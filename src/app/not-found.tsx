import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { TicketEdge } from "@/components/ui/ticket-edge";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="shadow-ticket w-full max-w-xs rounded-card rounded-b-none border border-ink-200 bg-white p-6">
        <p className="font-mono text-xs font-medium tracking-wide text-ink-400 uppercase">
          Pedido no encontrado
        </p>
        <p className="mt-3 font-display text-3xl font-extrabold text-ink-900">404</p>
        <p className="mt-2 text-sm text-ink-500">
          Esta página no existe, o el link tiene un error de tipeo.
        </p>
      </div>
      <TicketEdge fill="var(--color-ink-50)" className="w-full max-w-xs" />

      <Link href="/" className={cn(buttonVariants({ size: "md" }), "mt-6")}>
        Volver al inicio
      </Link>
    </main>
  );
}
