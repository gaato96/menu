/**
 * What each staff role is called, and what it is allowed to do in the UI.
 *
 * The labels lived in four copies (panel layout, usuarios, admin, role
 * select) and drifted the moment a role was added — 'waiter' is the role that
 * made that cost visible, so they were collapsed here.
 *
 * The capability helpers are for hiding controls, NOT for authorisation: RLS
 * and the orders_update_guard trigger decide what actually happens. Their
 * only job is to stop showing a mozo a button whose write the database will
 * silently refuse.
 */

import type { StaffRole } from "@/types/database";

export const ROLE_LABELS: Record<StaffRole, string> = {
  superadmin: "Superadmin",
  owner: "Dueño",
  manager: "Encargado",
  cashier: "Cajero",
  waiter: "Mozo",
};

/** Roles an owner can pick from when inviting or reassigning someone. */
export const ASSIGNABLE_ROLES = ["owner", "manager", "cashier", "waiter"] as const;
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

export function isAssignableRole(value: unknown): value is AssignableRole {
  return typeof value === "string" && (ASSIGNABLE_ROLES as readonly string[]).includes(value);
}

/** Setting the local up — creating tables, arranging the floor plan, editing
 *  the menu. Matches the `in ('owner', 'manager')` RLS policies. */
export function canConfigure(role: StaffRole) {
  return role === "owner" || role === "manager" || role === "superadmin";
}

/** Undoing things: reversing a comanda or cancelling it. Matches the guard
 *  trigger, which rejects both for a cajero and a mozo. */
export function canReverseOrders(role: StaffRole) {
  return role === "owner" || role === "manager" || role === "superadmin";
}
