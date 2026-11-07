import type { Metadata } from "next";
import { CategoryPage } from "@/components/tools/category-page";
import { pageMetadata } from "@/lib/seo";
import { getCategory } from "@/lib/tools";

export const metadata: Metadata = pageMetadata({
  title: "Free Online Calculators",
  description: getCategory("calculators")!.description,
  path: "/calculators",
});

export default function Page() {
  return <CategoryPage slug="calculators" />;
}
