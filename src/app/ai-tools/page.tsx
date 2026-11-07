import type { Metadata } from "next";
import { CategoryPage } from "@/components/tools/category-page";
import { pageMetadata } from "@/lib/seo";
import { getCategory } from "@/lib/tools";

export const metadata: Metadata = pageMetadata({
  title: "Free Online AI Tools",
  description: getCategory("ai-tools")!.description,
  path: "/ai-tools",
});

export default function Page() {
  return <CategoryPage slug="ai-tools" />;
}
