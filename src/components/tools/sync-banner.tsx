"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cloud, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  mode: "guest" | "account";
  configured: boolean;
  localCount: number;
  onImport: () => void;
}

export function SyncBanner({ mode, configured, localCount, onImport }: Props) {
  const pathname = usePathname();
  return (
    <div className="space-y-2 text-sm">
      {mode === "account" ? (
        <p className="flex items-center gap-2 text-muted-foreground"><Cloud className="h-4 w-4" aria-hidden="true" /> Synced to your account.</p>
      ) : (
        <p className="flex items-center gap-2 text-muted-foreground">
          <HardDrive className="h-4 w-4" aria-hidden="true" /> Saved in this browser only.
          {configured && (
            <>
              {" "}
              <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="text-foreground underline">Log in</Link> to sync across devices.
            </>
          )}
        </p>
      )}
      {mode === "account" && localCount > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
          <p>You have {localCount} {localCount === 1 ? "item" : "items"} saved in this browser.</p>
          <Button size="sm" variant="outline" onClick={onImport}>Move them to my account</Button>
        </div>
      )}
    </div>
  );
}
