import { describe, expect, it } from "vitest";

import { countIncluded, menuImportDraftSchema, normalizeExtractedMenu } from "@/lib/menu/import";

describe("normalizeExtractedMenu", () => {
  it("converts pesos to cents and keeps order", () => {
    const draft = normalizeExtractedMenu({
      categories: [
        {
          name: " Pizzas ",
          products: [
            {
              name: "Muzzarella",
              description: "Salsa,  muzza   y orégano",
              price: 8000,
              option_groups: [
                {
                  name: "Tamaño",
                  selection: "single",
                  required: true,
                  options: [
                    { name: "Chica", price_delta: 0 },
                    { name: "Grande", price_delta: 4000 },
                  ],
                },
              ],
            },
            { name: "Fugazzeta", price: 9500.5 },
          ],
        },
      ],
    });

    expect(draft.categories).toHaveLength(1);
    expect(draft.categories[0].name).toBe("Pizzas");
    const [muzza, fuga] = draft.categories[0].products;
    expect(muzza.priceCents).toBe(800_000);
    expect(muzza.description).toBe("Salsa, muzza y orégano");
    expect(muzza.optionGroups[0].options[1].priceDeltaCents).toBe(400_000);
    expect(muzza.optionGroups[0].required).toBe(true);
    expect(fuga.priceCents).toBe(950_050);
    expect(menuImportDraftSchema.safeParse(draft).success).toBe(true);
  });

  it("drops nameless products and empty categories, flags missing prices", () => {
    const draft = normalizeExtractedMenu({
      categories: [
        { name: "Vacía", products: [{ name: "  ", price: 100 }] },
        { name: "", products: [{ name: "Agua", price: Number.NaN }] },
      ],
    });

    expect(draft.categories).toHaveLength(1);
    expect(draft.categories[0].name).toBe("Carta");
    expect(draft.categories[0].products[0].priceCents).toBe(0);
    expect(draft.categories[0].products[0].priceUnclear).toBe(true);
  });

  it("drops option groups with no usable options and defaults selection to single", () => {
    const draft = normalizeExtractedMenu({
      categories: [
        {
          name: "Burgers",
          products: [
            {
              name: "Clásica",
              price: 7000,
              option_groups: [
                { name: "Vacío", options: [{ name: "" }] },
                { name: "Punto", selection: "whatever", options: [{ name: "Jugosa" }] },
              ],
            },
          ],
        },
      ],
    });

    const groups = draft.categories[0].products[0].optionGroups;
    expect(groups).toHaveLength(1);
    expect(groups[0].selection).toBe("single");
    expect(groups[0].options[0].priceDeltaCents).toBe(0);
  });

  it("survives a completely empty or malformed payload", () => {
    expect(normalizeExtractedMenu({}).categories).toEqual([]);
    expect(normalizeExtractedMenu({ categories: [{}] }).categories).toEqual([]);
  });
});

describe("countIncluded", () => {
  it("counts only ticked products", () => {
    const draft = normalizeExtractedMenu({
      categories: [{ name: "A", products: [{ name: "x", price: 1 }, { name: "y", price: 2 }] }],
    });
    draft.categories[0].products[1].include = false;
    expect(countIncluded(draft)).toBe(1);
  });
});
