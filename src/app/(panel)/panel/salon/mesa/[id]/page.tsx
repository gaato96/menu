import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { WaiterOrder } from "@/components/panel/waiter-order";
import { requireModule, requireStaff } from "@/lib/auth/context";
import { getPublicMenu } from "@/lib/menu/queries";
import { formatMoney } from "@/lib/money";
import { fetchTableOrders } from "@/lib/orders/board-queries";
import { statusLabel } from "@/lib/orders/status";
import { createClient } from "@/lib/supabase/server";

import { createWaiterOrder } from "../../actions";

export const metadata = { title: "Tomar pedido" };
export const dynamic = "force-dynamic";

export default async function WaiterOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staff = await requireStaff();
  requireModule(staff, "tables");
  const supabase = await createClient();

  const { data: table } = await supabase
    .from("restaurant_tables")
    .select("id, label, seats, zone, is_active")
    .eq("id", id)
    .maybeSingle();
  if (!table) notFound();

  // Same menu the diner sees: one source of truth for what is on sale and
  // which options exist, so the waiter can never enter something the QR flow
  // would reject.
  const [menu, openOrders] = await Promise.all([
    getPublicMenu(staff.business.slug),
    fetchTableOrders(supabase, staff.business.id, table.id),
  ]);

  const categories = menu.categories
    .filter((category) => category.is_active && category.products.length > 0)
    .map((category) => ({
      id: category.id,
      name: category.name,
      products: category.products,
    }));

  const accountTotal = openOrders.reduce((sum, order) => sum + order.total_cents, 0);
  const currency = staff.business.currency;
  const tableName = table.label.toLowerCase().startsWith("mesa")
    ? table.label
    : `Mesa ${table.label}`;

  return (
    <main className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
      {/* One compact row instead of a three-line header block: on a phone held
          in one hand at the table, every line here is a line of menu the
          waiter cannot see. */}
      <div className="flex items-center gap-3">
        <Link
          href="/panel/salon"
          aria-label="Volver al salón"
          className="flex size-touch shrink-0 items-center justify-center rounded-lg border border-ink-200 text-ink-500 hover:bg-ink-50"
        >
          <ArrowLeft className="size-5" aria-hidden />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-lg font-bold tracking-tight text-ink-900 sm:text-xl">
            {tableName}
          </h1>
          <p className="flex items-center gap-1.5 text-xs text-ink-500">
            <Users className="size-3.5" aria-hidden />
            {table.seats} lugares
            {table.zone ? ` · ${table.zone}` : ""}
            {openOrders.length > 0 &&
              ` · ${openOrders.length} comanda${openOrders.length === 1 ? "" : "s"} abierta${
                openOrders.length === 1 ? "" : "s"
              }`}
          </p>
        </div>
        {accountTotal > 0 && (
          <div className="shrink-0 text-right">
            <p className="text-xs text-ink-500">Cuenta</p>
            <p className="font-mono text-base font-semibold text-ink-900">
              {formatMoney(accountTotal, { currency })}
            </p>
          </div>
        )}
      </div>

      {!table.is_active && (
        <p className="rounded-card border border-warning bg-warning-soft p-3 text-sm text-warning">
          Esta mesa está desactivada — activala en el salón para tomarle pedidos.
        </p>
      )}

      {/* What is already on this table, folded shut by default: the reason a
          waiter opens a table is almost always to ADD something, and the
          account only matters when somebody asks for it. */}
      {openOrders.length > 0 && (
        <details className="group rounded-card border border-ink-200 bg-white">
          <summary className="flex min-h-touch cursor-pointer list-none items-center justify-between gap-2 px-3 text-sm font-semibold text-ink-900">
            Lo que ya pidió la mesa
            <span className="text-xs font-normal text-ink-500">
              <span className="group-open:hidden">ver detalle</span>
              <span className="hidden group-open:inline">ocultar</span>
            </span>
          </summary>
          <div className="divide-y divide-ink-100 border-t border-ink-100">
            {openOrders.map((order) => (
              <div key={order.id} className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-semibold text-ink-900">{order.code}</span>
                  <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-700">
                    {statusLabel(order.status, order.fulfillment_type)}
                  </span>
                </div>
                <ul className="mt-1.5 space-y-0.5 text-sm text-ink-700">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      <span className="font-medium">{item.quantity}×</span> {item.productName}
                      {item.options.length > 0 && (
                        <span className="block pl-4 text-xs text-ink-500">
                          {item.options.map((o) => o.optionName).join(" · ")}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
                <p className="mt-1 text-right font-mono text-sm text-ink-900">
                  {formatMoney(order.total_cents, { currency })}
                </p>
              </div>
            ))}
          </div>
        </details>
      )}

      {categories.length === 0 ? (
        <p className="rounded-card border border-dashed border-ink-200 p-6 text-center text-sm text-ink-500">
          Todavía no hay productos cargados en el menú.
        </p>
      ) : (
        <WaiterOrder
          tableLabel={tableName}
          categories={categories}
          currency={currency}
          disabled={!table.is_active}
          submit={createWaiterOrder.bind(null, table.id)}
        />
      )}
    </main>
  );
}
