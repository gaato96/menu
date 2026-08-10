"use client";

import { Minus, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import type { DisplayProduct } from "@/lib/menu/types";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string; products: DisplayProduct[] };

interface Line {
  key: string;
  product: DisplayProduct;
  quantity: number;
  optionIds: string[];
  optionNames: string[];
  unitCents: number;
}

/**
 * Taking an order at the table, from the waiter's phone.
 *
 * Prices shown here are for the customer's benefit only — the server
 * re-prices the whole cart from the database inside createOrder() before
 * anything is written. Nothing this component computes is trusted.
 */
export function WaiterOrder({
  tableLabel,
  categories,
  currency,
  submit,
}: {
  tableLabel: string;
  categories: Category[];
  currency: string;
  submit: (formData: FormData) => Promise<{ ok: true; code: string } | { ok: false; error: string }>;
}) {
  const router = useRouter();
  const [lines, setLines] = useState<Line[]>([]);
  const [picking, setPicking] = useState<DisplayProduct | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const total = useMemo(
    () => lines.reduce((sum, line) => sum + line.unitCents * line.quantity, 0),
    [lines],
  );

  function addLine(product: DisplayProduct, optionIds: string[]) {
    const chosen = product.groups
      .flatMap((group) => group.options)
      .filter((option) => optionIds.includes(option.id));

    const unitCents =
      product.base_price_cents + chosen.reduce((sum, o) => sum + o.price_delta_cents, 0);
    const key = `${product.id}:${[...optionIds].sort().join(",")}`;

    setLines((current) => {
      // Same product with the same options is one line with a bigger number,
      // not two lines the kitchen has to reconcile.
      const existing = current.find((line) => line.key === key);
      if (existing) {
        return current.map((line) =>
          line.key === key ? { ...line, quantity: line.quantity + 1 } : line,
        );
      }
      return [
        ...current,
        {
          key,
          product,
          quantity: 1,
          optionIds,
          optionNames: chosen.map((o) => o.name),
          unitCents,
        },
      ];
    });
    setError(null);
  }

  function onProductTap(product: DisplayProduct) {
    if (!product.is_available) return;
    // Only stop for a sheet when there is actually something to choose.
    const hasChoices = product.groups.some((group) => group.options.length > 0);
    if (hasChoices) setPicking(product);
    else addLine(product, []);
  }

  function changeQuantity(key: string, delta: number) {
    setLines((current) =>
      current
        .map((line) => (line.key === key ? { ...line, quantity: line.quantity + delta } : line))
        .filter((line) => line.quantity > 0),
    );
  }

  function send() {
    if (lines.length === 0) {
      setError("Agregá al menos un producto.");
      return;
    }
    const formData = new FormData();
    formData.set(
      "lines",
      JSON.stringify(
        lines.map((line) => ({
          productId: line.product.id,
          quantity: line.quantity,
          optionIds: line.optionIds,
          notes: null,
        })),
      ),
    );
    formData.set("notes", notes);

    setError(null);
    startTransition(async () => {
      const result = await submit(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setLines([]);
      setNotes("");
      router.push(`/panel/salon?enviado=${encodeURIComponent(result.code)}`);
    });
  }

  return (
    <>
      <div className="flex flex-col gap-4 pb-40">
        {categories.map((category) => (
          <section key={category.id}>
            <h2 className="mb-2 font-display text-base font-bold tracking-tight text-ink-900">
              {category.name}
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {category.products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  disabled={!product.is_available}
                  onClick={() => onProductTap(product)}
                  className={cn(
                    "flex min-h-touch-lg flex-col items-start justify-between rounded-card border border-ink-200 bg-white p-3 text-left transition-colors",
                    product.is_available
                      ? "hover:border-brand hover:bg-brand-soft"
                      : "opacity-40",
                  )}
                >
                  <span className="text-sm leading-tight font-medium text-ink-900">
                    {product.name}
                  </span>
                  <span className="mt-1 font-mono text-xs text-ink-600">
                    {formatMoney(product.base_price_cents, { currency })}
                    {!product.is_available && " · agotado"}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* The cart is pinned: a waiter standing at the table needs the total
          and the send button reachable without scrolling back. */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-ink-200 bg-white p-3 shadow-ticket">
        <div className="mx-auto max-w-3xl">
          {lines.length > 0 && (
            <ul className="mb-2 max-h-40 overflow-y-auto">
              {lines.map((line) => (
                <li key={line.key} className="flex items-center gap-2 border-b border-ink-100 py-1.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ink-900">{line.product.name}</p>
                    {line.optionNames.length > 0 && (
                      <p className="truncate text-xs text-ink-500">
                        {line.optionNames.join(" · ")}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label={`Quitar uno de ${line.product.name}`}
                    onClick={() => changeQuantity(line.key, -1)}
                    className="flex size-touch items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100"
                  >
                    <Minus className="size-4" aria-hidden />
                  </button>
                  <span className="w-5 text-center font-mono text-sm">{line.quantity}</span>
                  <button
                    type="button"
                    aria-label={`Agregar uno de ${line.product.name}`}
                    onClick={() => changeQuantity(line.key, 1)}
                    className="flex size-touch items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100"
                  >
                    <Plus className="size-4" aria-hidden />
                  </button>
                  <span className="w-20 text-right font-mono text-sm text-ink-900">
                    {formatMoney(line.unitCents * line.quantity, { currency })}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {lines.length > 0 && (
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={1}
              placeholder="Aclaraciones para cocina (opcional)"
              className="mb-2"
            />
          )}

          {error && (
            <p className="mb-2 text-xs text-danger" role="alert">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-ink-500">{tableLabel}</p>
              <p className="font-mono text-lg font-semibold text-ink-900">
                {formatMoney(total, { currency })}
              </p>
            </div>
            <Button type="button" size="lg" onClick={send} disabled={pending || lines.length === 0}>
              {pending ? "Enviando…" : "Enviar a cocina"}
            </Button>
          </div>
        </div>
      </div>

      {picking && (
        <OptionPicker
          product={picking}
          currency={currency}
          onCancel={() => setPicking(null)}
          onConfirm={(optionIds) => {
            addLine(picking, optionIds);
            setPicking(null);
          }}
        />
      )}
    </>
  );
}

/**
 * Choosing variants for one product. Enforces required groups and max
 * selections in the UI; the server enforces them again for real.
 */
function OptionPicker({
  product,
  currency,
  onCancel,
  onConfirm,
}: {
  product: DisplayProduct;
  currency: string;
  onCancel: () => void;
  onConfirm: (optionIds: string[]) => void;
}) {
  const [selected, setSelected] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(product.groups.map((group) => [group.id, []])),
  );

  const missing = product.groups.filter(
    (group) => group.is_required && (selected[group.id]?.length ?? 0) < Math.max(1, group.min_select),
  );

  function toggle(groupId: string, optionId: string, single: boolean, maxSelect: number) {
    setSelected((current) => {
      const chosen = current[groupId] ?? [];
      if (single) return { ...current, [groupId]: chosen[0] === optionId ? [] : [optionId] };
      if (chosen.includes(optionId)) {
        return { ...current, [groupId]: chosen.filter((id) => id !== optionId) };
      }
      if (maxSelect > 0 && chosen.length >= maxSelect) return current;
      return { ...current, [groupId]: [...chosen, optionId] };
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink-950/40 sm:items-center">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-card bg-white p-4 sm:rounded-card">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="font-display text-lg font-bold tracking-tight text-ink-900">
            {product.name}
          </h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onCancel}
            className="flex size-touch shrink-0 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        {product.groups.map((group) => {
          const single = group.selection_type === "single";
          const chosen = selected[group.id] ?? [];
          return (
            <fieldset key={group.id} className="mb-4">
              <legend className="text-sm font-semibold text-ink-900">
                {group.name}
                <span className="ml-1 font-normal text-ink-500">
                  {group.is_required ? "· obligatorio" : "· opcional"}
                </span>
              </legend>
              <div className="mt-1.5 flex flex-col gap-1">
                {group.options.map((option) => (
                  <label
                    key={option.id}
                    className={cn(
                      "flex min-h-touch items-center gap-2 rounded-lg border px-3 text-sm",
                      chosen.includes(option.id)
                        ? "border-brand bg-brand-soft"
                        : "border-ink-200 bg-white",
                      !option.is_available && "opacity-40",
                    )}
                  >
                    <input
                      type={single ? "radio" : "checkbox"}
                      name={group.id}
                      checked={chosen.includes(option.id)}
                      disabled={!option.is_available}
                      // max_select null means "no ceiling" — 0 reads the same
                      // way to toggle(), which only enforces a positive limit.
                      onChange={() => toggle(group.id, option.id, single, group.max_select ?? 0)}
                      className="size-4"
                    />
                    <span className="flex-1 text-ink-900">{option.name}</span>
                    {option.price_delta_cents !== 0 && (
                      <span className="font-mono text-xs text-ink-600">
                        +{formatMoney(option.price_delta_cents, { currency })}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </fieldset>
          );
        })}

        <Button
          type="button"
          block
          size="lg"
          disabled={missing.length > 0}
          onClick={() => onConfirm(Object.values(selected).flat())}
        >
          {missing.length > 0 ? `Elegí ${missing[0].name}` : "Agregar al pedido"}
        </Button>
      </div>
    </div>
  );
}
