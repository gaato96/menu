import { marked } from "marked";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { reelPackages } from "@/content/internal/reel-packages";
import { requireSuperadmin } from "@/lib/auth/context";

export const metadata: Metadata = {
  title: "Paquete de reel",
  robots: { index: false, follow: false },
};

// One reel package (or DM resource) at a time, opened from the content
// calendar. Superadmin only, like the rest of /interno-64a0f7d0.
export default async function ReelPackagePage({ params }: { params: Promise<{ archivo: string }> }) {
  await requireSuperadmin();
  const { archivo } = await params;
  const paquete = reelPackages[decodeURIComponent(archivo)];
  if (!paquete) notFound();
  const html = await marked.parse(paquete.source);

  return (
    <main className="flex min-h-full flex-col bg-ink-50">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
        <nav className="sticky top-0 z-10 flex gap-3 border-b border-ink-200 bg-ink-50/95 px-3 py-2 text-xs font-medium backdrop-blur">
          <Link href="/interno-64a0f7d0/calendario" className="rounded-full bg-brand px-3 py-1.5 font-semibold text-white">
            ← Calendario
          </Link>
          <Link href="/interno-64a0f7d0" className="rounded-full bg-ink-100 px-3 py-1.5 text-ink-700">
            Notas
          </Link>
        </nav>
        <article className="doc-content px-4 py-6 sm:px-6" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </main>
  );
}
