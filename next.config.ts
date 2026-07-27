import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

/**
 * Product images live in Supabase Storage. The hostname is environment-specific,
 * so it is derived from the public URL rather than hardcoded.
 */
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
    // Menu photos are shot on phones and uploaded as-is. These are the widths
    // that actually get requested on a menu card and a product sheet.
    imageSizes: [96, 128, 256, 384],
    deviceSizes: [640, 750, 828, 1080, 1200],
  },
  async headers() {
    return [
      {
        // The service worker must never be served stale, or a tablet can get
        // stuck on an old build for as long as the cache lives.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  // A service worker in dev caches your own edits back at you.
  disable: process.env.NODE_ENV === "development",
  reloadOnOnline: false,
});

export default withSerwist(nextConfig);
