import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ConfirmSubmitButton } from "@/components/panel/confirm-submit-button";
import { ImageUploadForm } from "@/components/panel/image-upload-form";
import { AsyncToggle } from "@/components/panel/async-toggle";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { requireStaff } from "@/lib/auth/context";
import { fetchStaffMenu, fetchStaffProduct } from "@/lib/menu/staff-queries";
import { createClient } from "@/lib/supabase/server";

import {
  createOption,
  createOptionGroup,
  deleteOption,
  deleteOptionGroup,
  toggleOptionAvailable,
  updateProduct,
  uploadProductImage,
} from "../../actions";

export const metadata = { title: "Editar producto" };
export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const staff = await requireStaff();
  const supabase = await createClient();

  const [product, categories] = await Promise.all([
    fetchStaffProduct(supabase, id),
    fetchStaffMenu(supabase, staff.business.id),
  ]);
  if (!product) notFound();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <Link href="/panel/menu" className="flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900">
        <ArrowLeft className="size-4" aria-hidden />
        Volver al menú
      </Link>

      <div className="rounded-card border border-ink-200 bg-white p-4">
        <h1 className="mb-3 font-display text-lg font-bold tracking-tight text-ink-900">
          {product.name}
        </h1>

        <ImageUploadForm
          currentUrl={product.image_url}
          action={uploadProductImage.bind(null, product.id)}
        />

        <form action={updateProduct.bind(null, product.id)} className="mt-4 space-y-3">
          <Field label="Nombre" required>
            <Input name="name" defaultValue={product.name} required />
          </Field>
          <Field label="Descripción">
            <Textarea name="description" defaultValue={product.description ?? ""} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Precio" required>
              <Input
                name="price"
                defaultValue={(product.base_price_cents / 100).toString()}
                inputMode="decimal"
                required
              />
            </Field>
            <Field label="Categoría" required>
              <Select name="categoryId" defaultValue={product.category_id}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Button type="submit">Guardar cambios</Button>
        </form>
      </div>

      <div className="rounded-card border border-ink-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-ink-900">Variantes y agregados</h2>
        </div>

        {product.groups.length === 0 && (
          <p className="text-sm text-ink-500">Sin grupos de opciones todavía.</p>
        )}

        <div className="space-y-4">
          {product.groups.map((group) => (
            <div key={group.id} className="rounded-lg border border-ink-200 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="font-medium text-ink-900">{group.name}</p>
                  <p className="text-xs text-ink-500">
                    {group.selection_type === "single" ? "Selección única" : "Selección múltiple"}
                    {group.is_required ? " · Obligatorio" : " · Opcional"}
                    {group.max_select ? ` · Hasta ${group.max_select}` : ""}
                  </p>
                </div>
                <form action={deleteOptionGroup.bind(null, group.id, product.id)}>
                  <ConfirmSubmitButton
                    variant="ghost"
                    size="icon"
                    confirmMessage={`Eliminar el grupo "${group.name}" y sus opciones. ¿Seguro?`}
                    aria-label="Eliminar grupo"
                  >
                    <Trash2 className="size-4 text-danger" aria-hidden />
                  </ConfirmSubmitButton>
                </form>
              </div>

              <ul className="divide-y divide-ink-100">
                {group.options.map((option) => (
                  <li key={option.id} className="flex items-center gap-2 py-1.5">
                    <span className="flex-1 text-sm text-ink-900">{option.name}</span>
                    <span className="font-mono text-xs text-ink-500">
                      {option.price_delta_cents === 0
                        ? "Sin cargo"
                        : `${option.price_delta_cents > 0 ? "+" : ""}${(option.price_delta_cents / 100).toLocaleString("es-AR")}`}
                    </span>
                    <AsyncToggle
                      checked={option.is_available}
                      action={toggleOptionAvailable.bind(null, option.id, product.id)}
                    />
                    <form action={deleteOption.bind(null, option.id, product.id)}>
                      <ConfirmSubmitButton
                        variant="ghost"
                        size="icon"
                        confirmMessage={`Eliminar "${option.name}"?`}
                        aria-label="Eliminar opción"
                      >
                        <Trash2 className="size-3.5 text-danger" aria-hidden />
                      </ConfirmSubmitButton>
                    </form>
                  </li>
                ))}
              </ul>

              <form
                action={createOption.bind(null, group.id, product.id)}
                className="mt-2 flex flex-wrap items-end gap-2 border-t border-ink-100 pt-2"
              >
                <Input name="name" placeholder="Nombre de la opción" required className="min-w-[8rem] flex-1" />
                <Input name="priceDelta" placeholder="+0 o -0" inputMode="decimal" className="w-24" />
                <Button type="submit" size="sm" variant="outline">
                  Agregar
                </Button>
              </form>
            </div>
          ))}
        </div>

        <form
          action={createOptionGroup.bind(null, product.id)}
          className="mt-4 space-y-2 border-t border-ink-100 pt-3"
        >
          <p className="text-sm font-medium text-ink-900">Nuevo grupo de opciones</p>
          <div className="grid grid-cols-2 gap-2">
            <Input name="name" placeholder="Ej: Tamaño" required />
            <Select name="selectionType" defaultValue="single">
              <option value="single">Selección única</option>
              <option value="multiple">Selección múltiple</option>
            </Select>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 text-sm text-ink-700">
              <input type="checkbox" name="isRequired" className="size-4" />
              Obligatorio
            </label>
            <label className="flex items-center gap-1.5 text-sm text-ink-700">
              Máximo (múltiple)
              <Input name="maxSelect" placeholder="sin límite" className="w-24" />
            </label>
          </div>
          <Button type="submit" size="sm">
            Crear grupo
          </Button>
        </form>
      </div>
    </main>
  );
}
