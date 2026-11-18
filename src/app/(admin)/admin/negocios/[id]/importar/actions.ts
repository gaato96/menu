"use server";

import { revalidatePath } from "next/cache";

import { requireSuperadmin } from "@/lib/auth/context";
import { applyMenuImport } from "@/lib/menu/apply-import";
import { menuImportDraftSchema, type MenuImportDraft } from "@/lib/menu/import";
import { readMenuFromUpload, type ReadMenuResult } from "@/lib/menu/read-import";
import { createClient } from "@/lib/supabase/server";

/**
 * Superadmin version: loads the carta of ANY local — the way to build a demo
 * with a prospect's real menu before writing to them. No monthly cap: the
 * superadmin is the one paying.
 */
export async function adminReadMenuAction(businessId: string, formData: FormData): Promise<ReadMenuResult> {
  const { userId } = await requireSuperadmin();
  return readMenuFromUpload(businessId, userId, formData, { bypassCap: true });
}

export async function adminApplyMenuAction(
  businessId: string,
  draft: MenuImportDraft,
): Promise<{ ok: true; products: number; categories: number } | { ok: false; error: string }> {
  await requireSuperadmin();
  const parsed = menuImportDraftSchema.safeParse(draft);
  if (!parsed.success) return { ok: false, error: "Revisá los datos: hay algún nombre vacío o un precio inválido." };

  // Session client: the *_staff_write policies let a superadmin write any
  // business's menu, so RLS still has the last word.
  const result = await applyMenuImport(await createClient(), businessId, parsed.data);
  if (result.ok) revalidatePath(`/admin/negocios/${businessId}`);
  return result;
}
