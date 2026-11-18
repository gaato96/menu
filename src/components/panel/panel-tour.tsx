"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

/**
 * First-run tour for the owner or manager of a new local.
 *
 * Hand-rolled rather than a tour library: five steps, a spotlight and a
 * card. Targets are `data-tour` attributes on the real UI (nav tabs, "Ver
 * menú"), so the tour can never describe a button that is not there — a
 * step whose target is missing (module off, different role) is skipped.
 *
 * Shown once per person: finishing or skipping calls `onDone`, which stamps
 * profiles.tour_completed_at. The guide page has "Ver el recorrido de nuevo".
 */

type Step = { target?: string; title: string; body: string };

function stepsFor(businessName: string, menuUrl: string): Step[] {
  return [
    {
      title: `Bienvenido a VivoMenu, ${businessName}`,
      body: "En un minuto te muestro dónde está cada cosa. Podés saltearlo y verlo después desde la Guía de uso.",
    },
    {
      target: "tab-comandas",
      title: "Comandas: acá entran los pedidos",
      body: "Cada pedido aparece al instante con una alerta. Lo pasás de columna con un toque: confirmar, a cocina, despachar. Si el cliente no mandó el WhatsApp, la tarjeta te avisa y le podés escribir desde ahí.",
    },
    {
      target: "ver-menu",
      title: "Tu menú público",
      body: `Este es el link que le pasás a tus clientes: ${menuUrl}. Ponelo en la respuesta automática de WhatsApp Business: el cliente arma el pedido y te llega ordenado, con dirección y forma de pago.`,
    },
    {
      target: "tab-mas",
      title: "Menú, Configuración y Resumen",
      body: "En Más cambiás precios y fotos, marcás algo como agotado, cargás horarios y zonas de delivery, y cada lunes mirás el resumen de la semana.",
    },
    {
      title: "Listo para empezar",
      body: "Antes del primer pedido revisá tu carta y tus horarios. En la Guía de uso tenés la lista de puesta en marcha y cómo poner el link en WhatsApp paso a paso.",
    },
  ];
}

type Rect = { top: number; left: number; width: number; height: number };

export function PanelTour({
  businessName,
  menuUrl,
  onDone,
}: {
  businessName: string;
  menuUrl: string;
  onDone: () => Promise<void>;
}) {
  const steps = stepsFor(businessName, menuUrl);
  const [open, setOpen] = useState(true);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const step = steps[index];

  const measure = useCallback(() => {
    const el = step.target ? document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`) : null;
    if (!el) return setRect(null);
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step.target]);

  useEffect(() => {
    if (!open) return;
    // Next frame: state updates happen in a callback, not in the effect body,
    // and the measurement runs after scrollIntoView moved the tab row.
    const frame = requestAnimationFrame(() => {
      if (step.target) {
        const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
        // Skip steps whose target is not on screen for this role/module set.
        if (!el) return setIndex((i) => Math.min(i + 1, steps.length - 1));
        // The tab row scrolls sideways on a phone: bring the target into view.
        el.scrollIntoView({ block: "nearest", inline: "center" });
      }
      measure();
    });
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, step.target, steps.length, measure]);

  function finish() {
    setOpen(false);
    startTransition(() => onDone());
  }

  if (!open) return null;

  const last = index === steps.length - 1;
  const pad = 6;
  // Card goes under the target when there is room, otherwise centred.
  const cardTop = rect ? Math.min(rect.top + rect.height + pad + 10, window.innerHeight - 260) : undefined;
  const cardLeft = rect ? Math.max(12, Math.min(rect.left, window.innerWidth - 352)) : undefined;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      {rect ? (
        <div
          className="pointer-events-none absolute rounded-lg ring-2 ring-brand transition-all duration-200"
          style={{
            top: rect.top - pad,
            left: rect.left - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
            boxShadow: "0 0 0 9999px rgb(20 16 12 / 0.55)",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-[rgb(20_16_12/0.55)]" />
      )}

      <div
        className={
          rect
            ? "absolute w-[min(340px,calc(100vw-24px))] rounded-card bg-white p-4 shadow-xl"
            : "absolute top-1/2 left-1/2 w-[min(380px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 rounded-card bg-white p-5 shadow-xl"
        }
        style={rect ? { top: cardTop, left: cardLeft } : undefined}
      >
        <div className="flex items-start justify-between gap-3">
          <p id="tour-title" className="font-display text-base font-bold text-ink-900">
            {step.title}
          </p>
          <button
            type="button"
            onClick={finish}
            aria-label="Cerrar el recorrido"
            className="-m-1 rounded p-1 text-ink-400 hover:text-ink-700"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
        <p className="mt-2 text-sm text-ink-700">{step.body}</p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="text-xs text-ink-400">
            {index + 1} de {steps.length}
          </span>
          <div className="flex gap-2">
            {index === 0 ? (
              <Button variant="ghost" size="sm" onClick={finish} disabled={pending}>
                Saltear
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setIndex((i) => i - 1)}>
                Atrás
              </Button>
            )}
            {last ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={() => {
                    // Navigate explicitly: a <Link> inside an overlay that
                    // unmounts on click loses the navigation.
                    finish();
                    router.push("/panel/guia");
                  }}
                >
                  Ir a la guía
                </Button>
                <Button size="sm" onClick={finish} disabled={pending}>
                  Terminar
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => setIndex((i) => i + 1)}>
                {index === 0 ? "Empezar" : "Siguiente"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
