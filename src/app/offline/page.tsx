import { WifiOff } from "lucide-react";

export const metadata = { title: "Sin conexión" };

export default function OfflinePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <WifiOff className="size-12 text-ink-300" aria-hidden />
      <h1 className="text-xl font-semibold text-ink-900">Sin conexión</h1>
      <p className="max-w-sm text-sm text-ink-500">
        No pudimos conectarnos. El tablero de comandas necesita internet para mostrarte
        pedidos reales — preferimos avisarte antes que mostrarte una comanda vieja.
      </p>
      <p className="max-w-sm text-sm text-ink-500">
        Revisá el WiFi del local y volvé a intentar.
      </p>
    </main>
  );
}
