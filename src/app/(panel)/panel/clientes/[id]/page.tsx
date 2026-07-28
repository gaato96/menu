import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireModule, requireStaff } from "@/lib/auth/context";
import { fetchCustomer, fetchCustomerOrders } from "@/lib/customers/queries";
import { formatMoney } from "@/lib/money";
import { statusLabel } from "@/lib/orders/status";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Cliente" };
export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const staff = await requireStaff();
  requireModule(staff, "crm_loyalty");
  const supabase = await createClient();

  const [customer, orders] = await Promise.all([
    fetchCustomer(supabase, staff.business.id, id),
    fetchCustomerOrders(supabase, staff.business.id, id),
  ]);
  if (!customer) notFound();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <Link href="/panel/clientes" className="flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900">
        <ArrowLeft className="size-4" aria-hidden />
        Volver a clientes
      </Link>

      <div className="rounded-card border border-ink-200 bg-white p-4">
        <h1 className="font-display text-lg font-bold tracking-tight text-ink-900">{customer.name}</h1>
        <p className="font-mono text-sm text-ink-500">{customer.phone}</p>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-ink-50 p-3">
            <p className="text-xs text-ink-500">Gastado (pedidos completados)</p>
            <p className="font-mono text-lg font-semibold text-ink-900">
              {formatMoney(customer.total_spent_cents, { currency: staff.business.currency })}
            </p>
          </div>
          <div className="rounded-lg bg-ink-50 p-3">
            <p className="text-xs text-ink-500">Pedidos completados</p>
            <p className="font-mono text-lg font-semibold text-ink-900">{customer.completed_orders}</p>
          </div>
        </div>
      </div>

      <div className="rounded-card border border-ink-200 bg-white p-4">
        <h2 className="mb-3 font-semibold text-ink-900">Historial</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-ink-500">Sin pedidos todavía.</p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {orders.map((order) => (
              <li key={order.id} className="flex items-center gap-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm font-semibold text-ink-900">{order.code}</p>
                  <p className="text-xs text-ink-500">
                    {new Date(order.created_at).toLocaleDateString("es-AR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    · {statusLabel(order.status, order.fulfillment_type)}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-sm text-ink-900">
                  {formatMoney(order.total_cents, { currency: staff.business.currency })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
