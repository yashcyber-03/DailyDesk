import type { Metadata } from "next";
import { CategoryPage } from "@/components/tools/category-page";
import { pageMetadata } from "@/lib/seo";
import { getCategory } from "@/lib/tools";

export const metadata: Metadata = pageMetadata({
  title: "Free Online PDF Tools",
  description: getCategory("pdf-tools")!.description,
  path: "/pdf-tools",
});

export default function Page() {
  return <CategoryPage slug="pdf-tools" />;
}
