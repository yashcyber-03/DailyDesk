"use client";

import { useCallback, useEffect, useState } from "react";
import { tools } from "@/config/tools";
import type { Tool } from "@/types/tool";

const KEY = "dailydesk:recent-tools";
const MAX = 8;

function read(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return []; // storage unavailable or corrupted: behave as if empty
  }
}

export function recordRecentTool(slug: string) {
  try {
    const next = [slug, ...read().filter((s) => s !== slug)].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignore: recent tools are a convenience only
  }
}

export function useRecentTools() {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSlugs(read());
  }, []);

  const clear = useCallback(() => {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      // ignore
    }
    setSlugs([]);
  }, []);

  const recent = slugs.map((s) => tools.find((t) => t.slug === s)).filter((t): t is Tool => Boolean(t));
  return { recent, clear };
}
