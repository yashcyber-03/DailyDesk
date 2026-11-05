import { buildCsp } from "./src/lib/security/csp.mjs";

const isDev = process.env.NODE_ENV !== "production";
// CSP_MODE: "enforce" (default) | "report-only" (log violations in the browser console only) | "off"
const cspMode = process.env.CSP_MODE ?? "enforce";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  webpack: (config) => {
    // pdf.js references an optional Node-only 'canvas' package; the browser build must not try to bundle it.
    config.resolve.alias.canvas = false;
    return config;
  },
  async headers() {
    const headers = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    ];
    if (!isDev) headers.push({ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" });
    if (!isDev && cspMode !== "off") {
      headers.push({
        key: cspMode === "report-only" ? "Content-Security-Policy-Report-Only" : "Content-Security-Policy",
        value: buildCsp({ supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL }),
      });
    }
    return [{ source: "/:path*", headers }];
  },
};

export default nextConfig;
