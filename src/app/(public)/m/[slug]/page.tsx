import { redirect } from "next/navigation";

import { getPublicMenu } from "@/lib/menu/queries";

import { MenuClient } from "./menu-client";

export default async function PublicMenuPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ mesa?: string; clasico?: string }>;
}) {
  const { slug } = await params;
  const { mesa, clasico } = await searchParams;
  const data = await getPublicMenu(slug, mesa);

  // Both flags, not one: catalog_view_enabled says the vertical view exists,
  // catalog_is_default says it is the front door. `?clasico=1` is the escape
  // hatch the vertical view links back with — without it the redirect and
  // that link would bounce the customer between the two forever.
  if (data.settings.catalog_view_enabled && data.settings.catalog_is_default && !clasico) {
    // `?mesa=` has to survive the hop or a customer scanning a table QR lands
    // as a takeaway order and the comanda loses its table.
    redirect(mesa ? `/m/${slug}/catalogo?mesa=${encodeURIComponent(mesa)}` : `/m/${slug}/catalogo`);
  }

  return <MenuClient data={data} />;
}
