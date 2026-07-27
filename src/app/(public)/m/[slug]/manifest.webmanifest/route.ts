import { NextResponse } from "next/server";

import { createPublicClient } from "@/lib/supabase/server";

/**
 * A manifest per business, so a customer installs "Pizzería Don José" on
 * their home screen — not "Menú Digital". That's the whole point of doing
 * this dynamically instead of shipping one static file: the icon a repeat
 * customer taps every Friday should be theirs, not the platform's.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createPublicClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("name, brand_color, logo_url")
    .eq("slug", slug)
    .maybeSingle();

  if (!business) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const icons = business.logo_url
    ? [
        { src: business.logo_url, sizes: "192x192", type: "image/png", purpose: "any" },
        { src: business.logo_url, sizes: "512x512", type: "image/png", purpose: "any" },
      ]
    : [
        { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
        { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
        {
          src: "/icons/icon-512-maskable.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ];

  const manifest = {
    id: `/m/${slug}`,
    name: business.name,
    short_name: business.name.slice(0, 30),
    description: `Menú de ${business.name} — pedí online.`,
    start_url: `/m/${slug}`,
    scope: `/m/${slug}`,
    display: "standalone",
    orientation: "portrait",
    background_color: "#f1ebdd",
    theme_color: business.brand_color,
    lang: "es-AR",
    dir: "ltr",
    categories: ["food", "shopping"],
    icons,
  };

  return NextResponse.json(manifest, {
    headers: { "Content-Type": "application/manifest+json" },
  });
}
