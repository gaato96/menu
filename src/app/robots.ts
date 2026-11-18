import { siteUrl } from "@/lib/site-url";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const origin = siteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Staff-only surfaces have nothing for a crawler and everything
        // behind them is already gated by RLS regardless. The internal notes
        // page is deliberately NOT listed: robots.txt is public, and naming a
        // hidden path here is how people find it. It sits behind
        // requireSuperadmin() instead.
        disallow: ["/panel", "/admin", "/login", "/sin-acceso"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
  };
}
