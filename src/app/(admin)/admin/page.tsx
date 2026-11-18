import { AlertTriangle } from "lucide-react";
import Link from "next/link";

import { AdminPushToggle } from "@/components/admin/admin-push-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { argentinaDate, evaluateFollowup, type FollowupVerdict } from "@/lib/admin/followup";
import { requireSuperadmin } from "@/lib/auth/context";
import { businessTodayDateStr } from "@/lib/business/date-range";
import { formatMoney } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

import { signOut } from "../../(auth)/login/actions";

export const metadata = { title: "Superadmin" };
export const dynamic = "force-dynamic";

const SUBSCRIPTION_LABELS: Record<string, { label: string; className: string }> = {
  trial: { label: "Prueba", className: "bg-status-confirmed-soft text-status-confirmed" },
  active: { label: "Activa", className: "bg-status-done-soft text-status-done" },
  past_due: { label: "Vencida", className: "bg-warning-soft text-warning" },
  suspended: { label: "Suspendida", className: "bg-danger-soft text-danger" },
};

type SubRow = {
  status: "trial" | "active" | "past_due" | "suspended";
  trial_ends_at: string;
  current_period_end: string | null;
  monthly_amount_cents: number | null;
};

function shortDate(dateStr: string) {
  const [, m, d] = dateStr.split("-");
  return `${Number(d)}/${Number(m)}`;
}

function ago(iso: string | null, today: string): string {
  if (!iso) return "nunca";
  const days = Math.round((Date.parse(`${today}T12:00:00Z`) - Date.parse(`${argentinaDate(iso)}T12:00:00Z`)) / 86_400_000);
  if (days <= 0) return "hoy";
  if (days === 1) return "ayer";
  return `hace ${days} días`;
}

function trialLabel(v: FollowupVerdict, trialEndsAt: string) {
  if (v.trialDaysLeft === null) return "—";
  if (v.trialDaysLeft < 0) return `terminó el ${shortDate(trialEndsAt)}`;
  if (v.trialDaysLeft === 0) return "último día";
  return `${v.trialDaysLeft} día${v.trialDaysLeft === 1 ? "" : "s"} (hasta ${shortDate(trialEndsAt)})`;
}

/** Outside the component: reading the clock is not render logic. */
function orderWindows() {
  const now = Date.now();
  return { since30: new Date(now - 30 * 86_400_000).toISOString(), since7: now - 7 * 86_400_000 };
}

