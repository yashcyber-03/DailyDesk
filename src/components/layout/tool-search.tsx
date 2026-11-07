"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { getPopularTools, searchTools } from "@/lib/tools";

export function ToolSearch({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const trimmed = query.trim();
  const results = trimmed ? searchTools(trimmed).slice(0, 6) : getPopularTools().slice(0, 5);

  const close = () => {
    setOpen(false);
    setQuery("");
    onNavigate?.();
  };

  return (
    <div ref={wrapRef} className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <Input
        type="search"
        placeholder="Search tools..."
        aria-label="Search tools"
        aria-expanded={open}
        aria-controls={listId}
        className="pl-9"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && results[0]) {
            router.push(`/tools/${results[0].slug}`);
            close();
          }
        }}
      />
      {open && (
        <div id={listId} className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl border bg-card shadow-lg">
          <p className="px-3 pt-3 text-xs font-medium text-muted-foreground">
            {trimmed ? "Results" : "Suggested tools"}
          </p>
          {results.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">No tools match &ldquo;{trimmed}&rdquo;.</p>
          ) : (
            <ul className="p-1.5">
              {results.map((tool) => {
                const Icon = tool.icon;
                return (
                  <li key={tool.slug}>
                    <Link
                      href={`/tools/${tool.slug}`}
                      onClick={close}
                      className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm hover:bg-accent"
                    >
                      <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                      {tool.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
