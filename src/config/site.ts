const fromVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined;

export const siteConfig = {
  name: "DailyDesk",
  tagline: "Everything You Need, All in One Desk.",
  description:
    "DailyDesk is a free online toolkit with PDF tools, image tools, calculators and productivity apps, all in one place.",
  // Set NEXT_PUBLIC_SITE_URL to your real domain. It is used for canonical links, the sitemap and social previews.
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? fromVercel ?? "http://localhost:3000").replace(/\/$/, ""),
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || undefined,
} as const;
