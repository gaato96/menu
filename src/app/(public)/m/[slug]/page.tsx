import { getPublicMenu } from "@/lib/menu/queries";

import { MenuClient } from "./menu-client";

export default async function PublicMenuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getPublicMenu(slug);

  return <MenuClient data={data} />;
}
