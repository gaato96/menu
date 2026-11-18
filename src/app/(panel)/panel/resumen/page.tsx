import { redirect } from "next/navigation";

import { requireStaff } from "@/lib/auth/context";
import { canConfigure } from "@/lib/auth/roles";
import { businessRangeUtc, businessTodayDateStr } from "@/lib/business/date-range";
import { formatMoney } from "@/lib/money";
import {
  summarizeWeek,
  summaryHeadlines,
  WEEKDAY_NAMES,
  type SummaryItemRow,
  type SummaryOrderRow,
} from "@/lib/orders/weekly-summary";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Resumen semanal" };
export const dynamic = "force-dynamic";

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function shortDate(dateStr: string): string {
  const [, m, d] = dateStr.split("-");
  return `${Number(d)}/${Number(m)}`;
}

const ORDER_COLUMNS = "id, status, fulfillment_type, total_cents, created_at, customer_phone, whatsapp_opened_at";

export default async function WeeklySummaryPage() {
  const staff = await requireStaff();
  if (!canConfigure(staff.role)) redirect("/panel");

  const tz = staff.business.timezone;
  const today = businessTodayDateStr(tz);
  const from = shiftDate(today, -6);
  const currentRange = businessRangeUtc(from, today, tz);
  const previousRange = businessRangeUtc(shiftDate(today, -13), shiftDate(today, -7), tz);
  const historyStart = businessRangeUtc(shiftDate(today, -180), shiftDate(today, -7), tz).startIso;

  const supabase = await createClient();
  const [currentResult, previousResult, historyResult] = await Promise.all([
    supabase
      .from("orders")
      .select(ORDER_COLUMNS)
      .gte("created_at", currentRange.startIso)
      .lt("created_at", currentRange.endIsoExclusive)
      .limit(5000),
    supabase
      .from("orders")
      .select(ORDER_COLUMNS)
      .gte("created_at", previousRange.startIso)
      .lt("created_at", previousRange.endIsoExclusive)
      .limit(5000),
    supabase
      .from("orders")
      .select("customer_phone")
      .gte("created_at", historyStart)
      .lt("created_at", currentRange.startIso)
      .not("customer_phone", "is", null)
      .limit(10000),
  ]);

  const current = (currentResult.data ?? []) as SummaryOrderRow[];
  const ids = current.map((o) => o.id);
  const items: SummaryItemRow[] = [];
  // Chunked: a long `in.(…)` list overflows the URL PostgREST receives.
  for (let i = 0; i < ids.length; i += 200) {
    const { data } = await supabase
      .from("order_items")
      .select("order_id, product_name, quantity, line_total_cents")
      .in("order_id", ids.slice(i, i + 200));
    items.push(...((data ?? []) as SummaryItemRow[]));
  }

  const summary = summarizeWeek({
    current,
    previous: (previousResult.data ?? []) as SummaryOrderRow[],
    currentItems: items,
    knownPhones: new Set(
      (historyResult.data ?? []).map((r) => (r.customer_phone ?? "").replace(/\D/g, "")).filter(Boolean),
    ),
    timeZone: tz,
  });

  const money = (cents: number) => formatMoney(cents, { currency: staff.business.currency });
  const headlines = summaryHeadlines(summary, money);
  const maxHour = Math.max(1, ...summary.byHour);
  const activeHours = summary.byHour
    .map((count, hour) => ({ hour, count }))
    .filter((h, i, all) => {
      const first = all.findIndex((x) => x.count > 0);
      const last = all.length - 1 - [...all].reverse().findIndex((x) => x.count > 0);
      return first >= 0 && i >= first && i <= last;
    });

  const change = (value: number | null) =>
    value === null ? (
      <span className="text-ink-400">sin semana anterior</span>
    ) : (
      <span className={value < 0 ? "text-danger" : "text-success"}>
        {value > 0 ? "+" : ""}
        {value}% vs. semana anterior
      </span>
    );

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 p-3 sm:p-4">
      <div>
        <h1 className="font-display text-lg font-bold tracking-tight text-ink-900 sm:text-xl">Resumen semanal</h1>
        <p className="text-sm text-ink-500">
          Del {shortDate(from)} al {shortDate(today)}, comparado con los 7 días anteriores.
        </p>
      </div>

      <section className="rounded-card border border-ink-200 bg-white p-4">
        <ul className="space-y-1 text-ink-900">
          {headlines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Ventas", value: money(summary.current.revenueCents), extra: change(summary.revenueChangePct) },
          { label: "Pedidos", value: String(summary.current.orders), extra: change(summary.ordersChangePct) },
          {
            label: "Ticket promedio",
            value: money(summary.current.avgTicketCents),
            extra: <span className="text-ink-400">antes {money(summary.previous.avgTicketCents)}</span>,
          },
          {
            label: "Cancelados",
            value: String(summary.current.cancelled),
            extra: <span className="text-ink-400">antes {summary.previous.cancelled}</span>,
          },
        ].map((tile) => (
          <div key={tile.label} className="rounded-card border border-ink-200 bg-white p-3">
            <p className="text-xs text-ink-500">{tile.label}</p>
            <p className="mt-1 font-mono text-xl font-semibold text-ink-900">{tile.value}</p>
            <p className="mt-1 text-xs">{tile.extra}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-3 lg:grid-cols-2">
        <section className="rounded-card border border-ink-200 bg-white p-4">
          <h2 className="mb-3 font-semibold text-ink-900">Pedidos por hora</h2>
          {activeHours.length === 0 ? (
            <p className="text-sm text-ink-500">Sin pedidos esta semana.</p>
          ) : (
            <ul className="space-y-1">
              {activeHours.map(({ hour, count }) => (
                <li key={hour} className="flex items-center gap-2 text-xs">
                  <span className="w-10 shrink-0 font-mono text-ink-500">{String(hour).padStart(2, "0")} h</span>
                  <span className="h-4 rounded-sm bg-brand" style={{ width: `${(count / maxHour) * 100}%`, minWidth: count ? 4 : 0 }} />
                  <span className="font-mono text-ink-700">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-card border border-ink-200 bg-white p-4">
          <h2 className="mb-3 font-semibold text-ink-900">Lo más pedido</h2>
          {summary.topProducts.length === 0 ? (
            <p className="text-sm text-ink-500">Sin pedidos esta semana.</p>
          ) : (
            <ol className="space-y-2">
              {summary.topProducts.map((p, i) => (
                <li key={p.name} className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="text-ink-900">
                    <span className="mr-2 font-mono text-ink-400">{i + 1}</span>
                    {p.name}
                  </span>
                  <span className="shrink-0 font-mono text-ink-700">
                    {p.quantity} · {money(p.revenueCents)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="rounded-card border border-ink-200 bg-white p-4">
          <h2 className="mb-3 font-semibold text-ink-900">Cómo pidieron</h2>
          <dl className="grid grid-cols-3 gap-2 text-center">
            {[
              ["Delivery", summary.byFulfillment.delivery],
              ["Retiro", summary.byFulfillment.pickup],
              ["Mesa", summary.byFulfillment.dine_in],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-lg bg-ink-50 p-2">
                <dt className="text-xs text-ink-500">{label}</dt>
                <dd className="font-mono text-lg font-semibold text-ink-900">{value}</dd>
              </div>
            ))}
          </dl>
          {summary.bestWeekday !== null && (
            <p className="mt-3 text-xs text-ink-500">
              Día más fuerte: {WEEKDAY_NAMES[summary.bestWeekday]} ({summary.byWeekday[summary.bestWeekday]} pedidos).
            </p>
          )}
        </section>

        <section className="rounded-card border border-ink-200 bg-white p-4">
          <h2 className="mb-3 font-semibold text-ink-900">Clientes</h2>
          <dl className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-lg bg-ink-50 p-2">
              <dt className="text-xs text-ink-500">Volvieron</dt>
              <dd className="font-mono text-lg font-semibold text-ink-900">{summary.repeatCustomers}</dd>
            </div>
            <div className="rounded-lg bg-ink-50 p-2">
              <dt className="text-xs text-ink-500">Nuevos</dt>
              <dd className="font-mono text-lg font-semibold text-ink-900">{summary.newCustomers}</dd>
            </div>
          </dl>
          {summary.unconfirmed > 0 && (
            <p className="mt-3 text-xs text-warning">
              {summary.unconfirmed} pedido{summary.unconfirmed === 1 ? "" : "s"} no se confirmaron por WhatsApp.
              Conviene escribirles desde el tablero.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
