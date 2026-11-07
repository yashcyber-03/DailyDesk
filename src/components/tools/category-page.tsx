import { AdSlot } from "@/components/ads/ad-slot";
import { ToolGrid } from "@/components/tools/tool-card";
import { categoryIntros } from "@/content/categories";
import { getCategory, getToolsByCategory } from "@/lib/tools";
import type { CategorySlug } from "@/types/tool";

export function CategoryPage({ slug }: { slug: CategorySlug }) {
  const category = getCategory(slug)!;
  const Icon = category.icon;
  return (
    <>
      <div className="container py-12">
        <Icon className="h-7 w-7 text-primary" aria-hidden="true" />
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{category.name}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{category.description}</p>
        <div className="mt-8">
          <ToolGrid items={getToolsByCategory(slug)} />
        </div>
        <div className="mt-12 max-w-3xl space-y-3 text-sm text-muted-foreground">
          {categoryIntros[slug].map((p) => <p key={p}>{p}</p>)}
        </div>
      </div>
      <AdSlot id="category-bottom" />
    </>
  );
}
