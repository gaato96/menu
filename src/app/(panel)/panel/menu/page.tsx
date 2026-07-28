import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

import { AsyncToggle } from "@/components/panel/async-toggle";
import { ConfirmSubmitButton } from "@/components/panel/confirm-submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { requireStaff } from "@/lib/auth/context";
import { formatMoney } from "@/lib/money";
import { fetchStaffMenu } from "@/lib/menu/staff-queries";
import { createClient } from "@/lib/supabase/server";

import {
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  moveCategory,
  moveProduct,
  toggleCategoryActive,
  toggleProductAvailable,
  updateCategoryName,
} from "./actions";

export const metadata = { title: "Menú" };
export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const staff = await requireStaff();
  const supabase = await createClient();
  const categories = await fetchStaffMenu(supabase, staff.business.id);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold tracking-tight text-ink-900">Menú</h1>
      </div>

      <form action={createCategory} className="flex items-end gap-2 rounded-card border border-ink-200 bg-white p-3">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-ink-900">Nueva categoría</label>
          <Input name="name" placeholder="Ej: Postres" required />
        </div>
        <Button type="submit" size="md">
          <Plus className="size-4" aria-hidden />
          Agregar
        </Button>
      </form>

      {categories.length === 0 && (
        <p className="rounded-card border border-dashed border-ink-200 p-6 text-center text-sm text-ink-500">
          Todavía no tenés categorías. Creá la primera arriba.
        </p>
      )}

      <div className="space-y-3">
        {categories.map((category, categoryIndex) => (
          <details
            key={category.id}
            open
            className="overflow-hidden rounded-card border border-ink-200 bg-white"
          >
            <summary className="flex cursor-pointer list-none items-center gap-2 border-b border-ink-100 bg-ink-50 px-3 py-2">
              <div className="flex shrink-0 flex-col">
                <form action={moveCategory.bind(null, category.id, "up")}>
                  <button
                    type="submit"
                    disabled={categoryIndex === 0}
                    className="flex size-6 items-center justify-center text-ink-400 disabled:opacity-30"
                    aria-label="Subir categoría"
                  >
                    <ChevronUp className="size-4" />
                  </button>
                </form>
                <form action={moveCategory.bind(null, category.id, "down")}>
                  <button
                    type="submit"
                    disabled={categoryIndex === categories.length - 1}
                    className="flex size-6 items-center justify-center text-ink-400 disabled:opacity-30"
                    aria-label="Bajar categoría"
                  >
                    <ChevronDown className="size-4" />
                  </button>
                </form>
              </div>

              <span className="flex-1 font-semibold text-ink-900">
                {category.name}{" "}
                <span className="font-normal text-ink-400">({category.products.length})</span>
              </span>

              <AsyncToggle
                checked={category.is_active}
                action={toggleCategoryActive.bind(null, category.id)}
                label="Visible"
              />

              <form action={deleteCategory.bind(null, category.id)}>
                <ConfirmSubmitButton
                  variant="ghost"
                  size="icon"
                  confirmMessage={`Eliminar "${category.name}" y todos sus productos. No se puede deshacer. ¿Seguro?`}
                  aria-label="Eliminar categoría"
                >
                  <Trash2 className="size-4 text-danger" aria-hidden />
                </ConfirmSubmitButton>
              </form>
            </summary>

            <div className="p-3">
              <form
                action={updateCategoryName.bind(null, category.id)}
                className="mb-3 flex items-center gap-2"
              >
                <Input name="name" defaultValue={category.name} className="max-w-xs" />
                <Button type="submit" variant="outline" size="sm">
                  Renombrar
                </Button>
              </form>

              <ul className="divide-y divide-ink-100">
                {category.products.map((product, productIndex) => (
                  <li key={product.id} className="flex items-center gap-2 py-2">
                    <div className="flex shrink-0 flex-col">
                      <form action={moveProduct.bind(null, product.id, category.id, "up")}>
                        <button
                          type="submit"
                          disabled={productIndex === 0}
                          className="flex size-5 items-center justify-center text-ink-400 disabled:opacity-30"
                          aria-label="Subir producto"
                        >
                          <ChevronUp className="size-3.5" />
                        </button>
                      </form>
                      <form action={moveProduct.bind(null, product.id, category.id, "down")}>
                        <button
                          type="submit"
                          disabled={productIndex === category.products.length - 1}
                          className="flex size-5 items-center justify-center text-ink-400 disabled:opacity-30"
                          aria-label="Bajar producto"
                        >
                          <ChevronDown className="size-3.5" />
                        </button>
                      </form>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-900">{product.name}</p>
                      <p className="font-mono text-xs text-ink-500">
                        {formatMoney(product.base_price_cents, { currency: staff.business.currency })}
                      </p>
                    </div>

                    <AsyncToggle
                      checked={product.is_available}
                      action={toggleProductAvailable.bind(null, product.id)}
                    />

                    <Link
                      href={`/panel/menu/producto/${product.id}`}
                      className="flex size-touch items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100"
                      aria-label="Editar producto"
                    >
                      <Pencil className="size-4" aria-hidden />
                    </Link>

                    <form action={deleteProduct.bind(null, product.id)}>
                      <ConfirmSubmitButton
                        variant="ghost"
                        size="icon"
                        confirmMessage={`Eliminar "${product.name}". No se puede deshacer. ¿Seguro?`}
                        aria-label="Eliminar producto"
                      >
                        <Trash2 className="size-4 text-danger" aria-hidden />
                      </ConfirmSubmitButton>
                    </form>
                  </li>
                ))}
              </ul>

              <form
                action={createProduct.bind(null, category.id)}
                className="mt-3 flex flex-wrap items-end gap-2 border-t border-ink-100 pt-3"
              >
                <div className="min-w-[10rem] flex-1">
                  <label className="mb-1 block text-xs font-medium text-ink-700">Producto nuevo</label>
                  <Input name="name" placeholder="Nombre" required />
                </div>
                <div className="w-28">
                  <label className="mb-1 block text-xs font-medium text-ink-700">Precio</label>
                  <Input name="price" placeholder="0" inputMode="decimal" required />
                </div>
                <Button type="submit" size="md">
                  <Plus className="size-4" aria-hidden />
                  Agregar
                </Button>
              </form>
            </div>
          </details>
        ))}
      </div>
    </main>
  );
}
