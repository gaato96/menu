import { redirect } from "next/navigation";

import { CatalogScroll } from "@/components/catalog/catalog-scroll";
import { getPublicMenu } from "@/lib/menu/queries";

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getPublicMenu(slug);

  if (!data.settings.catalog_view_enabled) redirect(`/m/${slug}`);

  return <CatalogScroll data={data} />;
}
