"use client";

import { BellRing, Check, HandPlatter, Receipt, X } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { TableCallKind } from "@/types/database";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * The one thing a seated customer wants that the menu could never give them:
 * getting somebody's attention without waving.
 *
 * Only rendered when a table actually resolved from `?mesa=` — there is no
 * such thing as asking for the bill on a delivery order, and showing it there
 * would produce alerts the staff cannot act on.
 *
 * Repeated taps are safe by design: the server keeps one open call per table
 * per kind (partial unique index) and answers "already open" as success, so
 * an impatient customer never floods the floor with alerts.
 */
export function TableCallButton({
  slug,
  tableId,
  tableLabel,
  tone = "light",
}: {
  slug: string;
  tableId: string;
  tableLabel: string;
  /** `dark` for the photo-backed catalog, where a white pill would blow out. */
  tone?: "light" | "dark";
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [sentKind, setSentKind] = useState<TableCallKind | null>(null);

  async function call(kind: TableCallKind) {
    setStatus("sending");
    try {
      const response = await fetch("/api/table-calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, tableId, kind }),
      });
      if (!response.ok) throw new Error("failed");
      setSentKind(kind);
      setStatus("sent");
      // Long enough to read, short enough that asking again is not a fight.
      setTimeout(() => {
        setOpen(false);
        setStatus("idle");
      }, 2500);
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex min-h-touch items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold",
          tone === "dark"
            ? "bg-black/40 text-white backdrop-blur-sm"
            : "border border-ink-200 bg-white text-ink-900",
        )}
      >
        <BellRing className="size-4" aria-hidden />
        Llamar
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/50 sm:items-center"
          onClick={() => status !== "sending" && setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-card bg-white p-4 sm:rounded-card"
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold tracking-tight text-ink-900">
                  Mesa {tableLabel}
                </h2>
                <p className="text-xs text-ink-500">Avisale al salón sin levantar la mano.</p>
              </div>
              <button
                type="button"
                aria-label="Cerrar"
                onClick={() => setOpen(false)}
                className="flex size-touch shrink-0 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            {status === "sent" ? (
              <div className="flex items-center gap-2 rounded-card bg-success-soft p-4 text-sm font-medium text-success">
                <Check className="size-5 shrink-0" aria-hidden />
                {sentKind === "bill"
                  ? "Listo, ya saben que querés la cuenta."
                  : "Listo, ya viene alguien."}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <CallOption
                  icon={<Receipt className="size-5" aria-hidden />}
                  label="Pedir la cuenta"
                  hint="Avisamos que querés cerrar la mesa."
                  disabled={status === "sending"}
                  onClick={() => void call("bill")}
                />
                <CallOption
                  icon={<HandPlatter className="size-5" aria-hidden />}
                  label="Llamar al mozo"
                  hint="Para pedir algo más o lo que necesites."
                  disabled={status === "sending"}
                  onClick={() => void call("waiter")}
                />
                {status === "error" && (
                  <p className="text-xs text-danger" role="alert">
                    No pudimos avisar. Probá de nuevo en un momento.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function CallOption({
  icon,
  label,
  hint,
  disabled,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex min-h-touch-lg items-center gap-3 rounded-card border border-ink-200 px-4 text-left transition-colors active:bg-brand-soft disabled:opacity-50"
    >
      <span className="text-brand">{icon}</span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-ink-900">{label}</span>
        <span className="block text-xs text-ink-500">{hint}</span>
      </span>
    </button>
  );
}
