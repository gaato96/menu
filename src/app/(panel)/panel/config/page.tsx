import { Trash2 } from "lucide-react";

import { ActionForm } from "@/components/panel/action-form";
import { AsyncToggle } from "@/components/panel/async-toggle";
import { ConfirmSubmitButton } from "@/components/panel/confirm-submit-button";
import { ImageUploadForm } from "@/components/panel/image-upload-form";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { requireStaff } from "@/lib/auth/context";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

import {
  createDeliveryZone,
  createHours,
  deleteHours,
  deleteZone,
  toggleCatalogDefault,
  toggleCatalogView,
  toggleOpenManual,
  toggleZoneActive,
  updateSettings,
  uploadCoverImage,
  uploadLogo,
  connectMercadoPago,
  disconnectMercadoPago,
  toggleMercadoPago,
  updatePrinting,
} from "./actions";

export const metadata = { title: "Configuración" };
export const dynamic = "force-dynamic";

const DAY_LABELS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default async function ConfigPage() {
  const staff = await requireStaff();
  const supabase = await createClient();

  const [zonesResult, hoursResult] = await Promise.all([
    supabase.from("delivery_zones").select("*").eq("business_id", staff.business.id).order("sort_order"),
    supabase
      .from("business_hours")
      .select("*")
      .eq("business_id", staff.business.id)
      .order("day_of_week"),
  ]);

  // Only whether an account is connected and as whom — never the token.
  const mpAccount = staff.modules.has("mercadopago")
    ? (
        await createAdminClient()
          .from("business_mp_credentials")
          .select("mp_nickname, connected_at")
          .eq("business_id", staff.business.id)
          .maybeSingle()
      ).data
    : null;

  const zones = zonesResult.data ?? [];
  const hours = hoursResult.data ?? [];
  const settings = staff.settings;

  return (
    <main className="flex flex-1 flex-col gap-4 p-3 sm:p-4">
      <h1 className="font-display text-lg font-bold tracking-tight text-ink-900 sm:text-xl">Configuración</h1>

      <section className="flex items-center justify-between rounded-card border border-ink-200 bg-white p-4">
        <div>
          <p className="font-medium text-ink-900">Local abierto ahora</p>
          <p className="text-xs text-ink-500">
            Apagalo si te desbordaste de pedidos — corta el menú público al instante, sin
            tocar el horario configurado.
          </p>
        </div>
        <AsyncToggle checked={staff.business.is_open_manual} action={toggleOpenManual} />
      </section>

      <section className="rounded-card border border-ink-200 bg-white p-4">
        <h2 className="mb-3 font-semibold text-ink-900">Imagen del local</h2>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm text-ink-700">Logo</p>
            <ImageUploadForm currentUrl={staff.business.logo_url} action={uploadLogo} />
          </div>
          <div>
            <p className="mb-2 text-sm text-ink-700">Portada del menú</p>
            <ImageUploadForm currentUrl={staff.business.cover_image_url} action={uploadCoverImage} aspect="wide" />
          </div>
        </div>
      </section>

      <section className="flex items-center justify-between rounded-card border border-ink-200 bg-white p-4">
        <div>
          <p className="font-medium text-ink-900">Catálogo scroll</p>
          <p className="text-xs text-ink-500">
            Vista a pantalla completa, una foto por plato, pensada para compartir. Vivo en{" "}
            <span className="font-mono">/m/{staff.business.slug}/catalogo</span>.
          </p>
        </div>
        <AsyncToggle checked={settings.catalog_view_enabled} action={toggleCatalogView} />
      </section>

      <section className="flex items-center justify-between gap-3 rounded-card border border-ink-200 bg-white p-4">
        <div>
          <p className="font-medium text-ink-900">Abrir el menú en el catálogo</p>
          <p className="text-xs text-ink-500">
            El QR abre directo la vista vertical a pantalla completa, y el menú clásico queda a
            un toque. Prendelo solo si tenés buenas fotos de casi todos los platos — a pantalla
            completa, una foto mala se nota más que en la lista.
          </p>
        </div>
        <AsyncToggle checked={settings.catalog_is_default} action={toggleCatalogDefault} />
      </section>

      <section className="rounded-card border border-ink-200 bg-white p-4">
        <h2 className="mb-3 font-semibold text-ink-900">Entrega y pago</h2>
        <ActionForm action={updateSettings} className="space-y-3">
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-ink-700">
              <input type="checkbox" name="deliveryEnabled" defaultChecked={settings.delivery_enabled} className="size-4" />
              Delivery
            </label>
            <label className="flex items-center gap-2 text-sm text-ink-700">
              <input type="checkbox" name="pickupEnabled" defaultChecked={settings.pickup_enabled} className="size-4" />
              Retiro en el local
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Pedido mínimo" hint="Solo cuenta la comida, no el envío">
              <Input name="minOrder" defaultValue={(settings.min_order_cents / 100).toString()} inputMode="decimal" />
            </Field>
            <Field label="Tiempo de preparación (min)">
              <Input name="prepTime" type="number" min={0} max={240} defaultValue={settings.prep_time_minutes} />
            </Field>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-ink-700">
              <input type="checkbox" name="cashEnabled" defaultChecked={settings.cash_enabled} className="size-4" />
              Efectivo
            </label>
            <label className="flex items-center gap-2 text-sm text-ink-700">
              <input type="checkbox" name="transferEnabled" defaultChecked={settings.transfer_enabled} className="size-4" />
              Transferencia
            </label>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Alias">
              <Input name="transferAlias" defaultValue={settings.transfer_alias ?? ""} />
            </Field>
            <Field label="CBU/CVU">
              <Input name="transferCbu" defaultValue={settings.transfer_cbu ?? ""} />
            </Field>
            <Field label="Titular">
              <Input name="transferHolder" defaultValue={settings.transfer_holder ?? ""} />
            </Field>
          </div>

          <Button type="submit">Guardar</Button>
        </ActionForm>
      </section>

      {staff.modules.has("mercadopago") && (
        <section className="rounded-card border border-ink-200 bg-white p-4">
          <h2 className="font-semibold text-ink-900">Mercado Pago</h2>
          {mpAccount ? (
            <div className="mt-2 space-y-3">
              <p className="text-sm text-ink-700">
                Conectado{mpAccount.mp_nickname ? ` como ${mpAccount.mp_nickname}` : ""}. La plata entra directo a esa
                cuenta.
              </p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-ink-700">Ofrecer Mercado Pago en el pedido</p>
                <AsyncToggle checked={settings.mercadopago_enabled} action={toggleMercadoPago} />
              </div>
              {staff.role === "owner" && (
                <form action={disconnectMercadoPago}>
                  <ConfirmSubmitButton confirmMessage="¿Desconectar la cuenta? Se deja de ofrecer Mercado Pago." variant="outline" size="sm">
                    Desconectar cuenta
                  </ConfirmSubmitButton>
                </form>
              )}
            </div>
          ) : staff.role === "owner" ? (
            <ActionForm action={connectMercadoPago} className="mt-2 space-y-3">
              <p className="text-xs text-ink-500">
                En mercadopago.com.ar/developers → Tus integraciones → creá una aplicación → Credenciales de
                producción, copiá el <b>Access Token</b> (empieza con APP_USR-) y pegalo acá. Solo lo usa el servidor
                para crear los cobros; nadie más lo ve.
              </p>
              <Field label="Access Token">
                <Input name="accessToken" type="password" autoComplete="off" placeholder="APP_USR-…" required />
              </Field>
              <Button type="submit">Conectar</Button>
            </ActionForm>
          ) : (
            <p className="mt-2 text-sm text-ink-500">El dueño del local tiene que conectar la cuenta.</p>
          )}
        </section>
      )}

      {staff.modules.has("kitchen_printing") && (
        <section className="rounded-card border border-ink-200 bg-white p-4">
          <h2 className="font-semibold text-ink-900">Impresión de comandas</h2>
          <p className="mt-1 text-xs text-ink-500">
            Imprime en la impresora térmica que ya usa esta tablet o compu (USB, Bluetooth o red). Para que imprima sin
            preguntar, abrí Chrome con la opción --kiosk-printing.
          </p>
          <ActionForm action={updatePrinting} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Ancho del papel">
              <Select name="paper" defaultValue={String(settings.print_paper_mm)}>
                <option value="80">80 mm</option>
                <option value="58">58 mm</option>
              </Select>
            </Field>
            <Field label="Imprimir solo">
              <Select name="auto" defaultValue={settings.print_auto}>
                <option value="off">Nunca, solo con el botón</option>
                <option value="on_new">Cuando entra un pedido</option>
                <option value="on_kitchen">Cuando pasa a cocina</option>
              </Select>
            </Field>
            <div className="sm:col-span-2">
              <Button type="submit">Guardar</Button>
            </div>
          </ActionForm>
        </section>
      )}

      <section className="rounded-card border border-ink-200 bg-white p-4">
        <h2 className="mb-3 font-semibold text-ink-900">Zonas de delivery</h2>
        <ul className="mb-3 divide-y divide-ink-100">
          {zones.map((zone: Tables<"delivery_zones">) => (
            <li key={zone.id} className="flex items-center gap-2 py-2">
              <span className="flex-1 text-sm text-ink-900">{zone.name}</span>
              <span className="font-mono text-xs text-ink-500">
                {(zone.fee_cents / 100).toLocaleString("es-AR")}
              </span>
              <AsyncToggle checked={zone.is_active} action={toggleZoneActive.bind(null, zone.id)} />
              <form action={deleteZone.bind(null, zone.id)}>
                <ConfirmSubmitButton
                  variant="ghost"
                  size="icon"
                  confirmMessage={`Eliminar la zona "${zone.name}"?`}
                  aria-label="Eliminar zona"
                >
                  <Trash2 className="size-4 text-danger" aria-hidden />
                </ConfirmSubmitButton>
              </form>
            </li>
          ))}
          {zones.length === 0 && <p className="py-2 text-sm text-ink-500">Sin zonas todavía.</p>}
        </ul>
        <form action={createDeliveryZone} className="flex flex-wrap items-end gap-2">
          <Input name="name" placeholder="Ej: Centro" required className="min-w-[8rem] flex-1" />
          <Input name="fee" placeholder="Costo de envío" inputMode="decimal" className="w-32" required />
          <Button type="submit" size="sm">
            Agregar
          </Button>
        </form>
      </section>

      <section className="rounded-card border border-ink-200 bg-white p-4">
        <h2 className="mb-3 font-semibold text-ink-900">Horarios</h2>
        <ul className="mb-3 divide-y divide-ink-100">
          {hours.map((h: Tables<"business_hours">) => (
            <li key={h.id} className="flex items-center gap-2 py-2 text-sm">
              <span className="flex-1 text-ink-900">{DAY_LABELS[h.day_of_week]}</span>
              <span className="font-mono text-xs text-ink-500">
                {h.opens_at.slice(0, 5)}–{h.closes_at.slice(0, 5)}
              </span>
              <form action={deleteHours.bind(null, h.id)}>
                <ConfirmSubmitButton variant="ghost" size="icon" confirmMessage="Eliminar este horario?" aria-label="Eliminar horario">
                  <Trash2 className="size-4 text-danger" aria-hidden />
                </ConfirmSubmitButton>
              </form>
            </li>
          ))}
          {hours.length === 0 && (
            <p className="py-2 text-sm text-ink-500">
              Sin horarios cargados — el local se toma como siempre abierto mientras el
              switch de arriba esté prendido.
            </p>
          )}
        </ul>
        <form action={createHours} className="flex flex-wrap items-end gap-2">
          <Select name="dayOfWeek" defaultValue="5" className="w-32">
            {DAY_LABELS.map((label, index) => (
              <option key={index} value={index}>
                {label}
              </option>
            ))}
          </Select>
          <Field label="Abre">
            <input type="time" name="opensAt" defaultValue="20:00" className="min-h-touch rounded-lg border border-ink-200 px-2 text-sm" required />
          </Field>
          <Field label="Cierra">
            <input type="time" name="closesAt" defaultValue="01:00" className="min-h-touch rounded-lg border border-ink-200 px-2 text-sm" required />
          </Field>
          <Button type="submit" size="sm">
            Agregar
          </Button>
        </form>
      </section>
    </main>
  );
}
