"use client";

import { AlertTriangle, FileUp, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { countIncluded, MENU_IMPORT_MAX_FILES, type MenuImportDraft } from "@/lib/menu/import";
import { formatMoney, parseMoneyToCents } from "@/lib/money";

type ReadAction = (formData: FormData) => Promise<{ ok: true; draft: MenuImportDraft } | { ok: false; error: string }>;
type ApplyAction = (
  draft: MenuImportDraft,
) => Promise<{ ok: true; products: number; categories: number } | { ok: false; error: string }>;

/** Phone photos are 4-8MB; the model reads a 2000px JPEG just as well. */
async function shrink(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/heic" || file.size < 1_500_000) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    return blob ? new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }) : file;
  } catch {
    return file;
  }
}

export function MenuImportFlow({
  readAction,
  applyAction,
  doneHref,
  currency,
}: {
  readAction: ReadAction;
  applyAction: ApplyAction;
  doneHref: string;
  currency: string;
}) {
  const [draft, setDraft] = useState<MenuImportDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ products: number; categories: number } | null>(null);
  const [reading, startReading] = useTransition();
  const [applying, startApplying] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function read(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);
    const picked = Array.from(fileList).slice(0, MENU_IMPORT_MAX_FILES);
    startReading(async () => {
      const formData = new FormData();
      for (const file of await Promise.all(picked.map(shrink))) formData.append("files", file);
      const result = await readAction(formData);
      if (inputRef.current) inputRef.current.value = "";
      if (!result.ok) return setError(result.error);
      setDraft(result.draft);
    });
  }

  function update(categoryIndex: number, productIndex: number, patch: Partial<MenuImportDraft["categories"][number]["products"][number]>) {
    setDraft((current) => {
      if (!current) return current;
      const next = structuredClone(current);
      Object.assign(next.categories[categoryIndex].products[productIndex], patch);
      return next;
    });
  }

  function renameCategory(categoryIndex: number, name: string) {
    setDraft((current) => {
      if (!current) return current;
      const next = structuredClone(current);
      next.categories[categoryIndex].name = name;
      return next;
    });
  }

  function apply() {
    if (!draft) return;
    setError(null);
    startApplying(async () => {
      const result = await applyAction(draft);
      if (!result.ok) return setError(result.error);
      setDone({ products: result.products, categories: result.categories });
      setDraft(null);
    });
  }

  if (done) {
    return (
      <div className="rounded-card border border-ink-200 bg-white p-6 text-center">
        <p className="font-display text-lg font-bold text-ink-900">
          Listo: {done.products} producto{done.products === 1 ? "" : "s"} en {done.categories} categoría
          {done.categories === 1 ? "" : "s"}.
        </p>
        <p className="mt-1 text-sm text-ink-600">Revisalos en el menú y sumales las fotos.</p>
        <div className="mt-4 flex justify-center gap-2">
          <Link href={doneHref} className={buttonVariants({ size: "md" })}>
            Ir al menú
          </Link>
          <Button variant="outline" size="md" onClick={() => setDone(null)}>
            Importar otra página
          </Button>
        </div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="space-y-3">
        <label
          className={`flex cursor-pointer flex-col items-center gap-2 rounded-card border-2 border-dashed border-ink-200 bg-white p-8 text-center ${reading ? "pointer-events-none opacity-70" : "hover:border-ink-400"}`}
        >
          {reading ? (
            <>
              <Loader2 className="size-8 animate-spin text-ink-500" aria-hidden />
              <span className="font-medium text-ink-900">Leyendo la carta…</span>
              <span className="text-sm text-ink-500">Tarda entre 20 segundos y un minuto.</span>
            </>
          ) : (
            <>
              <FileUp className="size-8 text-ink-500" aria-hidden />
              <span className="font-medium text-ink-900">Subí fotos o el PDF de la carta</span>
              <span className="text-sm text-ink-500">
                Hasta {MENU_IMPORT_MAX_FILES} archivos. Fotos derechas, con buena luz y los precios a la vista.
              </span>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
            className="sr-only"
            onChange={(event) => read(event.target.files)}
          />
        </label>
        {error && <p className="text-sm font-medium text-red-700">{error}</p>}
      </div>
    );
  }

  const included = countIncluded(draft);
  const unclear = draft.categories.flatMap((c) => c.products).filter((p) => p.include && p.priceUnclear).length;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-card border border-ink-200 bg-white p-3 text-sm text-ink-700">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-ink-500" aria-hidden />
        <p>
          Esto es lo que leyó la IA. Corregí lo que haga falta y destildá lo que no quieras cargar. No se cambia ni se
          borra nada de lo que ya tenés en el menú.
        </p>
      </div>

      {draft.categories.map((category, categoryIndex) => (
        <section key={categoryIndex} className="rounded-card border border-ink-200 bg-white p-3">
          <Input
            value={category.name}
            onChange={(event) => renameCategory(categoryIndex, event.target.value)}
            className="mb-2 font-semibold"
            aria-label="Nombre de la categoría"
          />
          <ul className="divide-y divide-ink-100">
            {category.products.map((product, productIndex) => (
              <li key={productIndex} className={`flex flex-wrap items-center gap-2 py-2 ${product.include ? "" : "opacity-50"}`}>
                <input
                  type="checkbox"
                  checked={product.include}
                  onChange={(event) => update(categoryIndex, productIndex, { include: event.target.checked })}
                  className="size-4"
                  aria-label={`Cargar ${product.name}`}
                />
                <div className="min-w-40 flex-1">
                  <Input
                    value={product.name}
                    onChange={(event) => update(categoryIndex, productIndex, { name: event.target.value })}
                    aria-label="Nombre"
                  />
                  {(product.description || product.optionGroups.length > 0) && (
                    <p className="mt-1 text-xs text-ink-500">
                      {product.description}
                      {product.optionGroups.length > 0 &&
                        ` ${product.description ? "· " : ""}${product.optionGroups
                          .map((g) => `${g.name}: ${g.options.map((o) => o.name).join(", ")}`)
                          .join(" · ")}`}
                    </p>
                  )}
                </div>
                <div className="w-32">
                  <Input
                    inputMode="decimal"
                    defaultValue={product.priceCents ? String(product.priceCents / 100) : ""}
                    placeholder="Precio"
                    onBlur={(event) => {
                      const cents = parseMoneyToCents(event.target.value);
                      if (cents !== null) update(categoryIndex, productIndex, { priceCents: cents, priceUnclear: false });
                    }}
                    aria-label="Precio"
                    className={product.priceUnclear ? "border-amber-500" : ""}
                  />
                </div>
                <span className="w-20 text-right text-xs text-ink-500 tabular-nums">
                  {formatMoney(product.priceCents, { currency })}
                </span>
                {product.priceUnclear && (
                  <span className="flex items-center gap-1 text-xs font-medium text-amber-700">
                    <AlertTriangle className="size-3.5" aria-hidden /> Revisá el precio
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}

      {error && <p className="text-sm font-medium text-red-700">{error}</p>}

      <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-2 rounded-card border border-ink-200 bg-white p-3 shadow-lg">
        <p className="text-sm text-ink-700">
          {included} producto{included === 1 ? "" : "s"} para cargar
          {unclear > 0 && <span className="text-amber-700"> · {unclear} sin precio claro</span>}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="md" onClick={() => setDraft(null)} disabled={applying}>
            Descartar
          </Button>
          <Button size="md" onClick={apply} disabled={applying || included === 0}>
            {applying && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Cargar {included} producto{included === 1 ? "" : "s"}
          </Button>
        </div>
      </div>
    </div>
  );
}
