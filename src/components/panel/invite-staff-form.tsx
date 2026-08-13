"use client";

import { useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import type { InviteResult } from "@/app/(panel)/panel/usuarios/actions";

export function InviteStaffForm({
  action,
}: {
  action: (formData: FormData) => Promise<InviteResult>;
}) {
  const [result, setResult] = useState<InviteResult | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="rounded-card border border-ink-200 bg-white p-4">
      <h2 className="mb-3 font-semibold text-ink-900">Invitar empleado</h2>

      {result?.ok ? (
        <div className="rounded-lg bg-status-done-soft p-3 text-sm text-status-done">
          <p className="font-medium">Cuenta creada. Pasale estos datos:</p>
          <p className="mt-1 font-mono">Contraseña: {result.password}</p>
          <p className="mt-2 text-xs">
            Puede cambiarla después desde su cuenta. Guardala ahora — no se vuelve a mostrar.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => setResult(null)}
          >
            Invitar a otra persona
          </Button>
        </div>
      ) : (
        <form
          ref={formRef}
          action={(formData) => {
            startTransition(async () => {
              const outcome = await action(formData);
              setResult(outcome);
              if (outcome.ok) formRef.current?.reset();
            });
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Nombre" required>
              <Input name="fullName" required />
            </Field>
            <Field label="Email" required>
              <Input name="email" type="email" required />
            </Field>
            <Field label="Rol">
              <Select name="role" defaultValue="cashier">
                <option value="cashier">Cajero</option>
                <option value="waiter">Mozo</option>
                <option value="manager">Encargado</option>
              </Select>
            </Field>
          </div>

          <p className="text-xs text-ink-500">
            <strong className="font-medium text-ink-700">Mozo:</strong> toma pedidos en las mesas
            desde su celular. · <strong className="font-medium text-ink-700">Cajero:</strong> mueve
            comandas y maneja la caja. ·{" "}
            <strong className="font-medium text-ink-700">Encargado:</strong> además edita el menú y
            puede cancelar pedidos.
          </p>

          {result?.error && <p className="text-sm text-danger">{result.error}</p>}

          <Button type="submit" disabled={pending}>
            {pending ? "Creando…" : "Crear cuenta"}
          </Button>
        </form>
      )}
    </div>
  );
}
