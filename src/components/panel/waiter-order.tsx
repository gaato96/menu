"use client";

import { ChevronUp, Minus, Plus, Search, ShoppingBag, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/field";
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
 * Taking an order at the table.
 *
 * Two shapes, one component. On a phone (the mozo's own, standing at the
 * table) the menu owns the screen and the cart is a single pinned row that
 * expands only when they want to check it. From `lg` up (the counter tablet
 * or a desktop) the cart is a column that sits beside the menu and never
 * moves — there the screen is wide and hiding the order behind a tap is
 * pointless.
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
  disabled = false,
}: {
  tableLabel: string;
  categories: Category[];
  currency: string;
  submit: (formData: FormData) => Promise<{ ok: true; code: string } | { ok: false; error: string }>;
  /** A deactivated table can be browsed but not ordered for. */
  disabled?: boolean;
}) {
  const router = useRouter();
  const [lines, setLines] = useState<Line[]>([]);
  const [picking, setPicking] = useState<DisplayProduct | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const total = useMemo(
    () => lines.reduce((sum, line) => sum + line.unitCents * line.quantity, 0),
    [lines],
  );
  const itemCount = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity, 0),
    [lines],
  );

  // A long menu is faster to search than to scroll past on a phone. Matching
  // on the product name only: a mozo types "milanesa", not a description.
  const visibleCategories = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return categories;
    return categories
      .map((category) => ({
        ...category,
        products: category.products.filter((p) => p.name.toLowerCase().includes(term)),
      }))
      .filter((category) => category.products.length > 0);
  }, [categories, query]);

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
    if (!product.is_available || disabled) return;
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
      setCartOpen(false);
      router.push(`/panel/salon?enviado=${encodeURIComponent(result.code)}`);
    });
  }

  const cartBody = (
    <>
      {lines.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-400">
          Tocá un producto para empezar la comanda.
        </p>
      ) : (
        <ul className="divide-y divide-ink-100">
          {lines.map((line) => (
            <li key={line.key} className="flex items-center gap-2 py-1.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink-900">{line.product.name}</p>
                {line.optionNames.length > 0 && (
                  <p className="truncate text-xs text-ink-500">{line.optionNames.join(" · ")}</p>
                )}
              </div>
              <button
                type="button"
                aria-label={
                  line.quantity === 1
                    ? `Quitar ${line.product.name}`
                    : `Quitar uno de ${line.product.name}`
                }
                onClick={() => changeQuantity(line.key, -1)}
                className="flex size-touch items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100"
              >
                {line.quantity === 1 ? (
                  <Trash2 className="size-4 text-danger" aria-hidden />
                ) : (
                  <Minus className="size-4" aria-hidden />
                )}
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
          // Overrides the control's default min-h-24: inside a cart that is
          // already competing for vertical space, a one-line note field is a
          // one-line field.
          className="mt-2 min-h-touch"
        />
      )}

      {error && (
        <p className="mt-2 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </>
  );

  const sendButton = (
    <Button
      type="button"
      size="lg"
      onClick={send}
      disabled={pending || lines.length === 0 || disabled}
    >
      {pending ? "Enviando…" : "Enviar a cocina"}
    </Button>
  );

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        {/* pb-32 leaves room for the pinned mobile cart; from lg the cart is a
            column instead of an overlay, so the padding goes away. */}
        <div className="flex flex-col gap-3 pb-32 lg:pb-0">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar un producto…"
              aria-label="Buscar un producto"
              className="pl-9"
            />
          </div>

          {visibleCategories.length === 0 ? (
            <p className="rounded-card border border-dashed border-ink-200 p-6 text-center text-sm text-ink-500">
              Nada coincide con “{query}”.
            </p>
          ) : (
            visibleCategories.map((category) => (
              <section key={category.id}>
                <h2 className="mb-2 font-display text-base font-bold tracking-tight text-ink-900">
                  {category.name}
                </h2>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                  {category.products.map((product) => {
                    const inCart = lines
                      .filter((line) => line.product.id === product.id)
                      .reduce((sum, line) => sum + line.quantity, 0);
                    return (
                      <button
                        key={product.id}
                        type="button"
                        disabled={!product.is_available || disabled}
                        onClick={() => onProductTap(product)}
                        className={cn(
                          "relative flex min-h-touch-lg flex-col items-start justify-between rounded-card border border-ink-200 bg-white p-2.5 text-left transition-colors sm:p-3",
                          product.is_available && !disabled
                            ? "hover:border-brand hover:bg-brand-soft active:bg-brand-soft"
                            : "opacity-40",
                          inCart > 0 && "border-brand",
                        )}
                      >
                        <span className="text-sm leading-tight font-medium text-ink-900">
                          {product.name}
                        </span>
                        <span className="mt-1 font-mono text-xs text-ink-600">
                          {formatMoney(product.base_price_cents, { currency })}
                          {!product.is_available && " · agotado"}
                        </span>
                        {/* How many of this product are already on the comanda.
                            Without it a mozo adding a second round has to open
                            the cart to know whether the first tap registered. */}
                        {inCart > 0 && (
                          <span className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-brand font-mono text-xs font-semibold text-brand-fg">
                            {inCart}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>

        {/* Desktop cart: a real column, sticky under the panel header. */}
        <aside className="sticky top-24 hidden max-h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-card border border-ink-200 bg-white lg:flex">
          <div className="flex items-center justify-between gap-2 border-b border-ink-100 px-3 py-2">
            <h2 className="text-sm font-semibold text-ink-900">Comanda</h2>
            <span className="text-xs text-ink-500">{tableLabel}</span>
          </div>
          <div className="flex-1 overflow-y-auto px-3">{cartBody}</div>
          <div className="flex items-center gap-3 border-t border-ink-100 p-3">
            <div className="flex-1">
              <p className="text-xs text-ink-500">
                {itemCount} ítem{itemCount === 1 ? "" : "s"}
              </p>
              <p className="font-mono text-lg font-semibold text-ink-900">
                {formatMoney(total, { currency })}
              </p>
            </div>
            {sendButton}
          </div>
        </aside>
      </div>

      {/* Mobile cart: one pinned row. It expands into the list only when the
          mozo asks for it — the old version kept a scrolling line list open
          permanently and ate a third of the screen while they were still
          choosing. */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-ink-200 bg-white shadow-ticket lg:hidden">
        {cartOpen && lines.length > 0 && (
          <div className="max-h-[45vh] overflow-y-auto border-b border-ink-100 px-3 pb-2">
            {cartBody}
          </div>
        )}
        {!cartOpen && error && (
          <p className="px-3 pt-2 text-xs text-danger" role="alert">
            {error}
          </p>
        )}

        <div className="flex items-center gap-2 p-3">
          <button
            type="button"
            onClick={() => setCartOpen((open) => !open)}
            disabled={lines.length === 0}
            aria-expanded={cartOpen}
            className="flex min-h-touch flex-1 items-center gap-2 rounded-lg px-2 text-left disabled:opacity-60"
          >
            <span className="relative">
              <ShoppingBag className="size-5 text-ink-500" aria-hidden />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-brand font-mono text-[10px] font-semibold text-brand-fg">
                  {itemCount}
                </span>
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs text-ink-500">{tableLabel}</span>
              <span className="block font-mono text-lg leading-tight font-semibold text-ink-900">
                {formatMoney(total, { currency })}
              </span>
            </span>
            {lines.length > 0 && (
              <ChevronUp
                className={cn("size-4 shrink-0 text-ink-400 transition-transform", cartOpen && "rotate-180")}
                aria-hidden
              />
            )}
          </button>
          {sendButton}
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
