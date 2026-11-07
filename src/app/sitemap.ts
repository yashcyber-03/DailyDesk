import type { MetadataRoute } from "next";
import { categories } from "@/config/categories";
import { siteConfig } from "@/config/site";
import { tools } from "@/config/tools";
import { absolute, sitemapItems } from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapItems(tools.map((t) => t.slug), categories.map((c) => c.href)).map((item) => ({
    url: absolute(siteConfig.url, item.path),
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }));
}
