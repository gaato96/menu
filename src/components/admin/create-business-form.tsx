"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import type { CreateBusinessResult } from "@/app/(admin)/admin/negocios/nuevo/actions";

export function CreateBusinessForm({
  action,
}: {
  action: (formData: FormData) => Promise<CreateBusinessResult>;
}) {
  const [result, setResult] = useState<CreateBusinessResult | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  if (result?.ok) {
    return (
      <div className="rounded-card border border-status-done bg-status-done-soft p-4 text-status-done">
        <p className="font-medium">Negocio creado: /m/{result.slug}</p>
        <p className="mt-1 text-sm">Pasale estos datos al dueño para el primer login:</p>
        <p className="mt-1 font-mono">Contraseña: {result.password}</p>
        <p className="mt-2 text-xs">No se vuelve a mostrar — guardala ahora.</p>
        <div className="mt-3 flex gap-2">
          <Link href="/admin" className="text-sm text-brand underline underline-offset-2">
            Volver al listado
          </Link>
          <Link href={`/m/${result.slug}`} target="_blank" className="text-sm text-brand underline underline-offset-2">
            Ver menú
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(async () => {
          const outcome = await action(formData);
          setResult(outcome);
        });
      }}
      className="space-y-4 rounded-card border border-ink-200 bg-white p-4"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Nombre del negocio" required>
          <Input name="name" required placeholder="Pizzería Don José" />
        </Field>
        <Field label="WhatsApp" required hint="Solo números, con código de país: 5493811234567">
          <Input name="whatsappPhone" required placeholder="5493811234567" />
        </Field>
        <Field label="Dirección">
          <Input name="address" placeholder="Av. Siempre Viva 742" />
        </Field>
        <Field label="Color de marca" hint="Hex, ej: #D1420A">
          <Input name="brandColor" defaultValue="#D1420A" />
        </Field>
      </div>

      <div className="border-t border-ink-100 pt-3">
        <p className="mb-2 text-sm font-medium text-ink-900">Cuenta del dueño</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Nombre" required>
            <Input name="ownerName" required />
          </Field>
          <Field label="Email" required>
            <Input name="ownerEmail" type="email" required />
          </Field>
        </div>
      </div>

      {result?.error && <p className="text-sm text-danger">{result.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Creando…" : "Crear negocio"}
      </Button>
    </form>
  );
}
