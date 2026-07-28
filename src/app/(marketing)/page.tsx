import {
  ArrowRight,
  LayoutGrid,
  MessagesSquare,
  Percent,
  Play,
  Smartphone,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ChaosToTicket } from "@/components/marketing/chaos-to-ticket";
import { Reveal } from "@/components/marketing/reveal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const WHATSAPP_URL = "https://wa.me/543815976357";
const DEMO_MENU_URL = "/m/burger-house-tuc";
const DEMO_CATALOG_URL = "/m/burger-house-tuc/catalogo";

export const metadata: Metadata = {
  title: "Menú digital y tablero de comandas para tu local",
  description:
    "Tus clientes piden desde el celular con fotos y todo. A vos te llega armado al WhatsApp y a un tablero en tiempo real. Sin comisión por pedido.",
};

const BENEFITS = [
  {
    icon: Percent,
    title: "Te quedás con el 100%",
    body: "Nada de comisión por pedido como PedidosYa o Rappi. Lo que cobrás, es tuyo.",
  },
  {
    icon: MessagesSquare,
    title: "Se terminó el teléfono ardiendo",
    body: "Los pedidos entran ordenados y con foto — no mezclados con audios y memes en el mismo chat.",
  },
  {
    icon: LayoutGrid,
    title: "Tu mostrador ve todo en un tablero",
    body: "Comandas en tiempo real, columna por columna. Nadie grita “¿va el pedido 4?” desde la cocina.",
  },
  {
    icon: Smartphone,
    title: "Anda como una app, sin ser una app",
    body: "Tu cliente la instala con un toque desde el navegador. Vos no le pagás nada a Google ni a Apple.",
  },
];

const STEPS = [
  {
    stage: "Pedido",
    title: "Armamos tu menú",
    body: "Nos mandás tus platos, precios y fotos por WhatsApp. Nosotros lo cargamos con las variantes y los agregados.",
  },
  {
    stage: "Confirmado",
    title: "Tu cliente pide solo",
    body: "Entra al link de tu negocio, arma el pedido y lo manda — sin escribirte a las 21:30 un viernes a preguntar el precio.",
  },
  {
    stage: "En cocina",
    title: "Vos confirmás y listo",
    body: "El pedido cae directo a tu WhatsApp y a tu tablero. Vos decidís cuándo entra a cocina.",
  },
] as const;

export default function LandingPage() {
  return (
    <>
      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-5xl px-4 pt-10 pb-4 sm:pt-16">
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          <div>
            <p className="font-mono text-xs font-medium tracking-wide text-ink-500 uppercase">
              Para restaurantes, pizzerías y hamburgueserías
            </p>
            <h1 className="mt-3 font-display text-4xl leading-[0.95] font-extrabold tracking-tight text-ink-900 sm:text-5xl">
              Tu menú. Tu pedido. <span className="text-brand">Tu plata.</span>
            </h1>
            <p className="mt-4 max-w-md text-base text-ink-700">
              Tus clientes piden desde el celular con fotos y todo. A vos te llega armado y
              prolijo, y confirmás en un toque. Sin PedidosYa. Sin comisión.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ size: "lg" }), "bg-[#25D366] hover:brightness-95")}
              >
                Escribinos por WhatsApp
                <ArrowRight className="size-4" aria-hidden />
              </a>
              <Link href={DEMO_MENU_URL} className={buttonVariants({ variant: "outline", size: "lg" })}>
                <Play className="size-4" aria-hidden />
                Ver un menú en vivo
              </Link>
            </div>
          </div>

          <ChaosToTicket />
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Benefits — receipt line items, on purpose                        */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
        <Reveal>
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
            Lo que cambia para tu local
          </h2>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {BENEFITS.map((benefit, index) => (
            <Reveal key={benefit.title} delay={index * 80}>
              <div className="shadow-ticket flex h-full gap-3 rounded-card border border-ink-200 bg-white p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                  <benefit.icon className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="font-semibold text-ink-900">{benefit.title}</p>
                  <p className="mt-0.5 text-sm text-ink-500">{benefit.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* How it works — a real sequence, staged like order status         */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4">
          <Reveal>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
              De la idea al pedido en tres pasos
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <Reveal key={step.title} delay={index * 100} className="relative">
                <span className="font-mono text-xs font-semibold tracking-wide text-brand uppercase">
                  {step.stage}
                </span>
                <h3 className="mt-2 font-display text-xl font-bold text-ink-900">{step.title}</h3>
                <p className="mt-1.5 text-sm text-ink-500">{step.body}</p>
                {index < STEPS.length - 1 && (
                  <div className="mt-6 hidden h-px bg-ink-100 sm:block" aria-hidden />
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Feature spotlight — catalog scroll                               */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand">
              <Sparkles className="size-3.5" aria-hidden />
              Nuevo
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
              Un catálogo que se mira, no se lee
            </h2>
            <p className="mt-3 max-w-md text-sm text-ink-700">
              Scroll vertical, una foto por plato, precio grande y un botón para agregar —
              pensado para compartir en una historia de Instagram, no para competir con una
              carta en PDF.
            </p>
            <Link
              href={DEMO_CATALOG_URL}
              className={cn(buttonVariants({ variant: "outline", size: "md" }), "mt-5")}
            >
              Probar el catálogo
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Reveal>

          <Reveal delay={120} className="mx-auto w-full max-w-[220px]">
            <div className="shadow-ticket aspect-[9/16] overflow-hidden rounded-2xl border-4 border-ink-900 bg-ink-900">
              <div className="relative flex size-full flex-col justify-end bg-gradient-to-br from-brand to-ink-900 p-4">
                <span className="w-fit rounded-full bg-white/15 px-2 py-0.5 text-[0.65rem] font-medium text-white backdrop-blur-sm">
                  Hamburguesas
                </span>
                <p className="font-display mt-2 text-lg leading-tight font-extrabold text-white">
                  Doble Cheddar
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-white">$ 13.900</span>
                  <span className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-brand-fg">
                    Agregar
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Live demo                                                         */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4">
          <Reveal className="text-center">
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
              Mirá un menú real, no una maqueta
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-ink-700">
              Este es el menú de Burger House, un local armado con Menú Digital. Pedí, mirá el
              catálogo, tocá todo lo que quieras — es la versión real, corriendo en vivo.
            </p>
          </Reveal>

          <Reveal delay={120} className="mx-auto mt-8 w-full max-w-[300px]">
            <div className="shadow-ticket overflow-hidden rounded-[2rem] border-8 border-ink-900 bg-white">
              <iframe
                src={DEMO_MENU_URL}
                title="Menú de Burger House Tucumán"
                loading="lazy"
                className="h-[560px] w-full"
              />
            </div>
            <div className="mt-3 flex justify-center gap-4 text-sm">
              <a
                href={DEMO_MENU_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand underline-offset-2 hover:underline"
              >
                Abrir en una pestaña nueva
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Final CTA                                                         */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-brand px-4 py-16 sm:py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-brand-fg sm:text-4xl">
            ¿Arrancamos?
          </h2>
          <p className="mt-3 text-brand-fg/85">
            Mandanos un WhatsApp y en un rato ya tenés tu menú armado.
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-touch-lg items-center gap-2 rounded-lg bg-[#25D366] px-8 text-base font-semibold text-white hover:brightness-95"
          >
            Escribinos ahora
            <ArrowRight className="size-4" aria-hidden />
          </a>
          <p className="mt-4 text-xs text-brand-fg/70">
            Sin tarjeta. Sin contrato atado. Hablás con una persona, no con un bot.
          </p>
        </Reveal>
      </section>
    </>
  );
}
