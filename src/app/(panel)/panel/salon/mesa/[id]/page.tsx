import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { WaiterOrder } from "@/components/panel/waiter-order";
import { requireModule, requireStaff } from "@/lib/auth/context";
import { getPublicMenu } from "@/lib/menu/queries";
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
    .select("id, label, seats, is_active")
    .eq("id", id)
    .maybeSingle();
  if (!table) notFound();

  // Same menu the diner sees: one source of truth for what is on sale and
  // which options exist, so the waiter can never enter something the QR flow
  // would reject.
  const menu = await getPublicMenu(staff.business.slug);

  const categories = menu.categories
    .filter((category) => category.is_active && category.products.length > 0)
    .map((category) => ({
      id: category.id,
      name: category.name,
      products: category.products,
    }));

  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <div>
        <Link
          href="/panel/salon"
          className="flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver al salón
        </Link>
        <h1 className="mt-2 font-display text-xl font-bold tracking-tight text-ink-900">
          {table.label}
        </h1>
        <p className="text-sm text-ink-500">
          {table.is_active
            ? "Tocá los productos para armar el pedido. Entra directo a cocina."
            : "Esta mesa está desactivada — activala en el salón para tomarle pedidos."}
        </p>
      </div>

      {categories.length === 0 ? (
        <p className="rounded-card border border-dashed border-ink-200 p-6 text-center text-sm text-ink-500">
          Todavía no hay productos cargados en el menú.
        </p>
      ) : (
        <WaiterOrder
          tableLabel={table.label}
          categories={categories}
          currency={staff.business.currency}
          submit={createWaiterOrder.bind(null, table.id)}
        />
      )}
    </main>
  );
}
