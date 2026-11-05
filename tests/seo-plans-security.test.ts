import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { absolute, breadcrumbJsonLd, descriptionFrom, faqJsonLd, jsonLd, pageMetadata, sitemapItems, webApplicationJsonLd } from "../src/lib/seo.ts";
import { PLANS, PREMIUM_FEATURES, aiLimitFor, hasFeature } from "../src/config/plans.ts";
import { buildCsp } from "../src/lib/security/csp.mjs";
import { noBillingProvider } from "../src/lib/billing/provider.ts";

test("jsonLd cannot break out of its script tag", () => {
  const out = jsonLd({ name: "</script><script>alert(1)</script>", sep: "a\u2028b" });
  assert.ok(!out.includes("</script>") && !out.includes("<"));
  assert.ok(!out.includes("\u2028"));
  assert.equal(JSON.parse(out.replace(/\\u003c/g, "<")).name, "</script><script>alert(1)</script>");
});

test("descriptionFrom", () => {
  assert.equal(descriptionFrom("Merge PDF combines files. It is free. More text."), "Merge PDF combines files.");
  const long = descriptionFrom("word ".repeat(80));
  assert.ok(long.length <= 155 && long.endsWith("..."));
  assert.equal(descriptionFrom("  spaced   out \n text "), "spaced out text");
});

test("page metadata: canonical, social tags, noindex", () => {
  const m = pageMetadata({ title: "Merge PDF", description: "d", path: "/tools/merge-pdf" });
  assert.equal(m.alternates?.canonical, "/tools/merge-pdf");
  assert.equal((m.openGraph as { url: string }).url, "/tools/merge-pdf");
  assert.equal((m.twitter as { card: string }).card, "summary_large_image");
  assert.equal(m.robots, undefined);
  assert.deepEqual(pageMetadata({ title: "x", description: "d", path: "/x", noindex: true }).robots, { index: false, follow: true });
});

test("sitemap", () => {
  const items = sitemapItems(["merge-pdf", "emi-calculator"], ["/pdf-tools"]);
  const paths = items.map((i) => i.path);
  assert.deepEqual(paths.slice(0, 2), ["/", "/tools"]);
  for (const p of ["/pricing", "/about", "/contact", "/privacy-policy", "/terms-and-conditions", "/pdf-tools", "/tools/merge-pdf", "/tools/emi-calculator"]) assert.ok(paths.includes(p), p);
  for (const hidden of ["/dashboard", "/login", "/signup", "/reset-password", "/forgot-password"]) assert.ok(!paths.includes(hidden), hidden);
  assert.equal(new Set(paths).size, paths.length, "no duplicates");
  assert.ok(items.every((i) => i.priority > 0 && i.priority <= 1));
});

test("structured data shapes", () => {
  assert.equal(absolute("https://x.com/", "/a"), "https://x.com/a");
  const b = breadcrumbJsonLd("https://x.com", [{ name: "Home", path: "/" }, { name: "Tool", path: "/tools/a" }]);
  assert.deepEqual(b.itemListElement.map((i) => [i.position, i.item]), [[1, "https://x.com/"], [2, "https://x.com/tools/a"]]);
  const w = webApplicationJsonLd("https://x.com", { name: "N", description: "D", path: "/tools/a" });
  assert.equal(w["@type"], "WebApplication"); assert.equal(w.offers.price, "0"); assert.equal(w.url, "https://x.com/tools/a");
  const f = faqJsonLd([{ q: "Q?", a: "A." }]);
  assert.equal(f.mainEntity[0].acceptedAnswer.text, "A.");
});

test("plans and feature flags", () => {
  assert.equal(PLANS.free.available, true);
  assert.equal(PLANS.pro.available, false, "Pro cannot be bought yet");
  assert.ok(aiLimitFor("pro") > aiLimitFor("free"));
  assert.equal(hasFeature("free", "higher-ai-limits"), false);
  assert.equal(hasFeature("pro", "ad-free"), true);
  for (const f of Object.keys(PREMIUM_FEATURES) as (keyof typeof PREMIUM_FEATURES)[]) assert.ok(PREMIUM_FEATURES[f].label.length > 0);
});

test("billing is separate and not configured", async () => {
  assert.equal(noBillingProvider.configured, false);
  await assert.rejects(() => noBillingProvider.createCheckoutUrl({ userId: "u", plan: "pro", returnUrl: "/" }), /not configured/);
});

test("content security policy", () => {
  const csp = buildCsp({ supabaseUrl: "https://abc.supabase.co" });
  const dir = (name: string) => csp.split("; ").find((d) => d.startsWith(`${name} `)) ?? "";
  assert.ok(dir("connect-src").includes("https://abc.supabase.co") && dir("connect-src").includes("wss://abc.supabase.co"));
  assert.ok(!dir("script-src").includes("unsafe-eval"), "no eval in production");
  assert.ok(buildCsp({ isDev: true }).includes("'unsafe-eval'"));
  assert.ok(dir("img-src").includes("blob:") && dir("img-src").includes("data:"), "image previews and QR codes");
  assert.ok(dir("worker-src").includes("blob:"));
  assert.equal(dir("object-src"), "object-src 'none'");
  assert.equal(dir("frame-ancestors"), "frame-ancestors 'self'");
  assert.ok(!/\*/.test(csp), "no wildcards");
  assert.ok(!buildCsp({ supabaseUrl: "not a url" }).includes("not a url"));
  assert.ok(!csp.includes("upgrade-insecure-requests"), "would break http://localhost production tests");
});

test("ai_usage migration: owners can only read, only the function writes", () => {
  const sql = readFileSync(new URL("../supabase/migrations/20261102000000_ai_usage.sql", import.meta.url), "utf8");
  assert.ok(/alter table public\.ai_usage enable row level security/.test(sql));
  const policies = [...sql.matchAll(/create policy "([^"]+)" on public\.ai_usage for (\w+)/g)].map((m) => m[2]);
  assert.deepEqual(policies, ["select"], "only a select policy");
  assert.ok(/grant select on public\.ai_usage to authenticated/.test(sql) && !/grant (insert|update|delete)/.test(sql));
  const fn = sql.slice(sql.indexOf("create or replace function public.consume_ai_quota"));
  assert.ok(/security definer/.test(fn) && /set search_path = ''/.test(fn));
  assert.ok(/auth\.uid\(\)/.test(fn) && /v_user is null/.test(fn), "acts only for the signed-in user");
  assert.ok(/revoke execute on function public\.consume_ai_quota\(integer\) from public, anon/.test(sql));
  assert.equal((sql.match(/\$\$/g) ?? []).length, 2);
  assert.equal((sql.match(/\(/g) ?? []).length, (sql.match(/\)/g) ?? []).length);
});
