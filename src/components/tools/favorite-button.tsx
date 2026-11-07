"use client";

import { Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function FavoriteButton({ slug }: { slug: string }) {
  const { user, loading, configured } = useAuth();
  const userId = user?.id;
  const [favId, setFavId] = useState<string | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setFavId(null);
      return;
    }
    // Disable the button until we know the current state, so a quick click cannot be overwritten by a late answer.
    setFavId(undefined);
    let cancelled = false;
    createClient()
      .from("favorites")
      .select("id")
      .eq("tool_slug", slug)
      .maybeSingle()
      .then(
        ({ data }) => {
          if (!cancelled) setFavId(data?.id ?? null);
        },
        () => {
          if (!cancelled) setFavId(null);
        },
      );
    return () => {
      cancelled = true;
    };
  }, [userId, slug]);

  if (!configured || loading) return null;

  if (!userId) {
    return (
      <Link href={`/login?next=${encodeURIComponent(`/tools/${slug}`)}`} className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm hover:bg-accent">
        <Star className="h-4 w-4" aria-hidden="true" /> Log in to save as favourite
      </Link>
    );
  }

  async function toggle() {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    if (favId) {
      const { error: err } = await supabase.from("favorites").delete().eq("id", favId);
      if (err) setError("Could not update favourites. Please try again.");
      else setFavId(null);
    } else {
      const { data, error: err } = await supabase.from("favorites").insert({ tool_slug: slug }).select("id").single();
      if (err?.code === "23505") {
        // Already saved (for example in another tab): show it as saved instead of failing.
        const existing = await supabase.from("favorites").select("id").eq("tool_slug", slug).maybeSingle();
        setFavId(existing.data?.id ?? null);
      } else if (err) {
        setError(err.code === "23514" ? "You have reached the favourites limit." : "Could not update favourites. Please try again.");
      } else {
        setFavId(data.id);
      }
    }
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" aria-pressed={!!favId} disabled={busy || favId === undefined} onClick={toggle}>
        <Star className={`h-4 w-4 ${favId ? "fill-current text-primary" : ""}`} aria-hidden="true" />
        {favId ? "Favourite" : "Add to favourites"}
      </Button>
      {error && <span role="alert" className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
