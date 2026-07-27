import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

import { signOut } from "../login/actions";

export const metadata = { title: "Sin acceso" };

export default function NoAccessPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <ShieldAlert className="size-12 text-ink-300" aria-hidden />
      <h1 className="text-xl font-semibold text-ink-900">Tu cuenta no tiene acceso</h1>
      <p className="max-w-sm text-sm text-ink-500">
        Puede que tu usuario esté desactivado o que todavía no esté asignado a un local.
        Hablá con el dueño del negocio o con soporte.
      </p>

      <form action={signOut}>
        <Button variant="outline" type="submit">
          Cerrar sesión
        </Button>
      </form>
    </main>
  );
}
