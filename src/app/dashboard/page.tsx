import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountSettings } from "@/components/account/account-settings";
import { NotConfigured } from "@/components/auth/auth-shell";
import TodoList from "@/components/tools/implementations/todo-list";
import { ToolGrid } from "@/components/tools/tool-card";
import { Card } from "@/components/ui/card";
import { PLANS } from "@/config/plans";
import { getTool } from "@/lib/tools";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Tool } from "@/types/tool";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const toTools = (slugs: string[]): Tool[] => slugs.map((s) => getTool(s)).filter((t): t is Tool => Boolean(t));

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <Card className="p-4">
      <p className="text-2xl font-semibold tabular-nums">{typeof value === "number" ? value.toLocaleString("en-US") : value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </Card>
  );
}

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) return <NotConfigured />;

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  if (!claims) redirect("/login?next=/dashboard");
  const userId = String(claims.sub);
  const email = typeof claims.email === "string" ? claims.email : "";

  // Every query runs as the signed-in user, so Row Level Security returns only their rows.
  const todayUtc = new Date().toISOString().slice(0, 10);
  const [profile, settings, history, favorites, notes, openTasks, noteCount, aiToday] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", userId).maybeSingle(),
    supabase.from("user_settings").select("theme").eq("user_id", userId).maybeSingle(),
    supabase.from("tool_history").select("tool_slug,use_count,last_used_at").order("last_used_at", { ascending: false }),
    supabase.from("favorites").select("tool_slug").order("created_at", { ascending: false }),
    supabase.from("notes").select("id,title,updated_at").order("updated_at", { ascending: false }).limit(5),
    supabase.from("tasks").select("id", { count: "exact", head: true }).eq("done", false),
    supabase.from("notes").select("id", { count: "exact", head: true }),
    supabase.from("ai_usage").select("request_count").eq("usage_date", todayUtc).maybeSingle(),
  ]);

  const loadFailed = [profile, settings, history, favorites, notes, openTasks, noteCount].some((r) => r.error);
  const displayName = profile.data?.display_name || email.split("@")[0] || "there";
  const theme = settings.data?.theme === "light" || settings.data?.theme === "dark" ? settings.data.theme : "system";
  const historyRows = (history.data ?? []) as { tool_slug: string; use_count: number; last_used_at: string }[];
  const totalUses = historyRows.reduce((sum, r) => sum + r.use_count, 0);
  const recent = toTools(historyRows.slice(0, 6).map((r) => r.tool_slug));
  const favTools = toTools(((favorites.data ?? []) as { tool_slug: string }[]).map((f) => f.tool_slug));
  const noteRows = (notes.data ?? []) as { id: string; title: string; updated_at: string }[];

  return (
    <div className="container space-y-12 py-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Welcome back, {displayName}</h1>
        <p className="mt-2 text-muted-foreground">Your tools, notes and tasks in one place. Plan: {PLANS.free.name}.</p>
        {loadFailed && (
          <p role="alert" className="mt-4 rounded-lg border border-destructive/40 p-3 text-sm">
            Some of your data could not be loaded. If you have just set up the project, make sure the database setup (SQL migration) has been run. See docs/supabase-setup.md.
          </p>
        )}
      </header>

      <section aria-labelledby="activity">
        <h2 id="activity" className="mb-4 text-xl font-semibold tracking-tight">Activity overview</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Tools used" value={historyRows.length} />
          <Stat label="Total uses" value={totalUses} />
          <Stat label="Favourites" value={favTools.length} />
          <Stat label="Saved notes" value={noteCount.count ?? 0} />
          <Stat label="Open tasks" value={openTasks.count ?? 0} />
          <Stat label="AI requests today" value={`${aiToday.data?.request_count ?? 0} / ${PLANS.free.aiRequestsPerDay}`} />
        </div>
      </section>

      <section aria-labelledby="recent">
        <h2 id="recent" className="mb-4 text-xl font-semibold tracking-tight">Recently used</h2>
        {recent.length > 0 ? <ToolGrid items={recent} /> : <p className="text-sm text-muted-foreground">Tools you use will appear here. <Link href="/tools" className="underline">Browse tools</Link></p>}
      </section>

      <section aria-labelledby="favs">
        <h2 id="favs" className="mb-4 text-xl font-semibold tracking-tight">Favourite tools</h2>
        {favTools.length > 0 ? <ToolGrid items={favTools} /> : <p className="text-sm text-muted-foreground">Open any tool and choose &ldquo;Add to favourites&rdquo; to pin it here.</p>}
      </section>

      <section aria-labelledby="notes">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="notes" className="text-xl font-semibold tracking-tight">Saved notes</h2>
          <Link href="/tools/notes-manager" className="text-sm underline">Open Notes Manager</Link>
        </div>
        {noteRows.length > 0 ? (
          <ul className="divide-y rounded-xl border">
            {noteRows.map((n) => (
              <li key={n.id} className="flex items-center justify-between gap-4 p-4">
                <span className="truncate text-sm font-medium">{n.title || "Untitled note"}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{n.updated_at.slice(0, 10)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No notes yet.</p>
        )}
      </section>

      <section aria-labelledby="todo">
        <h2 id="todo" className="mb-4 text-xl font-semibold tracking-tight">To-do list</h2>
        <TodoList />
      </section>

      <section aria-labelledby="settings">
        <h2 id="settings" className="mb-4 text-xl font-semibold tracking-tight">Account settings</h2>
        <AccountSettings userId={userId} email={email} initialName={profile.data?.display_name ?? ""} initialTheme={theme} />
      </section>
    </div>
  );
}
