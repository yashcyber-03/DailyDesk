import { test } from "node:test";
import assert from "node:assert/strict";
import { absolute, breadcrumbJsonLd, descriptionFrom, faqJsonLd, jsonLd, pageMetadata, sitemapItems, webApplicationJsonLd } from "../src/lib/seo.ts";
import { categories } from "../src/config/categories.ts";
import { tools } from "../src/config/tools.ts";

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

test("static sitemap contains only current routes", () => {
  const items = sitemapItems(["merge-pdf", "emi-calculator"], ["/pdf-tools"]);
  const paths = items.map((i) => i.path);
  assert.deepEqual(paths.slice(0, 2), ["/", "/tools"]);
  for (const p of ["/pricing", "/about", "/contact", "/privacy-policy", "/terms-and-conditions", "/pdf-tools", "/tools/merge-pdf", "/tools/emi-calculator"]) assert.ok(paths.includes(p), p);
  for (const removed of ["/dashboard", "/login", "/signup", "/ai-assistant", "/ai-tools"]) assert.ok(!paths.includes(removed), removed);
  assert.equal(new Set(paths).size, paths.length, "no duplicates");
  assert.ok(items.every((i) => i.priority > 0 && i.priority <= 1));
});

test("tool catalog has no accounts, AI or paid plans", () => {
  assert.ok(categories.every((category) => String(category.slug) !== "ai-tools"));
  assert.ok(tools.every((tool) => !tool.slug.startsWith("ai-")));
  assert.ok(tools.every((tool) => !("requiresAuth" in tool) && !("proOnly" in tool)));
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
