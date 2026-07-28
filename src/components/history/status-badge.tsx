import { STATUS_LABELS, type OrderStatus } from "@/lib/orders/status";
import { cn } from "@/lib/utils";

const TONE_CLASSES: Record<OrderStatus, string> = {
  pending_payment: "bg-status-pending-soft text-status-pending",
  confirmed: "bg-status-confirmed-soft text-status-confirmed",
  in_kitchen: "bg-status-kitchen-soft text-status-kitchen",
  on_the_way: "bg-status-transit-soft text-status-transit",
  ready_for_pickup: "bg-status-transit-soft text-status-transit",
  completed: "bg-status-done-soft text-status-done",
  cancelled: "bg-status-cancelled-soft text-status-cancelled",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
        TONE_CLASSES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
