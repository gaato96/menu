import { z } from "zod";

import { CENTS } from "@/lib/money";

/**
 * Menu import: the pure half.
 *
 * Gemini returns a RawExtractedMenu (prices in pesos, loose shapes). That is
 * normalized into a MenuImportDraft (cents, trimmed, clamped) which travels
 * to the browser for review and comes back on "Cargar". The draft is
 * re-validated on the way back with `menuImportDraftSchema` — it is menu data
 * an owner could type by hand anyway, so the check is about shape and limits,
 * not trust.
 */

/** Uploads per local per calendar month. Platform-paid, so capped. */
export const MENU_IMPORTS_MONTHLY_CAP = 10;
export const MENU_IMPORT_MAX_FILES = 6;
export const MENU_IMPORT_MAX_TOTAL_BYTES = 9 * 1024 * 1024;
export const MENU_IMPORT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
]);

/** OpenAPI-subset schema for Gemini's responseSchema. */
export const MENU_EXTRACTION_SCHEMA = {
  type: "OBJECT",
  properties: {
    categories: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          products: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING" },
                description: { type: "STRING" },
                price: { type: "NUMBER" },
                price_unclear: { type: "BOOLEAN" },
                option_groups: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      name: { type: "STRING" },
                      selection: { type: "STRING", enum: ["single", "multiple"] },
                      required: { type: "BOOLEAN" },
                      options: {
                        type: "ARRAY",
                        items: {
                          type: "OBJECT",
                          properties: {
                            name: { type: "STRING" },
                            price_delta: { type: "NUMBER" },
                          },
                          required: ["name"],
                        },
                      },
                    },
                    required: ["name", "options"],
                  },
                },
              },
              required: ["name", "price"],
            },
          },
        },
        required: ["name", "products"],
      },
    },
  },
  required: ["categories"],
} as const;

export type RawExtractedMenu = {
  categories?: {
    name?: string;
    products?: {
      name?: string;
      description?: string;
      price?: number;
      price_unclear?: boolean;
      option_groups?: {
        name?: string;
        selection?: string;
        required?: boolean;
        options?: { name?: string; price_delta?: number }[];
      }[];
    }[];
  }[];
};

// --- Draft (what the owner reviews) ------------------------------------------

const optionSchema = z.object({
  name: z.string().trim().min(1).max(80),
  priceDeltaCents: z.number().int().min(-10_000_000).max(10_000_000),
});

const optionGroupSchema = z.object({
  name: z.string().trim().min(1).max(80),
  selection: z.enum(["single", "multiple"]),
  required: z.boolean(),
  options: z.array(optionSchema).min(1).max(40),
});

const productSchema = z.object({
  /** Client-side only: whether to load this one. */
  include: z.boolean(),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500),
  priceCents: z.number().int().min(0).max(100_000_000),
  priceUnclear: z.boolean(),
  optionGroups: z.array(optionGroupSchema).max(10),
});

const categorySchema = z.object({
  name: z.string().trim().min(1).max(80),
  products: z.array(productSchema).max(200),
});

export const menuImportDraftSchema = z.object({
  categories: z.array(categorySchema).min(1).max(60),
});

export type MenuImportDraft = z.infer<typeof menuImportDraftSchema>;
export type MenuImportProduct = z.infer<typeof productSchema>;

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

function pesosToCents(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.round(value * CENTS);
}

/**
 * Raw model output -> reviewable draft. Never throws: anything malformed is
 * dropped (a product with no name) or zeroed and flagged (a price that is not
 * a number), so the owner sees what to fix instead of an error.
 */
export function normalizeExtractedMenu(raw: RawExtractedMenu): MenuImportDraft {
  const categories: MenuImportDraft["categories"] = [];

  for (const rawCategory of raw.categories ?? []) {
    const products: MenuImportProduct[] = [];

    for (const rawProduct of rawCategory?.products ?? []) {
      const name = clean(rawProduct?.name, 120);
      if (!name) continue;

      const priceCents = Math.max(0, pesosToCents(rawProduct?.price));
      const optionGroups: MenuImportProduct["optionGroups"] = [];

      for (const rawGroup of rawProduct?.option_groups ?? []) {
        const groupName = clean(rawGroup?.name, 80);
        const options = (rawGroup?.options ?? [])
          .map((option) => ({
            name: clean(option?.name, 80),
            priceDeltaCents: pesosToCents(option?.price_delta),
          }))
          .filter((option) => option.name)
          .slice(0, 40);
        if (!groupName || options.length === 0) continue;

        optionGroups.push({
          name: groupName,
          selection: rawGroup?.selection === "multiple" ? "multiple" : "single",
          required: rawGroup?.required === true,
          options,
        });
        if (optionGroups.length === 10) break;
      }

      products.push({
        include: true,
        name,
        description: clean(rawProduct?.description, 500),
        priceCents,
        priceUnclear: rawProduct?.price_unclear === true || priceCents === 0,
        optionGroups,
      });
      if (products.length === 200) break;
    }

    if (products.length === 0) continue;
    categories.push({ name: clean(rawCategory?.name, 80) || "Carta", products });
    if (categories.length === 60) break;
  }

  return { categories };
}

/** How many products the owner left ticked. */
export function countIncluded(draft: MenuImportDraft): number {
  return draft.categories.reduce(
    (total, category) => total + category.products.filter((product) => product.include).length,
    0,
  );
}
