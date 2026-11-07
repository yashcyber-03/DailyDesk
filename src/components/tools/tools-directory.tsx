"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { RecentTools } from "@/components/tools/recent-tools";
import { ToolGrid } from "@/components/tools/tool-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categories } from "@/config/categories";
import { tools } from "@/config/tools";
import { cn } from "@/lib/utils";
import { getToolsByCategory, searchTools } from "@/lib/tools";
import type { CategorySlug } from "@/types/tool";

type Filter = CategorySlug | "all";

export function ToolsDirectory() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const q = query.trim();
  const filtered = useMemo(() => {
    const base = q ? searchTools(q) : tools;
    return filter === "all" ? base : base.filter((t) => t.category === filter);
  }, [q, filter]);

  const grouped = !q && filter === "all";
  const chips: { value: Filter; label: string }[] = [
    { value: "all", label: "All" },
    ...categories.map((c) => ({ value: c.slug as Filter, label: c.name })),
  ];

  return (
    <div>
      <RecentTools className="mb-10" />

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          type="search"
          aria-label="Search all tools"
          placeholder="Search by name, category or keyword..."
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {chips.map((c) => (
          <button
            key={c.value}
            type="button"
            aria-pressed={filter === c.value}
            onClick={() => setFilter(c.value)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
              filter === c.value ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "tool" : "tools"}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-xl border p-8 text-center">
          <p className="font-medium">No tools found</p>
          <p className="mt-1 text-sm text-muted-foreground">Try a different word or clear the filters.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : grouped ? (
        categories.map((c) => (
          <section key={c.slug} className="mt-8" aria-labelledby={`cat-${c.slug}`}>
            <h2 id={`cat-${c.slug}`} className="mb-4 text-xl font-semibold tracking-tight">{c.name}</h2>
            <ToolGrid items={getToolsByCategory(c.slug)} />
          </section>
        ))
      ) : (
        <div className="mt-6">
          <ToolGrid items={filtered} />
        </div>
      )}
    </div>
  );
}
