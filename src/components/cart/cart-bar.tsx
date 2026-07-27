"use client";

import { ShoppingBag } from "lucide-react";

import { formatMoney } from "@/lib/money";

/** Sticky bottom bar, only present once the cart has something in it. */
export function CartBar({
  itemCount,
  totalCents,
  currency,
  onOpen,
}: {
  itemCount: number;
  totalCents: number;
  currency: string;
  onOpen: () => void;
}) {
  if (itemCount === 0) return null;

  return (
    <div
      className="shadow-ticket fixed inset-x-0 bottom-0 z-30 px-4 pb-4"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex min-h-touch-lg w-full items-center gap-3 rounded-lg bg-brand px-4 text-brand-fg"
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-fg/20 text-sm font-bold">
          {itemCount}
        </span>
        <span className="flex flex-1 items-center gap-1.5 text-left font-semibold">
          <ShoppingBag className="size-4" aria-hidden />
          Ver pedido
        </span>
        <span className="font-mono text-base font-semibold tabular-nums">
          {formatMoney(totalCents, { currency })}
        </span>
      </button>
    </div>
  );
}
