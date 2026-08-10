import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { requireModule, requireStaff } from "@/lib/auth/context";
import { businessRangeUtc, businessTodayDateStr } from "@/lib/business/date-range";
import { formatMoney } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";
import type { CashMovementKind, CashPaymentMethod } from "@/types/database";

export const metadata = { title: "Reportes de caja" };
export const dynamic = "force-dynamic";

const METHOD_LABELS: Record<CashPaymentMethod, string> = {
  cash: "Efectivo",
  card: "Tarjeta",
  transfer: "Transferencia",
  mercadopago: "MercadoPago",
  other: "Otro",
};

const MOVEMENT_LABELS: Record<CashMovementKind, string> = {
  expense: "Gastos",
  income: "Ingresos",
  withdrawal: "Retiros",
};

export default async function CashReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const staff = await requireStaff();
  requireModule(staff, "cash_register");
  const params = await searchParams;
  const supabase = await createClient();
  const currency = staff.business.currency;

  const today = businessTodayDateStr(staff.business.timezone);
  const from = params.from || today;
  const to = params.to || today;
  const { startIso, endIsoExclusive } = businessRangeUtc(from, to, staff.business.timezone);

  const [paymentsResult, movementsResult, sessionsResult] = await Promise.all([
    supabase
      .from("order_payments")
      .select("method, amount_cents, discount_cents, tip_cents, collected_cents")
      .gte("created_at", startIso)
      .lt("created_at", endIsoExclusive),
    supabase
      .from("cash_movements")
      .select("kind, amount_cents")
      .gte("created_at", startIso)
      .lt("created_at", endIsoExclusive),
    // Ranged on closed_at: a shift belongs to the day it was arqueado, which
    // is what an owner means by "el cierre del sábado" even when the drawer
    // opened on Friday evening.
    supabase
      .from("cash_sessions")
      .select("id, opened_at, closed_at, counted_cents, expected_cents, difference_cents")
      .not("closed_at", "is", null)
      .gte("closed_at", startIso)
      .lt("closed_at", endIsoExclusive)
      .order("closed_at", { ascending: false }),
  ]);

  const payments = paymentsResult.data ?? [];
  const movements = movementsResult.data ?? [];
  const sessions = sessionsResult.data ?? [];

  const gross = payments.reduce((total, p) => total + p.amount_cents, 0);
  const discounts = payments.reduce((total, p) => total + p.discount_cents, 0);
  const tips = payments.reduce((total, p) => total + p.tip_cents, 0);
  const collected = payments.reduce((total, p) => total + p.collected_cents, 0);

  const byMethod = (Object.keys(METHOD_LABELS) as CashPaymentMethod[])
    .map((method) => {
      const rows = payments.filter((p) => p.method === method);
      return { method, count: rows.length, cents: rows.reduce((t, p) => t + p.collected_cents, 0) };
    })
    .filter((row) => row.count > 0);

  const byMovement = (Object.keys(MOVEMENT_LABELS) as CashMovementKind[])
    .map((kind) => {
      const rows = movements.filter((m) => m.kind === kind);
      return { kind, count: rows.length, cents: rows.reduce((t, m) => t + m.amount_cents, 0) };
    })
    .filter((row) => row.count > 0);

  const netDifference = sessions.reduce((total, s) => total + (s.difference_cents ?? 0), 0);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <Link
        href="/panel/caja"
        className="flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Volver a la caja
      </Link>

      <h1 className="font-display text-xl font-bold tracking-tight text-ink-900">
        Reportes de caja
      </h1>

      <form className="flex flex-wrap items-end gap-3 rounded-card border border-ink-200 bg-white p-4">
        <div className="w-40">
          <Field label="Desde">
            <Input type="date" name="from" defaultValue={from} />
          </Field>
        </div>
        <div className="w-40">
          <Field label="Hasta">
            <Input type="date" name="to" defaultValue={to} />
          </Field>
        </div>
        <Button type="submit" variant="outline" size="sm">
          Ver
        </Button>
      </form>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Pedidos cobrados" value={String(payments.length)} />
        <Stat label="Bruto" value={formatMoney(gross, { currency })} />
        <Stat label="Descuentos" value={formatMoney(discounts, { currency })} />
        <Stat label="Propinas" value={formatMoney(tips, { currency })} />
      </div>

      <div className="rounded-card border border-ink-200 bg-white p-4">
        <p className="text-xs text-ink-500">Total cobrado</p>
        <p className="mt-0.5 font-mono text-2xl font-semibold text-ink-900">
          {formatMoney(collected, { currency })}
        </p>
        <p className="mt-1 text-xs text-ink-500">
          Bruto menos descuentos, más propinas. Las propinas no son facturación del local.
        </p>
      </div>

      <section className="rounded-card border border-ink-200 bg-white p-4">
        <h2 className="font-semibold text-ink-900">Por medio de pago</h2>
        {byMethod.length === 0 ? (
          <Empty />
        ) : (
          <ul className="mt-3 divide-y divide-ink-100">
            {byMethod.map((row) => (
              <li key={row.method} className="flex items-baseline justify-between gap-3 py-2">
                <span className="text-sm text-ink-700">
                  {METHOD_LABELS[row.method]}{" "}
                  <span className="text-ink-500">
                    · {row.count} {row.count === 1 ? "pedido" : "pedidos"}
                  </span>
                </span>
                <span className="font-mono text-sm text-ink-900">
                  {formatMoney(row.cents, { currency })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-card border border-ink-200 bg-white p-4">
        <h2 className="font-semibold text-ink-900">Movimientos de caja</h2>
        {byMovement.length === 0 ? (
          <Empty />
        ) : (
          <ul className="mt-3 divide-y divide-ink-100">
            {byMovement.map((row) => (
              <li key={row.kind} className="flex items-baseline justify-between gap-3 py-2">
                <span className="text-sm text-ink-700">
                  {MOVEMENT_LABELS[row.kind]} <span className="text-ink-500">· {row.count}</span>
                </span>
                <span className="font-mono text-sm text-ink-900">
                  {row.kind === "income" ? "+" : "−"}
                  {formatMoney(row.cents, { currency })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-card border border-ink-200 bg-white p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-semibold text-ink-900">Cierres</h2>
          {sessions.length > 0 && (
            <p className="text-sm text-ink-600">
              Diferencia acumulada:{" "}
              <span className={netDifference < 0 ? "text-danger" : "text-ink-900"}>
                {formatMoney(netDifference, { currency })}
              </span>
            </p>
          )}
        </div>

        {sessions.length === 0 ? (
          <Empty />
        ) : (
          <ul className="mt-3 divide-y divide-ink-100">
            {sessions.map((session) => (
              <li key={session.id} className="py-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm text-ink-700">
                    {new Date(session.closed_at!).toLocaleString("es-AR", {
                      timeZone: staff.business.timezone,
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                  <span
                    className={`font-mono text-sm ${
                      (session.difference_cents ?? 0) < 0 ? "text-danger" : "text-ink-900"
                    }`}
                  >
                    {(session.difference_cents ?? 0) === 0
                      ? "sin diferencia"
                      : formatMoney(session.difference_cents ?? 0, { currency })}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-ink-500">
                  Contado {formatMoney(session.counted_cents ?? 0, { currency })} · esperado{" "}
                  {formatMoney(session.expected_cents ?? 0, { currency })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
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

function Empty() {
  return <p className="mt-3 text-sm text-ink-500">Sin datos en este rango.</p>;
}
