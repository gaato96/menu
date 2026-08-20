"use client";

import * as Checkbox from "@radix-ui/react-checkbox";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { Check } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { Sheet } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/field";
import type { DisplayProduct } from "@/lib/menu/types";
import { toMenuProduct } from "@/lib/menu/types";
import { formatMoney } from "@/lib/money";
import { priceLine, type MenuSnapshot } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export interface ProductSheetSubmit {
  productId: string;
  quantity: number;
  optionIds: string[];
  notes: string;
}

export function ProductSheet({
  product,
  currency,
  onClose,
  onSubmit,
}: {
  product: DisplayProduct | null;
  currency: string;
  onClose: () => void;
  onSubmit: (value: ProductSheetSubmit) => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState("");

  // Resets selections when a different product opens, without an extra
  // render pass. The sheet stays mounted across products for its exit
  // animation, so state can't just be seeded once via useState(() => ...) —
  // but adjusting it during render (React's documented pattern for "state
  // that depends on a prop changing") is still cheaper than useEffect, which
  // would render once with stale data and then re-render with the reset.
  const [resetForProductId, setResetForProductId] = useState(product?.id);
  if (product && product.id !== resetForProductId) {
    setResetForProductId(product.id);
    setQuantity(1);
    setNotes("");
    setSelected(Object.fromEntries(product.groups.map((g) => [g.id, []])));
  }

  const menuProduct = useMemo(() => (product ? toMenuProduct(product) : null), [product]);

  const optionIds = useMemo(() => Object.values(selected).flat(), [selected]);

  const priced = useMemo(() => {
    if (!menuProduct) return null;
    const snapshot: MenuSnapshot = {
      products: new Map([[menuProduct.id, menuProduct]]),
      zones: new Map(),
      settings: { deliveryEnabled: true, pickupEnabled: true, minOrderCents: 0, dineInEnabled: true },
    };
    const errors: Parameters<typeof priceLine>[2] = [];
    const result = priceLine({ lineId: "preview", productId: menuProduct.id, quantity, optionIds }, snapshot, errors);
    return { line: result, errors };
  }, [menuProduct, quantity, optionIds]);

  if (!product || !menuProduct) return null;

  const toggleSingle = (groupId: string, optionId: string) => {
    setSelected((prev) => ({ ...prev, [groupId]: [optionId] }));
  };

  const toggleMultiple = (groupId: string, optionId: string, checked: boolean, max: number | null) => {
    setSelected((prev) => {
      const current = prev[groupId] ?? [];
      if (checked) {
        if (max !== null && current.length >= max) return prev;
        return { ...prev, [groupId]: [...current, optionId] };
      }
      return { ...prev, [groupId]: current.filter((id) => id !== optionId) };
    });
  };

  const canSubmit = priced?.line !== null && priced?.line !== undefined;

  return (
    <Sheet
      open={Boolean(product)}
      onOpenChange={(open) => !open && onClose()}
      title={product.name}
      footer={
        <Button
          type="button"
          size="lg"
          block
          disabled={!canSubmit}
          onClick={() =>
            canSubmit &&
            onSubmit({ productId: product.id, quantity, optionIds, notes })
          }
        >
          {canSubmit && priced?.line
            ? `Agregar — ${formatMoney(priced.line.lineTotalCents, { currency })}`
            : "Elegí las opciones requeridas"}
        </Button>
      }
    >
      <div className="space-y-5">
        {product.image_url && (
          // 4:5, not 16:9. The photos this menu is fed are vertical 9:16 (the
          // AI enhancer asks for that ratio explicitly, and a phone camera
          // held normally gives it anyway), so a 16:9 window was throwing
          // away most of the plate. Capped by max-h so a tall photo still
          // leaves the price and the options visible without scrolling.
          <div className="-mt-1 mx-auto aspect-4/5 max-h-[45vh] overflow-hidden rounded-lg bg-ink-100">
            <Image
              src={product.image_url}
              alt=""
              width={640}
              height={800}
              className="size-full object-cover"
            />
          </div>
        )}

        {product.description && <p className="text-sm text-ink-500">{product.description}</p>}

        {product.groups.map((group) => (
          <fieldset key={group.id} className="space-y-2">
            <legend className="mb-2 flex items-baseline justify-between gap-2">
              <span className="text-sm font-semibold text-ink-900">{group.name}</span>
              <span className="text-xs text-ink-500">
                {group.is_required
                  ? "Obligatorio"
                  : group.max_select
                    ? `Hasta ${group.max_select}`
                    : "Opcional"}
              </span>
            </legend>

            {group.selection_type === "single" ? (
              <RadioGroup.Root
                value={selected[group.id]?.[0] ?? ""}
                onValueChange={(value) => toggleSingle(group.id, value)}
                className="space-y-2"
              >
                {group.options.map((option) => (
                  <RadioGroup.Item
                    key={option.id}
                    value={option.id}
                    disabled={!option.is_available}
                    className={cn(
                      "flex w-full min-h-touch items-center justify-between rounded-lg border border-ink-200 px-3 text-left text-sm data-[state=checked]:border-brand data-[state=checked]:bg-brand-soft",
                      !option.is_available && "opacity-40",
                    )}
                  >
                    <span className="text-ink-900">
                      {option.name}
                      {!option.is_available && " (agotado)"}
                    </span>
                    <span className="flex items-center gap-2 text-ink-500">
                      {option.price_delta_cents !== 0 &&
                        `+${formatMoney(option.price_delta_cents, { currency })}`}
                      <span className="flex size-5 items-center justify-center rounded-full border border-ink-300 data-[state=checked]:border-brand data-[state=checked]:bg-brand">
                        <RadioGroup.Indicator>
                          <Check className="size-3 text-brand-fg" aria-hidden />
                        </RadioGroup.Indicator>
                      </span>
                    </span>
                  </RadioGroup.Item>
                ))}
              </RadioGroup.Root>
            ) : (
              <div className="space-y-2">
                {group.options.map((option) => {
                  const checked = (selected[group.id] ?? []).includes(option.id);
                  const atMax =
                    group.max_select !== null && (selected[group.id]?.length ?? 0) >= group.max_select;

                  return (
                    <label
                      key={option.id}
                      className={cn(
                        "flex min-h-touch w-full items-center justify-between rounded-lg border border-ink-200 px-3 text-sm",
                        checked && "border-brand bg-brand-soft",
                        (!option.is_available || (atMax && !checked)) && "opacity-40",
                      )}
                    >
                      <span className="text-ink-900">
                        {option.name}
                        {!option.is_available && " (agotado)"}
                      </span>
                      <span className="flex items-center gap-2 text-ink-500">
                        {option.price_delta_cents !== 0 &&
                          `+${formatMoney(option.price_delta_cents, { currency })}`}
                        <Checkbox.Root
                          checked={checked}
                          disabled={!option.is_available || (atMax && !checked)}
                          onCheckedChange={(value) =>
                            toggleMultiple(group.id, option.id, value === true, group.max_select)
                          }
                          className="flex size-5 items-center justify-center rounded border border-ink-300 data-[state=checked]:border-brand data-[state=checked]:bg-brand"
                        >
                          <Checkbox.Indicator>
                            <Check className="size-3 text-brand-fg" aria-hidden />
                          </Checkbox.Indicator>
                        </Checkbox.Root>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </fieldset>
        ))}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-900" htmlFor="item-notes">
            Aclaración para este plato
          </label>
          <Textarea
            id="item-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej: sin sal, cortada al medio…"
            maxLength={160}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-ink-900">Cantidad</span>
          <QuantityStepper value={quantity} onChange={setQuantity} />
        </div>
      </div>
    </Sheet>
  );
}
