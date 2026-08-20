import { redirect } from "next/navigation";

import { CatalogScroll } from "@/components/catalog/catalog-scroll";
import { getPublicMenu } from "@/lib/menu/queries";

export default async function CatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ mesa?: string }>;
}) {
  const { slug } = await params;
  // Reads ?mesa= for the same reason the classic menu does: now that this can
  // be the default view, the table QR lands HERE, and a dine_in order with no
  // table_id is rejected by the dine_in_requires_table constraint.
  const { mesa } = await searchParams;
  const data = await getPublicMenu(slug, mesa);

  if (!data.settings.catalog_view_enabled) redirect(`/m/${slug}`);

  return <CatalogScroll data={data} />;
}
