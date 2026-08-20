import { AlertTriangle, ExternalLink, LogOut } from "lucide-react";
import Link from "next/link";

import { NavTabs } from "@/components/panel/nav-tabs";
import { TableCallsAlert } from "@/components/panel/table-calls-alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { moduleList, requireStaff } from "@/lib/auth/context";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { fetchPendingCalls } from "@/lib/tables/calls";
import { cn } from "@/lib/utils";

import { signOut } from "../../(auth)/login/actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const staff = await requireStaff();
  const { business, subscription } = staff;

  // Only costs a query for businesses that actually have mesas. A local doing
  // delivery only never pays for a feature it cannot use.
  const pendingCalls = staff.modules.has("tables")
    ? await fetchPendingCalls(await createClient(), business.id)
    : [];

  const periodEnd = subscription.current_period_end
    ? new Date(`${subscription.current_period_end}T00:00:00`).toLocaleDateString("es-AR", {
        day: "numeric",
        month: "long",
      })
    : null;

  return (
    <div
      className="flex min-h-full flex-col"
      // Each business themes its own panel. --color-brand itself is
      // redeclared here (not a --brand indirection) so descendants actually
      // pick it up — see the comment on --color-brand in globals.css.
      style={
        {
          "--color-brand": business.brand_color,
          "--color-brand-fg": "#ffffff",
          "--color-brand-soft": `color-mix(in srgb, ${business.brand_color} 14%, white)`,
        } as React.CSSProperties
      }
    >
      <header className="sticky top-0 z-20 border-b border-ink-200 bg-white">
        {/* Tighter on a phone than on the counter tablet: the header is pure
            overhead on a 5" screen, and every row it eats comes out of the
            board underneath it. */}
        <div className="flex items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4 sm:py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm leading-tight font-semibold text-ink-900 sm:text-base">
              {business.name}
            </p>
            <p className="truncate text-xs text-ink-500">
              {staff.fullName ?? "Sin nombre"} · {ROLE_LABELS[staff.role] ?? staff.role}
            </p>
          </div>

          {/* Opening the diner-facing menu is the most common thing an owner
              does from here, so it lives in the header. The label collapses to
              the icon on a phone — the icon alone is unambiguous next to an
              aria-label, and the words were pushing the logout button off. */}
          <Link
            href={`/m/${business.slug}`}
            target="_blank"
            aria-label="Ver menú público"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "shrink-0 px-2 sm:px-3")}
          >
            <span className="hidden sm:inline">Ver menú</span>
            <ExternalLink className="size-4" aria-hidden />
          </Link>

          <form action={signOut}>
            <Button variant="ghost" size="icon" type="submit" aria-label="Cerrar sesión">
              <LogOut className="size-5" aria-hidden />
            </Button>
          </form>
        </div>

        {subscription.status === "past_due" && (
          <div className="flex items-start gap-2 bg-warning-soft px-4 py-2 text-sm text-warning">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>
              Tu suscripción está vencida{periodEnd ? ` desde el ${periodEnd}` : ""}. El
              sistema sigue funcionando normalmente — regularizá el pago para evitar la
              suspensión.
            </p>
          </div>
        )}

        {subscription.status === "suspended" && (
          <div className="flex items-start gap-2 bg-danger-soft px-4 py-2 text-sm text-danger">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>
              Tu suscripción está suspendida y el menú público no está recibiendo pedidos.
              Escribinos para reactivarlo.
            </p>
          </div>
        )}

        <NavTabs role={staff.role} modules={moduleList(staff)} />

        {/* Under the tabs and inside the sticky header: a table waiting on
            somebody is an interrupt, and it must not scroll away. */}
        {staff.modules.has("tables") && (
          <TableCallsAlert businessId={business.id} initialCalls={pendingCalls} />
        )}
      </header>

      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
