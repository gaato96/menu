import { getPublicMenu } from "@/lib/menu/queries";

import { MenuClient } from "./menu-client";

export default async function PublicMenuPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ mesa?: string }>;
}) {
  const { slug } = await params;
  const { mesa } = await searchParams;
  const data = await getPublicMenu(slug, mesa);

  return <MenuClient data={data} />;
}
