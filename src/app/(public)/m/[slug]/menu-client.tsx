"use client";

import { Clapperboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { CartBar } from "@/components/cart/cart-bar";
import { CartSheet } from "@/components/cart/cart-sheet";
import { CheckoutSheet } from "@/components/checkout/checkout-sheet";
import { CategoryNav } from "@/components/menu/category-nav";
import { MenuHeader } from "@/components/menu/menu-header";
import { ProductCard } from "@/components/menu/product-card";
import { ProductSheet, type ProductSheetSubmit } from "@/components/menu/product-sheet";
import { TableCallButton } from "@/components/menu/table-call-button";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { buildMenuSnapshot, type DisplayProduct, type PublicMenuData } from "@/lib/menu/types";
import { cartLineCount, useCartStore } from "@/stores/cart";

export function MenuClient({ data }: { data: PublicMenuData }) {
  const router = useRouter();
  const { business, settings, categories, zones, isOpenNow } = data;

  const snapshot = useMemo(() => buildMenuSnapshot(data), [data]);

  const ensureBusiness = useCartStore((s) => s.ensureBusiness);
  const lines = useCartStore((s) => s.lines);
  const fulfillment = useCartStore((s) => s.fulfillment);
  const deliveryZoneId = useCartStore((s) => s.deliveryZoneId);
  const tableId = useCartStore((s) => s.tableId);
  const addLine = useCartStore((s) => s.addLine);
  const updateLine = useCartStore((s) => s.updateLine);
  const removeLine = useCartStore((s) => s.removeLine);
  const setFulfillment = useCartStore((s) => s.setFulfillment);
  const setDeliveryZoneId = useCartStore((s) => s.setDeliveryZoneId);
  const setTableId = useCartStore((s) => s.setTableId);
  const clearCart = useCartStore((s) => s.clear);

  useEffect(() => {
    ensureBusiness(business.slug);
  }, [ensureBusiness, business.slug]);

  // A resolved ?mesa= locks the whole visit to dine_in — there is no UI to
  // switch back to delivery/pickup once a table is scanned, by design.
  useEffect(() => {
    if (data.table) {
      setTableId(data.table.id);
      setFulfillment("dine_in");
    }
  }, [data.table, setTableId, setFulfillment]);

  const [activeProduct, setActiveProduct] = useState<DisplayProduct | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const totalCents = useMemo(() => {
    let total = 0;
    for (const line of lines) {
      const product = snapshot.products.get(line.productId);
      if (!product?.isAvailable) continue;
      const unit =
        product.basePriceCents +
        line.optionIds.reduce((sum, optionId) => {
          for (const group of product.groups) {
            const option = group.options.find((o) => o.id === optionId);
            if (option) return sum + option.priceDeltaCents;
          }
          return sum;
        }, 0);
      total += Math.max(0, unit) * line.quantity;
    }
    return total;
  }, [lines, snapshot]);

  function handleAddToCart(value: ProductSheetSubmit) {
    addLine({ productId: value.productId, quantity: value.quantity, optionIds: value.optionIds, notes: value.notes });
    setActiveProduct(null);
  }

  return (
    <div
      className="flex min-h-full flex-col pb-24"
      style={
        {
          // Redeclared directly (not via a --brand indirection) so every
          // bg-brand/text-brand/border-brand descendant actually picks this
          // up — see the comment on --color-brand in globals.css.
          "--color-brand": business.brand_color,
          "--color-brand-fg": "#ffffff",
          "--color-brand-soft": `color-mix(in srgb, ${business.brand_color} 14%, white)`,
        } as React.CSSProperties
      }
    >
      <MenuHeader
        name={business.name}
        address={business.address}
        logoUrl={business.logo_url}
        coverImageUrl={business.cover_image_url}
        isOpenNow={isOpenNow}
      />

      <div className="space-y-2 px-4 pt-3">
        <InstallPrompt
          label={`Instalá el menú de ${business.name}`}
          storageKey={`install-prompt:menu:${business.slug}`}
        />
        {(settings.catalog_view_enabled || data.table) && (
          <div className="flex items-center gap-2">
            {settings.catalog_view_enabled && (
              <a
                href={
                  data.table
                    ? `/m/${business.slug}/catalogo?mesa=${encodeURIComponent(data.table.label)}`
                    : `/m/${business.slug}/catalogo`
                }
                className="flex min-h-touch min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand px-2 text-sm font-semibold whitespace-nowrap text-brand-fg"
              >
                <Clapperboard className="size-4 shrink-0" aria-hidden />
                {/* Shortened from "Ver la carta en fotos y videos": next to the
                    "Llamar" pill on a narrow phone that wrapped to two lines
                    and grew taller than its neighbor. The icon already says
                    "video" — the copy doesn't have to repeat it. */}
                <span className="truncate">Fotos y video</span>
              </a>
            )}
            {data.table && (
              <TableCallButton
                slug={business.slug}
                tableId={data.table.id}
                tableLabel={data.table.label}
              />
            )}
          </div>
        )}
      </div>

      <CategoryNav categories={categories.map((c) => ({ id: c.id, name: c.name }))} />

      <main className="flex-1 space-y-6 px-4 py-4">
        {categories.map((category) => (
          <section key={category.id} id={`category-${category.id}`} className="scroll-mt-28">
            <h2 className="mb-2.5 font-display text-xl font-bold tracking-tight text-ink-900">
              {category.name}
            </h2>
            <div className="space-y-2.5">
              {category.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currency={business.currency}
                  onSelect={() => setActiveProduct(product)}
                />
              ))}
            </div>
          </section>
        ))}
      </main>

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
          router.push(`/m/${business.slug}/pedido/${orderId}`);
        }}
      />
    </div>
  );
}
