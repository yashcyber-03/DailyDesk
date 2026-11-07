"use client";

import { useEffect } from "react";
import { ToolGrid } from "@/components/tools/tool-card";
import { Button } from "@/components/ui/button";
import { recordRecentTool, useRecentTools } from "@/hooks/use-recent-tools";

export function RecordVisit({ slug }: { slug: string }) {
  useEffect(() => {
    recordRecentTool(slug);
  }, [slug]);

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
