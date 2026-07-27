"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { Sheet } from "@/components/ui/sheet";
import { formatMoney } from "@/lib/money";
import type { MenuSnapshot, PricedLine } from "@/lib/pricing";
import { priceLine } from "@/lib/pricing";
import type { CartLine } from "@/stores/cart";

export interface CartLineView {
  line: CartLine;
  priced: PricedLine | null;
  errorMessage: string | null;
}

/** Prices every cart line individually so a sold-out item doesn't block the rest. */
export function priceCartLines(lines: CartLine[], snapshot: MenuSnapshot): CartLineView[] {
  return lines.map((line) => {
    const errors: Parameters<typeof priceLine>[2] = [];
    const priced = priceLine(
      { lineId: line.lineId, productId: line.productId, quantity: line.quantity, optionIds: line.optionIds },
      snapshot,
      errors,
    );
    return { line, priced, errorMessage: errors[0]?.message ?? null };
  });
}

export function CartSheet({
  open,
  onOpenChange,
  lines,
  snapshot,
  currency,
  isOpenNow,
  onUpdateQuantity,
  onRemove,
  onCheckout,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lines: CartLine[];
  snapshot: MenuSnapshot;
  currency: string;
  isOpenNow: boolean;
  onUpdateQuantity: (lineId: string, quantity: number) => void;
  onRemove: (lineId: string) => void;
  onCheckout: () => void;
}) {
  const views = useMemo(() => priceCartLines(lines, snapshot), [lines, snapshot]);
  const hasBlockingErrors = views.some((v) => v.errorMessage);
  const subtotalCents = views.reduce((total, v) => total + (v.priced?.lineTotalCents ?? 0), 0);

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Tu pedido"
      footer={
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-500">Subtotal</span>
            <span className="font-mono text-lg font-semibold text-ink-900">
              {formatMoney(subtotalCents, { currency })}
            </span>
          </div>
          <Button
            type="button"
            size="lg"
            block
            disabled={lines.length === 0 || hasBlockingErrors || !isOpenNow}
            onClick={onCheckout}
          >
            {!isOpenNow ? "El local está cerrado" : "Continuar"}
          </Button>
        </div>
      }
    >
      {views.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-500">Todavía no agregaste nada.</p>
      ) : (
        <ul className="space-y-4">
          {views.map(({ line, priced, errorMessage }) => (
            <li key={line.lineId} className="flex gap-3 border-b border-ink-100 pb-4 last:border-0">
              <div className="min-w-0 flex-1">
                {priced ? (
                  <>
                    <p className="font-medium text-ink-900">{priced.productName}</p>
                    {priced.options.length > 0 && (
                      <p className="mt-0.5 text-xs text-ink-500">
                        {priced.options.map((o) => o.optionName).join(" · ")}
                      </p>
                    )}
                    {priced.notes && (
                      <p className="mt-0.5 text-xs italic text-ink-500">“{priced.notes}”</p>
                    )}
                  </>
                ) : (
                  <p className="flex items-center gap-1.5 text-sm text-danger">
                    <AlertTriangle className="size-4 shrink-0" aria-hidden />
                    {errorMessage}
                  </p>
                )}

                <div className="mt-2 flex items-center gap-3">
                  <QuantityStepper
                    value={line.quantity}
                    onChange={(quantity) => onUpdateQuantity(line.lineId, quantity)}
                  />
                  <button
                    type="button"
                    onClick={() => onRemove(line.lineId)}
                    aria-label="Quitar del pedido"
                    className="flex size-touch items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
              </div>

              {priced && (
                <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-ink-900">
                  {formatMoney(priced.lineTotalCents, { currency })}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}
