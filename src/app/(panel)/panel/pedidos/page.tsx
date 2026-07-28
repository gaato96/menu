import { Bike, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/field";
import { StatusBadge } from "@/components/history/status-badge";
import { requireStaff } from "@/lib/auth/context";
import { businessRangeUtc, businessTodayDateStr } from "@/lib/business/date-range";
import { formatMoney } from "@/lib/money";
import { fetchOrderHistory, summarizeOrders } from "@/lib/orders/history-queries";
import { ORDER_STATUSES, STATUS_LABELS, type FulfillmentType, type OrderStatus } from "@/lib/orders/status";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Pedidos" };
export const dynamic = "force-dynamic";

interface SearchParams {
  from?: string;
  to?: string;
  status?: string;
  fulfillment?: string;
}

export default async function OrderHistoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const staff = await requireStaff();
  const params = await searchParams;
  const supabase = await createClient();

  const today = businessTodayDateStr(staff.business.timezone);
  const from = params.from || today;
  const to = params.to || today;
  const status = ORDER_STATUSES.includes(params.status as OrderStatus)
    ? (params.status as OrderStatus)
    : undefined;
  const fulfillment =
    params.fulfillment === "delivery" || params.fulfillment === "pickup"
      ? (params.fulfillment as FulfillmentType)
      : undefined;

  const { startIso, endIsoExclusive } = businessRangeUtc(from, to, staff.business.timezone);
  const orders = await fetchOrderHistory(supabase, staff.business.id, {
    startIso,
    endIsoExclusive,
    status,
    fulfillment,
  });
  const summary = summarizeOrders(orders);
  const isToday = from === today && to === today;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="font-display text-xl font-bold tracking-tight text-ink-900">
        {isToday ? "Resumen de hoy" : "Historial de pedidos"}
      </h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard label="Pedidos" value={String(summary.orderCount)} />
        <SummaryCard
          label="Facturación"
          value={formatMoney(summary.revenueCents, { currency: staff.business.currency })}
        />
        <SummaryCard
          label="Ticket promedio"
          value={formatMoney(summary.averageTicketCents, { currency: staff.business.currency })}
        />
        <SummaryCard label="Cancelados" value={String(summary.cancelledCount)} />
      </div>

      <form className="grid grid-cols-2 gap-3 rounded-card border border-ink-200 bg-white p-3 sm:grid-cols-5 sm:items-end">
        <Field label="Desde">
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="block min-h-touch w-full rounded-lg border border-ink-200 px-3 text-sm"
          />
        </Field>
        <Field label="Hasta">
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="block min-h-touch w-full rounded-lg border border-ink-200 px-3 text-sm"
          />
        </Field>
        <Field label="Estado">
          <Select name="status" defaultValue={status ?? ""}>
            <option value="">Todos</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Entrega">
          <Select name="fulfillment" defaultValue={fulfillment ?? ""}>
            <option value="">Todas</option>
            <option value="delivery">Delivery</option>
            <option value="pickup">Retiro</option>
          </Select>
        </Field>
        <Button type="submit" className="sm:col-span-1">
          Filtrar
        </Button>
      </form>

      <div className="overflow-hidden rounded-card border border-ink-200 bg-white">
        {orders.length === 0 ? (
          <p className="p-6 text-center text-sm text-ink-500">
            No hay pedidos en ese rango con esos filtros.
          </p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {orders.map((order) => (
              <li key={order.id} className="flex items-start gap-3 px-4 py-3">
                <div className="flex min-w-0 flex-1 items-start gap-2">
                  {order.fulfillment_type === "delivery" ? (
                    <Bike className="mt-0.5 size-4 shrink-0 text-ink-400" aria-hidden />
                  ) : (
                    <Store className="mt-0.5 size-4 shrink-0 text-ink-400" aria-hidden />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-ink-900">
                        {order.code}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="truncate text-sm text-ink-700">{order.customer_name}</p>
                    <p className="truncate text-xs text-ink-400">
                      {order.items.map((i) => `${i.quantity}× ${i.productName}`).join(", ")}
                    </p>
                    {order.status === "cancelled" && order.cancel_reason && (
                      <p className="mt-0.5 text-xs text-danger">Motivo: {order.cancel_reason}</p>
                    )}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="font-mono text-sm font-semibold text-ink-900">
                    {formatMoney(order.total_cents, { currency: staff.business.currency })}
                  </p>
                  <p className="text-xs text-ink-400">
                    {new Date(order.created_at).toLocaleTimeString("es-AR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-ink-200 bg-white p-3">
      <p className="text-xs text-ink-500">{label}</p>
      <p className="font-mono text-lg font-semibold text-ink-900">{value}</p>
    </div>
  );
}
