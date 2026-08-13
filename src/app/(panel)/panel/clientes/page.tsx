import { Users } from "lucide-react";
import Link from "next/link";

import { requireModule, requireStaff } from "@/lib/auth/context";
import { fetchCustomers } from "@/lib/customers/queries";
import { formatMoney } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Clientes" };
export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const staff = await requireStaff();
  requireModule(staff, "crm_loyalty");
  const supabase = await createClient();
  const customers = await fetchCustomers(supabase, staff.business.id);

  return (
    <main className="flex flex-1 flex-col gap-4 p-3 sm:p-4">
      <div>
        <h1 className="font-display text-lg font-bold tracking-tight text-ink-900 sm:text-xl">Clientes</h1>
        <p className="text-sm text-ink-500">
          Se arman solos a partir del teléfono de cada pedido — nadie se carga a mano acá.
        </p>
      </div>

      {customers.length === 0 ? (
        <p className="rounded-card border border-dashed border-ink-200 p-6 text-center text-sm text-ink-500">
          Todavía no hay clientes. Van a aparecer apenas entre el primer pedido.
        </p>
      ) : (
        <div className="overflow-hidden rounded-card border border-ink-200 bg-white">
          <ul className="divide-y divide-ink-100">
            {customers.map((customer) => (
              <li key={customer.customer_id}>
                <Link
                  href={`/panel/clientes/${customer.customer_id}`}
                  className="flex items-center gap-3 p-3 hover:bg-ink-50"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-500">
                    <Users className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-900">{customer.name}</p>
                    <p className="font-mono text-xs text-ink-500">{customer.phone}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-sm font-semibold text-ink-900">
                      {formatMoney(customer.total_spent_cents, { currency: staff.business.currency })}
                    </p>
                    <p className="text-xs text-ink-500">
                      {customer.completed_orders} pedido{customer.completed_orders === 1 ? "" : "s"}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
