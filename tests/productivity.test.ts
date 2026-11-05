import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { safeNext, friendlyAuthError } from "../src/lib/auth/redirect.ts";
import { createLocalRepo, type KeyValueStore } from "../src/lib/repo/local.ts";
import { createRemoteRepo, mapDbError } from "../src/lib/repo/remote.ts";
import type { Task } from "../src/lib/repo/types.ts";
import { addDays, bestStreak, currentStreak, lastNDays, toggleDate } from "../src/lib/productivity/habits.ts";
import { cleanTitle, filterTasks, sortPlanner } from "../src/lib/productivity/lists.ts";
import { clampMinutes, formatClock, nextMode, parseSettings, remainingMs } from "../src/lib/productivity/pomodoro.ts";
import { activeSets, cryptoRandomInt, DEFAULT_PASSWORD_OPTIONS, generatePassword, strength, validateOptions } from "../src/lib/productivity/password.ts";

test("safeNext blocks open redirects", () => {
  assert.equal(safeNext("/tools/emi-calculator"), "/tools/emi-calculator");
  assert.equal(safeNext("/dashboard?tab=1#x"), "/dashboard?tab=1#x");
  for (const bad of ["//evil.com", "https://evil.com", "/\\evil.com", "javascript:alert(1)", "", null, undefined, "/a\nb", "evil"]) {
    assert.equal(safeNext(bad as string | null | undefined), "/dashboard", String(bad));
  }
  assert.equal(safeNext("//x", "/"), "/");
});

test("friendly auth errors never echo raw messages", () => {
  assert.equal(friendlyAuthError({ message: "Invalid login credentials" }), "Incorrect email or password.");
  assert.match(friendlyAuthError({ code: "email_not_confirmed" }), /confirm your email/);
  assert.match(friendlyAuthError({ code: "over_email_send_rate_limit", message: "email rate limit exceeded" }), /Too many/);
  assert.match(friendlyAuthError({ code: "weak_password" }), /stronger password/);
  assert.equal(friendlyAuthError({ message: "duplicate key secret_table_name" }), "Something went wrong. Please try again.");
  assert.equal(friendlyAuthError(null), "Something went wrong. Please try again.");
});

function memoryStore(initial: Record<string, string> = {}): KeyValueStore & { data: Record<string, string> } {
  const data = { ...initial };
  return { data, getItem: (k) => data[k] ?? null, setItem: (k, v) => { data[k] = v; }, removeItem: (k) => { delete data[k]; } };
}

test("local repo: add, list order, update, remove, clear", async () => {
  const store = memoryStore();
  let t = 0;
  const repo = createLocalRepo<Task>("tasks", () => store, () => new Date(Date.UTC(2026, 0, 1, 0, 0, t++)));
  const a = await repo.add({ title: "first", done: false, due_date: null });
  const b = await repo.add({ title: "second", done: false, due_date: "2026-02-01" });
  assert.ok(a.id && a.id !== b.id);
  assert.deepEqual((await repo.list()).map((x) => x.title), ["second", "first"], "newest first");
  const u = await repo.update(a.id, { done: true });
  assert.equal(u.done, true); assert.equal(u.title, "first"); assert.ok(u.updated_at > a.updated_at);
  await assert.rejects(() => repo.update("missing", { done: true }), /no longer exists/);
  await repo.remove(b.id);
  assert.equal(repo.count(), 1);
  repo.clear();
  assert.deepEqual(await repo.list(), []);
});

test("local repo: corrupt data, storage failures, item cap", async () => {
  const store = memoryStore({ "dailydesk:local:tasks": "{not json" });
  const repo = createLocalRepo<Task>("tasks", () => store);
  assert.deepEqual(await repo.list(), []);
  store.data["dailydesk:local:tasks"] = JSON.stringify([{ id: "1", title: "ok", created_at: "x", updated_at: "x" }, 5, null, { title: "no id" }]);
  assert.equal((await repo.list()).length, 1, "invalid entries dropped");
  const full: KeyValueStore = { getItem: () => null, setItem: () => { throw new Error("quota"); }, removeItem: () => {} };
  await assert.rejects(() => createLocalRepo<Task>("tasks", () => full).add({ title: "x", done: false, due_date: null }), /could not save/);
  const big = memoryStore({ "dailydesk:local:tasks": JSON.stringify(Array.from({ length: 1000 }, (_, i) => ({ id: String(i), created_at: "x", updated_at: "x" }))) });
  await assert.rejects(() => createLocalRepo<Task>("tasks", () => big).add({ title: "x", done: false, due_date: null }), /limit/);
});

