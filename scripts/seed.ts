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
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import sharp from "sharp";

import { MODULE_KEYS } from "../src/lib/modules/registry";
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

// --- Demo images -----------------------------------------------------------
//
// Downloaded (not hotlinked) and re-uploaded into Supabase Storage: next.config.ts
// only allow-lists the Supabase host in remotePatterns, so a menu that pointed
// at Unsplash directly would fail to render and would break offline. Cached on
// disk in a gitignored folder so re-running the seed doesn't re-download ~40
// photos every time.

const CACHE_DIR = path.join(import.meta.dirname, ".seed-cache");

async function downloadWithCache(url: string): Promise<Buffer> {
  await mkdir(CACHE_DIR, { recursive: true });
  const cachePath = path.join(CACHE_DIR, Buffer.from(url).toString("base64url") + ".bin");

  try {
    return await readFile(cachePath);
  } catch {
    // Not cached yet — fall through to fetch it.
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error(`No pude descargar ${url}: HTTP ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(cachePath, buffer);
  return buffer;
}

async function uploadFromUrl(bucket: "business-images" | "product-images", folder: string, sourceUrl: string) {
  const buffer = await downloadWithCache(sourceUrl);
  const objectPath = `${folder}/${randomUUID()}.jpg`;

  const { error } = await db.storage.from(bucket).upload(objectPath, buffer, {
    contentType: "image/jpeg",
    upsert: true,
  });
  if (error) throw new Error(`No pude subir ${objectPath}: ${error.message}`);

  return db.storage.from(bucket).getPublicUrl(objectPath).data.publicUrl;
}

/** Generates a per-tenant logo (initials over the brand color) instead of hunting for fake business logos. */
async function generateLogo(businessName: string, brandColor: string): Promise<Buffer> {
  const initials = businessName
    .split(/\s+/)
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const svg = `
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" fill="${brandColor}" />
      <text x="128" y="128" text-anchor="middle" dominant-baseline="central"
        font-family="Arial, sans-serif" font-size="104" font-weight="700" fill="#ffffff">
        ${initials}
      </text>
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function uploadLogo(businessId: string, businessName: string, brandColor: string) {
  const buffer = await generateLogo(businessName, brandColor);
  const objectPath = `${businessId}/logo_url/${randomUUID()}.png`;

  const { error } = await db.storage.from("business-images").upload(objectPath, buffer, {
    contentType: "image/png",
    upsert: true,
  });
  if (error) throw new Error(`No pude subir el logo: ${error.message}`);

  return db.storage.from("business-images").getPublicUrl(objectPath).data.publicUrl;
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
  /** Source URL of a demo photo — downloaded and re-uploaded to Storage. */
  image?: string;
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
  /** Source URL of a demo cover photo — downloaded and re-uploaded to Storage. */
  cover?: string;
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
    cover: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=1600&q=80",
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
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
          },
          {
            name: "Doble Cheddar",
            description: "Doble medallón, doble cheddar y cebolla caramelizada.",
            price: pesos(13900),
            groups: [COOKING_POINT, BURGER_EXTRAS, BURGER_REMOVE],
            image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800&q=80",
          },
          {
            name: "Bacon BBQ",
            description: "Panceta crocante, cheddar y salsa barbacoa de la casa.",
            price: pesos(12500),
            groups: [COOKING_POINT, BURGER_EXTRAS, BURGER_REMOVE],
            image: "https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=800&q=80",
          },
          {
            name: "Chicken Crispy",
            description: "Pechuga crocante, mayonesa picante y pickles.",
            price: pesos(11000),
            groups: [BURGER_EXTRAS, BURGER_REMOVE],
            image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80",
          },
          {
            name: "Veggie",
            description: "Medallón de garbanzo y remolacha.",
            price: pesos(10200),
            groups: [BURGER_EXTRAS, BURGER_REMOVE],
            image: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=800&q=80",
          },
          {
            name: "Pulled Pork",
            description: "Cerdo desmechado braseado 8 horas, cebolla crispy.",
            price: pesos(13500),
            groups: [BURGER_EXTRAS, BURGER_REMOVE],
            image: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=800&q=80",
          },
        ],
      },
      {
        name: "Papas",
        products: [
          {
            name: "Papas clásicas",
            price: pesos(4500),
            image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80",
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
            image: "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=800&q=80",
          },
          {
            name: "Aros de cebolla",
            price: pesos(5200),
            image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80",
          },
        ],
      },
      {
        name: "Para picar",
        products: [
          {
            name: "Bastones de mozzarella",
            price: pesos(6200),
            image: "https://images.unsplash.com/photo-1600628421066-f6bda6a7b976?w=800&q=80",
          },
          {
            name: "Nachos con queso",
            price: pesos(6800),
            image: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800&q=80",
          },
          {
            name: "Alitas Buffalo",
            price: pesos(8200),
            image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80",
          },
          {
            name: "Provoleta",
            price: pesos(7000),
            image: "https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80",
          },
        ],
      },
      {
        name: "Bebidas",
        products: [
          {
            name: "Gaseosa 500ml",
            price: pesos(2500),
            image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800&q=80",
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
          {
            name: "Agua mineral 500ml",
            price: pesos(1800),
            image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800&q=80",
          },
          {
            name: "Limonada casera",
            price: pesos(3200),
            image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",
          },
          {
            name: "Cerveza artesanal IPA 473ml",
            price: pesos(4800),
            available: false,
            image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&q=80",
          },
        ],
      },
      {
        name: "Postres",
        products: [
          {
            name: "Brownie con helado",
            price: pesos(5500),
            image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80",
          },
          {
            name: "Milkshake de chocolate",
            price: pesos(4800),
            image: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=800&q=80",
          },
          {
            name: "Cheesecake",
            price: pesos(5200),
            image: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=800&q=80",
          },
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
    cover: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=1600&q=80",
    zones: [
      { name: "Centro", fee: pesos(1500) },
      { name: "Barrio Norte", fee: pesos(2000) },
    ],
    staff: [{ email: "dueno@donjose.test", name: "José Gómez", role: "owner" }],
    categories: [
      {
        name: "Entradas",
        products: [
          {
            name: "Bruschetta",
            price: pesos(4500),
            image: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=800&q=80",
          },
          {
            name: "Provoleta",
            price: pesos(6500),
            image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800&q=80",
          },
          {
            name: "Ensalada caprese",
            price: pesos(5800),
            image: "https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?w=800&q=80",
          },
        ],
      },
      {
        name: "Pizzas",
        products: [
          {
            name: "Muzzarella",
            description: "Salsa de tomate, muzzarella y aceitunas.",
            price: pesos(12000),
            groups: [PIZZA_SIZE, PIZZA_EXTRAS],
            image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80",
          },
          {
            name: "Napolitana",
            description: "Muzzarella, rodajas de tomate y ajo.",
            price: pesos(14500),
            groups: [PIZZA_SIZE, PIZZA_EXTRAS],
            image: "https://images.unsplash.com/photo-1601924582970-9238bcb495d9?w=800&q=80",
          },
          {
            name: "Fugazzeta rellena",
            price: pesos(17000),
            groups: [PIZZA_SIZE],
            image: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=800&q=80",
          },
          {
            name: "Calabresa",
            description: "Muzzarella, longaniza calabresa y morrones.",
            price: pesos(15500),
            groups: [PIZZA_SIZE, PIZZA_EXTRAS],
            image: "https://images.unsplash.com/photo-1541599468348-e96984315921?w=800&q=80",
          },
          {
            name: "Cuatro quesos",
            price: pesos(16000),
            groups: [PIZZA_SIZE],
            image: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&q=80",
          },
          {
            name: "Vegetariana",
            description: "Muzzarella, berenjena, zapallito y morrones asados.",
            price: pesos(14000),
            groups: [PIZZA_SIZE, PIZZA_EXTRAS],
            image: "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=800&q=80",
          },
        ],
      },
      {
        name: "Empanadas",
        products: [
          {
            name: "Empanada de carne",
            price: pesos(1800),
            image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80",
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
          {
            name: "Empanada de pollo",
            price: pesos(1800),
            image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80",
          },
          {
            name: "Empanada de jamón y queso",
            price: pesos(1800),
            image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80",
          },
          {
            name: "Empanada de verdura",
            price: pesos(1700),
            image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80",
          },
          {
            name: "Docena surtida",
            price: pesos(19500),
            image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
          },
        ],
      },
      {
        name: "Bebidas",
        products: [
          {
            name: "Gaseosa 1.5L",
            price: pesos(4200),
            image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&q=80",
          },
          {
            name: "Agua saborizada 500ml",
            price: pesos(1800),
            image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800&q=80",
          },
          {
            name: "Cerveza 473ml",
            price: pesos(4500),
            image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&q=80",
          },
        ],
      },
      {
        name: "Postres",
        products: [
          {
            name: "Tiramisú",
            price: pesos(5200),
            image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80",
          },
          {
            name: "Gelato",
            price: pesos(4200),
            image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80",
          },
          {
            name: "Panqueque con dulce de leche",
            price: pesos(4800),
            image: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=800&q=80",
          },
        ],
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

  const [logoUrl, coverUrl] = await Promise.all([
    uploadLogo(business.id, seed.name, seed.brandColor),
    seed.cover ? uploadFromUrl("business-images", `${business.id}/cover_image_url`, seed.cover) : null,
  ]);

  check(
    await db
      .from("businesses")
      .update({ logo_url: logoUrl, cover_image_url: coverUrl })
      .eq("id", business.id)
      .select()
      .single(),
    `business images ${seed.slug}`,
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

  // Every demo business runs with every premium module on, so RLS and E2E
  // suites exercise the restrictive gate policies rather than skip them.
  check(
    await db
      .from("business_modules")
      .insert(MODULE_KEYS.map((module_key) => ({ business_id: business.id, module_key })))
      .select(),
    "business_modules",
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

      if (productSeed.image) {
        const imageUrl = await uploadFromUrl(
          "product-images",
          `${business.id}/${product.id}`,
          productSeed.image,
        );
        await db.from("products").update({ image_url: imageUrl }).eq("id", product.id);
      }

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
