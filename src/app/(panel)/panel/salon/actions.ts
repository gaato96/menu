"use server";

import { revalidatePath } from "next/cache";

import { requireModule, requireStaff } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";

export async function createTable(formData: FormData) {
  const staff = await requireStaff();
  requireModule(staff, "tables");
  const supabase = await createClient();

  const label = String(formData.get("label") ?? "").trim();
  const seats = Math.max(1, Math.trunc(Number(formData.get("seats")) || 2));
  const zone = String(formData.get("zone") ?? "").trim() || null;
  if (!label) return;

  const { count } = await supabase
    .from("restaurant_tables")
    .select("id", { count: "exact", head: true })
    .eq("business_id", staff.business.id);

  await supabase.from("restaurant_tables").insert({
    business_id: staff.business.id,
    label,
    seats,
    zone,
    sort_order: count ?? 0,
  });

  revalidatePath("/panel/salon");
}

export async function toggleTableActive(tableId: string, isActive: boolean) {
  const staff = await requireStaff();
  requireModule(staff, "tables");
  const supabase = await createClient();
  await supabase.from("restaurant_tables").update({ is_active: isActive }).eq("id", tableId);
  revalidatePath("/panel/salon");
}

export async function deleteTable(tableId: string) {
  const staff = await requireStaff();
  requireModule(staff, "tables");
  const supabase = await createClient();
  // A table with order history keeps existing — restaurant_tables has no
  // ON DELETE CASCADE from orders, and orders.table_id is a real record of
  // where that order happened. Deactivating (above) is the day-to-day tool;
  // this is only for a table that was created by mistake and never used.
  await supabase.from("restaurant_tables").delete().eq("id", tableId);
  revalidatePath("/panel/salon");
}
