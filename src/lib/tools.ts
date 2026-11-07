import { categories } from "@/config/categories";
import { tools } from "@/config/tools";
import type { CategorySlug, Tool } from "@/types/tool";

export const getTool = (slug: string) => tools.find((t) => t.slug === slug);
export const getCategory = (slug: CategorySlug) => categories.find((c) => c.slug === slug);
export const getToolsByCategory = (slug: CategorySlug) => tools.filter((t) => t.category === slug);
export const getPopularTools = () => tools.filter((t) => t.popular);
export const getNewTools = () => tools.filter((t) => t.isNew);

export function searchTools(query: string): Tool[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored: { tool: Tool; score: number }[] = [];
  for (const tool of tools) {
    const name = tool.name.toLowerCase();
    const category = getCategory(tool.category)?.name.toLowerCase() ?? "";
    let score = 0;
    if (name.startsWith(q)) score = 4;
    else if (name.includes(q)) score = 3;
    else if (tool.keywords.some((k) => k.includes(q))) score = 2;
    else if (category.includes(q) || tool.shortDescription.toLowerCase().includes(q)) score = 1;
    if (score > 0) scored.push({ tool, score });
  }
  return scored.sort((a, b) => b.score - a.score).map((s) => s.tool);
}
