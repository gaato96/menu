import { CheckCircle2 } from "lucide-react";

import { TicketEdge } from "@/components/ui/ticket-edge";

/**
 * The hero's one signature moment: the exact transformation this product
 * sells, rendered instead of described. Left is what a Friday night looks
 * like today — a WhatsApp thread nobody can read at a glance. Right is the
 * same order as a comanda, the same object the kitchen board already uses
 * (see order-card.tsx) — proof this isn't a mockup of a different product.
 */
export function ChaosToTicket() {
  return (
    <div className="relative mx-auto w-full max-w-sm py-6">
      <div
        aria-hidden
        className="shadow-ticket -rotate-3 rounded-card border border-ink-200 bg-white p-3"
      >
        <p className="mb-2 text-center text-[0.6rem] font-medium tracking-wide text-ink-300 uppercase">
          Hoy, por WhatsApp
        </p>
        <div className="space-y-1.5">
          <ChatBubble from="them">Hola buenas, quería hacer un pedido</ChatBubble>
          <ChatBubble from="them">2 doble cheddar, una sin cebolla</ChatBubble>
          <ChatBubble from="us">dale! con papas o sin?</ChatBubble>
          <ChatBubble from="them">una con papas grandes</ChatBubble>
          <ChatBubble from="them">ah y la dirección es Laprida 800</ChatBubble>
          <ChatBubble from="them">🙏🙏</ChatBubble>
          <ChatBubble from="us">perdon como era la sin cebolla??</ChatBubble>
        </div>
      </div>

      <div
        aria-hidden
        className="shadow-ticket animate-in fade-in slide-in-from-bottom-6 relative z-10 -mt-8 ml-6 rotate-2 rounded-card rounded-b-none border border-ink-200 bg-white p-4 duration-700"
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-base font-semibold text-ink-900">D-0142</span>
          <span className="bg-success-soft text-success flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
            <CheckCircle2 className="size-3" />
            Confirmado
          </span>
        </div>
        <p className="mt-2 text-sm font-medium text-ink-900">Julieta Ríos · Laprida 800</p>
        <ul className="mt-2 space-y-1 text-sm text-ink-700">
          <li>
            <span className="font-mono font-medium">2×</span> Doble Cheddar
            <span className="block pl-4 text-xs text-ink-500">1 sin cebolla</span>
          </li>
          <li>
            <span className="font-mono font-medium">1×</span> Papas grandes
          </li>
        </ul>
        <div className="mt-2 flex items-center justify-between border-t border-ink-100 pt-2">
          <span className="font-mono text-sm font-semibold text-ink-900">$ 31.900</span>
          <span className="text-xs text-ink-500">Efectivo</span>
        </div>
      </div>
      <TicketEdge fill="var(--color-ink-50)" className="relative z-10 ml-6 w-[calc(100%-1.5rem)]" />
    </div>
  );
}

function ChatBubble({ from, children }: { from: "them" | "us"; children: React.ReactNode }) {
  return (
    <div className={`flex ${from === "us" ? "justify-end" : "justify-start"}`}>
      <span
        className={
          from === "us"
            ? "max-w-[80%] rounded-lg bg-[#dcf8c6] px-2 py-1 text-xs text-ink-900"
            : "max-w-[80%] rounded-lg bg-ink-100 px-2 py-1 text-xs text-ink-900"
        }
      >
        {children}
      </span>
    </div>
  );
}
