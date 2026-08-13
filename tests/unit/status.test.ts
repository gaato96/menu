import { describe, expect, it } from "vitest";

import {
  BOARD_COLUMNS,
  checkTransition,
  columnForStatus,
  nextStatus,
  statusForColumn,
} from "@/lib/orders/status";

describe("board columns", () => {
  it("maps both ready states into the single 'ready' column", () => {
    expect(columnForStatus("on_the_way")).toBe("ready");
    expect(columnForStatus("ready_for_pickup")).toBe("ready");
  });

  it("resolves the ready column to the right status per fulfillment type", () => {
    expect(statusForColumn("ready", "delivery")).toBe("on_the_way");
    expect(statusForColumn("ready", "pickup")).toBe("ready_for_pickup");
  });

  it("keeps cancelled off the board", () => {
    expect(columnForStatus("cancelled")).toBeNull();
    expect(BOARD_COLUMNS.flatMap((c) => c.statuses)).not.toContain("cancelled");
  });
});

describe("nextStatus", () => {
  it("routes a delivery order through 'en camino'", () => {
    expect(nextStatus("in_kitchen", "delivery")).toBe("on_the_way");
  });

  it("routes a pickup order through 'listo para retirar'", () => {
    expect(nextStatus("in_kitchen", "pickup")).toBe("ready_for_pickup");
  });

  it("stops at completed", () => {
    expect(nextStatus("completed", "delivery")).toBeNull();
    expect(nextStatus("cancelled", "delivery")).toBeNull();
  });
});

describe("checkTransition", () => {
  it("lets a cashier move an order forward, including skipping steps", () => {
    expect(
      checkTransition({
        from: "pending_payment",
        to: "in_kitchen",
        role: "cashier",
        fulfillment: "delivery",
      }).ok,
    ).toBe(true);
  });

  it("stops a cashier from moving an order backwards", () => {
    const result = checkTransition({
      from: "in_kitchen",
      to: "confirmed",
      role: "cashier",
      fulfillment: "delivery",
    });

    expect(result.ok).toBe(false);
  });

  // A mozo is restricted exactly like a cajero: they take the order and push
  // it forward, and anything that undoes work belongs to whoever is
  // accountable for the shift. Mirrored by on_order_update() in
  // supabase/migrations/20260813000000_waiter_role.sql.
  it("lets a waiter move an order forward but not backwards", () => {
    expect(
      checkTransition({
        from: "confirmed",
        to: "in_kitchen",
        role: "waiter",
        fulfillment: "dine_in",
      }).ok,
    ).toBe(true);

    expect(
      checkTransition({
        from: "in_kitchen",
        to: "confirmed",
        role: "waiter",
        fulfillment: "dine_in",
      }).ok,
    ).toBe(false);
  });

  it("stops a waiter from cancelling", () => {
    expect(
      checkTransition({
        from: "confirmed",
        to: "cancelled",
        role: "waiter",
        fulfillment: "dine_in",
      }).ok,
    ).toBe(false);
  });

  it("stops a cashier from cancelling, but allows a manager", () => {
    expect(
      checkTransition({
        from: "confirmed",
        to: "cancelled",
        role: "cashier",
        fulfillment: "pickup",
      }).ok,
    ).toBe(false);

    expect(
      checkTransition({
        from: "confirmed",
        to: "cancelled",
        role: "manager",
        fulfillment: "pickup",
      }).ok,
    ).toBe(true);
  });

  it("never sends a pickup order to 'en camino'", () => {
    const result = checkTransition({
      from: "in_kitchen",
      to: "on_the_way",
      role: "owner",
      fulfillment: "pickup",
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toContain("retiro");
  });

  it("never sends a delivery order to 'listo para retirar'", () => {
    expect(
      checkTransition({
        from: "in_kitchen",
        to: "ready_for_pickup",
        role: "owner",
        fulfillment: "delivery",
      }).ok,
    ).toBe(false);
  });

  it("refuses to cancel an order that is already completed", () => {
    expect(
      checkTransition({
        from: "completed",
        to: "cancelled",
        role: "owner",
        fulfillment: "delivery",
      }).ok,
    ).toBe(false);
  });

  it("rejects a no-op transition", () => {
    expect(
      checkTransition({
        from: "confirmed",
        to: "confirmed",
        role: "owner",
        fulfillment: "delivery",
      }).ok,
    ).toBe(false);
  });
});
