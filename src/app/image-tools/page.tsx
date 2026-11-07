import type { Metadata } from "next";
import { CategoryPage } from "@/components/tools/category-page";
import { pageMetadata } from "@/lib/seo";
import { getCategory } from "@/lib/tools";

export const metadata: Metadata = pageMetadata({
  title: "Free Online Image Tools",
  description: getCategory("image-tools")!.description,
  path: "/image-tools",
});

export default function Page() {
  return <CategoryPage slug="image-tools" />;
}
