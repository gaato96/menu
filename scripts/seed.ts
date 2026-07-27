/**
 * Demo seed: two real-looking Tucumán businesses with full menus and staff.
 *
 * Written as a script rather than supabase/seed.sql because `supabase db push`
 * does not run seed files against a hosted project, and this has to work the
 * same way locally and in the cloud.
 *
 * Two businesses is not decoration: the RLS suite needs a second tenant to
 * prove isolation against.
 *
 *   npm run db:seed
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

import type { Database } from "../src/types/database";

config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PASSWORD = process.env.SEED_PASSWORD ?? "menudigital123";

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

// This script creates a superadmin and wipes any business sharing a demo slug.
// Running it against real customer data would be destructive, so a remote
// target has to be confirmed on purpose.
const isLocal = /localhost|127\.0\.0\.1/.test(SUPABASE_URL);
if (!isLocal && process.env.SEED_CONFIRM_REMOTE !== "yes") {
  console.error(
    [
      `El target no es local: ${SUPABASE_URL}`,
      "",
      "Este script BORRA los negocios demo y crea un superadmin.",
      "Si es lo que querés, volvé a correrlo con:",
      "",
      "  $env:SEED_CONFIRM_REMOTE='yes'; npm run db:seed",
    ].join("\n"),
  );
  process.exit(1);
}

const db = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/**
 * Throws on the first database error instead of silently seeding half a menu.
 *
 * Returns NonNullable<T> rather than taking `T | null`: inference would happily
 * pick `T = Business | null` and hand the null straight back to the caller.
 */
function check<T>(
  result: { data: T; error: { message: string } | null },
  label: string,
): NonNullable<T> {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  if (result.data == null) throw new Error(`${label}: la consulta no devolvió filas`);
  return result.data;
}

async function upsertUser(
  email: string,
  fullName: string,
  role: "superadmin" | "owner" | "manager" | "cashier",
  businessId: string | null,
) {
  const { data: created, error } = await db.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  let userId = created?.user?.id;

  // Re-running the seed must not fail on users that already exist.
  if (error) {
    if (!/already|registered|exists/i.test(error.message)) throw error;

    const { data: list } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
    userId = list?.users.find((u) => u.email === email)?.id;
    if (!userId) throw new Error(`No pude resolver el usuario existente ${email}`);

    await db.auth.admin.updateUserById(userId, { password: PASSWORD });
  }

  check(
    await db
      .from("profiles")
      .upsert({ id: userId!, business_id: businessId, role, full_name: fullName })
      .select()
      .single(),
    `profile ${email}`,
  );

  return userId!;
}

interface OptionSeed {
  name: string;
  delta?: number;
  available?: boolean;
}

interface GroupSeed {
  name: string;
  type: "single" | "multiple";
  required?: boolean;
  min?: number;
  max?: number | null;
  options: OptionSeed[];
}

interface ProductSeed {
  name: string;
  description?: string;
  price: number;
  available?: boolean;
  groups?: GroupSeed[];
}

interface CategorySeed {
  name: string;
  products: ProductSeed[];
}

interface BusinessSeed {
  slug: string;
  name: string;
  brandColor: string;
  whatsapp: string;
  address: string;
  minOrder: number;
  transferAlias: string;
  zones: { name: string; fee: number; active?: boolean }[];
  categories: CategorySeed[];
  staff: { email: string; name: string; role: "owner" | "manager" | "cashier" }[];
}

/** Prices are in cents. $9.500 -> 950_000 */
const pesos = (amount: number) => Math.round(amount * 100);

const COOKING_POINT: GroupSeed = {
  name: "Punto de cocción",
  type: "single",
  required: true,
  min: 1,
  max: 1,
  options: [{ name: "Jugosa" }, { name: "A punto" }, { name: "Bien cocida" }],
};

const BURGER_EXTRAS: GroupSeed = {
  name: "Agregados",
  type: "multiple",
  min: 0,
  max: 4,
  options: [
    { name: "Cheddar extra", delta: pesos(1200) },
    { name: "Panceta", delta: pesos(1800) },
    { name: "Huevo frito", delta: pesos(900) },
    { name: "Aros de cebolla", delta: pesos(1000) },
  ],
};

const BURGER_REMOVE: GroupSeed = {
  name: "Quitar ingredientes",
  type: "multiple",
  min: 0,
  max: null,
  options: [{ name: "Sin lechuga" }, { name: "Sin tomate" }, { name: "Sin salsa" }],
};

const PIZZA_SIZE: GroupSeed = {
  name: "Tamaño",
  type: "single",
  required: true,
  min: 1,
  max: 1,
  options: [
    { name: "Chica (6 porciones)" },
    { name: "Grande (8 porciones)", delta: pesos(4500) },
  ],
};

