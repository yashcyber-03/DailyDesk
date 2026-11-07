import type { Metadata } from "next";

export const SITE_NAME = "DailyDesk";

/** JSON for a <script type="application/ld+json"> tag. Escapes characters that could close the tag early. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

/** First sentence of a text, shortened on a word boundary, for meta descriptions. */
export function descriptionFrom(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, " ").trim();
  const first = clean.split(/(?<=[.!?])\s/)[0] ?? clean;
  if (first.length <= max) return first;
  const cut = first.slice(0, max - 3);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), 1))}...`;
}

export function pageMetadata(o: { title: string; description: string; path: string; noindex?: boolean }): Metadata {
  return {
    title: o.title,
    description: o.description,
    alternates: { canonical: o.path },
    openGraph: { type: "website", siteName: SITE_NAME, title: `${o.title} | ${SITE_NAME}`, description: o.description, url: o.path },
    twitter: { card: "summary_large_image", title: `${o.title} | ${SITE_NAME}`, description: o.description },
    ...(o.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

export interface SitemapItem {
  path: string;
  priority: number;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
}

export function sitemapItems(toolSlugs: string[], categoryPaths: string[]): SitemapItem[] {
  const fixed: SitemapItem[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/tools", priority: 0.9, changeFrequency: "weekly" },
    { path: "/ai-assistant", priority: 0.8, changeFrequency: "monthly" },
    { path: "/pricing", priority: 0.5, changeFrequency: "monthly" },
    { path: "/about", priority: 0.4, changeFrequency: "yearly" },
    { path: "/contact", priority: 0.4, changeFrequency: "yearly" },
    { path: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/terms-and-conditions", priority: 0.3, changeFrequency: "yearly" },
  ];
  return [
    ...fixed,
    ...categoryPaths.map((path) => ({ path, priority: 0.8, changeFrequency: "weekly" as const })),
    ...toolSlugs.map((slug) => ({ path: `/tools/${slug}`, priority: 0.7, changeFrequency: "monthly" as const })),
  ];
}

export const absolute = (base: string, path: string) => `${base.replace(/\/$/, "")}${path}`;

export function breadcrumbJsonLd(base: string, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: absolute(base, item.path) })),
  };
}

export function webApplicationJsonLd(base: string, o: { name: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: o.name,
    description: o.description,
    url: absolute(base, o.path),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any (web browser)",
    browserRequirements: "Requires JavaScript",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export function siteJsonLd(base: string, description: string) {
  return [
    { "@context": "https://schema.org", "@type": "Organization", name: SITE_NAME, url: base },
    { "@context": "https://schema.org", "@type": "WebSite", name: SITE_NAME, url: base, description },
  ];
}
