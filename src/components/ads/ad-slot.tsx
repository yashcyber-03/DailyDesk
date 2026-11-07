import { adsEnabled } from "@/config/flags";

export type AdSlotId = "home-middle" | "tool-below" | "category-bottom";

/**
 * Reserved place for an advertisement. Renders nothing unless NEXT_PUBLIC_ADS_ENABLED=true.
 * While no ad network is connected it only shows a labelled placeholder during development.
 * To connect a network later, render its ad unit here (client script/component) and update the Privacy Policy
 * and add cookie consent where the law requires it.
 */
export function AdSlot({ id, className = "" }: { id: AdSlotId; className?: string }) {
  if (!adsEnabled || process.env.NODE_ENV === "production") return null;
  return (
    <aside aria-label="Advertisement placeholder" data-ad-slot={id} className={`container ${className}`}>
      <div className="flex min-h-24 items-center justify-center rounded-xl border-2 border-dashed text-sm text-muted-foreground">
        Ad placement &ldquo;{id}&rdquo; (no ad network connected)
      </div>
    </aside>
  );
}