const PIZZA_EXTRAS: GroupSeed = {
  name: "Agregados",
  type: "multiple",
  min: 0,
  max: 3,
  options: [
    { name: "Jamón", delta: pesos(2000) },
    { name: "Morrón", delta: pesos(1200) },
    { name: "Aceitunas", delta: pesos(800) },
    { name: "Huevo", delta: pesos(1000) },
  ],
};

const BUSINESSES: BusinessSeed[] = [
  {
    slug: "burger-house-tuc",
    name: "Burger House Tucumán",
    brandColor: "#D1420A",
    whatsapp: "5493811111111",
    address: "Av. Aconquija 1250, Yerba Buena",
    minOrder: pesos(8000),
    transferAlias: "burger.house.tuc",
    zones: [
      { name: "Yerba Buena", fee: pesos(1500) },
      { name: "Centro", fee: pesos(2200) },
      { name: "Barrio Sur", fee: pesos(2500) },
      { name: "Tafí Viejo", fee: pesos(3500), active: false },
    ],
    staff: [
      { email: "dueno@burgerhouse.test", name: "Martín Ruiz", role: "owner" },
      { email: "encargado@burgerhouse.test", name: "Sofía Paz", role: "manager" },
      { email: "cajero@burgerhouse.test", name: "Nico Díaz", role: "cashier" },
    ],
    categories: [
      {
        name: "Hamburguesas",
        products: [
          {
            name: "Clásica",
            description: "Medallón de 150g, lechuga, tomate y salsa de la casa.",
            price: pesos(9500),
            groups: [COOKING_POINT, BURGER_EXTRAS, BURGER_REMOVE],
          },
          {
            name: "Doble Cheddar",
            description: "Doble medallón, doble cheddar y cebolla caramelizada.",
            price: pesos(13900),
            groups: [COOKING_POINT, BURGER_EXTRAS, BURGER_REMOVE],
          },
          {
            name: "Veggie",
            description: "Medallón de garbanzo y remolacha.",
            price: pesos(10200),
            groups: [BURGER_EXTRAS, BURGER_REMOVE],
          },
        ],
      },
      {
        name: "Papas",
        products: [
          {
            name: "Papas clásicas",
            price: pesos(4500),
            groups: [
              {
                name: "Tamaño",
                type: "single",
                required: true,
                min: 1,
                max: 1,
                options: [{ name: "Chicas" }, { name: "Grandes", delta: pesos(2000) }],
              },
            ],
          },
          {
            name: "Papas cheddar y panceta",
            price: pesos(7800),
          },
        ],
      },
      {
        name: "Bebidas",
        products: [
          {
            name: "Gaseosa 500ml",
            price: pesos(2500),
            groups: [
              {
                name: "Sabor",
                type: "single",
                required: true,
                min: 1,
                max: 1,
                options: [
                  { name: "Coca-Cola" },
                  { name: "Coca-Cola Zero" },
                  { name: "Sprite" },
                  { name: "Fanta", available: false },
                ],
              },
            ],
          },
          { name: "Agua mineral 500ml", price: pesos(1800) },
          { name: "Cerveza artesanal IPA 473ml", price: pesos(4800), available: false },
        ],
      },
    ],
  },
  {
    slug: "pizzeria-don-jose",
    name: "Pizzería Don José",
    brandColor: "#1D6B45",
    whatsapp: "5493812222222",
    address: "San Martín 450, San Miguel de Tucumán",
    minOrder: 0,
    transferAlias: "don.jose.pizza",
    zones: [
      { name: "Centro", fee: pesos(1500) },
      { name: "Barrio Norte", fee: pesos(2000) },
    ],
    staff: [{ email: "dueno@donjose.test", name: "José Gómez", role: "owner" }],
    categories: [
      {
        name: "Pizzas",
        products: [
          {
            name: "Muzzarella",
            description: "Salsa de tomate, muzzarella y aceitunas.",
            price: pesos(12000),
            groups: [PIZZA_SIZE, PIZZA_EXTRAS],
          },
          {
            name: "Napolitana",
            description: "Muzzarella, rodajas de tomate y ajo.",
            price: pesos(14500),
            groups: [PIZZA_SIZE, PIZZA_EXTRAS],
          },
          {
            name: "Fugazzeta rellena",
            price: pesos(17000),
            groups: [PIZZA_SIZE],
          },
        ],
      },
      {
        name: "Empanadas",
        products: [
          {
            name: "Empanada de carne",
            price: pesos(1800),
            groups: [
              {
                name: "Cocción",
                type: "single",
                required: true,
                min: 1,
                max: 1,
                options: [{ name: "Al horno" }, { name: "Frita" }],
              },
            ],
          },
          { name: "Empanada de pollo", price: pesos(1800) },
          { name: "Docena surtida", price: pesos(19500) },
        ],
      },
      {
        name: "Bebidas",
        products: [{ name: "Gaseosa 1.5L", price: pesos(4200) }],
      },
    ],
  },
];