function fakeClient(result: { data: unknown; error: { code?: string; message?: string } | null }) {
  const calls: string[] = [];
  const builder: any = new Proxy({}, {
    get(_t, prop) {
      if (prop === "then") return (resolve: (v: unknown) => void) => resolve(result);
      return (...args: unknown[]) => { calls.push(`${String(prop)}(${args.map((a) => JSON.stringify(a)).join(",")})`); return builder; };
    },
  });
  return { calls, client: { from: (t: string) => { calls.push(`from(${t})`); return builder; } } as any };
}

test("remote repo: queries and error mapping", async () => {
  const ok = fakeClient({ data: [{ id: "1" }], error: null });
  assert.deepEqual(await createRemoteRepo(ok.client, "tasks").list(), [{ id: "1" }]);
  assert.deepEqual(ok.calls.slice(0, 3), ["from(tasks)", 'select("*")', 'order("created_at",{"ascending":false})']);

  const add = fakeClient({ data: { id: "9", title: "t" }, error: null });
  await createRemoteRepo(add.client, "notes").add({ title: "t", content: "" } as never);
  assert.deepEqual(add.calls.slice(0, 2), ["from(notes)", 'insert({"title":"t","content":""})'], "no user_id is sent; the database fills it from the session");

  const upd = fakeClient({ data: { id: "1" }, error: null });
  await createRemoteRepo(upd.client, "tasks").update("1", { done: true });
  assert.ok(upd.calls.includes('eq("id","1")'));

  const bad = fakeClient({ data: null, error: { code: "23514", message: "new row for relation violates check constraint secret" } });
  await assert.rejects(() => createRemoteRepo(bad.client, "tasks").add({ title: "x" } as never), (e: Error) => /too long|limit/.test(e.message) && !/secret|relation/.test(e.message));
  assert.match(mapDbError({ code: "42501" }).message, /log in again/);
  assert.match(mapDbError({ code: "XX000" }).message, /Could not save/);
});

test("habit streaks", () => {
  const today = "2026-11-01";
  assert.equal(addDays("2026-03-01", -1), "2026-02-28");
  assert.equal(addDays("2024-03-01", -1), "2024-02-29");
  assert.deepEqual(lastNDays(3, today), ["2026-10-30", "2026-10-31", "2026-11-01"]);
  assert.equal(currentStreak([], today), 0);
  assert.equal(currentStreak(["2026-11-01", "2026-10-31", "2026-10-30", "2026-10-28"], today), 3);
  assert.equal(currentStreak(["2026-10-31", "2026-10-30"], today), 2, "today not done yet keeps streak alive");
  assert.equal(currentStreak(["2026-10-29"], today), 0, "missed yesterday resets");
  assert.equal(bestStreak(["2026-01-01", "2026-01-02", "2026-01-03", "2026-01-10", "2026-01-11"]), 3);
  assert.equal(bestStreak([]), 0);
  assert.deepEqual(toggleDate(["2026-01-02"], "2026-01-01"), ["2026-01-01", "2026-01-02"]);
  assert.deepEqual(toggleDate(["2026-01-02"], "2026-01-02"), []);
});

test("task and planner helpers", () => {
  const tasks = [{ done: true }, { done: false }, { done: false }];
  assert.equal(filterTasks(tasks, "all").length, 3);
  assert.equal(filterTasks(tasks, "active").length, 2);
  assert.equal(filterTasks(tasks, "done").length, 1);
  const entries = [{ n: "c", start_time: null }, { n: "b", start_time: "10:00" }, { n: "a", start_time: "09:30" }, { n: "d", start_time: null }];
  assert.deepEqual(sortPlanner(entries).map((e) => e.n), ["a", "b", "c", "d"]);
  assert.deepEqual(cleanTitle("  hello   world ", 50), { ok: true, value: "hello world" });
  assert.equal(cleanTitle("   ", 50).ok, false);
  assert.equal(cleanTitle("x".repeat(51), 50).ok, false);
});

test("pomodoro helpers", () => {
  assert.equal(formatClock(25 * 60_000), "25:00");
  assert.equal(formatClock(59_001), "01:00");
  assert.equal(formatClock(0), "00:00");
  assert.equal(remainingMs(1000, 1500), 0);
  assert.equal(remainingMs(2000, 500), 1500);
  assert.equal(nextMode("focus", 1, 4), "short");
  assert.equal(nextMode("focus", 4, 4), "long");
  assert.equal(nextMode("short", 1, 4), "focus");
  assert.equal(nextMode("long", 4, 4), "focus");
  assert.equal(clampMinutes(0), 1); assert.equal(clampMinutes(500), 120); assert.equal(clampMinutes(12.4), 12);
  assert.deepEqual(parseSettings({ focus: 50, short: "x", long: 999, longEvery: 3 }), { focus: 50, short: 5, long: 120, longEvery: 3 });
  assert.deepEqual(parseSettings(null), { focus: 25, short: 5, long: 15, longEvery: 4 });
});

