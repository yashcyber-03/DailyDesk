import type { LucideIcon } from "lucide-react";

export type CategorySlug =
  | "pdf-tools"
  | "image-tools"
  | "calculators"
  | "productivity";

export interface Category {
  slug: CategorySlug;
  name: string;
  description: string;
  icon: LucideIcon;
  href: `/${CategorySlug}`;
}

export interface Tool {
  slug: string;
  name: string;
  category: CategorySlug;
  shortDescription: string;
  keywords: string[];
  icon: LucideIcon;
  popular?: boolean;
  isNew?: boolean;
}
