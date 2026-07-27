import Link from "next/link";

import { Button } from "@/components/ui/button";
import { requireSuperadmin } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/money";

import { signOut } from "../../(auth)/login/actions";

export const metadata = { title: "Superadmin" };

const SUBSCRIPTION_LABELS: Record<string, { label: string; className: string }> = {
  trial: { label: "Prueba", className: "bg-status-confirmed-soft text-status-confirmed" },
  active: { label: "Activa", className: "bg-status-done-soft text-status-done" },
  past_due: { label: "Vencida", className: "bg-warning-soft text-warning" },
  suspended: { label: "Suspendida", className: "bg-danger-soft text-danger" },
};

export default async function AdminPage() {
  const admin = await requireSuperadmin();
  const supabase = await createClient();

  const { data: businesses } = await supabase
    .from("businesses")
    .select("id, name, slug, status, subscriptions(status, current_period_end, monthly_amount_cents)")
    .order("name");

  const rows = businesses ?? [];
  const monthlyRevenue = rows
    .filter((b) => {
      const sub = Array.isArray(b.subscriptions) ? b.subscriptions[0] : b.subscriptions;
      return sub?.status === "active";
    })
    .reduce((total, b) => {
      const sub = Array.isArray(b.subscriptions) ? b.subscriptions[0] : b.subscriptions;
      return total + (sub?.monthly_amount_cents ?? 0);
    }, 0);

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center gap-3 border-b border-ink-200 bg-white px-4 py-3">
        <div className="flex-1">
          <p className="font-semibold text-ink-900">Superadmin</p>
          <p className="text-xs text-ink-500">{admin.fullName ?? "Galu"}</p>
        </div>
        <form action={signOut}>
          <Button variant="ghost" size="sm" type="submit">
            Salir
          </Button>
        </form>
      </header>

      <main className="flex flex-1 flex-col gap-6 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-card border border-ink-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-ink-500">Negocios</p>
            <p className="mt-1 text-2xl font-semibold text-ink-900">{rows.length}</p>
          </div>
          <div className="rounded-card border border-ink-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-ink-500">
              Ingreso recurrente
            </p>
            <p className="mt-1 text-2xl font-semibold text-ink-900">
              {formatMoney(monthlyRevenue)}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-card border border-ink-200 bg-white">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead className="border-b border-ink-200 text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-3 font-medium">Negocio</th>
                <th className="px-4 py-3 font-medium">Suscripción</th>
                <th className="px-4 py-3 font-medium">Vence</th>
                <th className="px-4 py-3 font-medium">Menú</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((business) => {
                const sub = Array.isArray(business.subscriptions)
                  ? business.subscriptions[0]
                  : business.subscriptions;
                const badge = SUBSCRIPTION_LABELS[sub?.status ?? "trial"];

                return (
                  <tr key={business.id} className="border-b border-ink-100 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink-900">{business.name}</p>
                      <p className="text-xs text-ink-500">/m/{business.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-500">
                      {sub?.current_period_end ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/m/${business.slug}`}
                        target="_blank"
                        className="text-brand underline underline-offset-2"
                      >
                        Abrir
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-ink-300">
          Alta de negocios y edición de suscripciones se construyen en la Fase 5.
        </p>
      </main>
    </div>
  );
}
