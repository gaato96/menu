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
  // Next's own default for a Server Action's request body is 1MB — nowhere
  // near enough for the dish video upload (up to 8MB, see
  // video-upload-form.tsx). Below this ceiling, Vercel rejects the request
  // before it ever reaches uploadProductVideo(), so the failure never gets
  // to return the graceful { error } the action is written to produce —
  // the browser just sees a generic crashed-page screen instead of a form
  // message. 10mb leaves headroom over the 8MB the client already enforces.
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
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
