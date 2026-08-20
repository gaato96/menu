"use client";

import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CartBar } from "@/components/cart/cart-bar";
import { CartSheet } from "@/components/cart/cart-sheet";
import { CatalogMedia } from "@/components/catalog/catalog-media";
import { CatalogShare } from "@/components/catalog/catalog-share";
import { CheckoutSheet } from "@/components/checkout/checkout-sheet";
import { ProductSheet, type ProductSheetSubmit } from "@/components/menu/product-sheet";
import { TableCallButton } from "@/components/menu/table-call-button";
import { buildMenuSnapshot, type DisplayProduct, type PublicMenuData } from "@/lib/menu/types";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { cartLineCount, useCartStore } from "@/stores/cart";

export function CatalogScroll({ data }: { data: PublicMenuData }) {
  const { business, settings, categories, zones, isOpenNow } = data;

  const snapshot = useMemo(() => buildMenuSnapshot(data), [data]);

  const products = useMemo(
    () =>
      categories.flatMap((category) =>
        category.products.map((product) => ({ product, categoryName: category.name })),
      ),
    [categories],
  );

  const ensureBusiness = useCartStore((s) => s.ensureBusiness);
  const lines = useCartStore((s) => s.lines);
  const fulfillment = useCartStore((s) => s.fulfillment);
  const deliveryZoneId = useCartStore((s) => s.deliveryZoneId);
  const addLine = useCartStore((s) => s.addLine);
  const updateLine = useCartStore((s) => s.updateLine);
  const removeLine = useCartStore((s) => s.removeLine);
  const setFulfillment = useCartStore((s) => s.setFulfillment);
  const setDeliveryZoneId = useCartStore((s) => s.setDeliveryZoneId);
  const tableId = useCartStore((s) => s.tableId);
  const setTableId = useCartStore((s) => s.setTableId);
  const clearCart = useCartStore((s) => s.clear);

  useEffect(() => {
    ensureBusiness(business.slug);
  }, [ensureBusiness, business.slug]);

  // Same lock as the classic menu: a resolved ?mesa= pins the whole visit to
  // dine_in. This view used to hardcode table={null} because it was only
  // reachable from the marketing site — now it can BE the table's QR target.
  useEffect(() => {
    if (data.table) {
      setTableId(data.table.id);
      setFulfillment("dine_in");
    }
  }, [data.table, setTableId, setFulfillment]);

  const [activeProduct, setActiveProduct] = useState<DisplayProduct | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Which slide is on screen. Owned here rather than by each slide because
  // only ONE clip may play at a time — see CatalogMedia.
  const [activeIndex, setActiveIndex] = useState(0);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);

  const registerSlide = useCallback((index: number) => {
    return (node: HTMLElement | null) => {
      slideRefs.current[index] = node;
    };
  }, []);

  useEffect(() => {
    const nodes = slideRefs.current.filter((n): n is HTMLElement => n !== null);
    if (nodes.length === 0) return;

    // 0.6 rather than 1: scroll-snap settles a hair off a perfect viewport
    // match on some Android browsers, and at a threshold of 1 the video would
    // never start. Only one slide can clear 60% of a full-height viewport, so
    // this can't light up two at once.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = nodes.indexOf(entry.target as HTMLElement);
          if (index >= 0) setActiveIndex(index);
        }
      },
      { threshold: 0.6 },
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [products.length]);

  const totalCents = useMemo(() => {
    let total = 0;
    for (const line of lines) {
      const p = snapshot.products.get(line.productId);
      if (!p?.isAvailable) continue;
      const unit =
        p.basePriceCents +
        line.optionIds.reduce((sum, optionId) => {
          for (const group of p.groups) {
            const option = group.options.find((o) => o.id === optionId);
            if (option) return sum + option.priceDeltaCents;
          }
          return sum;
        }, 0);
      total += Math.max(0, unit) * line.quantity;
    }
    return total;
  }, [lines, snapshot]);

  function quickAdd(product: DisplayProduct) {
    if (product.groups.length > 0) {
      setActiveProduct(product);
      return;
    }

    // No options to choose: fuse repeated taps into one line's quantity
    // instead of spawning a new line every time, per Tanda B plan.
    const existing = lines.find((l) => l.productId === product.id && l.optionIds.length === 0);
    if (existing) {
      updateLine(existing.lineId, { quantity: existing.quantity + 1 });
    } else {
      addLine({ productId: product.id, quantity: 1, optionIds: [], notes: "" });
    }
  }

  function handleAddToCart(value: ProductSheetSubmit) {
    addLine({ productId: value.productId, quantity: value.quantity, optionIds: value.optionIds, notes: value.notes });
    setActiveProduct(null);
  }

  return (
    <div
      className="relative"
      style={
        {
          "--color-brand": business.brand_color,
          "--color-brand-fg": "#ffffff",
          "--color-brand-soft": `color-mix(in srgb, ${business.brand_color} 14%, white)`,
        } as React.CSSProperties
      }
    >
      <div className="fixed inset-x-0 top-0 z-20 flex items-center justify-between p-3" style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}>
        <Link
          // ?clasico=1 so the redirect in page.tsx lets this through instead
          // of bouncing straight back here when this is the default view.
          href={
            data.table
              ? `/m/${business.slug}?clasico=1&mesa=${encodeURIComponent(data.table.label)}`
              : `/m/${business.slug}?clasico=1`
          }
          aria-label="Ver menú clásico"
          className="flex size-touch items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
        >
          <ArrowLeft className="size-5" aria-hidden />
        </Link>
        <div className="flex items-center gap-2">
          {data.table && (
            <TableCallButton
              slug={business.slug}
              tableId={data.table.id}
              tableLabel={data.table.label}
              tone="dark"
            />
          )}
          <CatalogShare businessName={business.name} />
        </div>
      </div>

      <div className="h-dvh snap-y snap-mandatory overflow-y-auto scroll-smooth">
        {products.map(({ product, categoryName }, index) => (
          <section
            key={product.id}
            ref={registerSlide(index)}
            className="relative flex h-dvh w-full snap-start snap-always flex-col justify-end"
          >
            <CatalogMedia
              videoUrl={product.video_url}
              imageUrl={product.image_url}
              name={product.name}
              active={index === activeIndex}
              mounted={Math.abs(index - activeIndex) <= 1}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />

            <div
              className="relative flex flex-col gap-3 p-5 text-white"
              style={{ paddingBottom: "max(6.5rem, calc(6.5rem + env(safe-area-inset-bottom)))" }}
            >
              <span className="w-fit rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
                {categoryName}
              </span>
              <h2 className="font-display text-3xl leading-tight font-extrabold tracking-tight drop-shadow-sm">
                {product.name}
              </h2>
              {product.description && (
                <p className="line-clamp-3 text-sm text-white/85">{product.description}</p>
              )}

              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-xl font-bold">
                  {product.groups.length > 0 && "desde "}
                  {formatMoney(product.base_price_cents, { currency: business.currency })}
                </span>
                <button
                  type="button"
                  disabled={!product.is_available}
                  onClick={() => quickAdd(product)}
                  className={cn(
                    "flex min-h-touch items-center gap-1.5 rounded-full bg-brand px-5 font-semibold text-brand-fg shadow-lg",
                    !product.is_available && "opacity-50",
                  )}
                >
                  <Plus className="size-4" aria-hidden />
                  {product.is_available ? "Agregar" : "Agotado"}
                </button>
              </div>
            </div>
          </section>
        ))}
      </div>

      <ProductSheet
        product={activeProduct}
        currency={business.currency}
        onClose={() => setActiveProduct(null)}
        onSubmit={handleAddToCart}
      />

      <CartBar itemCount={cartLineCount(lines)} totalCents={totalCents} currency={business.currency} onOpen={() => setCartOpen(true)} />

      <CartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        lines={lines}
        snapshot={snapshot}
        currency={business.currency}
        isOpenNow={isOpenNow}
        onUpdateQuantity={(lineId, quantity) => updateLine(lineId, { quantity })}
        onRemove={removeLine}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      <CheckoutSheet
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        businessSlug={business.slug}
        currency={business.currency}
        settings={{
          deliveryEnabled: settings.delivery_enabled,
          pickupEnabled: settings.pickup_enabled,
          cashEnabled: settings.cash_enabled,
          transferEnabled: settings.transfer_enabled,
          transferAlias: settings.transfer_alias,
          transferCbu: settings.transfer_cbu,
          transferHolder: settings.transfer_holder,
        }}
        zones={zones.map((z) => ({ id: z.id, name: z.name, feeCents: z.fee_cents, isActive: z.is_active }))}
        snapshot={snapshot}
        lines={lines}
        fulfillment={fulfillment}
        onFulfillmentChange={setFulfillment}
        deliveryZoneId={deliveryZoneId}
        onDeliveryZoneChange={setDeliveryZoneId}
        table={data.table}
        tableId={tableId}
        onOrderCreated={({ orderId }) => {
          clearCart();
          setCheckoutOpen(false);
          window.location.href = `/m/${business.slug}/pedido/${orderId}`;
        }}
      />
    </div>
  );
}
