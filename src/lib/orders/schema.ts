import { z } from "zod";

/**
 * Shape of POST /api/orders. Shared between the checkout form and the route
 * handler so both reject the same malformed input with the same message —
 * the server re-validates regardless, this only makes the client's errors
 * match what the server would say.
 */
export const orderRequestSchema = z.object({
  businessSlug: z.string().min(1),
  fulfillment: z.enum(["delivery", "pickup"]),
  deliveryZoneId: z.string().uuid().nullable().optional(),
  customerName: z.string().trim().min(2, "Ingresá tu nombre.").max(80),
  customerPhone: z
    .string()
    .trim()
    .min(6, "Ingresá un teléfono de contacto.")
    .max(20)
    .regex(/^[0-9+()\s-]+$/, "Ese teléfono no parece válido."),
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

export type OrderRequest = z.infer<typeof orderRequestSchema>;
