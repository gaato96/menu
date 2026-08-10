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
 * Price per 1K image in USD thousandths. Used to record what a generation
 * cost, so the audit table reflects the model that actually ran.
 */
const COST_USD_MILLIS: Record<string, number> = {
  "gemini-2.5-flash-image": 39,
  "gemini-3.1-flash-lite-image": 34,
  "gemini-3.1-flash-image": 67,
  "gemini-3-pro-image": 134,
};

const DEFAULT_COST_USD_MILLIS = 67;

/**
 * Default is Nano Banana 1 on purpose: it is the image model with a free
 * tier, so a project WITHOUT billing enabled can generate test photos at no
 * cost and simply gets 429 when the daily allowance runs out — never a
 * surprise charge.
 *
 * Careful: the free tier only applies while the project has no billing
 * account. Once billing is on, Google moves the project to the paid tier and
 * every call is charged, whatever model it is. Code cannot opt back out of
 * that — the switch lives in the Cloud console, not here.
 */
const PRIMARY_MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";

/**
 * Only consulted when the primary is rate-limited, and only if set. Unset
 * (the default) means a spent free tier stops the feature instead of
 * silently rolling onto a paid model — "free first, paid only if I say so".
 */
const FALLBACK_MODEL = process.env.GEMINI_IMAGE_MODEL_FALLBACK || null;

/** Vertical, because the catalog renders photos full-bleed on a phone. */
const ASPECT_RATIO = "9:16";
const IMAGE_SIZE = "1K";

/** A phone photo round-trips in ~10-20s; past this something is wrong. */
const TIMEOUT_MS = 90_000;

export interface EnhancedImage {
  bytes: Buffer;
  mimeType: string;
  promptVariant: string;
  /** Which model actually produced this, after any fallback. */
  model: string;
  costUsdMillis: number;
}

export type EnhanceResult =
  | { ok: true; image: EnhancedImage }
  | { ok: false; error: string };

/**
 * Retouches a real photo of a dish. Same dish, better photo.
 *
 * Image-to-image only: the caller's photo is the input, never a text-only
 * generation. Nothing about which dish it is reaches the model — see the
 * header of prompts.ts for why naming it produced a burger from a pasta
 * photo.
 *
 * Tries the free-tier model first and only steps up to a paid one if
 * GEMINI_IMAGE_MODEL_FALLBACK is set — see PRIMARY_MODEL above.
 */
export async function enhanceDishPhoto(params: {
  bytes: Buffer;
  mimeType: string;
}): Promise<EnhanceResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "El generador de fotos no está configurado." };
  }

  const prompt = buildDishEnhancePrompt();
  const inputImage = {
    type: "image",
    mime_type: params.mimeType,
    data: params.bytes.toString("base64"),
  };

  const first = await callModel(apiKey, PRIMARY_MODEL, prompt, inputImage);
  if (first.ok || !first.rateLimited || !FALLBACK_MODEL) {
    return toResult(first);
  }

  // Free allowance is spent for today. Only reached when a paid fallback was
  // configured on purpose.
  console.warn(`[gemini] ${PRIMARY_MODEL} rate-limited, falling back to ${FALLBACK_MODEL}`);
  return toResult(await callModel(apiKey, FALLBACK_MODEL, prompt, inputImage));
}

type CallOutcome =
  | { ok: true; bytes: Buffer; mimeType: string; model: string }
  | { ok: false; error: string; rateLimited: boolean };

function toResult(outcome: CallOutcome): EnhanceResult {
  if (!outcome.ok) return { ok: false, error: outcome.error };
  return {
    ok: true,
    image: {
      bytes: outcome.bytes,
      mimeType: outcome.mimeType,
      promptVariant: PROMPT_VARIANT,
      model: outcome.model,
      costUsdMillis: COST_USD_MILLIS[outcome.model] ?? DEFAULT_COST_USD_MILLIS,
    },
  };
}

async function callModel(
  apiKey: string,
  model: string,
  prompt: string,
  inputImage: { type: string; mime_type: string; data: string },
): Promise<CallOutcome> {
  const body = {
    model,
    // Image FIRST, then the instructions. With the text leading, the model
    // treats the prompt as the brief and the photo as a loose reference;
    // leading with the photo makes it the subject the instructions act on.
    input: [inputImage, { type: "text", text: prompt }],
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
    return { ok: false, rateLimited: false, error: "No pudimos contactar al generador. Probá de nuevo." };
  }

  if (!response.ok) {
    // Body is logged, never surfaced: it can echo the prompt and, on an auth
    // failure, details about the project.
    console.error("[gemini] HTTP", response.status, model, await response.text().catch(() => ""));
    if (response.status === 429) {
      return {
        ok: false,
        rateLimited: true,
        error: "Se agotó el cupo gratuito de hoy. Probá mañana.",
      };
    }
    if (response.status === 400 || response.status === 403) {
      return {
        ok: false,
        rateLimited: false,
        error: "El generador rechazó la imagen. Probá con otra foto.",
      };
    }
    return { ok: false, rateLimited: false, error: "El generador falló. Probá de nuevo en un momento." };
  }

  const image = extractImage(await response.json());
  if (!image) {
    // The model can decline to return an image and answer in text instead —
    // typically when it reads the photo as something it will not depict.
    console.error("[gemini] no image in response", model);
    return {
      ok: false,
      rateLimited: false,
      error: "El generador no devolvió una imagen. Probá con otra foto.",
    };
  }

  return { ok: true, bytes: image.bytes, mimeType: image.mimeType, model };
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
