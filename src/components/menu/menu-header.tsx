import { MapPin } from "lucide-react";

import { cn } from "@/lib/utils";

export function MenuHeader({
  name,
  address,
  logoUrl,
  coverImageUrl,
  isOpenNow,
}: {
  name: string;
  address: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  isOpenNow: boolean;
}) {
  if (!coverImageUrl) {
    return (
      <header className="border-b border-ink-100 bg-white px-5 pb-5 pt-6">
        <div className="flex items-start gap-4">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- tiny per-tenant logo, not worth the Image pipeline's LCP budget
            <img
              src={logoUrl}
              alt=""
              className="size-14 shrink-0 rounded-lg border border-ink-100 object-cover"
            />
          ) : null}

          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl leading-none font-extrabold tracking-tight text-ink-900">
              {name}
            </h1>
            <MenuHeaderStatus isOpenNow={isOpenNow} address={address} className="mt-2" />
          </div>
        </div>

        {!isOpenNow && <ClosedNotice />}
      </header>
    );
  }

  return (
    <header className="border-b border-ink-100 bg-white">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-ink-100 sm:aspect-[21/9]">
        {/* eslint-disable-next-line @next/next/no-img-element -- full-bleed hero, decorative, not the LCP text below it */}
        <img src={coverImageUrl} alt="" className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 px-5 pb-4">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- small overlaid logo
            <img
              src={logoUrl}
              alt=""
              className="size-14 shrink-0 rounded-lg border-2 border-white object-cover shadow-md"
            />
          ) : null}
          <h1 className="font-display text-3xl leading-none font-extrabold tracking-tight text-white drop-shadow-sm">
            {name}
          </h1>
        </div>
      </div>

      <div className="px-5 pb-5 pt-3">
        <MenuHeaderStatus isOpenNow={isOpenNow} address={address} />
        {!isOpenNow && <ClosedNotice />}
      </div>
    </header>
  );
}

function MenuHeaderStatus({
  isOpenNow,
  address,
  className,
}: {
  isOpenNow: boolean;
  address: string | null;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-sm", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 font-medium",
          isOpenNow ? "text-success" : "text-ink-500",
        )}
      >
        <span className={cn("size-1.5 rounded-full", isOpenNow ? "bg-success" : "bg-ink-300")} aria-hidden />
        {isOpenNow ? "Abierto ahora" : "Cerrado ahora"}
      </span>

      {address && (
        <span className="inline-flex items-center gap-1 text-ink-500">
          <MapPin className="size-3.5" aria-hidden />
          {address}
        </span>
      )}
    </div>
  );
}

function ClosedNotice() {
  return (
    <p className="mt-4 rounded-lg bg-ink-100 px-3 py-2 text-sm text-ink-700">
      El local está cerrado en este momento. Podés mirar el menú, pero todavía no se pueden
      hacer pedidos.
    </p>
  );
}
