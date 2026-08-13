import Link from "next/link";
import { redirect } from "next/navigation";

import { ActionForm } from "@/components/panel/action-form";
import { ConfirmSubmitButton } from "@/components/panel/confirm-submit-button";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { requireModule, requireStaff } from "@/lib/auth/context";
import { formatMoney } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";
import type { CashMovementKind, CashPaymentMethod } from "@/types/database";

import {
  addCashMovement,
  closeCashSession,
  collectOrder,
  openCashSession,
  uncollectOrder,
} from "./actions";

export const metadata = { title: "Caja" };
export const dynamic = "force-dynamic";

const MOVEMENT_LABELS: Record<CashMovementKind, string> = {
  expense: "Gasto",
  income: "Ingreso",
  withdrawal: "Retiro",
};

const METHOD_LABELS: Record<CashPaymentMethod, string> = {
  cash: "Efectivo",
  card: "Tarjeta",
  transfer: "Transferencia",
  mercadopago: "MercadoPago",
  other: "Otro",
};

export default async function CashRegisterPage() {
  const staff = await requireStaff();
  requireModule(staff, "cash_register");
  // The drawer belongs to whoever is at the counter. Every cash_* policy is
  // `in ('owner', 'manager', 'cashier')`, so a mozo reaching this URL would
  // otherwise get a page that renders as "no hay caja abierta" and an "abrir
  // caja" button that fails — an explicit bounce is the honest answer.
  if (staff.role === "waiter") redirect("/panel");
  const supabase = await createClient();
  const currency = staff.business.currency;

  const { data: session } = await supabase
    .from("cash_sessions")
    .select("*")
    .is("closed_at", null)
    .maybeSingle();

  if (!session) {
    const { data: last } = await supabase
      .from("cash_sessions")
      .select("closed_at, counted_cents, expected_cents, difference_cents")
      .not("closed_at", "is", null)
      .order("closed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return (
      <main className="flex flex-1 flex-col gap-4 p-3 sm:p-4">
        <Header />

        <div className="rounded-card border border-ink-200 bg-white p-4">
          <h2 className="font-semibold text-ink-900">Abrir caja</h2>
          <p className="mt-1 text-sm text-ink-600">
            Poné con cuánto efectivo arrancás el turno. Si arrancás sin fondo, dejalo en cero.
          </p>

          <ActionForm action={openCashSession}>
            <div className="mt-3 max-w-48">
              <Field label="Fondo inicial">
                <Input name="openingFloat" inputMode="decimal" defaultValue="0" />
              </Field>
            </div>
            <Button type="submit" className="mt-3">
              Abrir caja
            </Button>
          </ActionForm>
        </div>

        {last?.closed_at && (
          <div className="rounded-card border border-ink-200 bg-white p-4">
            <h2 className="font-semibold text-ink-900">Último cierre</h2>
            <p className="mt-1 text-sm text-ink-600">
              {new Date(last.closed_at).toLocaleString("es-AR", {
                timeZone: staff.business.timezone,
              })}
              {" · contado "}
              {formatMoney(last.counted_cents ?? 0, { currency })}
              {" · esperado "}
              {formatMoney(last.expected_cents ?? 0, { currency })}
              {" · "}
              <Difference cents={last.difference_cents ?? 0} currency={currency} />
            </p>
          </div>
        )}
      </main>
    );
  }

  // Everything below belongs to the open session.
  const [movementsResult, paymentsResult, uncollectedResult] = await Promise.all([
    supabase
      .from("cash_movements")
      .select("*")
      .eq("cash_session_id", session.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("order_payments")
      .select("*")
      .eq("cash_session_id", session.id)
      .order("created_at", { ascending: false }),
    // Scoped to this shift, not to every uncollected order ever. Two reasons:
    // a shift should only account for its own takings, and on the day the
    // module is switched on every order in the history is technically
    // "uncollected" — an unbounded query would open the screen with hundreds
    // of old delivery orders that were paid in cash at the door years ago.
    //
    // Status is left alone beyond skipping cancellations: an order can
    // legitimately be paid before it is ready (mostrador) or after (mesa).
    supabase
      .from("orders")
      .select("id, code, customer_name, total_cents, status")
      .neq("status", "cancelled")
      .gte("created_at", session.opened_at)
      .order("created_at", { ascending: false }),
  ]);

  const movements = movementsResult.data ?? [];
  const payments = paymentsResult.data ?? [];
  const orders = uncollectedResult.data ?? [];
  const collectedIds = new Set(payments.map((p) => p.order_id));
  const pendingOrders = orders.filter((o) => !collectedIds.has(o.id));

  // Joined here rather than embedded in the query: the hand-written Database
  // type declares no relationships, so a PostgREST embed does not type-check.
  const orderCodes = new Map(orders.map((o) => [o.id, o.code]));

  const cashFromOrders = payments
    .filter((p) => p.method === "cash")
    .reduce((total, p) => total + p.collected_cents, 0);
  const movementsNet = movements.reduce(
    (total, m) => total + (m.kind === "income" ? m.amount_cents : -m.amount_cents),
    0,
  );
  // Mirrors close_cash_session exactly: only cash ever passed through the drawer.
  const expectedCents = session.opening_float_cents + cashFromOrders + movementsNet;

  const totalCollected = payments.reduce((total, p) => total + p.collected_cents, 0);
  const totalTips = payments.reduce((total, p) => total + p.tip_cents, 0);

  return (
    <main className="flex flex-1 flex-col gap-4 p-3 sm:p-4">
      <Header />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Fondo inicial" value={formatMoney(session.opening_float_cents, { currency })} />
        <Stat label="Cobrado" value={formatMoney(totalCollected, { currency })} />
        <Stat label="Propinas" value={formatMoney(totalTips, { currency })} />
        <Stat label="Efectivo esperado" value={formatMoney(expectedCents, { currency })} />
      </div>

      {pendingOrders.length > 0 && (
        <section className="rounded-card border border-ink-200 bg-white p-4">
          <h2 className="font-semibold text-ink-900">Pedidos sin cobrar</h2>
          <ul className="mt-3 divide-y divide-ink-100">
            {pendingOrders.map((order) => (
              <li key={order.id} className="py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-ink-900">
                    #{order.code} · {order.customer_name}
                  </p>
                  <p className="font-mono text-sm text-ink-900">
                    {formatMoney(order.total_cents, { currency })}
                  </p>
                </div>

                <ActionForm
                  action={collectOrder.bind(null, order.id)}
                  className="mt-2 flex flex-wrap items-end gap-2"
                >
                  <div className="w-36">
                    <Field label="Pagó con">
                      <Select name="method" defaultValue="cash">
                        {Object.entries(METHOD_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                  <div className="w-28">
                    <Field label="Descuento">
                      <Input name="discount" inputMode="decimal" defaultValue="0" />
                    </Field>
                  </div>
                  <div className="w-28">
                    <Field label="Propina">
                      <Input name="tip" inputMode="decimal" defaultValue="0" />
                    </Field>
                  </div>
                  <Button type="submit">Cobrar</Button>
                </ActionForm>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-card border border-ink-200 bg-white p-4">
        <h2 className="font-semibold text-ink-900">Movimientos de caja</h2>
        <p className="mt-1 text-sm text-ink-600">
          Lo que entra o sale del cajón sin ser un pedido: pagarle a un proveedor, un retiro, plata
          que ponés a mitad del turno.
        </p>

        <ActionForm
          action={addCashMovement.bind(null, session.id)}
          className="mt-3 flex flex-wrap items-end gap-2"
        >
          <div className="w-32">
            <Field label="Tipo">
              <Select name="kind" defaultValue="expense">
                {Object.entries(MOVEMENT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="min-w-48 flex-1">
            <Field label="Concepto">
              <Input name="concept" placeholder="Verdulería, cambio, retiro al banco…" />
            </Field>
          </div>
          <div className="w-28">
            <Field label="Monto">
              <Input name="amount" inputMode="decimal" />
            </Field>
          </div>
          <Button type="submit" variant="outline">
            Registrar
          </Button>
        </ActionForm>

        {movements.length > 0 && (
          <ul className="mt-4 divide-y divide-ink-100 border-t border-ink-100">
            {movements.map((movement) => (
              <li key={movement.id} className="flex items-baseline justify-between gap-3 py-2">
                <span className="min-w-0 truncate text-sm text-ink-700">
                  <span className="text-ink-500">{MOVEMENT_LABELS[movement.kind]}</span>{" "}
                  {movement.concept}
                </span>
                <span className="font-mono text-sm whitespace-nowrap text-ink-900">
                  {movement.kind === "income" ? "+" : "−"}
                  {formatMoney(movement.amount_cents, { currency })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {payments.length > 0 && (
        <section className="rounded-card border border-ink-200 bg-white p-4">
          <h2 className="font-semibold text-ink-900">Cobros del turno</h2>
          <ul className="mt-3 divide-y divide-ink-100">
            {payments.map((payment) => {
              return (
                <li key={payment.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2">
                  <span className="text-sm text-ink-700">
                    #{orderCodes.get(payment.order_id) ?? "—"} · {METHOD_LABELS[payment.method]}
                  </span>
                  {payment.discount_cents > 0 && (
                    <span className="text-xs text-ink-500">
                      desc. {formatMoney(payment.discount_cents, { currency })}
                    </span>
                  )}
                  {payment.tip_cents > 0 && (
                    <span className="text-xs text-ink-500">
                      prop. {formatMoney(payment.tip_cents, { currency })}
                    </span>
                  )}
                  <span className="ml-auto font-mono text-sm text-ink-900">
                    {formatMoney(payment.collected_cents, { currency })}
                  </span>
                  <ActionForm action={uncollectOrder.bind(null, payment.id)}>
                    <ConfirmSubmitButton
                      confirmMessage="¿Anular este cobro? El pedido vuelve a quedar sin cobrar."
                      variant="ghost"
                      size="sm"
                      className="text-xs text-ink-500 hover:text-danger"
                    >
                      Anular
                    </ConfirmSubmitButton>
                  </ActionForm>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="rounded-card border border-ink-200 bg-white p-4">
        <h2 className="font-semibold text-ink-900">Cerrar caja</h2>
        <p className="mt-1 text-sm text-ink-600">
          Contá el efectivo del cajón y ponelo acá. El sistema calcula la diferencia contra los{" "}
          {formatMoney(expectedCents, { currency })} que deberían estar.
        </p>

        <ActionForm action={closeCashSession.bind(null, session.id)} className="mt-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-36">
              <Field label="Efectivo contado" required>
                <Input name="counted" inputMode="decimal" required />
              </Field>
            </div>
            <div className="min-w-48 flex-1">
              <Field label="Notas" hint="Opcional">
                <Textarea name="notes" rows={1} />
              </Field>
            </div>
          </div>
          <ConfirmSubmitButton
            confirmMessage="¿Cerrar la caja? Después no se le pueden agregar cobros ni movimientos."
            className="mt-3"
          >
            Cerrar caja
          </ConfirmSubmitButton>
        </ActionForm>
      </section>
    </main>
  );
}

function Header() {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <div>
        <h1 className="font-display text-lg font-bold tracking-tight text-ink-900 sm:text-xl">Caja</h1>
        <p className="text-sm text-ink-500">
          Un turno por vez. El comprobante que sale de acá no es una factura.
        </p>
      </div>
      <Link
        href="/panel/caja/reportes"
        className="min-h-touch text-sm text-ink-500 underline-offset-4 hover:text-ink-900 hover:underline"
      >
        Ver reportes
      </Link>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-ink-200 bg-white p-3">
      <p className="text-xs text-ink-500">{label}</p>
      <p className="mt-0.5 font-mono text-lg font-semibold text-ink-900">{value}</p>
    </div>
  );
}

function Difference({ cents, currency }: { cents: number; currency: string }) {
  if (cents === 0) return <span className="text-ink-700">sin diferencia</span>;
  return (
    <span className={cents < 0 ? "text-danger" : "text-ink-900"}>
      {cents > 0 ? "sobró " : "faltó "}
      {formatMoney(Math.abs(cents), { currency })}
    </span>
  );
}
