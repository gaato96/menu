import { marked } from "marked";
import type { Metadata } from "next";

import { mensajesEnFrio } from "@/content/internal/mensajes-en-frio";
import { planContenido } from "@/content/internal/plan-contenido";
import { planMarketing } from "@/content/internal/plan-marketing";
import { productMarketing } from "@/content/internal/product-marketing";
import { prospeccion } from "@/content/internal/prospeccion";

import { DocsReader } from "./docs-reader";

// Not a real access boundary — just kept out of search results and off any
// nav link. Anyone with the exact URL can read it, which is the point: it
// has to open on a phone away from the laptop, with no login step.
export const metadata: Metadata = {
  title: "Notas internas",
  robots: { index: false, follow: false },
};

const DOCS = [
  { key: "plan", label: "Plan de marketing", source: planMarketing },
  { key: "contexto", label: "Contexto de producto", source: productMarketing },
  { key: "prospeccion", label: "Prospección", source: prospeccion },
  { key: "mensajes", label: "Mensajes en frío", source: mensajesEnFrio },
  { key: "contenido", label: "Plan de contenido", source: planContenido },
];

export default async function InternalDocsPage() {
  const docs = await Promise.all(
    DOCS.map(async (doc) => ({
      key: doc.key,
      label: doc.label,
      html: await marked.parse(doc.source),
    })),
  );

  return (
    <main className="flex min-h-full flex-col bg-ink-50">
      <DocsReader docs={docs} />
    </main>
  );
}
