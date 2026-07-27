import { expect, test } from "@playwright/test";

const PASSWORD = process.env.SEED_PASSWORD ?? "menudigital123";

test.describe("acceso al panel", () => {
  test("manda al login y vuelve a donde quería ir", async ({ page }) => {
    await page.goto("/panel");
    await expect(page).toHaveURL(/\/login\?next=%2Fpanel/);
  });

  test("un dueño entra y ve el panel de su local", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("dueno@burgerhouse.test");
    await page.getByLabel("Contraseña").fill(PASSWORD);
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page).toHaveURL(/\/panel/);

    const header = page.getByRole("banner");
    await expect(header.getByText("Burger House Tucumán", { exact: true })).toBeVisible();
    await expect(header.getByText("Dueño")).toBeVisible();

    // The other business must never surface anywhere in the panel.
    await expect(page.getByText("Pizzería Don José")).toHaveCount(0);
  });

  test("no filtra si el usuario existe cuando la contraseña está mal", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("dueno@burgerhouse.test");
    await page.getByLabel("Contraseña").fill("contrasena-incorrecta");
    await page.getByRole("button", { name: "Entrar" }).click();

    // Scoped to the form: Next renders its own aria-live route announcer with
    // role="alert", which would otherwise match first.
    const error = page.locator("form").getByRole("alert");
    await expect(error).toBeVisible();
    await expect(error).toHaveText("Email o contraseña incorrectos.");

    // Same wording as for an address that was never registered, so the form
    // cannot be used to enumerate real accounts.
    await page.getByLabel("Email").fill("nadie@ejemplo.test");
    await page.getByLabel("Contraseña").fill("otra-cosa");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(error).toHaveText("Email o contraseña incorrectos.");
  });

  test("el superadmin va a /admin, no al panel de un local", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("agencia.gutmark@gmail.com");
    await page.getByLabel("Contraseña").fill(PASSWORD);
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page).toHaveURL(/\/admin/);
    await expect(page.getByRole("cell", { name: "Burger House Tucumán" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Pizzería Don José" })).toBeVisible();
  });

  test("un cajero entra y ve su rol", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("cajero@burgerhouse.test");
    await page.getByLabel("Contraseña").fill(PASSWORD);
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page).toHaveURL(/\/panel/);
    await expect(page.getByText("Cajero")).toBeVisible();
  });
});

test.describe("PWA", () => {
  test("sirve el manifest y el service worker sin pasar por auth", async ({ request }) => {
    const manifest = await request.get("/manifest.webmanifest");
    expect(manifest.status()).toBe(200);

    const parsed = (await manifest.json()) as { start_url: string; icons: unknown[] };
    expect(parsed.start_url).toBe("/panel");
    expect(parsed.icons.length).toBeGreaterThanOrEqual(3);

    // A 307 here would break installation: the browser expects JavaScript.
    const sw = await request.get("/sw.js");
    expect(sw.status()).toBe(200);
    expect(sw.headers()["content-type"]).toContain("javascript");
  });
});
