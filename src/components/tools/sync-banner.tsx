"use client";

import { HardDrive } from "lucide-react";

export function SyncBanner() {
  return (
    <p className="flex items-center gap-2 text-sm text-muted-foreground">
      <HardDrive className="h-4 w-4" aria-hidden="true" /> Saved in this browser only.
    </p>
  );
}
