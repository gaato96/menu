import { marked } from "marked";

import { requireSuperadmin } from "@/lib/auth/context";
import type { Metadata } from "next";

import { manualDeMarca } from "@/content/internal/manual-de-marca";
import { marketingDocs } from "@/content/internal/marketing-docs";
import { mensajesEnFrio } from "@/content/internal/mensajes-en-frio";
import { nombresYMarca } from "@/content/internal/nombres-y-marca";
import { planMarketing } from "@/content/internal/plan-marketing";
import { precios } from "@/content/internal/precios";
import { progreso } from "@/content/internal/progreso";
import { prospeccion } from "@/content/internal/prospeccion";
import { sistemaProspeccionFrio } from "@/content/internal/sistema-prospeccion-frio";

import { DocsReader } from "./docs-reader";

// Superadmin only. It used to be open to anyone with the URL (and robots.txt
// named the prefix), which put pricing reasoning, cold-message scripts and
// competitor notes one click from a competitor or a prospect. On a phone this
// is one login, then the session sticks.
export const metadata: Metadata = {
  title: "Notas internas",
  robots: { index: false, follow: false },
};

// The current notes come generated from marketing/ (npm run docs:internal).
// The hand-copied July/August documents after them are history: they no
// longer govern, except the brand manual and the name/brand note.
const DOCS = [
  ...marketingDocs,
  { key: "manual", label: "Manual de marca", source: manualDeMarca },
  { key: "marca", label: "Nombre y marca", source: nombresYMarca },
  { key: "progreso", label: "Progreso (ago)", source: progreso },
  { key: "plan", label: "Plan de marketing (jul)", source: planMarketing },
  { key: "prospeccion", label: "Prospección (jul)", source: prospeccion },
  { key: "sistema-frio", label: "Sistema en frío (ago)", source: sistemaProspeccionFrio },
  { key: "mensajes", label: "Mensajes en frío (ago)", source: mensajesEnFrio },
  { key: "precios", label: "Precios (jul)", source: precios },
];

export default async function InternalDocsPage({ searchParams }: { searchParams: Promise<{ doc?: string }> }) {
  await requireSuperadmin();
  const { doc } = await searchParams;

  const docs = await Promise.all(
    DOCS.map(async (doc) => ({
      key: doc.key,
      label: doc.label,
      html: await marked.parse(doc.source),
    })),
  );

  return (
    <main className="flex min-h-full flex-col bg-ink-50">
      <DocsReader docs={docs} initial={doc} />
    </main>
  );
}
