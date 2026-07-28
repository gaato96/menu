import {
  ArrowRight,
  CheckCircle2,
  LayoutGrid,
  MessagesSquare,
  Percent,
  Play,
  Smartphone,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import {
  BoardScreen,
  CatalogScreen,
  MenuScreen,
  type DemoDish,
} from "@/components/marketing/demo-screens";
import { DishMarquee } from "@/components/marketing/dish-marquee";
import {
  ChaosToOrderScene,
  CountUp,
  Parallax,
  Rise,
  WordReveal,
} from "@/components/marketing/motion-primitives";
import { buttonVariants } from "@/components/ui/button";
import { TicketEdge } from "@/components/ui/ticket-edge";
import { getPublicMenu } from "@/lib/menu/queries";
import { cn } from "@/lib/utils";

const WHATSAPP_URL = "https://wa.me/543815976357";
const DEMO_SLUG = "burger-house-tuc";
const DEMO_MENU_URL = `/m/${DEMO_SLUG}`;
const DEMO_CATALOG_URL = `/m/${DEMO_SLUG}/catalogo`;

// Imagery comes from the live demo tenant, so a re-seed can never leave the
// landing pointing at a dead Storage object. Revalidated hourly rather than
// per-request: this is a marketing page, not a menu.
export const revalidate = 3600;

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

export default async function LandingPage() {
  const demo = await getPublicMenu(DEMO_SLUG);

  const allDishes: DemoDish[] = demo.categories.flatMap((category) =>
    category.products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      priceCents: product.base_price_cents,
      imageUrl: product.image_url,
    })),
  );
  const withPhotos = allDishes.filter((dish) => dish.imageUrl);
  const marqueeDishes = withPhotos.map((dish) => ({
    id: dish.id,
    name: dish.name,
    imageUrl: dish.imageUrl!,
  }));
  const half = Math.ceil(marqueeDishes.length / 2);

  const business = {
    name: demo.business.name,
    address: demo.business.address,
    coverImageUrl: demo.business.cover_image_url,
    logoUrl: demo.business.logo_url,
    currency: demo.business.currency,
  };
  const heroDish = withPhotos[1] ?? withPhotos[0];

  return (
    <>
      {/* ================================================================ */}
      {/* Hero — the dark half. This is a Friday at 21:30.                  */}
      {/* ================================================================ */}
      <section className="grain ember-glow relative overflow-hidden bg-night-950">
        <div className="relative z-10 mx-auto max-w-6xl px-4 pt-14 pb-10 sm:pt-20">
          <Rise>
            <p className="font-mono text-xs font-medium tracking-[0.2em] text-ember uppercase">
              Restaurantes · Pizzerías · Hamburgueserías
            </p>
          </Rise>

          <h1 className="mt-5 max-w-3xl font-display text-[clamp(3rem,11vw,7rem)] leading-[0.86] font-extrabold tracking-tight text-white text-balance">
            <WordReveal text="Tu menú. Tu pedido." delay={0.1} />
            <br />
            <WordReveal text="Tu plata." highlight={["plata."]} delay={0.5} />
          </h1>

          <Rise delay={0.7} className="mt-6 max-w-lg">
            <p className="text-lg text-white/70">
              Tus clientes piden desde el celular con fotos y todo. A vos te llega armado y
              prolijo, y confirmás en un toque. Sin PedidosYa. Sin comisión.
            </p>
          </Rise>

          <Rise delay={0.85} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-[#25D366] shadow-lg shadow-[#25D366]/20 transition-transform hover:scale-[1.02] hover:brightness-95",
              )}
            >
              Escribinos por WhatsApp
              <ArrowRight className="size-4" aria-hidden />
            </a>
            <Link
              href={DEMO_MENU_URL}
              className={cn(
                buttonVariants({ size: "lg" }),
                "border border-white/20 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10",
              )}
            >
              <Play className="size-4" aria-hidden />
              Ver un menú en vivo
            </Link>
          </Rise>
        </div>

        {/* Two bands of real dishes, running opposite ways. The signature
            moment: the product's actual content, in motion, as the backdrop. */}
        <div className="relative z-10 space-y-3 pb-10">
          <DishMarquee dishes={marqueeDishes.slice(0, half)} durationSeconds={70} priority />
          <DishMarquee
            dishes={marqueeDishes.slice(half)}
            direction="right"
            durationSeconds={85}
            size={128}
            max={9}
          />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-24 bg-gradient-to-t from-night-950 to-transparent" />
      </section>

      {/* ================================================================ */}
      {/* Stats strip — the hinge between the dark and light halves         */}
      {/* ================================================================ */}
      <section className="border-b border-ink-200 bg-night-900 px-4 py-8">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-4 text-center">
          <Stat value={0} suffix="%" label="de comisión por pedido" />
          <Stat value={100} suffix="%" label="de la venta queda en tu caja" />
          <Stat value={30} suffix=" seg" label="para confirmar una comanda" />
        </div>
      </section>

      {/* ================================================================ */}
      {/* Problem → solution. The lights come up.                           */}
      {/* ================================================================ */}
      <section className="dot-grid relative px-4 py-20 sm:py-28">
        <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
          <Rise>
            <p className="font-mono text-xs font-semibold tracking-[0.2em] text-ember-ink uppercase">
              El problema
            </p>
            <h2 className="mt-3 font-display text-3xl leading-[0.95] font-extrabold tracking-tight text-ink-900 text-balance sm:text-5xl">
              Un pedido no debería tardar quince mensajes
            </h2>
            <p className="mt-4 max-w-md text-ink-700">
              Precio, agregados, dirección, forma de pago. Todo suelto en un chat, mezclado con
              audios, mientras la cocina espera y el teléfono vuelve a sonar. Así se pierden
              pedidos y así se equivocan.
            </p>
            <p className="mt-4 max-w-md font-medium text-ink-900">
              Menú Digital convierte eso en una comanda. Sola, ordenada, con todo adentro.
            </p>
          </Rise>

          <ChaosToOrderScene
            before={
              <div className="shadow-ticket rounded-card border border-ink-200 bg-white p-3">
                <p className="mb-2 text-center font-mono text-[0.6rem] tracking-wide text-ink-500 uppercase">
                  Hoy, por WhatsApp
                </p>
                <div className="space-y-1.5">
                  <ChatBubble from="them">Hola buenas, quería hacer un pedido</ChatBubble>
                  <ChatBubble from="them">2 doble cheddar, una sin cebolla</ChatBubble>
                  <ChatBubble from="us">dale! con papas o sin?</ChatBubble>
                  <ChatBubble from="them">una con papas grandes</ChatBubble>
                  <ChatBubble from="them">ah y la dirección es Laprida 800</ChatBubble>
                  <ChatBubble from="them">🙏🙏</ChatBubble>
                  <ChatBubble from="us">perdon como era la sin cebolla??</ChatBubble>
                </div>
              </div>
            }
            after={
              <div>
                <div className="shadow-ticket rounded-card rounded-b-none border border-ink-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-semibold text-ink-900">D-0142</span>
                    <span className="bg-success-soft text-success flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
                      <CheckCircle2 className="size-3" />
                      Confirmado
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-ink-900">
                    Julieta Ríos · Laprida 800
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-ink-700">
                    <li>
                      <span className="font-mono font-medium">2×</span> Doble Cheddar
                      <span className="block pl-4 text-xs text-ink-500">1 sin cebolla</span>
                    </li>
                    <li>
                      <span className="font-mono font-medium">1×</span> Papas grandes
                    </li>
                  </ul>
                  <div className="mt-2 flex items-center justify-between border-t border-ink-100 pt-2">
                    <span className="font-mono text-sm font-semibold text-ink-900">$ 31.900</span>
                    <span className="text-xs text-ink-500">Efectivo</span>
                  </div>
                </div>
                <TicketEdge fill="var(--color-ink-50)" />
              </div>
            }
          />
        </div>
      </section>

      {/* ================================================================ */}
      {/* Benefits — asymmetric bento, not four equal boxes                 */}
      {/* ================================================================ */}
      <section className="bg-white px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <Rise>
            <h2 className="max-w-xl font-display text-3xl leading-[0.95] font-extrabold tracking-tight text-ink-900 text-balance sm:text-4xl">
              Lo que cambia para tu local
            </h2>
          </Rise>

          <div className="mt-10 grid gap-4 sm:grid-cols-6">
            {BENEFITS.map((benefit, index) => (
              <Rise
                key={benefit.title}
                delay={index * 0.08}
                className={index < 2 ? "sm:col-span-3" : "sm:col-span-2"}
              >
                <div className="group h-full rounded-card border border-ink-200 bg-ink-50 p-5 transition-colors hover:border-brand hover:bg-brand-soft">
                  <span className="flex size-11 items-center justify-center rounded-lg bg-brand text-brand-fg">
                    <benefit.icon className="size-5" aria-hidden />
                  </span>
                  <p className="mt-4 font-display text-xl font-bold text-ink-900">
                    {benefit.title}
                  </p>
                  <p className="mt-1.5 text-sm text-ink-700">{benefit.body}</p>
                </div>
              </Rise>
            ))}

            <Rise delay={0.32} className="sm:col-span-2">
              <div className="flex h-full flex-col justify-between rounded-card bg-night-950 p-5">
                <p className="font-display text-xl leading-tight font-bold text-white">
                  Y el tablero que ve tu mostrador
                </p>
                <div className="mt-4 scale-90 origin-top-left">
                  <BoardScreen />
                </div>
              </div>
            </Rise>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* How it works — a real sequence, staged like order status          */}
      {/* ================================================================ */}
      <section className="px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <Rise>
            <h2 className="max-w-xl font-display text-3xl leading-[0.95] font-extrabold tracking-tight text-ink-900 text-balance sm:text-4xl">
              De la idea al pedido en tres pasos
            </h2>
          </Rise>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <Rise key={step.title} delay={index * 0.12}>
                <div className="relative">
                  <span className="font-mono text-xs font-semibold tracking-[0.15em] text-brand uppercase">
                    {step.stage}
                  </span>
                  <div className="mt-3 h-px w-full bg-gradient-to-r from-brand to-transparent" />
                  <h3 className="mt-4 font-display text-2xl leading-tight font-bold text-ink-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-ink-700">{step.body}</p>
                </div>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* Catalog scroll spotlight                                          */}
      {/* ================================================================ */}
      <section className="grain relative overflow-hidden bg-night-900 px-4 py-20 sm:py-28">
        <div className="ember-glow pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Rise>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ember/15 px-3 py-1 text-xs font-semibold text-ember">
              <Sparkles className="size-3.5" aria-hidden />
              Nuevo
            </span>
            <h2 className="mt-4 font-display text-3xl leading-[0.95] font-extrabold tracking-tight text-white text-balance sm:text-5xl">
              Un catálogo que se mira, no se lee
            </h2>
            <p className="mt-4 max-w-md text-white/70">
              Scroll vertical, una foto por plato, precio grande y un botón para agregar.
              Pensado para mandarlo por historia de Instagram, no para competir con una carta
              en PDF que nadie abre.
            </p>
            <Link
              href={DEMO_CATALOG_URL}
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-6 border border-white/20 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10",
              )}
            >
              Probar el catálogo
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Rise>

          {heroDish && (
            <Parallax strength={40} className="mx-auto w-full max-w-[260px]">
              <CatalogScreen
                dish={heroDish}
                currency={business.currency}
                categoryName={demo.categories[0]?.name ?? "Destacados"}
              />
            </Parallax>
          )}
        </div>
      </section>

      {/* ================================================================ */}
      {/* Live demo                                                         */}
      {/* ================================================================ */}
      <section className="bg-white px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Rise className="order-2 mx-auto w-full max-w-[280px] lg:order-1">
              <Parallax strength={30}>
                <MenuScreen business={business} dishes={withPhotos} />
              </Parallax>
            </Rise>

            <Rise delay={0.1} className="order-1 lg:order-2">
              <p className="font-mono text-xs font-semibold tracking-[0.2em] text-ember-ink uppercase">
                En vivo
              </p>
              <h2 className="mt-3 font-display text-3xl leading-[0.95] font-extrabold tracking-tight text-ink-900 text-balance sm:text-4xl">
                Mirá un menú real, no una maqueta
              </h2>
              <p className="mt-4 max-w-md text-ink-700">
                Este es {business.name}, un local armado con Menú Digital. Las fotos de arriba
                salen de ese mismo menú. Entrá, armá un pedido y tocá todo lo que quieras — es
                la versión real corriendo ahora mismo.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href={DEMO_MENU_URL} className={buttonVariants({ size: "lg" })}>
                  Abrir el menú
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                <Link
                  href={DEMO_CATALOG_URL}
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  Ver el catálogo
                </Link>
              </div>
            </Rise>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* Final CTA — back into the dark, bookending the page               */}
      {/* ================================================================ */}
      <section className="grain ember-glow relative overflow-hidden bg-night-950 px-4 py-20 sm:py-28">
        <Rise className="relative mx-auto max-w-2xl text-center">
          <h2 className="font-display text-[clamp(2.5rem,9vw,5rem)] leading-[0.9] font-extrabold tracking-tight text-white text-balance">
            ¿Arrancamos?
          </h2>
          <p className="mt-4 text-lg text-white/70">
            Mandanos un WhatsApp y en un rato ya tenés tu menú armado.
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-8 bg-[#25D366] px-10 shadow-lg shadow-[#25D366]/25 transition-transform hover:scale-[1.02] hover:brightness-95",
            )}
          >
            Escribinos ahora
            <ArrowRight className="size-4" aria-hidden />
          </a>
          <p className="mt-5 text-xs text-white/50">
            Sin tarjeta. Sin contrato atado. Hablás con una persona, no con un bot.
          </p>
        </Rise>
      </section>
    </>
  );
}

function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  return (
    <div>
      <p className="font-mono text-3xl font-semibold tracking-tight text-ember tabular-nums sm:text-4xl">
        <CountUp to={value} suffix={suffix} />
      </p>
      <p className="mt-1 text-xs text-white/55">{label}</p>
    </div>
  );
}

function ChatBubble({ from, children }: { from: "them" | "us"; children: React.ReactNode }) {
  return (
    <div className={`flex ${from === "us" ? "justify-end" : "justify-start"}`}>
      <span
        className={cn(
          "max-w-[80%] rounded-lg px-2 py-1 text-xs text-ink-900",
          from === "us" ? "bg-[#dcf8c6]" : "bg-ink-100",
        )}
      >
        {children}
      </span>
    </div>
  );
}
