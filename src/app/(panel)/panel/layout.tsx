import { AlertTriangle, ExternalLink, LogOut } from "lucide-react";
import Link from "next/link";

import { NavTabs } from "@/components/panel/nav-tabs";
import { Button, buttonVariants } from "@/components/ui/button";
import { moduleList, requireStaff } from "@/lib/auth/context";
import { cn } from "@/lib/utils";

import { signOut } from "../../(auth)/login/actions";

const ROLE_LABELS: Record<string, string> = {
  owner: "Dueño",
  manager: "Encargado",
  cashier: "Cajero",
  superadmin: "Superadmin",
};

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const staff = await requireStaff();
  const { business, subscription } = staff;

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
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-ink-900">{business.name}</p>
            <p className="text-xs text-ink-500">
              {staff.fullName ?? "Sin nombre"} · {ROLE_LABELS[staff.role] ?? staff.role}
            </p>
          </div>

          {/* Opening the diner-facing menu is the most common thing an owner
              does from here, so it lives in the header. */}
          <Link
            href={`/m/${business.slug}`}
            target="_blank"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "shrink-0")}
          >
            Ver menú
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
      </header>

      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
