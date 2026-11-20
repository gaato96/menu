import type { Metadata } from "next";

import { diasCalendario } from "@/content/internal/calendario-contenido";
import { requireSuperadmin } from "@/lib/auth/context";
import { businessTodayDateStr } from "@/lib/business/date-range";

import { CalendarioContenido } from "./calendario-contenido";

export const metadata: Metadata = {
  title: "Calendario de contenido",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

// Superadmin only, like the rest of /interno-64a0f7d0.
export default async function CalendarioPage() {
  await requireSuperadmin();
  const hoy = businessTodayDateStr("America/Argentina/Buenos_Aires");

  return (
    <main className="flex min-h-full flex-col bg-ink-50">
      <CalendarioContenido dias={diasCalendario()} hoy={hoy} />
    </main>
  );
}
