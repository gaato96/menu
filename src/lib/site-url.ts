/**
 * The public origin of the site, for anything that leaves the browser: QR
 * codes printed and taped to tables, Open Graph images in WhatsApp previews,
 * the sitemap.
 *
 * NEXT_PUBLIC_SITE_URL first. If a deploy forgets it, Vercel's own
 * VERCEL_PROJECT_PRODUCTION_URL (the production domain, no scheme) is the
 * next best thing — this used to fall straight to localhost, and production
 * shipped QR codes pointing at http://localhost:3000 for months without
 * anyone noticing (audit 2026-11-18). Localhost is only for local dev.
 *
 * Server-only in practice: VERCEL_PROJECT_PRODUCTION_URL is not exposed to
 * the browser bundle.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;

  return "http://localhost:3000";
}
