import type { Metadata } from "next";
import { CategoryPage } from "@/components/tools/category-page";
import { pageMetadata } from "@/lib/seo";
import { getCategory } from "@/lib/tools";

export const metadata: Metadata = pageMetadata({
  title: "Free Online Productivity Tools",
  description: getCategory("productivity")!.description,
  path: "/productivity",
});

export default function Page() {
  return <CategoryPage slug="productivity" />;
}
