"use client";

import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const KEY = "dailydesk:favorites";

export function FavoriteButton({ slug }: { slug: string }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY);
      const parsed: unknown = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "string")) {
        throw new Error("Invalid favourites data.");
      }
      setFavorites(parsed);
      setReady(true);
    } catch {
      setError("Could not load favourites from this browser.");
    }
  }, []);

  function toggle() {
    const next = favorites.includes(slug) ? favorites.filter((item) => item !== slug) : [...favorites, slug];
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
      setFavorites(next);
      setError(null);
    } catch {
      setError("Could not save favourites. Browser storage may be full or blocked.");
    }
  }

  const isFavorite = favorites.includes(slug);
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" aria-pressed={isFavorite} disabled={!ready} onClick={toggle}>
        <Star className={`h-4 w-4 ${isFavorite ? "fill-current text-primary" : ""}`} aria-hidden="true" />
        {isFavorite ? "Favourite" : "Add to favourites"}
      </Button>
      {error && <span role="alert" className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
