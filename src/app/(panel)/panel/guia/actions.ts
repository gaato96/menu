"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireStaff } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";

/** Finished or skipped: the tour never opens again on any device for this person. */
export async function completeTour() {
  await requireStaff();
  const supabase = await createClient();
  await supabase.rpc("set_tour_completed", { p_completed: true });
  revalidatePath("/panel", "layout");
}

/** "Ver el recorrido de nuevo" from the guide. */
export async function restartTour() {
  await requireStaff();
  const supabase = await createClient();
  await supabase.rpc("set_tour_completed", { p_completed: false });
  revalidatePath("/panel", "layout");
  redirect("/panel");
}
