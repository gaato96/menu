import type { Metadata } from "next";

import { createPublicClient } from "@/lib/supabase/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createPublicClient();
  const { data: business } = await supabase.from("businesses").select("name").eq("slug", slug).maybeSingle();

  return {
    title: business?.name ?? "Menú",
    manifest: `/m/${slug}/manifest.webmanifest`,
  };
}

export default function PublicMenuLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-full flex-1 flex-col bg-white">{children}</div>;
}
