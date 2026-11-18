import "server-only";

import { extractMenuFromFiles } from "@/lib/ai/menu-extract";
import { createAdminClient } from "@/lib/supabase/admin";

import {
  MENU_IMPORT_MAX_FILES,
  MENU_IMPORT_MAX_TOTAL_BYTES,
  MENU_IMPORT_TYPES,
  MENU_IMPORTS_MONTHLY_CAP,
  normalizeExtractedMenu,
  type MenuImportDraft,
} from "./import";

export type ReadMenuResult = { ok: true; draft: MenuImportDraft } | { ok: false; error: string };

/**
 * Shared by the panel (owner/manager) and /admin (superadmin). The CALLER has
 * already decided who may do this for which business; this only enforces the
 * platform-side limits, spends, and records the spend.
 *
 * `bypassCap` is for the superadmin, who is the one paying anyway.
 */
export async function readMenuFromUpload(
  businessId: string,
  userId: string,
  formData: FormData,
  { bypassCap = false }: { bypassCap?: boolean } = {},
): Promise<ReadMenuResult> {
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { ok: false, error: "Elegí al menos una foto o un PDF de la carta." };
  if (files.length > MENU_IMPORT_MAX_FILES) {
    return { ok: false, error: `Máximo ${MENU_IMPORT_MAX_FILES} archivos por vez.` };
  }
  const total = files.reduce((sum, f) => sum + f.size, 0);
  if (total > MENU_IMPORT_MAX_TOTAL_BYTES) {
    return { ok: false, error: "Los archivos pesan más de 9MB en total. Mandá menos fotos o más livianas." };
  }
  if (files.some((f) => !MENU_IMPORT_TYPES.has(f.type))) {
    return { ok: false, error: "Solo fotos (JPG, PNG, WebP) o PDF." };
  }

  const admin = createAdminClient();

  if (!bypassCap) {
    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);
    const { count, error } = await admin
      .from("menu_imports")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .gte("created_at", monthStart.toISOString());
    // Fails closed, like the photo quota.
    if (error || (count ?? MENU_IMPORTS_MONTHLY_CAP) >= MENU_IMPORTS_MONTHLY_CAP) {
      return {
        ok: false,
        error: `Ya usaste las ${MENU_IMPORTS_MONTHLY_CAP} lecturas de carta de este mes. Escribinos y te la cargamos nosotros.`,
      };
    }
  }

  const result = await extractMenuFromFiles(
    await Promise.all(
      files.map(async (f) => ({ bytes: Buffer.from(await f.arrayBuffer()), mimeType: f.type })),
    ),
  );
  if (!result.ok) return result;

  const draft = normalizeExtractedMenu(result.menu);
  const productsFound = draft.categories.reduce((n, c) => n + c.products.length, 0);

  await admin.from("menu_imports").insert({
    business_id: businessId,
    created_by: userId,
    file_count: files.length,
    model: result.model,
    cost_usd_micros: result.costUsdMicros,
    products_found: productsFound,
  });

  if (productsFound === 0) {
    return { ok: false, error: "No encontramos productos con precio en esos archivos. Probá con fotos más nítidas." };
  }
  return { ok: true, draft };
}
