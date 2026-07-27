import { MapPin } from "lucide-react";

import { cn } from "@/lib/utils";

export function MenuHeader({
  name,
  address,
  logoUrl,
  isOpenNow,
}: {
  name: string;
  address: string | null;
  logoUrl: string | null;
  isOpenNow: boolean;
}) {
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

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 font-medium",
                isOpenNow ? "text-success" : "text-ink-500",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  isOpenNow ? "bg-success" : "bg-ink-300",
                )}
                aria-hidden
              />
              {isOpenNow ? "Abierto ahora" : "Cerrado ahora"}
            </span>

            {address && (
              <span className="inline-flex items-center gap-1 text-ink-500">
                <MapPin className="size-3.5" aria-hidden />
                {address}
              </span>
            )}
          </div>
        </div>
      </div>

      {!isOpenNow && (
        <p className="mt-4 rounded-lg bg-ink-100 px-3 py-2 text-sm text-ink-700">
          El local está cerrado en este momento. Podés mirar el menú, pero todavía no se
          pueden hacer pedidos.
        </p>
      )}
    </header>
  );
}
