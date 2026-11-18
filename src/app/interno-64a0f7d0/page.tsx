import { marked } from "marked";

import { requireSuperadmin } from "@/lib/auth/context";
import type { Metadata } from "next";

import { guiaProduccion } from "@/content/internal/guia-produccion";
import { manualDeMarca } from "@/content/internal/manual-de-marca";
import { mensajesEnFrio } from "@/content/internal/mensajes-en-frio";
import { nombresYMarca } from "@/content/internal/nombres-y-marca";
import { planContenido } from "@/content/internal/plan-contenido";
import { planMarketing } from "@/content/internal/plan-marketing";
import { precios } from "@/content/internal/precios";
import { productMarketing } from "@/content/internal/product-marketing";
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

const DOCS = [
  { key: "progreso", label: "Progreso", source: progreso },
  { key: "plan", label: "Plan de marketing", source: planMarketing },
  { key: "contexto", label: "Contexto de producto", source: productMarketing },
  { key: "prospeccion", label: "Prospección", source: prospeccion },
  { key: "sistema-frio", label: "Sistema en frío", source: sistemaProspeccionFrio },
  { key: "mensajes", label: "Mensajes en frío", source: mensajesEnFrio },
  { key: "contenido", label: "Plan de contenido", source: planContenido },
  { key: "produccion", label: "Guía de producción", source: guiaProduccion },
  { key: "precios", label: "Precios", source: precios },
  { key: "marca", label: "Nombre y marca", source: nombresYMarca },
  { key: "manual", label: "Manual de marca", source: manualDeMarca },
];

export default async function InternalDocsPage() {
  await requireSuperadmin();

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
