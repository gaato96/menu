import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Staff-only surfaces have nothing for a crawler and everything
        // behind them is already gated by RLS regardless. /interno-* pages
        // are internal notes shared by direct link only — the page-level
        // `robots: noindex` is the real signal, this is belt and suspenders.
        disallow: ["/panel", "/admin", "/login", "/sin-acceso", "/interno-"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
