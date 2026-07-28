import type { MetadataRoute } from "next";

/**
 * Only the marketing root: tenant menu URLs (/m/[slug]) are private-by-default
 * business listings, not pages this site wants to promote for indexing on its
 * own behalf — a restaurant that wants to be found on Google optimizes that
 * separately, this sitemap is for the SaaS product page itself.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
