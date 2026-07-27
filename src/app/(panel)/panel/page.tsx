import { LayoutDashboard } from "lucide-react";

import { InstallPrompt } from "@/components/pwa/install-prompt";
import { requireStaff } from "@/lib/auth/context";

export const metadata = { title: "Comandas" };

export default async function BoardPage() {
  const staff = await requireStaff();

  return (
    <main className="flex flex-1 flex-col gap-6 p-4">
      <InstallPrompt
        label="Instalá el tablero en esta tablet"
        storageKey="install-prompt:panel"
      />

      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <LayoutDashboard className="size-10 text-ink-300" aria-hidden />
        <h1 className="text-lg font-semibold text-ink-900">Tablero de comandas</h1>
        <p className="max-w-sm text-sm text-ink-500">
          Acá van a aparecer los pedidos de {staff.business.name} en tiempo real, con
          alerta sonora y aviso en pantalla.
        </p>
        <p className="text-xs text-ink-300">Se construye en la Fase 2.</p>
      </div>
    </main>
  );
}
