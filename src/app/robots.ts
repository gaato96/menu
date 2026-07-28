import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Staff-only surfaces have nothing for a crawler and everything
        // behind them is already gated by RLS regardless.
        disallow: ["/panel", "/admin", "/login", "/sin-acceso"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