test("password generator", () => {
  const o = DEFAULT_PASSWORD_OPTIONS;
  for (let i = 0; i < 200; i++) {
    const p = generatePassword(o);
    assert.equal(p.length, 16);
    assert.ok(/[a-z]/.test(p) && /[A-Z]/.test(p) && /[0-9]/.test(p) && /[^a-zA-Z0-9]/.test(p), "has every selected class: " + p);
  }
  assert.ok(/^[a-z]+$/.test(generatePassword({ ...o, upper: false, digits: false, symbols: false, length: 30 })));
  for (let i = 0; i < 100; i++) assert.ok(!/[0O1lI]/.test(generatePassword({ ...o, avoidAmbiguous: true })));
  assert.notEqual(generatePassword(o), generatePassword(o), "two passwords differ");
});

test("password generator: validation, determinism, uniformity, strength", () => {
  assert.ok(validateOptions({ ...DEFAULT_PASSWORD_OPTIONS, length: 7 }));
  assert.ok(validateOptions({ ...DEFAULT_PASSWORD_OPTIONS, length: 65 }));
  assert.ok(validateOptions({ ...DEFAULT_PASSWORD_OPTIONS, lower: false, upper: false, digits: false, symbols: false }));
  assert.equal(validateOptions(DEFAULT_PASSWORD_OPTIONS), null);
  assert.throws(() => generatePassword({ ...DEFAULT_PASSWORD_OPTIONS, length: 3 }), RangeError);
  assert.equal(activeSets({ ...DEFAULT_PASSWORD_OPTIONS, avoidAmbiguous: true }).join("").match(/[0O1lI]/), null);
  const always0 = () => 0;
  const p = generatePassword({ ...DEFAULT_PASSWORD_OPTIONS, length: 8 }, always0);
  assert.equal(p.length, 8);
  // uniformity of cryptoRandomInt over a small range (loose bound; fails only if clearly biased)
  const counts = new Array(6).fill(0);
  for (let i = 0; i < 60000; i++) counts[cryptoRandomInt(6)]++;
  assert.ok(counts.every((c) => c > 9300 && c < 10700), counts.join(","));
  assert.throws(() => cryptoRandomInt(0), RangeError);
  assert.equal(strength({ ...DEFAULT_PASSWORD_OPTIONS, length: 8, upper: false, digits: false, symbols: false }).label, "Weak");
  assert.equal(strength({ ...DEFAULT_PASSWORD_OPTIONS, length: 16 }).label, "Very strong");
});

test("migration SQL: every table has RLS and own-row policies", () => {
  const sql = readFileSync(new URL("../supabase/migrations/20261101000000_initial_schema.sql", import.meta.url), "utf8");
  const tables = [...sql.matchAll(/create table public\.(\w+)/g)].map((m) => m[1]);
  assert.deepEqual(tables.sort(), ["favorites", "habits", "notes", "planner_entries", "profiles", "tasks", "tool_history", "user_settings"]);
  for (const t of tables) {
    assert.ok(new RegExp(`alter table public\\.${t} enable row level security`).test(sql), `RLS on ${t}`);
    assert.ok(new RegExp(`create policy "${t}_select_own"`).test(sql), `select policy on ${t}`);
    assert.ok(new RegExp(`create policy "${t}_insert_own"`).test(sql), `insert policy on ${t}`);
    assert.ok(new RegExp(`create policy "${t}_update_own"`).test(sql), `update policy on ${t}`);
  }
  const policies = sql.split("create policy").slice(1);
  assert.ok(policies.every((p) => p.includes("(select auth.uid())")), "all policies compare to the signed-in user");
  assert.ok(!/\bto (anon|public)\b/.test(sql.replace(/revoke[^;]*;/g, "")), "nothing is granted to anon or public");
  assert.ok(!/plan|stripe|billing/i.test(sql.split("create table public.user_settings")[1].split(");")[0]), "no plan/billing in user-editable settings");
  assert.equal((sql.match(/create or replace function[\s\S]*?\$\$;/g) ?? []).filter((f) => !/set search_path = ''/.test(f)).length, 0, "all functions pin search_path");
  assert.equal((sql.match(/\$\$/g) ?? []).length % 2, 0, "balanced $$ quoting");
  assert.equal((sql.match(/\(/g) ?? []).length, (sql.match(/\)/g) ?? []).length, "balanced parentheses");
});
