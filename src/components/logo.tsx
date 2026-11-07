import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { siteConfig } from "@/config/site";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight" aria-label={`${siteConfig.name} home`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <LayoutGrid className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="text-lg">{siteConfig.name}</span>
    </Link>
  );
}
