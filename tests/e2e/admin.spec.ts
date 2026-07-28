import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

const PASSWORD = process.env.SEED_PASSWORD ?? "menudigital123";

// Cleanup client: business deletion cascades every tenant table, but it does
// NOT touch auth.users (no FK to ride) — same gap deleteProduct/removeProductImages
// closes for Storage. Without this the test would leak one auth user into the
// real project every run, since this suite has no local/disposable Supabase.
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

test.describe("panel de superadmin", () => {
  test("da de alta un negocio, el dueño entra de verdad, y se puede borrar", async ({ page }) => {
    // Touches five distinct routes that may each compile on demand the first
    // time this dev server run hits them (/login, /admin, /admin/negocios/nuevo,
    // /panel, /admin/negocios/[id]) — the default 30s budget is too tight for
    // that on a cold server, independent of anything this test asserts.
    test.setTimeout(90_000);
    const stamp = Date.now();
    const businessName = `Negocio E2E ${stamp}`;
    const ownerEmail = `e2e-owner-${stamp}@example.test`;
    let ownerId: string | undefined;
    let businessId: string | undefined;
    let ownerPassword: string | undefined;

    try {
      await test.step("superadmin crea el negocio", async () => {
        await page.goto("/login");
        await page.getByLabel("Email").fill("agencia.gutmark@gmail.com");
        await page.getByLabel("Contraseña").fill(PASSWORD);
        await page.getByRole("button", { name: "Entrar" }).click();
        await expect(page).toHaveURL(/\/admin/);

        await page.getByRole("link", { name: "+ Nuevo negocio" }).click();
        // Named locators, not getByLabel: "Nombre" and "Email" appear twice on
        // this form (business + owner), and the accessible names collide.
        await page.locator('input[name="name"]').fill(businessName);
        await page.locator('input[name="whatsappPhone"]').fill("5493811234567");
        await page.locator('input[name="ownerName"]').fill("Dueño E2E");
        await page.locator('input[name="ownerEmail"]').fill(ownerEmail);
        await page.getByRole("button", { name: "Crear negocio" }).click();

        await expect(page.getByText(/Negocio creado/)).toBeVisible();
        const passwordText = await page.getByText(/Contraseña: /).textContent();
        ownerPassword = passwordText?.replace("Contraseña: ", "").trim();
        expect(ownerPassword).toBeTruthy();
      });

      await test.step("aparece en el listado y activa un módulo premium", async () => {
        await page.goto("/admin");
        const row = page.getByRole("row", { name: new RegExp(businessName) });
        await expect(row).toBeVisible();

        await row.getByRole("link", { name: "Administrar" }).click();
        await page.waitForURL(/\/admin\/negocios\/[0-9a-f-]{36}$/);
        businessId = new URL(page.url()).pathname.split("/").pop();

        const crmToggle = page.getByRole("switch").nth(1);
        await crmToggle.click();
        await page.reload();
        await expect(page.getByRole("switch").nth(1)).toHaveAttribute("aria-checked", "true");
      });

      await test.step("el dueño se loguea de verdad y ve su propio local", async () => {
        // proxy.ts redirects an already-signed-in visit to /login straight to
        // /admin — has to actually sign out first, not just navigate away.
        // The "Salir" button only lives on /admin, not on the detail page.
        await page.goto("/admin");
        await page.getByRole("button", { name: "Salir" }).click();
        await expect(page).toHaveURL(/\/login/);

        await page.getByLabel("Email").fill(ownerEmail);
        await page.getByLabel("Contraseña").fill(ownerPassword!);
        await page.getByRole("button", { name: "Entrar" }).click();

        // First hit of /panel this dev server run compiles it on demand —
        // slower than the default 5s under Next's dev-mode on-demand
        // compilation, not a real hang.
        await expect(page).toHaveURL(/\/panel/, { timeout: 15_000 });
        await expect(page.getByRole("banner").getByText(businessName)).toBeVisible();
        await expect(page.getByRole("banner").getByText("Dueño")).toBeVisible();

        const { data } = await admin
          .from("profiles")
          .select("id")
          .eq("business_id", businessId!)
          .eq("role", "owner")
          .maybeSingle();
        ownerId = data?.id;
      });

      await test.step("el superadmin lo borra", async () => {
        await page.getByRole("button", { name: "Cerrar sesión" }).click();
        await expect(page).toHaveURL(/\/login/);

        await page.getByLabel("Email").fill("agencia.gutmark@gmail.com");
        await page.getByLabel("Contraseña").fill(PASSWORD);
        await page.getByRole("button", { name: "Entrar" }).click();
        await expect(page).toHaveURL(/\/admin/);

        await page.goto(`/admin/negocios/${businessId}`);
        page.once("dialog", (dialog) => dialog.accept());
        await page.getByRole("button", { name: "Eliminar negocio" }).click();

        await expect(page).toHaveURL(/\/admin$/);
        await expect(page.getByText(businessName)).toHaveCount(0);
      });
    } finally {
      if (ownerId) await admin.auth.admin.deleteUser(ownerId);
      if (businessId) await admin.from("businesses").delete().eq("id", businessId);
    }
  });
});
