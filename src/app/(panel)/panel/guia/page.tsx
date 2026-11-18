import { CheckCircle2, Circle, MessageCircle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { requireStaff } from "@/lib/auth/context";
import { canConfigure } from "@/lib/auth/roles";
import { siteUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

import { restartTour } from "./actions";

export const metadata = { title: "Guía de uso" };
export const dynamic = "force-dynamic";

const SUPPORT_WHATSAPP = "https://wa.me/543815976357";

type Check = { done: boolean; label: string; hint: string; href?: string };

export default async function GuidePage() {
  const staff = await requireStaff();
  const supabase = await createClient();
  const isManager = canConfigure(staff.role);
  const menuUrl = `${siteUrl()}/m/${staff.business.slug}`;

  // RLS scopes every count to this business.
  const [products, withPhoto, hours, zones, team] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).not("image_url", "is", null),
    supabase.from("business_hours").select("id", { count: "exact", head: true }),
    supabase.from("delivery_zones").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_active", true),
  ]);

  const productCount = products.count ?? 0;
  const photoCount = withPhoto.count ?? 0;
  const s = staff.settings;

  const checks: Check[] = [
    {
      done: productCount > 0,
      label: "La carta está cargada",
      hint: productCount > 0 ? `${productCount} productos.` : "Cargala a mano o importala desde una foto o un PDF.",
      href: productCount > 0 ? "/panel/menu" : "/panel/menu/importar",
    },
    {
      done: productCount > 0 && photoCount >= productCount / 2,
      label: "La mitad de los platos tienen foto",
      hint: `${photoCount} de ${productCount}. Con la foto del celular alcanza; la IA la mejora.`,
      href: "/panel/menu",
    },
    {
      done: (hours.count ?? 0) > 0,
      label: "Horarios cargados",
      hint: "Fuera de horario el menú no toma pedidos. Si un día abrís de más, usá «Local abierto ahora».",
      href: "/panel/config",
    },
    {
      done: !s.delivery_enabled || (zones.count ?? 0) > 0,
      label: "Zonas de delivery con su costo",
      hint: s.delivery_enabled ? "Cada barrio con su precio de envío." : "No hacés delivery: no hace falta.",
      href: "/panel/config",
    },
    {
      done: Boolean(staff.business.logo_url),
      label: "Logo del local",
      hint: "Aparece en el menú y en el ícono de la app.",
      href: "/panel/config",
    },
    {
      done: !s.transfer_enabled || Boolean(s.transfer_alias || s.transfer_cbu),
      label: "Datos para transferir",
      hint: s.transfer_enabled ? "Alias o CBU, para que el cliente los vea al pagar." : "No aceptás transferencia.",
      href: "/panel/config",
    },
    {
      done: (team.count ?? 0) > 1,
      label: "Tu equipo tiene su usuario",
      hint: "Cajero, encargado o mozo, cada uno con lo suyo.",
      href: staff.role === "owner" ? "/panel/usuarios" : undefined,
    },
  ];
  const doneCount = checks.filter((c) => c.done).length;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-3 sm:p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="font-display text-lg font-bold tracking-tight text-ink-900 sm:text-xl">Guía de uso</h1>
          <p className="text-sm text-ink-600">Todo lo que hace falta para el primer pedido y para el día a día.</p>
        </div>
        {isManager && (
          <form action={restartTour}>
            <Button type="submit" variant="outline" size="sm">
              Ver el recorrido de nuevo
            </Button>
          </form>
        )}
      </div>

      {isManager && (
        <section className="rounded-card border border-ink-200 bg-white p-4">
          <h2 className="font-semibold text-ink-900">
            Puesta en marcha · {doneCount} de {checks.length}
          </h2>
          <ul className="mt-3 space-y-2">
            {checks.map((check) => (
              <li key={check.label} className="flex items-start gap-2">
                {check.done ? (
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
                ) : (
                  <Circle className="mt-0.5 size-5 shrink-0 text-ink-300" aria-hidden />
                )}
                <div className="min-w-0">
                  {check.href && !check.done ? (
                    <Link href={check.href} className="font-medium text-ink-900 underline underline-offset-2">
                      {check.label}
                    </Link>
                  ) : (
                    <p className={check.done ? "text-ink-500" : "font-medium text-ink-900"}>{check.label}</p>
                  )}
                  <p className="text-xs text-ink-500">{check.hint}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="space-y-2">
        <GuideItem title="Poner el link del menú en WhatsApp" open={isManager}>
          <p>
            Tu link es <span className="font-mono text-ink-900">{menuUrl}</span>. La idea es que cada vez que alguien te
            escribe, le llegue el link para que arme el pedido solo.
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>
              En <b>WhatsApp Business</b>, entrá a <b>Herramientas para la empresa</b>.
            </li>
            <li>
              Activá el <b>Mensaje de bienvenida</b> y escribí algo como: «¡Hola! Hacé tu pedido acá y te llega directo:»
              y pegá el link.
            </li>
            <li>
              Hacé lo mismo en el <b>Mensaje de ausencia</b>, para los que escriben fuera de horario.
            </li>
            <li>
              Pegá el link también en el <b>perfil de la empresa</b> (sitio web) y en la bio de Instagram.
            </li>
          </ol>
          <p className="mt-2">
            El cliente arma el pedido en el menú y lo manda por WhatsApp ya escrito. El pedido queda guardado en tu
            tablero aunque no llegue a mandar el mensaje.
          </p>
        </GuideItem>

        <GuideItem title="Atender un pedido en el tablero">
          <ol className="list-decimal space-y-1 pl-5">
            <li>Entra el pedido y suena la alerta. Si arriba dice «El sonido está desactivado», tocalo una vez para activarlo.</li>
            <li>
              Si dice <b>«Sin confirmar por el cliente»</b>, el cliente no mandó el WhatsApp: tocá el botón verde y le
              escribís desde ahí.
            </li>
            <li>
              Lo movés con un toque: <b>Confirmar</b> → <b>A cocina</b> → <b>Despachar</b> → <b>Completar</b>. También
              podés arrastrar la tarjeta.
            </li>
            <li>
              Cuando un delivery sale, tocá <b>«Avisar que ya salió»</b> y el cliente recibe el mensaje por WhatsApp.
            </li>
            {staff.modules.has("kitchen_printing") && (
              <li>
                Con el ícono de impresora sale la comanda. En Configuración elegís el papel (58 u 80 mm) y si imprime
                solo.
              </li>
            )}
          </ol>
        </GuideItem>

        <GuideItem title="Instalar VivoMenu en la tablet o el celular">
          <ol className="list-decimal space-y-1 pl-5">
            <li>Abrí el panel en Chrome.</li>
            <li>
              Tocá el menú de los tres puntos y elegí <b>Instalar app</b> o <b>Agregar a la pantalla principal</b>.
            </li>
            <li>
              Cuando llegue el primer pedido, aceptá las <b>notificaciones</b>: así te avisa aunque la pantalla esté
              apagada.
            </li>
          </ol>
        </GuideItem>

        {isManager && (
          <GuideItem title="Cambiar precios, fotos y productos agotados">
            <ul className="list-disc space-y-1 pl-5">
              <li>
                En <b>Menú</b> cambiás precios y descripciones. El interruptor de cada producto lo marca como
                agotado: mañana lo volvés a prender.
              </li>
              <li>
                Para la foto alcanza con el celular. Dentro de cada producto, «Mejorar la foto con IA» deja el mismo plato con
                mejor presentación (30 por mes).
              </li>
              <li>
                Si cambiás toda la carta, <Link href="/panel/menu/importar" className="underline">importala</Link> desde
                una foto o un PDF.
              </li>
            </ul>
          </GuideItem>
        )}

        {isManager && (
          <GuideItem title="Horarios, zonas y pagos">
            <ul className="list-disc space-y-1 pl-5">
              <li>Los horarios pueden pasar la medianoche (por ejemplo, de 20 a 1).</li>
              <li>«Local abierto ahora» corta el menú al instante si te desbordaste, sin tocar el horario.</li>
              <li>Cada zona de delivery tiene su costo de envío. El pedido mínimo cuenta solo la comida.</li>
            </ul>
          </GuideItem>
        )}

        {isManager && (
          <GuideItem title="El resumen de la semana">
            <p>
              En <Link href="/panel/resumen" className="underline">Más → Resumen semanal</Link> ves lo que vendiste, la
              hora pico, lo más pedido y cuántos clientes volvieron, comparado con la semana anterior.
            </p>
          </GuideItem>
        )}

        {staff.modules.has("cash_register") && (
          <GuideItem title="Caja">
            <p>
              Abrí la caja al empezar el turno, cobrá cada pedido (con propina o descuento) y cerrala con el arqueo al
              final. Los reportes quedan en Caja → Reportes.
            </p>
          </GuideItem>
        )}

        {staff.modules.has("tables") && (
          <GuideItem title="Salón y mesas">
            <p>
              Imprimí la hoja de QR desde Salón y pegá cada uno en su mesa. El mozo puede cargar el pedido desde la
              mesa, y el cliente puede pedir la cuenta o llamar al mozo desde el QR.
            </p>
          </GuideItem>
        )}
      </div>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-ink-200 bg-white p-4">
        <p className="text-sm text-ink-700">¿Algo no anda o no sabés cómo se hace? Escribinos.</p>
        <a
          href={SUPPORT_WHATSAPP}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-touch items-center gap-2 rounded-lg bg-[#25D366] px-4 text-sm font-semibold text-white"
        >
          <MessageCircle className="size-4" aria-hidden />
          Soporte por WhatsApp
        </a>
      </section>
    </main>
  );
}

function GuideItem({ title, open, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  return (
    <details open={open} className="group rounded-card border border-ink-200 bg-white p-4">
      <summary className="cursor-pointer font-semibold text-ink-900 marker:text-ink-400">{title}</summary>
      <div className="mt-2 text-sm text-ink-700">{children}</div>
    </details>
  );
}