async function seedBusiness(seed: BusinessSeed) {
  // Cascades wipe menu, orders and staff profiles for a clean re-run.
  const { data: existing } = await db
    .from("businesses")
    .select("id")
    .eq("slug", seed.slug)
    .maybeSingle();

  if (existing) {
    await db.from("businesses").delete().eq("id", existing.id);
  }

  const business = check(
    await db
      .from("businesses")
      .insert({
        slug: seed.slug,
        name: seed.name,
        brand_color: seed.brandColor,
        whatsapp_phone: seed.whatsapp,
        address: seed.address,
        timezone: "America/Argentina/Tucuman",
        currency: "ARS",
      })
      .select()
      .single(),
    `business ${seed.slug}`,
  );

  check(
    await db
      .from("business_settings")
      .insert({
        business_id: business.id,
        min_order_cents: seed.minOrder,
        transfer_enabled: true,
        transfer_alias: seed.transferAlias,
        transfer_holder: seed.name,
        prep_time_minutes: 35,
      })
      .select()
      .single(),
    "business_settings",
  );

  check(
    await db
      .from("subscriptions")
      .insert({
        business_id: business.id,
        status: "active",
        plan: "base",
        monthly_amount_cents: pesos(35000),
        current_period_end: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10),
      })
      .select()
      .single(),
    "subscription",
  );

  // Thursday through Sunday, 20:00 to 01:00. Crossing midnight is normal.
  check(
    await db
      .from("business_hours")
      .insert(
        [4, 5, 6, 0].map((day) => ({
          business_id: business.id,
          day_of_week: day,
          opens_at: "20:00",
          closes_at: "01:00",
        })),
      )
      .select(),
    "business_hours",
  );

  check(
    await db
      .from("delivery_zones")
      .insert(
        seed.zones.map((zone, index) => ({
          business_id: business.id,
          name: zone.name,
          fee_cents: zone.fee,
          is_active: zone.active ?? true,
          sort_order: index,
        })),
      )
      .select(),
    "delivery_zones",
  );

  for (const [categoryIndex, categorySeed] of seed.categories.entries()) {
    const category = check(
      await db
        .from("categories")
        .insert({
          business_id: business.id,
          name: categorySeed.name,
          sort_order: categoryIndex,
        })
        .select()
        .single(),
      `category ${categorySeed.name}`,
    );

    for (const [productIndex, productSeed] of categorySeed.products.entries()) {
      const product = check(
        await db
          .from("products")
          .insert({
            business_id: business.id,
            category_id: category.id,
            name: productSeed.name,
            description: productSeed.description ?? null,
            base_price_cents: productSeed.price,
            is_available: productSeed.available ?? true,
            sort_order: productIndex,
          })
          .select()
          .single(),
        `product ${productSeed.name}`,
      );

      for (const [groupIndex, groupSeed] of (productSeed.groups ?? []).entries()) {
        const group = check(
          await db
            .from("option_groups")
            .insert({
              business_id: business.id,
              product_id: product.id,
              name: groupSeed.name,
              selection_type: groupSeed.type,
              is_required: groupSeed.required ?? false,
              min_select: groupSeed.min ?? 0,
              max_select: groupSeed.max === undefined ? null : groupSeed.max,
              sort_order: groupIndex,
            })
            .select()
            .single(),
          `option_group ${groupSeed.name}`,
        );

        check(
          await db
            .from("options")
            .insert(
              groupSeed.options.map((option, optionIndex) => ({
                business_id: business.id,
                option_group_id: group.id,
                name: option.name,
                price_delta_cents: option.delta ?? 0,
                is_available: option.available ?? true,
                sort_order: optionIndex,
              })),
            )
            .select(),
          `options for ${groupSeed.name}`,
        );
      }
    }
  }

  for (const member of seed.staff) {
    await upsertUser(member.email, member.name, member.role, business.id);
  }

  console.log(`  ✔ ${seed.name} (/m/${seed.slug}) — ${seed.staff.length} usuarios`);
  return business.id;
}

async function main() {
  console.log(`Seeding ${SUPABASE_URL}\n`);

  for (const seed of BUSINESSES) {
    await seedBusiness(seed);
  }

  await upsertUser("agencia.gutmark@gmail.com", "Gastón (Galu)", "superadmin", null);
  console.log("  ✔ superadmin agencia.gutmark@gmail.com");

  console.log(`\nListo. Contraseña de todos los usuarios demo: ${PASSWORD}`);
  console.log("Menús públicos: /m/burger-house-tuc y /m/pizzeria-don-jose");
}

main().catch((error) => {
  console.error("\nFalló el seed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
