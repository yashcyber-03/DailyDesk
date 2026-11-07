/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  poweredByHeader: false,
  webpack: (config) => {
    // pdf.js references an optional Node-only 'canvas' package; the browser build must not try to bundle it.
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
