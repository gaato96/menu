"use client";

import { useTransition } from "react";

import { Select } from "@/components/ui/field";

type Role = "owner" | "manager" | "cashier";

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
    </Select>
  );
}
