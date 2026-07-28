"use client";

import { useTransition } from "react";

import { Switch } from "@/components/ui/switch";

/**
 * Wires a Switch to a Server Action that takes (checked: boolean). Calling a
 * "use server" function directly from a client component (no <form> needed)
 * is a plain RPC under the hood — Next handles the round trip.
 */
export function AsyncToggle({
  checked,
  action,
  label,
}: {
  checked: boolean;
  action: (checked: boolean) => Promise<void>;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Switch
      checked={checked}
      disabled={pending}
      label={label}
      onCheckedChange={(next) => startTransition(() => action(next))}
    />
  );
}
