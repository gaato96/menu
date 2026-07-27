import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { FulfillmentType } from "@/lib/orders/status";

/**
 * Cart state, persisted so a customer who backgrounds the app to check their
 * wallet — or gets bounced back from a WhatsApp redirect that didn't fire —
 * does not lose what they built.
 *
 * Scoped to one business at a time rather than one store per slug: a customer
 * ordering from two restaurants in the same sitting is not a case worth the
 * extra complexity, and switching businesses simply clears the cart.
 */

export interface CartLine {
  lineId: string;
  productId: string;
  quantity: number;
  optionIds: string[];
  notes: string;
}

interface CartState {
  businessSlug: string | null;
  lines: CartLine[];
  fulfillment: FulfillmentType;
  deliveryZoneId: string | null;

  ensureBusiness: (slug: string) => void;
  addLine: (line: Omit<CartLine, "lineId">) => void;
  updateLine: (lineId: string, patch: Partial<Omit<CartLine, "lineId">>) => void;
  removeLine: (lineId: string) => void;
  clear: () => void;
  setFulfillment: (fulfillment: FulfillmentType) => void;
  setDeliveryZoneId: (zoneId: string | null) => void;
}

function newLineId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `line-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      businessSlug: null,
      lines: [],
      fulfillment: "delivery",
      deliveryZoneId: null,

      ensureBusiness: (slug) => {
        if (get().businessSlug === slug) return;
        set({ businessSlug: slug, lines: [], deliveryZoneId: null });
      },

      addLine: (line) => {
        set((state) => ({ lines: [...state.lines, { ...line, lineId: newLineId() }] }));
      },

      updateLine: (lineId, patch) => {
        set((state) => ({
          lines: state.lines.map((line) => (line.lineId === lineId ? { ...line, ...patch } : line)),
        }));
      },

      removeLine: (lineId) => {
        set((state) => ({ lines: state.lines.filter((line) => line.lineId !== lineId) }));
      },

      clear: () => set({ lines: [] }),

      setFulfillment: (fulfillment) => set({ fulfillment }),
      setDeliveryZoneId: (deliveryZoneId) => set({ deliveryZoneId }),
    }),
    {
      name: "menu-digital-cart",
      version: 1,
    },
  ),
);

export function cartLineCount(lines: CartLine[]): number {
  return lines.reduce((total, line) => total + line.quantity, 0);
}
