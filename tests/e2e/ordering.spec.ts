import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

/**
 * End-to-end order flow, run against the real Supabase project the app is
 * pointed at (see .env.local) rather than a mock. Manually verified once via
 * the browser before being written up here — this is that same walk,
 * automated: pick a product, fill required and optional groups, checkout
 * through all four steps, land on WhatsApp with the order already persisted.
 */

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

const SLUG = "burger-house-tuc";

/**
 * The seeded schedule only covers Thu-Sun. Rather than skip this suite five
 * days a week, open the business for "today" before the test and remove it
 * after — the same trick used for manual verification.
 */
test.beforeAll(async () => {
  const { data: business } = await admin.from("businesses").select("id").eq("slug", SLUG).single();
  await admin
    .from("business_hours")
    .insert({
      business_id: business!.id,
      day_of_week: new Date().getDay(),
      opens_at: "00:00:00",
      closes_at: "23:59:00",
    });
});

test.afterAll(async () => {
  const { data: business } = await admin.from("businesses").select("id").eq("slug", SLUG).single();
  await admin
    .from("business_hours")
    .delete()
    .eq("business_id", business!.id)
    .eq("day_of_week", new Date().getDay())
    .eq("opens_at", "00:00:00");
});

test("builds a burger with options, checks out, and reaches WhatsApp with the order already saved", async ({
  page,
}) => {
  await page.goto(`/m/${SLUG}`);
  await expect(page.getByText("Abierto ahora")).toBeVisible();

  // --- Product sheet: required + optional groups -------------------------
  await page.getByRole("button", { name: /Clásica/ }).click();

  const sheet = page.getByRole("dialog");
  await expect(sheet.getByText("Punto de cocción")).toBeVisible();

  // The add button stays disabled/unlabeled until the required group is set.
  await expect(sheet.getByRole("button", { name: "Agregar" })).toHaveCount(0);

  await sheet.getByRole("radio", { name: "Jugosa" }).click();
  await sheet.getByLabel(/Cheddar extra/).click();

  const addButton = sheet.getByRole("button", { name: /Agregar —/ });
  await expect(addButton).toHaveText(/10\.700/);
  await addButton.click();

  // --- Cart ----------------------------------------------------------------
  await page.getByRole("button", { name: /Ver pedido/ }).click();
  const cartSheet = page.getByRole("dialog");
  await expect(cartSheet.getByText("Jugosa · Cheddar extra")).toBeVisible();
  await cartSheet.getByRole("button", { name: "Continuar" }).click();

  // --- Checkout step 1: fulfillment + zone ---------------------------------
  const checkout = page.getByRole("dialog");
  await expect(checkout.getByText("Paso 1 de 4")).toBeVisible();
  await checkout.getByRole("radio", { name: "Centro" }).click();
  await checkout.getByRole("button", { name: "Continuar" }).click();

  // --- Step 2: customer data -------------------------------------------------
  await expect(checkout.getByText("Paso 2 de 4")).toBeVisible();
  await checkout.getByLabel("Nombre").fill("Playwright Test");
  await checkout.getByLabel("Teléfono").fill("3811112222");
  await checkout.getByLabel("Dirección").fill("Av. Siempre Viva 742");
  await checkout.getByRole("button", { name: "Continuar" }).click();

  // --- Step 3: payment ---------------------------------------------------
  await expect(checkout.getByText("Paso 3 de 4")).toBeVisible();
  await expect(checkout.getByRole("radio", { name: "Efectivo" })).toHaveAttribute(
    "data-state",
    "checked",
  );
  await checkout.getByRole("button", { name: "Continuar" }).click();

  // --- Step 4: review and confirm -----------------------------------------
  await expect(checkout.getByText("Paso 4 de 4")).toBeVisible();

  const confirmButton = checkout.getByRole("button", { name: /Confirmar pedido/ });
  await expect(confirmButton).toHaveText(/12\.900/); // 10.700 + 2.200 delivery
  await confirmButton.click();

  // The confirmation page redirects to wa.me automatically; landing there
  // with the order code visible is proof the order round-tripped through
  // POST /api/orders before the browser ever left localhost. waitUntil:
  // "commit" — waiting for WhatsApp's own page to fully "load" depends on
  // real external network performance that has nothing to do with this app.
  await page.waitForURL(/wa\.me|api\.whatsapp\.com/, { timeout: 15_000, waitUntil: "commit" });
  const waUrl = page.url();
  expect(waUrl).toContain(encodeURIComponent("PEDIDO"));

  const { data: order } = await admin
    .from("orders")
    .select("id, code, total_cents, whatsapp_opened_at")
    .eq("customer_phone", "3811112222")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  expect(order?.total_cents).toBe(1290000);

  // The "opened" mark is a sendBeacon fired right before this same tick's
  // navigation to wa.me — it lands on the server independently of the page
  // that sent it, so give it a moment rather than reading the row instantly.
  await expect
    .poll(
      async () => {
        const { data } = await admin
          .from("orders")
          .select("whatsapp_opened_at")
          .eq("id", order!.id)
          .single();
        return data?.whatsapp_opened_at ?? null;
      },
      { timeout: 5_000 },
    )
    .not.toBeNull();

  // Clean up: delete the order this test just created.
  await admin.from("orders").delete().eq("id", order!.id);
});
