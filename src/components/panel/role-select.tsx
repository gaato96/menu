"use client";

import { useTransition } from "react";

import { Select } from "@/components/ui/field";
import type { AssignableRole } from "@/lib/auth/roles";

type Role = AssignableRole;

export function RoleSelect({
  currentRole,
  action,
}: {
  currentRole: Role;
  action: (role: Role) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Select
      defaultValue={currentRole}
      disabled={pending}
      className="w-32"
      onChange={(e) => startTransition(() => action(e.target.value as Role))}
    >
      <option value="owner">Dueño</option>
      <option value="manager">Encargado</option>
      <option value="cashier">Cajero</option>
      <option value="waiter">Mozo</option>
    </Select>
  );
}
