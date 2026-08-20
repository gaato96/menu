"use client";

import Image from "next/image";
import { Plus } from "lucide-react";

import { formatMoney } from "@/lib/money";
import type { DisplayProduct } from "@/lib/menu/types";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  currency,
  onSelect,
}: {
  product: DisplayProduct;
  currency: string;
  onSelect: () => void;
}) {
  const hasOptions = product.groups.length > 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!product.is_available}
      className={cn(
        "flex w-full items-center gap-3 rounded-card border border-ink-100 bg-white p-3 text-left transition-colors",
        product.is_available ? "active:bg-ink-50" : "opacity-60",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="font-medium text-ink-900">{product.name}</p>
        {product.description && (
          <p className="mt-0.5 line-clamp-2 text-sm text-ink-500">{product.description}</p>
        )}
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-sm font-semibold text-ink-900">
            {hasOptions && "desde "}
            {formatMoney(product.base_price_cents, { currency })}
          </span>
          {!product.is_available && (
            <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-500">
              Agotado
            </span>
          )}
        </div>
      </div>

      <div className="relative shrink-0">
        {/* 3:4 rather than square: the source photos are vertical, and a
            square crop cuts the top and bottom off every plate. */}
        <div className="aspect-3/4 w-[4.5rem] overflow-hidden rounded-lg bg-ink-100">
          {product.image_url && (
            <Image
              src={product.image_url}
              alt=""
              width={180}
              height={240}
              className="size-full object-cover"
            />
          )}
        </div>
        {product.is_available && (
          <span className="absolute -bottom-1.5 -right-1.5 flex size-7 items-center justify-center rounded-full bg-brand text-brand-fg shadow-sm">
            <Plus className="size-4" aria-hidden />
          </span>
        )}
      </div>
    </button>
  );
}
