import Link from "next/link";
import { notFound } from "next/navigation";

import { ActionForm } from "@/components/panel/action-form";
import { AsyncToggle } from "@/components/panel/async-toggle";
import { ConfirmSubmitButton } from "@/components/panel/confirm-submit-button";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { requireSuperadmin } from "@/lib/auth/context";
import { formatMoney } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";
import type { ModuleKey } from "@/types/database";

import {
  deleteBusiness,
  toggleBusinessStatus,
  toggleModule,
  updateBusiness,
  updateSubscription,
} from "./actions";

export const metadata = { title: "Negocio" };
export const dynamic = "force-dynamic";

const ROLE_LABELS: Record<string, string> = {
  owner: "Dueño",
  manager: "Encargado",
  cashier: "Cajero",
};

const MODULE_LABELS: Record<ModuleKey, string> = {
  crm_loyalty: "CRM / Fidelización",
  mercadopago: "MercadoPago",
  kitchen_printing: "Impresión de cocina",
  kitchen_display: "Pantalla de cocina (KDS)",
  inventory: "Stock e insumos",
  tables: "Mesas y salón",
};

const MODULE_KEYS = Object.keys(MODULE_LABELS) as ModuleKey[];

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSuperadmin();
  const { id } = await params;
  const supabase = await createClient();

  const [businessResult, subscriptionResult, modulesResult, staffResult] = await Promise.all([
    supabase.from("businesses").select("*").eq("id", id).maybeSingle(),
    supabase.from("subscriptions").select("*").eq("business_id", id).maybeSingle(),
    supabase.from("business_modules").select("module_key, enabled").eq("business_id", id),
    supabase
      .from("profiles")
      .select("id, full_name, role, is_active")
      .eq("business_id", id)
      .order("created_at"),
  ]);

  const business = businessResult.data;
  const subscription = subscriptionResult.data;
  if (!business || !subscription) notFound();

  const enabledModules = new Set((modulesResult.data ?? []).filter((m) => m.enabled).map((m) => m.module_key));
  const staff = staffResult.data ?? [];

  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-sm text-brand underline underline-offset-2">
            ← Negocios
          </Link>
          <h1 className="font-display text-xl font-bold tracking-tight text-ink-900">
            {business.name}
          </h1>
          <Link
            href={`/m/${business.slug}`}
            target="_blank"
            className="text-xs text-ink-500 underline underline-offset-2"
          >
            /m/{business.slug}
          </Link>
        </div>
        <div className="flex items-center gap-2 text-right">
          <span className="text-xs text-ink-500">
            {business.status === "active" ? "Activo" : "Suspendido"}
          </span>
          <AsyncToggle checked={business.status === "active"} action={toggleBusinessStatus.bind(null, business.id)} />
        </div>
      </div>

      <section className="rounded-card border border-ink-200 bg-white p-4">
        <h2 className="mb-3 font-semibold text-ink-900">Datos del negocio</h2>
        <ActionForm action={updateBusiness.bind(null, business.id)} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Nombre" required>
              <Input name="name" defaultValue={business.name} required />
            </Field>
            <Field label="WhatsApp" required>
              <Input name="whatsappPhone" defaultValue={business.whatsapp_phone} required />
            </Field>
            <Field label="Dirección">
              <Input name="address" defaultValue={business.address ?? ""} />
            </Field>
            <Field label="Color de marca">
              <Input name="brandColor" defaultValue={business.brand_color} />
            </Field>
          </div>
          <Button type="submit">Guardar</Button>
        </ActionForm>
      </section>

      <section className="rounded-card border border-ink-200 bg-white p-4">
        <h2 className="mb-3 font-semibold text-ink-900">Suscripción</h2>
        <ActionForm action={updateSubscription.bind(null, business.id)} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Plan">
              <Input name="plan" defaultValue={subscription.plan} />
            </Field>
            <Field label="Estado">
              <Select name="status" defaultValue={subscription.status}>
                <option value="trial">Prueba</option>
                <option value="active">Activa</option>
                <option value="past_due">Vencida</option>
                <option value="suspended">Suspendida</option>
              </Select>
            </Field>
            <Field label="Vence" hint="El menú público solo se corta con estado Suspendida">
              <input
                type="date"
                name="currentPeriodEnd"
                defaultValue={subscription.current_period_end ?? ""}
                className="min-h-touch w-full rounded-lg border border-ink-200 px-3 text-sm"
              />
            </Field>
            <Field label="Monto mensual">
              <Input
                name="monthlyAmount"
                inputMode="decimal"
                defaultValue={
                  subscription.monthly_amount_cents != null
                    ? (subscription.monthly_amount_cents / 100).toString()
                    : ""
                }
                placeholder={formatMoney(0)}
              />
            </Field>
          </div>
          <Field label="Notas" hint="Solo vos las ves — fecha de transferencia, acuerdos, etc.">
            <Textarea name="notes" defaultValue={subscription.notes ?? ""} />
          </Field>
          <Button type="submit">Guardar suscripción</Button>
        </ActionForm>
      </section>

      <section className="rounded-card border border-ink-200 bg-white p-4">
        <h2 className="mb-3 font-semibold text-ink-900">Módulos premium</h2>
        <ul className="divide-y divide-ink-100">
          {MODULE_KEYS.map((key) => (
            <li key={key} className="flex items-center justify-between py-2">
              <span className="text-sm text-ink-900">{MODULE_LABELS[key]}</span>
              <AsyncToggle
                checked={enabledModules.has(key)}
                action={toggleModule.bind(null, business.id, key)}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-card border border-ink-200 bg-white p-4">
        <h2 className="mb-3 font-semibold text-ink-900">Usuarios</h2>
        {staff.length === 0 ? (
          <p className="text-sm text-ink-500">Sin usuarios todavía.</p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {staff.map((profile) => (
              <li key={profile.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-ink-900">{profile.full_name ?? "Sin nombre"}</span>
                <span className="text-ink-500">
                  {ROLE_LABELS[profile.role] ?? profile.role}
                  {!profile.is_active && " · inactivo"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-card border border-danger bg-white p-4">
        <h2 className="mb-2 font-semibold text-danger">Zona de riesgo</h2>
        <p className="mb-3 text-xs text-ink-500">
          Borra el negocio y todo su menú, pedidos y usuarios. No hay vuelta atrás.
        </p>
        <form action={deleteBusiness.bind(null, business.id)}>
          <ConfirmSubmitButton
            variant="danger"
            confirmMessage={`Eliminar "${business.name}" para siempre? Esto borra menú, pedidos y usuarios.`}
          >
            Eliminar negocio
          </ConfirmSubmitButton>
        </form>
      </section>
    </main>
  );
}
