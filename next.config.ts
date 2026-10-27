import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // Hide the dev-only Next.js "N" button (it covered form fields). Errors still pop up in development.
  devIndicators: false,
  partialPrefetching: true,
  experimental: {
    // The Tailwind loader's output was being restored stale from this cache after
    // globals.css changed, so style edits didn't show up. Compile fresh on each start.
    turbopackFileSystemCacheForDev: false,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
