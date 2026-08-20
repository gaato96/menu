import { BellRing, Bike, MapPin, Plus, ShoppingBag, Utensils } from "lucide-react";
import Image from "next/image";

import { PhoneFrame } from "@/components/marketing/phone-frame";
import { formatMoney } from "@/lib/money";

export interface DemoDish {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  imageUrl: string | null;
}

export interface DemoBusiness {
  name: string;
  address: string | null;
  coverImageUrl: string | null;
  logoUrl: string | null;
  currency: string;
}

/** The public menu as a customer sees it, built from live demo data. */
export function MenuScreen({
  business,
  dishes,
}: {
  business: DemoBusiness;
  dishes: DemoDish[];
}) {
  return (
    <PhoneFrame>
      <div className="flex size-full flex-col">
        {business.coverImageUrl && (
          // Dark base under the photo: the overlaid name is white, and it must
          // stay readable in the frame between layout and image decode.
          <div className="relative aspect-[16/10] shrink-0 bg-night-800">
            <Image
              src={business.coverImageUrl}
              alt=""
              width={400}
              height={250}
              sizes="280px"
              className="size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end gap-2 p-3">
              {business.logoUrl && (
                <Image
                  src={business.logoUrl}
                  alt=""
                  width={40}
                  height={40}
                  sizes="40px"
                  className="size-9 rounded-md border-2 border-white object-cover"
                />
              )}
              <p className="font-display text-lg leading-none font-extrabold text-white">
                {business.name}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 border-b border-ink-100 px-3 py-2 text-[0.6rem]">
          <span className="text-success flex items-center gap-1 font-medium">
            <span className="bg-success size-1.5 rounded-full" />
            Abierto ahora
          </span>
          {business.address && (
            <span className="flex items-center gap-0.5 truncate text-ink-500">
              <MapPin className="size-2.5" />
              {business.address}
            </span>
          )}
        </div>

        <div className="flex gap-1.5 border-b border-ink-100 px-3 py-2">
          <span className="rounded-full bg-brand px-2 py-0.5 text-[0.6rem] font-medium text-brand-fg">
            Hamburguesas
          </span>
          <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[0.6rem] font-medium text-ink-700">
            Papas
          </span>
          <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[0.6rem] font-medium text-ink-700">
            Bebidas
          </span>
        </div>

        <div className="flex-1 space-y-2 overflow-hidden p-3">
          {dishes.slice(0, 4).map((dish) => (
            <div
              key={dish.id}
              className="flex items-center gap-2 rounded-card border border-ink-100 bg-white p-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.7rem] font-medium text-ink-900">{dish.name}</p>
                {dish.description && (
                  <p className="line-clamp-1 text-[0.6rem] text-ink-500">{dish.description}</p>
                )}
                <p className="mt-0.5 text-[0.7rem] font-semibold text-ink-900">
                  {formatMoney(dish.priceCents, { currency: business.currency })}
                </p>
              </div>
              <div className="relative shrink-0">
                <div className="size-12 overflow-hidden rounded-md bg-ink-100">
                  {dish.imageUrl && (
                    <Image
                      src={dish.imageUrl}
                      alt=""
                      width={96}
                      height={96}
                      sizes="48px"
                      className="size-full object-cover"
                    />
                  )}
                </div>
                <span className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full bg-brand text-brand-fg">
                  <Plus className="size-3" />
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="shrink-0 p-3">
          <div className="flex min-h-9 items-center gap-2 rounded-lg bg-brand px-3 text-brand-fg">
            <span className="flex size-5 items-center justify-center rounded-full bg-white/20 text-[0.6rem] font-bold">
              3
            </span>
            <span className="flex flex-1 items-center gap-1 text-[0.7rem] font-semibold">
              <ShoppingBag className="size-3" />
              Ver pedido
            </span>
            <span className="font-mono text-[0.7rem] font-semibold">$ 31.900</span>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

/** The catalog scroll view — one dish, full bleed. */
export function CatalogScreen({
  dish,
  currency,
  categoryName,
}: {
  dish: DemoDish;
  currency: string;
  categoryName: string;
}) {
  return (
    <PhoneFrame>
      <div className="relative flex size-full flex-col justify-end bg-night-900">
        {dish.imageUrl && (
          <Image
            src={dish.imageUrl}
            alt=""
            width={400}
            height={840}
            sizes="280px"
            className="absolute inset-0 size-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/20" />
        <div className="relative space-y-2 p-4 text-white">
          <span className="w-fit rounded-full bg-white/15 px-2 py-0.5 text-[0.6rem] font-medium backdrop-blur-sm">
            {categoryName}
          </span>
          <p className="font-display text-2xl leading-tight font-extrabold">{dish.name}</p>
          {dish.description && (
            <p className="line-clamp-2 text-[0.65rem] text-white/85">{dish.description}</p>
          )}
          <div className="flex items-center justify-between pt-1">
            <span className="text-base font-bold">
              {formatMoney(dish.priceCents, { currency })}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-[0.7rem] font-semibold text-brand-fg">
              <Plus className="size-3" />
              Agregar
            </span>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

/**
 * The same menu, opened from the QR taped to a table.
 *
 * Worth its own frame on the landing: it is the screen that sells the tables
 * module, and it looks nothing like the delivery flow — no address, no phone,
 * a table badge instead, and the button to call the waiter that only exists
 * here.
 */
export function TableScreen({
  business,
  dishes,
  tableLabel = "4",
}: {
  business: DemoBusiness;
  dishes: DemoDish[];
  tableLabel?: string;
}) {
  return (
    <PhoneFrame>
      <div className="flex size-full flex-col bg-ink-50">
        <div className="flex items-center gap-2 border-b border-ink-200 bg-white px-3 py-2.5">
          {business.logoUrl && (
            <Image
              src={business.logoUrl}
              alt=""
              width={40}
              height={40}
              sizes="40px"
              className="size-7 rounded-md object-cover"
            />
          )}
          <p className="min-w-0 flex-1 truncate font-display text-sm font-extrabold text-ink-900">
            {business.name}
          </p>
          <span className="flex items-center gap-1 rounded-full bg-brand-soft px-2 py-1 text-[0.6rem] font-semibold text-brand">
            <Utensils className="size-2.5" />
            Mesa {tableLabel}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-2">
          <span className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-brand py-2 text-[0.65rem] font-semibold text-brand-fg">
            Ver la carta en fotos y videos
          </span>
          <span className="flex items-center gap-1 rounded-full border border-ink-200 bg-white px-2.5 py-2 text-[0.65rem] font-semibold text-ink-900">
            <BellRing className="size-3" />
            Llamar
          </span>
        </div>

        <div className="flex-1 space-y-1.5 overflow-hidden px-3">
          {dishes.slice(0, 4).map((dish) => (
            <div
              key={dish.id}
              className="flex items-center gap-2 rounded-card border border-ink-100 bg-white p-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.7rem] font-medium text-ink-900">{dish.name}</p>
                <p className="mt-0.5 text-[0.65rem] font-semibold text-ink-900">
                  {formatMoney(dish.priceCents, { currency: business.currency })}
                </p>
              </div>
              {dish.imageUrl && (
                <Image
                  src={dish.imageUrl}
                  alt=""
                  width={90}
                  height={120}
                  sizes="45px"
                  className="aspect-3/4 w-9 shrink-0 rounded object-cover"
                />
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-ink-200 bg-white p-2.5">
          <div className="flex items-center justify-between rounded-lg bg-brand px-3 py-2 text-brand-fg">
            <span className="flex items-center gap-1.5 text-[0.65rem] font-semibold">
              <ShoppingBag className="size-3" />
              Enviar a la cocina
            </span>
            <span className="font-mono text-[0.7rem] font-bold">
              {formatMoney(
                dishes.slice(0, 2).reduce((sum, d) => sum + d.priceCents, 0),
                { currency: business.currency },
              )}
            </span>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

/**
 * The staff-side board — the half of the product a customer never sees.
 *
 * Dish names and prices come from the live demo tenant so the mock matches
 * the menu shown next to it. The codes and customer names stay invented on
 * purpose: real comandas are somebody's actual order.
 */
export function BoardScreen({
  dishes = [],
  currency = "ARS",
}: {
  dishes?: DemoDish[];
  currency?: string;
}) {
  const columns = [
    { label: "Nuevos", tone: "bg-status-pending-soft text-status-pending", count: 2, from: 0 },
    { label: "En cocina", tone: "bg-status-kitchen-soft text-status-kitchen", count: 3, from: 2 },
    { label: "En camino", tone: "bg-status-transit-soft text-status-transit", count: 1, from: 5 },
  ];

  const total = dishes.slice(0, 6).reduce((sum, dish) => sum + dish.priceCents, 0);

  return (
    <div className="shadow-ticket overflow-hidden rounded-card border border-ink-200 bg-ink-50">
      <div className="flex items-center justify-between border-b border-ink-200 bg-white px-3 py-2">
        <span className="text-xs font-semibold text-ink-900">Comandas</span>
        <span className="font-mono text-[0.65rem] text-ink-500">
          6 activos{total > 0 ? ` · ${formatMoney(total, { currency })}` : ""}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 p-2">
        {columns.map((column) => (
          <div key={column.label} className="space-y-1.5">
            <div
              className={`flex items-center justify-between rounded px-1.5 py-1 text-[0.6rem] font-semibold ${column.tone}`}
            >
              {column.label}
              <span className="font-mono">{column.count}</span>
            </div>
            {Array.from({ length: column.count }).map((_, index) => (
              <BoardMiniCard
                key={index}
                seed={column.from + index}
                dish={dishes[(column.from + index) % Math.max(1, dishes.length)]}
                currency={currency}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const DEMO_CODES = ["D-0142", "D-0143", "R-0088", "M-0144", "D-0145", "D-0146"];
const DEMO_NAMES = ["Julieta R.", "Marcos P.", "Vale G.", "Mesa 4", "Sofía A.", "Tomás L."];

function BoardMiniCard({
  seed,
  dish,
  currency,
}: {
  seed: number;
  dish?: DemoDish;
  currency: string;
}) {
  const index = seed % 6;
  const isTable = DEMO_NAMES[index].startsWith("Mesa");

  return (
    <div className="rounded border border-ink-200 bg-white p-1.5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[0.6rem] font-semibold text-ink-900">
          {DEMO_CODES[index]}
        </span>
        {isTable ? (
          <Utensils className="size-2.5 text-ink-400" />
        ) : (
          <Bike className="size-2.5 text-ink-400" />
        )}
      </div>
      <p className="truncate text-[0.55rem] text-ink-700">{DEMO_NAMES[index]}</p>
      {dish && <p className="truncate text-[0.5rem] text-ink-500">1× {dish.name}</p>}
      <p className="mt-0.5 font-mono text-[0.55rem] font-semibold text-ink-900">
        {dish ? formatMoney(dish.priceCents, { currency }) : "$ 31.900"}
      </p>
    </div>
  );
}
