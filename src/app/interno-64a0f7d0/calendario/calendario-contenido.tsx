"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { type Dia, FORMATOS, type Historia, NOMBRE_MES, sumarDias } from "@/content/internal/calendario-contenido";
import { cn } from "@/lib/utils";

/**
 * Month grid for the phone: tap a day and see what reel goes out, which
 * story sequence goes up, what to produce for tomorrow and what else happens.
 * "Hoy / Mañana / Pasado" jump straight to the three days that matter most.
 */

const CABECERA = ["L", "M", "M", "J", "V", "S", "D"];

const COLOR_HISTORIA: Record<Historia["clase"], string> = {
  secuencia: "bg-[#2A5C8A]",
  fundadores: "bg-ink-400",
  revivir: "bg-ember-ink",
  compartir: "bg-brand",
  estado: "bg-success",
};

function paqueteHref(archivo: string) {
  return `/interno-64a0f7d0/reel/${encodeURIComponent(archivo)}`;
}

export function CalendarioContenido({ dias, hoy }: { dias: Dia[]; hoy: string }) {
  const porIso = useMemo(() => new Map(dias.map((d) => [d.iso, d])), [dias]);
  const inicial = porIso.has(hoy) ? hoy : dias[0]?.iso;
  const [elegido, setElegido] = useState(inicial);
  const dia = porIso.get(elegido);

  // Months present in the range, each laid out Monday-first.
  const meses = useMemo(() => {
    const grupos = new Map<string, Dia[]>();
    for (const d of dias) {
      const k = `${d.anio}-${d.mes}`;
      grupos.set(k, [...(grupos.get(k) ?? []), d]);
    }
    return [...grupos.values()];
  }, [dias]);
  const [mesVisible, setMesVisible] = useState(() => {
    const i = meses.findIndex((m) => m.some((d) => d.iso === inicial));
    return i < 0 ? 0 : i;
  });
  const mes = meses[mesVisible] ?? [];
  const huecos = mes.length ? (new Date(`${mes[0].iso}T12:00:00Z`).getUTCDay() + 6) % 7 : 0;

  function elegir(iso: string) {
    if (!porIso.has(iso)) return;
    setElegido(iso);
    const i = meses.findIndex((m) => m.some((d) => d.iso === iso));
    if (i >= 0) setMesVisible(i);
  }

  const atajos = [
    { label: "Hoy", iso: hoy },
    { label: "Mañana", iso: sumarDias(hoy, 1) },
    { label: "Pasado", iso: sumarDias(hoy, 2) },
  ];

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-3 p-3">
      <header className="flex items-center justify-between gap-2">
        <h1 className="font-display text-xl font-bold tracking-tight text-ink-900">Calendario de contenido</h1>
        <Link href="/interno-64a0f7d0" className="text-xs font-medium text-ink-600 underline underline-offset-2">
          Notas
        </Link>
      </header>

      <div className="grid grid-cols-3 gap-2">
        {atajos.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={() => elegir(a.iso)}
            disabled={!porIso.has(a.iso)}
            className={cn(
              "min-h-touch rounded-lg border text-sm font-semibold",
              elegido === a.iso ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 bg-white text-ink-800",
              !porIso.has(a.iso) && "opacity-40",
            )}
          >
            {a.label}
          </button>
        ))}
      </div>

      <section className="rounded-card border border-ink-200 bg-white p-3">
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMesVisible((i) => Math.max(0, i - 1))}
            disabled={mesVisible === 0}
            className="min-h-touch px-3 text-lg text-ink-700 disabled:opacity-30"
            aria-label="Mes anterior"
          >
            ‹
          </button>
          <p className="font-semibold capitalize text-ink-900">
            {mes[0] ? `${NOMBRE_MES(mes[0].mes)} ${mes[0].anio}` : ""}
          </p>
          <button
            type="button"
            onClick={() => setMesVisible((i) => Math.min(meses.length - 1, i + 1))}
            disabled={mesVisible === meses.length - 1}
            className="min-h-touch px-3 text-lg text-ink-700 disabled:opacity-30"
            aria-label="Mes siguiente"
          >
            ›
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {CABECERA.map((c, i) => (
            <span key={i} className="text-[11px] font-semibold text-ink-400">
              {c}
            </span>
          ))}
          {Array.from({ length: huecos }, (_, i) => (
            <span key={`h${i}`} />
          ))}
          {mes.map((d) => (
            <button
              key={d.iso}
              type="button"
              onClick={() => elegir(d.iso)}
              className={cn(
                "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg border text-sm",
                d.iso === elegido ? "border-ink-900 bg-ink-900 text-white" : "border-transparent",
                d.iso === hoy && d.iso !== elegido && "border-ember-ink",
                d.reel && d.iso !== elegido && "bg-brand-soft font-bold text-ink-900",
              )}
            >
              {d.numero}
              <span className="flex h-1.5 gap-0.5">
                {d.reel && <span className="size-1.5 rounded-full bg-brand" />}
                {d.historias.some((h) => h.clase === "secuencia") && <span className="size-1.5 rounded-full bg-[#2A5C8A]" />}
                {d.extras.length > 0 && <span className="size-1.5 rounded-full bg-ember-ink" />}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-ink-500">
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-brand" /> Reel</span>
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-[#2A5C8A]" /> Secuencia</span>
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-ember-ink" /> Algo más</span>
        </p>
      </section>

      {dia && <DetalleDia dia={dia} esHoy={dia.iso === hoy} />}
    </div>
  );
}

function DetalleDia({ dia, esHoy }: { dia: Dia; esHoy: boolean }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-lg font-bold capitalize text-ink-900">
        {esHoy ? "Hoy, " : ""}
        {dia.largo}
      </h2>

      <Bloque titulo="Reel de hoy · 16:00">
        {dia.reel ? (
          <TarjetaReel reel={dia.reel} />
        ) : (
          <p className="text-sm text-ink-500">Hoy no sale reel.</p>
        )}
      </Bloque>

      <Bloque titulo="Historias">
        {dia.historias.length ? (
          <ul className="flex flex-col gap-2">
            {dia.historias.map((h, i) => (
              <li key={i} className="flex gap-2">
                <span className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", COLOR_HISTORIA[h.clase])} />
                <div className="min-w-0 text-sm">
                  <p className="font-semibold text-ink-900">{h.titulo}</p>
                  {h.reel && h.reel.id !== "COMISION" && <p className="text-ink-700">«{h.reel.gancho}»</p>}
                  {h.detalle && <p className="text-xs text-ink-500">{h.detalle}</p>}
                  {h.reel?.archivo && (
                    <Link href={paqueteHref(h.reel.archivo)} className="text-xs font-medium text-ink-800 underline underline-offset-2">
                      Abrir el paquete
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-500">Nada: un detrás de escena, si hay.</p>
        )}
      </Bloque>

      {dia.produce && (
        <Bloque titulo="Producir hoy (sale mañana)">
          <TarjetaReel reel={dia.produce} />
        </Bloque>
      )}

      {dia.extras.length > 0 && (
        <Bloque titulo="Además">
          <ul className="list-disc space-y-1 pl-5 text-sm text-ink-800">
            {dia.extras.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </Bloque>
      )}
    </section>
  );
}

function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-ink-200 bg-white p-3">
      <p className="mb-2 text-xs font-semibold tracking-wide text-ink-500 uppercase">{titulo}</p>
      {children}
    </div>
  );
}

function TarjetaReel({ reel }: { reel: Dia["reel"] & object }) {
  return (
    <div className="text-sm">
      <p className="font-semibold text-ink-900">«{reel.gancho}»</p>
      <p className="mt-1 text-xs text-ink-600">
        {reel.id} · {reel.serie} · {FORMATOS[reel.formato]} · {reel.rubro}
      </p>
      <p className="text-xs text-ink-600">
        Pedido: comentá <b>{reel.palabra}</b>
      </p>
      {reel.antes && <p className="mt-1 rounded bg-ink-50 px-2 py-1 text-xs text-ink-700">Antes: {reel.antes}</p>}
      {reel.archivo ? (
        <Link href={paqueteHref(reel.archivo)} className="mt-1 inline-block text-xs font-medium text-ink-800 underline underline-offset-2">
          Abrir el paquete {reel.numero}
        </Link>
      ) : (
        <p className="mt-1 text-xs text-ink-400">El paquete se genera el día anterior.</p>
      )}
    </div>
  );
}
