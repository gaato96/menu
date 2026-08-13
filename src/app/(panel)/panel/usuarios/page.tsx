import { redirect } from "next/navigation";

import { AsyncToggle } from "@/components/panel/async-toggle";
import { InviteStaffForm } from "@/components/panel/invite-staff-form";
import { RoleSelect } from "@/components/panel/role-select";
import { requireStaff } from "@/lib/auth/context";
import { type AssignableRole, ROLE_LABELS } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

import { inviteStaff, toggleStaffActive, updateStaffRole } from "./actions";

export const metadata = { title: "Usuarios" };
export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const staff = await requireStaff();
  // Not just a UI hide: staff below owner reaching this URL directly get sent
  // back, since RLS (profiles_owner_manage) would silently no-op their writes
  // anyway — better an explicit redirect than a page that looks functional
  // but does nothing.
  if (staff.role !== "owner") redirect("/panel");

  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .eq("business_id", staff.business.id)
    .order("created_at");

  return (
    <main className="flex flex-1 flex-col gap-4 p-3 sm:p-4">
      <h1 className="font-display text-lg font-bold tracking-tight text-ink-900 sm:text-xl">Usuarios</h1>

      <InviteStaffForm action={inviteStaff} />

      <div className="rounded-card border border-ink-200 bg-white">
        <ul className="divide-y divide-ink-100">
          {(profiles ?? []).map((profile) => (
            <li key={profile.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-900">
                  {profile.full_name ?? "Sin nombre"}
                </p>
                {profile.id === staff.userId && <p className="text-xs text-ink-400">Vos</p>}
              </div>

              {profile.id === staff.userId ? (
                <span className="text-sm text-ink-500">{ROLE_LABELS[profile.role]}</span>
              ) : (
                <RoleSelect
                  // Safe: the superadmin_has_no_business CHECK constraint
                  // guarantees a row with business_id set is never 'superadmin'.
                  currentRole={profile.role as AssignableRole}
                  action={updateStaffRole.bind(null, profile.id)}
                />
              )}

              {profile.id !== staff.userId && (
                <AsyncToggle
                  checked={profile.is_active}
                  action={toggleStaffActive.bind(null, profile.id)}
                  label="Activo"
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
