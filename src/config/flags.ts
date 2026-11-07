/** Feature flags read from the environment. NEXT_PUBLIC_ names must be written out in full so Next.js can inline them. */
export const adsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";
