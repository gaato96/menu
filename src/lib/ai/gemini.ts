import "server-only";

import { buildDishEnhancePrompt, PROMPT_VARIANT } from "./prompts";

/**
 * Gemini image client.
 *
 * Plain fetch rather than the SDK: one endpoint, one shape, and adding a
 * dependency that ships its own transport for a single POST is not worth the
 * install size. The key is read at call time, never at module load, so a
 * missing key is a handled error on the one page that uses it instead of a
 * build failure everywhere.
 *
 * Written generic on purpose — the purchases module (invoice photo -> line
 * items) is planned against this same file.
 */

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/interactions";

/**
 * Nano Banana 2. The Lite variant is half the price but noticeably worse at
 * holding a plate's composition steady, which is the one thing that must not
 * drift here (see prompts.ts).
 */
const MODEL = "gemini-3.1-flash-image";

/** US$0.067 per 1K image, stored as thousandths of a dollar. */
export const COST_PER_IMAGE_USD_MILLIS = 67;

/** Vertical, because the catalog renders photos full-bleed on a phone. */
const ASPECT_RATIO = "9:16";
const IMAGE_SIZE = "1K";

/** A phone photo round-trips in ~10-20s; past this something is wrong. */
const TIMEOUT_MS = 90_000;

export interface EnhancedImage {
  bytes: Buffer;
  mimeType: string;
  promptVariant: string;
}

export type EnhanceResult =
  | { ok: true; image: EnhancedImage }
  | { ok: false; error: string };

/**
 * Rewrites a real photo of a dish into an appetising one, same dish.
 *
 * Image-to-image only: the caller's photo is the input, never a text-only
 * generation. That is the first of the three safeguards against the model
 * inventing a dish the kitchen does not serve.
 */
export async function enhanceDishPhoto(params: {
  bytes: Buffer;
  mimeType: string;
  dishName: string;
  description?: string | null;
}): Promise<EnhanceResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "El generador de fotos no está configurado." };
  }

  const body = {
    model: MODEL,
    input: [
      { type: "text", text: buildDishEnhancePrompt(params.dishName, params.description) },
      { type: "image", mime_type: params.mimeType, data: params.bytes.toString("base64") },
    ],
    response_format: {
      type: "image",
      mime_type: "image/jpeg",
      aspect_ratio: ASPECT_RATIO,
      image_size: IMAGE_SIZE,
    },
  };

  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (cause) {
    // Timeout and network failure land here. Both are retryable by the user,
    // and neither should cost them a quota slot — the caller only records a
    // generation once bytes come back.
    console.error("[gemini] request failed", cause);
    return { ok: false, error: "No pudimos contactar al generador. Probá de nuevo." };
  }

  if (!response.ok) {
    // Body is logged, never surfaced: it can echo the prompt and, on an auth
    // failure, details about the project.
    console.error("[gemini] HTTP", response.status, await response.text().catch(() => ""));
    if (response.status === 429) {
      return { ok: false, error: "El generador está saturado. Esperá un minuto y probá de nuevo." };
    }
    if (response.status === 400 || response.status === 403) {
      return { ok: false, error: "El generador rechazó la imagen. Probá con otra foto." };
    }
    return { ok: false, error: "El generador falló. Probá de nuevo en un momento." };
  }

  const image = extractImage(await response.json());
  if (!image) {
    // The model can decline to return an image and answer in text instead —
    // typically when it reads the photo as something it will not depict.
    console.error("[gemini] no image in response");
    return { ok: false, error: "El generador no devolvió una imagen. Probá con otra foto." };
  }

  return {
    ok: true,
    image: { bytes: image.bytes, mimeType: image.mimeType, promptVariant: PROMPT_VARIANT },
  };
}

/**
 * Walks every step's content rather than indexing steps[0].content[0]: the
 * model may emit a text step before the image, and a hard index would read
 * that as "no image" on a perfectly good response.
 */
function extractImage(payload: unknown): { bytes: Buffer; mimeType: string } | null {
  if (typeof payload !== "object" || payload === null) return null;
  const steps = (payload as { steps?: unknown }).steps;
  if (!Array.isArray(steps)) return null;

  for (const step of steps) {
    const content = (step as { content?: unknown })?.content;
    if (!Array.isArray(content)) continue;

    for (const part of content) {
      const item = part as { type?: unknown; data?: unknown; mime_type?: unknown };
      if (item?.type !== "image" || typeof item.data !== "string" || !item.data) continue;

      return {
        bytes: Buffer.from(item.data, "base64"),
        mimeType: typeof item.mime_type === "string" ? item.mime_type : "image/jpeg",
      };
    }
  }

  return null;
}