export default async function AdminPage() {
  const admin = await requireSuperadmin();
  const supabase = await createClient();
  const today = businessTodayDateStr("America/Argentina/Buenos_Aires");
  const { since30, since7 } = orderWindows();

  const [{ data: businesses }, { data: recentOrders }, { count: devices }] = await Promise.all([
    supabase
      .from("businesses")
      .select(
        "id, name, slug, status, created_at, last_activity_at, subscriptions(status, trial_ends_at, current_period_end, monthly_amount_cents)",
      )
      .order("created_at", { ascending: false }),
    supabase.from("orders").select("business_id, created_at").gte("created_at", since30).limit(20000),
    supabase.from("admin_push_subscriptions").select("id", { count: "exact", head: true }),
  ]);

  const ordersByBusiness = new Map<string, { last: string | null; last7: number; last30: number }>();
  for (const order of recentOrders ?? []) {
    const entry = ordersByBusiness.get(order.business_id) ?? { last: null, last7: 0, last30: 0 };
    entry.last30 += 1;
    if (Date.parse(order.created_at) >= since7) entry.last7 += 1;
    if (!entry.last || order.created_at > entry.last) entry.last = order.created_at;
    ordersByBusiness.set(order.business_id, entry);
  }

  const rows = (businesses ?? []).map((business) => {
    const sub = (Array.isArray(business.subscriptions) ? business.subscriptions[0] : business.subscriptions) as
      | SubRow
      | undefined;
    const orders = ordersByBusiness.get(business.id) ?? { last: null, last7: 0, last30: 0 };
    const verdict = evaluateFollowup(
      {
        businessName: business.name,
        createdAt: business.created_at,
        lastActivityAt: business.last_activity_at,
        lastOrderAt: orders.last,
        ordersLast7Days: orders.last7,
        subscriptionStatus: sub?.status ?? "trial",
        trialEndsAt: sub?.trial_ends_at ?? today,
      },
      today,
    );
    return { business, sub, orders, verdict };
  });

  const monthlyRevenue = rows
    .filter((r) => r.sub?.status === "active")
    .reduce((total, r) => total + (r.sub?.monthly_amount_cents ?? 0), 0);
  const inTrial = rows.filter((r) => r.sub?.status === "trial").length;
  const followups = rows.filter((r) => r.verdict.needsFollowup && r.business.status === "active");

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center gap-3 border-b border-ink-200 bg-white px-4 py-3">
        <div className="flex-1">
          <p className="font-semibold text-ink-900">Superadmin</p>
          <p className="text-xs text-ink-500">{admin.fullName ?? "Galu"}</p>
        </div>
        <Link href="/admin/negocios/nuevo" className={buttonVariants({ size: "sm" })}>
          + Nuevo negocio
        </Link>
        <form action={signOut}>
          <Button variant="ghost" size="sm" type="submit">
            Salir
          </Button>
        </form>
      </header>

      <main className="flex flex-1 flex-col gap-6 p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-card border border-ink-200 bg-white p-4">
            <p className="text-xs tracking-wide text-ink-500 uppercase">Negocios</p>
            <p className="mt-1 text-2xl font-semibold text-ink-900">{rows.length}</p>
          </div>
          <div className="rounded-card border border-ink-200 bg-white p-4">
            <p className="text-xs tracking-wide text-ink-500 uppercase">En prueba</p>
            <p className="mt-1 text-2xl font-semibold text-ink-900">{inTrial}</p>
          </div>
          <div className="rounded-card border border-ink-200 bg-white p-4">
            <p className="text-xs tracking-wide text-ink-500 uppercase">Ingreso recurrente</p>
            <p className="mt-1 text-2xl font-semibold text-ink-900">{formatMoney(monthlyRevenue)}</p>
          </div>
        </div>

        <section className="rounded-card border border-ink-200 bg-white p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-semibold text-ink-900">Para hacer seguimiento</h2>
            <p className="text-xs text-ink-500">
              Te aviso por notificación el día antes de que termine cada prueba y cuando termina.
            </p>
          </div>
          <div className="mt-2">
            <AdminPushToggle registeredDevices={devices ?? 0} />
          </div>
          {followups.length === 0 ? (
            <p className="mt-3 text-sm text-ink-500">Nada pendiente hoy.</p>
          ) : (
            <ul className="mt-3 divide-y divide-ink-100">
              {followups.map(({ business, verdict }) => (
                <li key={business.id} className="flex items-start gap-2 py-2">
                  <AlertTriangle
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      verdict.stage === "trial_ended" || verdict.stage === "past_due" ? "text-danger" : "text-warning",
                    )}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/negocios/${business.id}`}
                      className="font-medium text-ink-900 underline-offset-2 hover:underline"
                    >
                      {business.name}
                    </Link>
                    <p className="text-sm text-ink-700">{verdict.reasons.join(" ")}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="overflow-x-auto rounded-card border border-ink-200 bg-white">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="border-b border-ink-200 text-xs tracking-wide text-ink-500 uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Negocio</th>
                <th className="px-4 py-3 font-medium">Alta</th>
                <th className="px-4 py-3 font-medium">Suscripción</th>
                <th className="px-4 py-3 font-medium">Prueba</th>
                <th className="px-4 py-3 font-medium">Último uso</th>
                <th className="px-4 py-3 font-medium">Último pedido</th>
                <th className="px-4 py-3 text-right font-medium">Pedidos 7 / 30 días</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ business, sub, orders, verdict }) => {
                const badge = SUBSCRIPTION_LABELS[sub?.status ?? "trial"];
                return (
                  <tr key={business.id} className="border-b border-ink-100 last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/negocios/${business.id}`}
                        className="font-medium text-ink-900 underline-offset-2 hover:underline"
                      >
                        {business.name}
                      </Link>
                      <p className="text-xs text-ink-500">/m/{business.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-700">{shortDate(argentinaDate(business.created_at))}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
                        {badge.label}
                      </span>
                      {business.status === "suspended" && (
                        <span className="ml-1 inline-flex rounded-full bg-danger-soft px-2 py-0.5 text-xs font-medium text-danger">
                          Negocio suspendido
                        </span>
                      )}
                      {sub?.status === "active" && sub.current_period_end && (
                        <p className="mt-0.5 text-xs text-ink-500">vence {shortDate(sub.current_period_end)}</p>
                      )}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3",
                        verdict.stage === "trial_ended" && "font-medium text-danger",
                        verdict.stage === "trial_ending" && "font-medium text-warning",
                        verdict.stage !== "trial_ended" && verdict.stage !== "trial_ending" && "text-ink-700",
                      )}
                    >
                      {trialLabel(verdict, sub?.trial_ends_at ?? today)}
                    </td>
                    <td className={cn("px-4 py-3", verdict.inactiveDays >= 3 ? "text-warning" : "text-ink-700")}>
                      {ago(business.last_activity_at, today)}
                    </td>
                    <td className="px-4 py-3 text-ink-700">{orders.last ? ago(orders.last, today) : "más de 30 días"}</td>
                    <td className="px-4 py-3 text-right font-mono text-ink-900">
                      {orders.last7} / {orders.last30}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
