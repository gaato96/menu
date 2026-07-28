import { Lock } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { requireStaff } from "@/lib/auth/context";
import { MODULE_LABELS } from "@/lib/modules/registry";
import type { ModuleKey } from "@/types/database";

export const metadata = { title: "Módulo no disponible" };

function isModuleKey(value: string | undefined): value is ModuleKey {
  return Boolean(value) && value! in MODULE_LABELS;
}

export default async function NoDisponiblePage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const staff = await requireStaff();
  const { m } = await searchParams;
  const label = isModuleKey(m) ? MODULE_LABELS[m] : "Este módulo";

  const message = encodeURIComponent(
    `Hola, soy de ${staff.business.name}. Quiero activar el módulo "${label}" en mi plan.`,
  );

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-ink-100 text-ink-500">
        <Lock className="size-6" aria-hidden />
      </span>
      <div className="space-y-1">
        <p className="text-lg font-semibold text-ink-900">{label} no está en tu plan</p>
        <p className="mx-auto max-w-sm text-sm text-ink-500">
          Escribinos y lo activamos para tu local.
        </p>
      </div>
      <a
        href={`https://wa.me/543815976357?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonVariants({ variant: "primary", size: "md" })}
      >
        Escribinos por WhatsApp
      </a>
    </div>
  );
}
