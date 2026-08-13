/**
 * Order state machine.
 *
 * The one non-obvious decision: `on_the_way` and `ready_for_pickup` are two
 * distinct database values but a single column on the board. A Kanban column
 * cannot rename itself per card, yet a delivery and a takeaway order are
 * genuinely different things once the food is ready. Keeping them apart in the
 * data is what later lets us measure delivery times and feed the kitchen
 * display without a migration.
 */

export const ORDER_STATUSES = [
  "pending_payment",
  "confirmed",
  "in_kitchen",
  "on_the_way",
  "ready_for_pickup",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const FULFILLMENT_TYPES = ["delivery", "pickup", "dine_in"] as const;
export type FulfillmentType = (typeof FULFILLMENT_TYPES)[number];

export const STAFF_ROLES = ["superadmin", "owner", "manager", "cashier", "waiter"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

/** Progress rank. The two "ready" states deliberately share rank 3. */
const RANK: Record<OrderStatus, number> = {
  pending_payment: 0,
  confirmed: 1,
  in_kitchen: 2,
  on_the_way: 3,
  ready_for_pickup: 3,
  completed: 4,
  cancelled: -1,
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Pendiente de pago",
  confirmed: "Confirmado",
  in_kitchen: "En cocina",
  on_the_way: "En camino",
  ready_for_pickup: "Listo para retirar",
  completed: "Completado",
  cancelled: "Cancelado",
};

/**
 * `ready_for_pickup` means "ready to hand over" for both pickup AND dine_in —
 * a table's food is also handed over, just by a server instead of the
 * customer walking to the counter. STATUS_LABELS alone can't express that
 * (it has no fulfillment context), so this wraps it for anywhere a label is
 * shown next to an actual order.
 */
export function statusLabel(status: OrderStatus, fulfillment: FulfillmentType): string {
  if (status === "ready_for_pickup" && fulfillment === "dine_in") return "Listo para servir";
  return STATUS_LABELS[status];
}

export type BoardColumnId =
  | "pending_payment"
  | "confirmed"
  | "in_kitchen"
  | "ready"
  | "completed";

export interface BoardColumn {
  id: BoardColumnId;
  label: string;
  /** Statuses that land in this column. */
  statuses: OrderStatus[];
  /** Design token prefix, see globals.css */
  tone: "pending" | "confirmed" | "kitchen" | "transit" | "done";
}

export const BOARD_COLUMNS: BoardColumn[] = [
  {
    id: "pending_payment",
    label: "Pendiente de pago",
    statuses: ["pending_payment"],
    tone: "pending",
  },
  { id: "confirmed", label: "Confirmado", statuses: ["confirmed"], tone: "confirmed" },
  { id: "in_kitchen", label: "En cocina", statuses: ["in_kitchen"], tone: "kitchen" },
  {
    id: "ready",
    label: "En camino / Listo",
    statuses: ["on_the_way", "ready_for_pickup"],
    tone: "transit",
  },
  { id: "completed", label: "Completado", statuses: ["completed"], tone: "done" },
];

export function columnForStatus(status: OrderStatus): BoardColumnId | null {
  const column = BOARD_COLUMNS.find((c) => c.statuses.includes(status));
  return column?.id ?? null;
}

/**
 * Which concrete status a card takes when dropped into a column. Only the
 * "ready" column is ambiguous, and the order's own fulfillment type resolves it.
 */
export function statusForColumn(
  columnId: BoardColumnId,
  fulfillment: FulfillmentType,
): OrderStatus {
  if (columnId === "ready") {
    return fulfillment === "delivery" ? "on_the_way" : "ready_for_pickup";
  }
  return columnId;
}

/** The status the quick-advance button moves to. `null` means end of the line. */
export function nextStatus(
  status: OrderStatus,
  fulfillment: FulfillmentType,
): OrderStatus | null {
  switch (status) {
    case "pending_payment":
      return "confirmed";
    case "confirmed":
      return "in_kitchen";
    case "in_kitchen":
      return fulfillment === "delivery" ? "on_the_way" : "ready_for_pickup";
    case "on_the_way":
    case "ready_for_pickup":
      return "completed";
    default:
      return null;
  }
}

export function isTerminal(status: OrderStatus) {
  return status === "completed" || status === "cancelled";
}

/** Statuses the board shows by default — everything still in play. */
export const ACTIVE_STATUSES = ORDER_STATUSES.filter((s) => !isTerminal(s));

const ROLES_THAT_CAN_REVERSE: StaffRole[] = ["superadmin", "owner", "manager"];

export interface TransitionCheck {
  from: OrderStatus;
  to: OrderStatus;
  role: StaffRole;
  fulfillment: FulfillmentType;
}

export type TransitionResult = { ok: true } | { ok: false; reason: string };

/**
 * Server-side authority on status changes. The board updates optimistically,
 * so this is what actually decides — the UI is only a suggestion.
 */
export function checkTransition({
  from,
  to,
  role,
  fulfillment,
}: TransitionCheck): TransitionResult {
  if (from === to) {
    return { ok: false, reason: "El pedido ya está en ese estado." };
  }

  // A ready state must match how the order is being delivered, or a takeaway
  // order ends up sitting in "en camino" forever with no driver.
  if (to === "on_the_way" && fulfillment !== "delivery") {
    return { ok: false, reason: "Un pedido de retiro no puede pasar a En camino." };
  }
  // ready_for_pickup now covers both pickup ("listo para retirar") and
  // dine_in ("listo para servir") — only delivery is barred from it.
  if (to === "ready_for_pickup" && fulfillment === "delivery") {
    return { ok: false, reason: "Un pedido de delivery no puede pasar a Listo para retirar." };
  }

  if (to === "cancelled") {
    if (from === "completed") {
      return { ok: false, reason: "Un pedido completado no se puede cancelar." };
    }
    return ROLES_THAT_CAN_REVERSE.includes(role)
      ? { ok: true }
      : { ok: false, reason: "Solo el encargado o el dueño pueden cancelar un pedido." };
  }

  // Reopening a cancelled order is a correction, not routine operation.
  if (from === "cancelled") {
    return ROLES_THAT_CAN_REVERSE.includes(role)
      ? { ok: true }
      : { ok: false, reason: "Solo el encargado o el dueño pueden reabrir un pedido cancelado." };
  }

  // Forward is free: skipping steps at 9pm on a Friday is a feature, not a bug.
  if (RANK[to] > RANK[from]) return { ok: true };

  return ROLES_THAT_CAN_REVERSE.includes(role)
    ? { ok: true }
    : { ok: false, reason: "Solo el encargado o el dueño pueden retroceder un pedido." };
}
