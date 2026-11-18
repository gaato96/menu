import "server-only";

import { MENU_EXTRACTION_SCHEMA, type RawExtractedMenu } from "@/lib/menu/import";

/**
 * Reads a printed menu (photos or a PDF) and returns its structure.
 *
 * Separate from gemini.ts on purpose: that file talks to the image endpoint
 * (Interactions API, image out); this one is plain generateContent with a
 * JSON schema, text out. Same key, same "read the key at call time" rule.
 *
 * Paid by the PLATFORM, not the local: it never touches the local's monthly
 * photo quota. The spend is recorded per call in `menu_imports` so it can be
 * audited, and capped per local per month (see MENU_IMPORTS_MONTHLY_CAP).
 */

// gemini-2.5-flash answers 404 "no longer available to new users" on this
// project (tested 2026-11-18); Google points to 3.8 Flash.
const MODEL = process.env.GEMINI_TEXT_MODEL || "gemini-3.8-flash";

/** USD per million tokens, for the audit row. An ESTIMATE (Flash-tier list
 *  price) — check the real rate in Google AI Studio billing before trusting
 *  the totals. */
const INPUT_USD_PER_M = 0.3;
const OUTPUT_USD_PER_M = 2.5;

/** A ten-page PDF menu takes ~30-60s; past this something is wrong. */
const TIMEOUT_MS = 120_000;

const PROMPT = `Sos un asistente que pasa cartas de restaurantes argentinos a datos.

Te paso fotos o un PDF de la carta de UN local. Devolvé TODAS las categorías y TODOS los productos que aparezcan, en el orden en que aparecen.

Reglas:
- Copiá los nombres y descripciones tal cual están escritos (corregí solo errores obvios de lectura). No inventes descripciones: si un plato no tiene, dejala vacía.
- price: el precio en pesos como número, sin signo ni puntos de miles (ej. "$12.500" -> 12500). Si un producto no tiene precio legible, usá 0 y poné price_unclear en true.
- Si un producto tiene tamaños o variantes con precios distintos (ej. "Pizza muzzarella: chica $8000 / grande $12000"), devolvé UN producto con price igual al precio más bajo y un option_group "Tamaño" de selección única, obligatorio, con price_delta = diferencia contra el más bajo (chica 0, grande 4000).
- Agregados o extras con precio ("+ cheddar $1500") van como option_group de selección múltiple, no obligatorio.
- Si la carta no tiene categorías claras, agrupá en una sola categoría llamada "Carta".
- Ignorá textos que no sean productos (horarios, teléfonos, direcciones, promociones sin precio).`;

export type MenuExtractInput = { bytes: Buffer; mimeType: string };

export type MenuExtractResult =
  | { ok: true; menu: RawExtractedMenu; model: string; costUsdMicros: number }
  | { ok: false; error: string };

export async function extractMenuFromFiles(files: MenuExtractInput[]): Promise<MenuExtractResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { ok: false, error: "Falta configurar la IA en el servidor." };

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          ...files.map((file) => ({
            inline_data: { mime_type: file.mimeType, data: file.bytes.toString("base64") },
          })),
          { text: PROMPT },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: MENU_EXTRACTION_SCHEMA,
      temperature: 0,
    },
  };

  let response: Response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      },
    );
  } catch (cause) {
    console.error("[menu-extract] request failed", cause);
    return { ok: false, error: "No pudimos contactar a la IA. Probá de nuevo." };
  }

  if (!response.ok) {
    // Logged, never surfaced: the body can echo project details.
    console.error("[menu-extract] HTTP", response.status, await response.text().catch(() => ""));
    if (response.status === 429) {
      return { ok: false, error: "La IA está saturada en este momento. Probá en unos minutos." };
    }
    return { ok: false, error: "La IA no pudo leer esos archivos. Probá con fotos más nítidas." };
  }

  const payload = (await response.json().catch(() => null)) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
    usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; thoughtsTokenCount?: number };
  } | null;

  const text = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
  let menu: RawExtractedMenu;
  try {
    menu = JSON.parse(text) as RawExtractedMenu;
  } catch {
    console.error("[menu-extract] non-JSON response");
    return { ok: false, error: "La IA no devolvió una carta legible. Probá de nuevo." };
  }

  const usage = payload?.usageMetadata;
  const inputTokens = usage?.promptTokenCount ?? 0;
  const outputTokens = (usage?.candidatesTokenCount ?? 0) + (usage?.thoughtsTokenCount ?? 0);
  const costUsdMicros = Math.round(inputTokens * INPUT_USD_PER_M + outputTokens * OUTPUT_USD_PER_M);

  return { ok: true, menu, model: MODEL, costUsdMicros };
}
