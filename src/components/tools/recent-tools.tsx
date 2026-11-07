"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { ToolGrid } from "@/components/tools/tool-card";
import { Button } from "@/components/ui/button";
import { recordRecentTool, useRecentTools } from "@/hooks/use-recent-tools";
import { createClient } from "@/lib/supabase/client";

export function RecordVisit({ slug }: { slug: string }) {
  const { user, loading } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    recordRecentTool(slug);
  }, [slug]);

  // Signed-in users also get their usage saved to their account (at most once a minute per tool).
  useEffect(() => {
    if (loading || !userId) return;
    const key = `dailydesk:synced:${slug}`;
    try {
      if (Date.now() - Number(window.sessionStorage.getItem(key) ?? 0) < 60_000) return;
      window.sessionStorage.setItem(key, String(Date.now()));
    } catch {
      // sessionStorage unavailable: record anyway
    }
    createClient().rpc("record_tool_use", { p_slug: slug }).then(
      () => undefined,
      () => undefined,
    );
  }, [slug, userId, loading]);

  return null;
}

export function RecentTools({ className }: { className?: string }) {
  const { recent, clear } = useRecentTools();
  if (recent.length === 0) return null;
  return (
    <section className={className} aria-labelledby="recent-tools">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 id="recent-tools" className="text-2xl font-semibold tracking-tight">Recently used</h2>
          <p className="mt-1 text-sm text-muted-foreground">Stored only in this browser.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={clear}>Clear</Button>
      </div>
      <ToolGrid items={recent.slice(0, 6)} />
    </section>
  );
}
