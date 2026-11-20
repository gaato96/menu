import { marked } from "marked";

import { requireSuperadmin } from "@/lib/auth/context";
import type { Metadata } from "next";

import { marketingDocs } from "@/content/internal/marketing-docs";

import { DocsReader } from "./docs-reader";

// Superadmin only. It used to be open to anyone with the URL (and robots.txt
// named the prefix), which put pricing reasoning, cold-message scripts and
// competitor notes one click from a competitor or a prospect. On a phone this
// is one login, then the session sticks.
//
// Only the notes that govern today (generated from marketing/ by
// `npm run docs:internal`). Superseded documents live in marketing/archivo/,
// and each reel package opens on its own page from the calendar.
export const metadata: Metadata = {
  title: "Notas internas",
  robots: { index: false, follow: false },
};

export default async function InternalDocsPage({ searchParams }: { searchParams: Promise<{ doc?: string }> }) {
  await requireSuperadmin();
  const { doc } = await searchParams;

  const docs = await Promise.all(
    marketingDocs.map(async (d) => ({
      key: d.key,
      label: d.label,
      html: await marked.parse(d.source),
    })),
  );

  return (
    <main className="flex min-h-full flex-col bg-ink-50">
      <DocsReader docs={docs} initial={doc} />
    </main>
  );
}
