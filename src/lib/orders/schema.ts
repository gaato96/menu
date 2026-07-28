import { z } from "zod";

/**
 * Shape of POST /api/orders. Shared between the checkout form and the route
 * handler so both reject the same malformed input with the same message —
 * the server re-validates regardless, this only makes the client's errors
 * match what the server would say.
 */
const orderRequestBase = z.object({
  businessSlug: z.string().min(1),
  fulfillment: z.enum(["delivery", "pickup", "dine_in"]),
  deliveryZoneId: z.string().uuid().nullable().optional(),
  /** Only meaningful (and required) when fulfillment is "dine_in". */
  tableId: z.string().uuid().nullable().optional(),
  customerName: z.string().trim().min(2, "Ingresá tu nombre.").max(80),
  // Nullable, not just optional: a dine_in order genuinely has no phone,
  // rather than one the client forgot to send.
  customerPhone: z
    .string()
    .trim()
    .max(20)
    .regex(/^[0-9+()\s-]+$/, "Ese teléfono no parece válido.")
    .nullable()
    .optional(),
  address: z.string().trim().max(200).nullable().optional(),
  addressReference: z.string().trim().max(160).nullable().optional(),
  paymentMethod: z.enum(["cash", "transfer"]),
  cashChangeForCents: z.number().int().min(0).nullable().optional(),
  notes: z.string().trim().max(300).nullable().optional(),
  idempotencyKey: z.string().min(10).max(100),
  lines: z
    .array(
      z.object({
        lineId: z.string().min(1),
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(99),
        optionIds: z.array(z.string().uuid()),
        notes: z.string().trim().max(160).nullable().optional(),
      }),
    )
    .min(1, "El carrito está vacío."),
});

/**
 * The base schema alone can't express "phone required unless dine_in" or
 * "table required only for dine_in" — those are relationships between two
 * fields, which is exactly what .superRefine is for on a z.object.
 */
export const orderRequestSchema = orderRequestBase.superRefine((data, ctx) => {
  if (data.fulfillment === "dine_in") {
    if (!data.tableId) {
      ctx.addIssue({ code: "custom", path: ["tableId"], message: "Falta la mesa." });
    }
  } else if (!data.customerPhone || data.customerPhone.trim().length < 6) {
    ctx.addIssue({
      code: "custom",
      path: ["customerPhone"],
      message: "Ingresá un teléfono de contacto.",
    });
  }
});

export type OrderRequest = z.infer<typeof orderRequestBase>;
