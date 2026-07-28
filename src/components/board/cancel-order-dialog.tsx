"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/field";
import type { BoardOrder } from "@/lib/orders/board-queries";
import { cn } from "@/lib/utils";

const QUICK_REASONS = [
  "El cliente canceló",
  "No hay stock",
  "Error al cargar el pedido",
  "No contesta el cliente",
] as const;

/**
 * A cancelled comanda with no reason is useless three weeks later when
 * someone asks "por qué se canceló tanto ese día". Cheap to capture now,
 * expensive to reconstruct later.
 */
export function CancelOrderDialog({
  order,
  onConfirm,
  onOpenChange,
}: {
  order: BoardOrder | null;
  onConfirm: (reason: string) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState("");

  const reason = selected === "other" ? customReason.trim() : selected;

  return (
    <Sheet
      open={order !== null}
      onOpenChange={(open) => {
        if (!open) {
          setSelected(null);
          setCustomReason("");
        }
        onOpenChange(open);
      }}
      title={`Cancelar ${order?.code ?? ""}`}
      description="Elegí un motivo — queda guardado en el historial del pedido."
      footer={
        <Button
          variant="danger"
          block
          disabled={!reason}
          onClick={() => reason && onConfirm(reason)}
        >
          Cancelar pedido
        </Button>
      }
    >
      <div className="space-y-2">
        {QUICK_REASONS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setSelected(r)}
            className={cn(
              "min-h-touch w-full rounded-lg border px-3 text-left text-sm",
              selected === r
                ? "border-brand bg-brand-soft font-medium text-brand"
                : "border-ink-200 text-ink-700",
            )}
          >
            {r}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setSelected("other")}
          className={cn(
            "min-h-touch w-full rounded-lg border px-3 text-left text-sm",
            selected === "other"
              ? "border-brand bg-brand-soft font-medium text-brand"
              : "border-ink-200 text-ink-700",
          )}
        >
          Otro motivo
        </button>

        {selected === "other" && (
          <Textarea
            autoFocus
            placeholder="Contá qué pasó…"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
          />
        )}
      </div>
    </Sheet>
  );
}
