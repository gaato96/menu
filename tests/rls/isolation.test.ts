import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, it } from "vitest";

import type { Database } from "@/types/database";

/**
 * Tenant isolation.
 *
 * This is the suite that cannot ever fail. Everything else in the product is a
 * feature; this is the thing that keeps one restaurant from reading another
 * restaurant's customers, phone numbers and sales.
 *
 * It runs against the real project, using the seeded demo businesses.
 *   npm run db:seed && npm run test:rls
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const PASSWORD = process.env.SEED_PASSWORD ?? "menudigital123";

const BURGER_SLUG = "burger-house-tuc";
const PIZZA_SLUG = "pizzeria-don-jose";

type Client = SupabaseClient<Database>;

const admin: Client = createClient<Database>(URL, SERVICE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function signIn(email: string) {
  const client = createClient<Database>(URL, ANON, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await client.auth.signInWithPassword({ email, password: PASSWORD });
  if (error) throw new Error(`No pude loguear ${email}: ${error.message}`);

  const claims = JSON.parse(
    Buffer.from(data.session!.access_token.split(".")[1], "base64").toString(),
  ) as { business_id?: string | null; user_role?: string };

  return { client, claims };
}

function anonClient(): Client {
  return createClient<Database>(URL, ANON, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

let burgerId: string;
let pizzaId: string;
let pizzaProductId: string;

beforeAll(async () => {
  const { data, error } = await admin
    .from("businesses")
    .select("id, slug")
    .in("slug", [BURGER_SLUG, PIZZA_SLUG]);

  if (error) throw error;
  if (data.length !== 2) {
    throw new Error("Faltan los negocios demo. Corré `npm run db:seed` primero.");
  }

  burgerId = data.find((b) => b.slug === BURGER_SLUG)!.id;
  pizzaId = data.find((b) => b.slug === PIZZA_SLUG)!.id;

  const { data: product } = await admin
    .from("products")
    .select("id")
    .eq("business_id", pizzaId)
    .limit(1)
    .single();

  pizzaProductId = product!.id;
}, 30_000);

describe("JWT claims", () => {
  it("stamps business_id and user_role into the token", async () => {
    const { claims } = await signIn("dueno@burgerhouse.test");

    // If this fails, the Custom Access Token Hook is not enabled in the
    // dashboard, and every policy below will deny for the wrong reason.
    expect(claims.user_role).toBe("owner");
    expect(claims.business_id).toBe(burgerId);
  });

  it("gives the superadmin a null business_id", async () => {
    const { claims } = await signIn("agencia.gutmark@gmail.com");
    expect(claims.user_role).toBe("superadmin");
    expect(claims.business_id ?? null).toBeNull();
  });
});

describe("staff cannot reach another business", () => {
  it("reads its own products and none of the neighbour's", async () => {
    const { client } = await signIn("dueno@burgerhouse.test");

    const mine = await client.from("products").select("id, business_id");
    expect(mine.error).toBeNull();
    expect(mine.data!.length).toBeGreaterThan(0);
    expect(mine.data!.every((row) => row.business_id === burgerId)).toBe(true);

    // Explicitly asking for the other tenant returns nothing rather than erroring.
    const theirs = await client.from("products").select("id").eq("business_id", pizzaId);
    expect(theirs.data).toEqual([]);
  });

  it("sees no orders, customers or phone numbers of another business", async () => {
    const { client } = await signIn("dueno@burgerhouse.test");

    for (const table of ["orders", "order_items", "order_status_events"] as const) {
      const result = await client.from(table).select("id").eq("business_id", pizzaId);
      expect(result.data, `${table} leaked`).toEqual([]);
    }
  });

  it("cannot edit a product belonging to another business", async () => {
    const { client } = await signIn("dueno@burgerhouse.test");

    const result = await client
      .from("products")
      .update({ base_price_cents: 1 })
      .eq("id", pizzaProductId)
      .select();

    // RLS makes the row invisible, so the update matches nothing.
    expect(result.data ?? []).toEqual([]);

    const { data: untouched } = await admin
      .from("products")
      .select("base_price_cents")
      .eq("id", pizzaProductId)
      .single();

    expect(untouched!.base_price_cents).toBeGreaterThan(1);
  });

  it("cannot create a product inside another business", async () => {
    const { client } = await signIn("dueno@burgerhouse.test");

    const { data: theirCategory } = await admin
      .from("categories")
      .select("id")
      .eq("business_id", pizzaId)
      .limit(1)
      .single();

    const result = await client.from("products").insert({
      business_id: pizzaId,
      category_id: theirCategory!.id,
      name: "Producto intruso",
      base_price_cents: 100,
    });

    expect(result.error).not.toBeNull();
  });

  it("cannot read another business's subscription", async () => {
    const { client } = await signIn("dueno@burgerhouse.test");

    const result = await client.from("subscriptions").select("*").eq("business_id", pizzaId);
    expect(result.data).toEqual([]);
  });

  it("cannot read staff profiles of another business", async () => {
    const { client } = await signIn("dueno@burgerhouse.test");

    const result = await client.from("profiles").select("id").eq("business_id", pizzaId);
    expect(result.data).toEqual([]);
  });
});

describe("role permissions inside a business", () => {
  it("stops a cashier from editing the menu", async () => {
    const { client } = await signIn("cajero@burgerhouse.test");

    const { data: ownProduct } = await admin
      .from("products")
      .select("id, base_price_cents")
      .eq("business_id", burgerId)
      .limit(1)
      .single();

    const result = await client
      .from("products")
      .update({ base_price_cents: 1 })
      .eq("id", ownProduct!.id)
      .select();

    expect(result.data ?? []).toEqual([]);

    const { data: after } = await admin
      .from("products")
      .select("base_price_cents")
      .eq("id", ownProduct!.id)
      .single();

    expect(after!.base_price_cents).toBe(ownProduct!.base_price_cents);
  });

  it("lets a cashier read the menu and the board", async () => {
    const { client } = await signIn("cajero@burgerhouse.test");

    const products = await client.from("products").select("id");
    expect(products.error).toBeNull();
    expect(products.data!.length).toBeGreaterThan(0);

    const orders = await client.from("orders").select("id");
    expect(orders.error).toBeNull();
  });

  it("stops a cashier from promoting themselves to owner", async () => {
    const { client } = await signIn("cajero@burgerhouse.test");
    const { data: user } = await client.auth.getUser();

    const result = await client
      .from("profiles")
      .update({ role: "owner" })
      .eq("id", user.user!.id)
      .select();

    expect(result.data ?? []).toEqual([]);

    const { data: after } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.user!.id)
      .single();

    expect(after!.role).toBe("cashier");
  });
});

describe("anonymous diners", () => {
  it("can read the public menu of an active business", async () => {
    const client = anonClient();

    const business = await client
      .from("businesses")
      .select("id, name")
      .eq("slug", PIZZA_SLUG)
      .single();

    expect(business.error).toBeNull();
    expect(business.data!.id).toBe(pizzaId);

    const products = await client.from("products").select("id").eq("business_id", pizzaId);
    expect(products.data!.length).toBeGreaterThan(0);
  });

  it("cannot read orders at all", async () => {
    const client = anonClient();
    const result = await client.from("orders").select("id");
    expect(result.data ?? []).toEqual([]);
  });

  it("cannot read staff profiles", async () => {
    const client = anonClient();
    const result = await client.from("profiles").select("id");
    expect(result.data ?? []).toEqual([]);
  });

  it("cannot insert an order directly, bypassing server-side pricing", async () => {
    const client = anonClient();

    const result = await client.from("orders").insert({
      business_id: pizzaId,
      code: "X-9999",
      fulfillment_type: "pickup",
      customer_name: "Intruso",
      customer_phone: "381",
      payment_method: "cash",
      subtotal_cents: 0,
      total_cents: 0,
      idempotency_key: `rls-test-${Date.now()}`,
    });

    expect(result.error).not.toBeNull();
  });

  it("cannot reach the order counter used to mint codes", async () => {
    const client = anonClient();
    const result = await client.from("order_counters").select("*");
    expect(result.data ?? []).toEqual([]);
  });
});

describe("subscription gate", () => {
  it("hides the public menu when the business is suspended, and restores it", async () => {
    const client = anonClient();

    await admin.from("subscriptions").update({ status: "suspended" }).eq("business_id", pizzaId);

    const suspended = await client.from("businesses").select("id").eq("slug", PIZZA_SLUG);
    expect(suspended.data ?? []).toEqual([]);

    const products = await client.from("products").select("id").eq("business_id", pizzaId);
    expect(products.data ?? []).toEqual([]);

    // past_due must keep serving: nobody shuts a shop down on a Friday night
    // because a bank transfer arrived late.
    await admin.from("subscriptions").update({ status: "past_due" }).eq("business_id", pizzaId);

    const pastDue = await client.from("businesses").select("id").eq("slug", PIZZA_SLUG);
    expect(pastDue.data!.length).toBe(1);

    await admin.from("subscriptions").update({ status: "active" }).eq("business_id", pizzaId);
  });

  it("still lets the staff of a suspended business log in and see their panel", async () => {
    await admin.from("subscriptions").update({ status: "suspended" }).eq("business_id", pizzaId);

    const { client } = await signIn("dueno@donjose.test");
    const result = await client.from("businesses").select("id").eq("id", pizzaId);

    expect(result.data!.length).toBe(1);

    await admin.from("subscriptions").update({ status: "active" }).eq("business_id", pizzaId);
  });
});
