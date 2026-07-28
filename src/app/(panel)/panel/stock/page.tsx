import { AlertTriangle, Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { requireModule, requireStaff } from "@/lib/auth/context";
import { fetchStaffMenu } from "@/lib/menu/staff-queries";
import { createClient } from "@/lib/supabase/server";

import { adjustProductStock, updateProductStock } from "./actions";

export const metadata = { title: "Stock" };
export const dynamic = "force-dynamic";

export default async function StockPage() {
  const staff = await requireStaff();
  requireModule(staff, "inventory");
  const supabase = await createClient();
  const categories = await fetchStaffMenu(supabase, staff.business.id);

  const products = categories.flatMap((category) =>
    category.products.map((product) => ({ ...product, categoryName: category.name })),
  );
  const tracked = products.filter((p) => p.stock_quantity !== null);
  const untracked = products.filter((p) => p.stock_quantity === null);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <div>
        <h1 className="font-display text-xl font-bold tracking-tight text-ink-900">Stock</h1>
        <p className="text-sm text-ink-500">
          Por producto, sin recetas ni insumos. Un producto sin cantidad cargada no lleva la
          cuenta — el menú se comporta igual que siempre.
        </p>
      </div>

      {tracked.length === 0 && (
        <p className="rounded-card border border-dashed border-ink-200 p-6 text-center text-sm text-ink-500">
          Todavía no cargaste stock para ningún producto. Elegí uno abajo y ponele una cantidad.
        </p>
      )}

      {tracked.length > 0 && (
        <div className="overflow-hidden rounded-card border border-ink-200 bg-white">
          <ul className="divide-y divide-ink-100">
            {tracked.map((product) => {
              const low =
                product.stock_quantity !== null && product.stock_quantity <= product.low_stock_threshold;
              return (
                <li key={product.id} className="flex items-center gap-3 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-900">{product.name}</p>
                    <p className="text-xs text-ink-500">{product.categoryName}</p>
                  </div>

                  {low && (
                    <span className="flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-xs font-medium text-warning">
                      <AlertTriangle className="size-3.5" aria-hidden />
                      Bajo
                    </span>
                  )}

                  <div className="flex items-center gap-1">
                    <form action={adjustProductStock.bind(null, product.id, -1)}>
                      <button
                        type="submit"
                        disabled={product.stock_quantity === 0}
                        aria-label="Restar uno"
                        className="flex size-touch items-center justify-center rounded-lg border border-ink-200 text-ink-700 disabled:opacity-30"
                      >
                        <Minus className="size-4" aria-hidden />
                      </button>
                    </form>
                    <span className="w-10 text-center font-mono text-base font-semibold text-ink-900">
                      {product.stock_quantity}
                    </span>
                    <form action={adjustProductStock.bind(null, product.id, 1)}>
                      <button
                        type="submit"
                        aria-label="Sumar uno"
                        className="flex size-touch items-center justify-center rounded-lg border border-ink-200 text-ink-700"
                      >
                        <Plus className="size-4" aria-hidden />
                      </button>
                    </form>
                  </div>

                  <form
                    action={updateProductStock.bind(null, product.id)}
                    className="flex items-center gap-1"
                  >
                    <input type="hidden" name="stockQuantity" value={product.stock_quantity ?? ""} />
                    <Input
                      name="lowStockThreshold"
                      defaultValue={product.low_stock_threshold}
                      inputMode="numeric"
                      className="w-16"
                      aria-label="Aviso de stock bajo"
                    />
                    <Button type="submit" variant="outline" size="sm">
                      Guardar
                    </Button>
                  </form>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {untracked.length > 0 && (
        <div className="overflow-hidden rounded-card border border-ink-200 bg-white">
          <p className="border-b border-ink-100 bg-ink-50 px-3 py-2 text-sm font-medium text-ink-700">
            Sin seguimiento de stock
          </p>
          <ul className="divide-y divide-ink-100">
            {untracked.map((product) => (
              <li key={product.id} className="flex items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">{product.name}</p>
                  <p className="text-xs text-ink-500">{product.categoryName}</p>
                </div>
                <form
                  action={updateProductStock.bind(null, product.id)}
                  className="flex items-center gap-2"
                >
                  <Input
                    name="stockQuantity"
                    placeholder="Cantidad"
                    inputMode="numeric"
                    className="w-24"
                  />
                  <input type="hidden" name="lowStockThreshold" value={product.low_stock_threshold} />
                  <Button type="submit" variant="outline" size="sm">
                    Empezar a contar
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
