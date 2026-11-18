"use server";

import { revalidatePath } from "next/cache";

import { requireStaff } from "@/lib/auth/context";
import { canConfigure } from "@/lib/auth/roles";
import { applyMenuImport } from "@/lib/menu/apply-import";
import { menuImportDraftSchema, type MenuImportDraft } from "@/lib/menu/import";
import { readMenuFromUpload, type ReadMenuResult } from "@/lib/menu/read-import";
import { createClient } from "@/lib/supabase/server";

const NOT_ALLOWED = "Solo el dueño o el encargado pueden cargar la carta.";

/** Step 1: read the carta. Platform-paid, capped per month (read-import.ts). */
export async function readMenuAction(formData: FormData): Promise<ReadMenuResult> {
  const staff = await requireStaff();
  if (!canConfigure(staff.role)) return { ok: false, error: NOT_ALLOWED };
  return readMenuFromUpload(staff.business.id, staff.userId, formData);
}

/** Step 2: load what the owner kept. Session client — RLS authorizes. */
export async function applyMenuAction(
  draft: MenuImportDraft,
): Promise<{ ok: true; products: number; categories: number } | { ok: false; error: string }> {
  const staff = await requireStaff();
  if (!canConfigure(staff.role)) return { ok: false, error: NOT_ALLOWED };

  const parsed = menuImportDraftSchema.safeParse(draft);
  if (!parsed.success) return { ok: false, error: "Revisá los datos: hay algún nombre vacío o un precio inválido." };

  const result = await applyMenuImport(await createClient(), staff.business.id, parsed.data);
  if (result.ok) revalidatePath("/panel/menu");
  return result;
}
