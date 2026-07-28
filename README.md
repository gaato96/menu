# Menú Digital

Toma de pedidos en tiempo real para locales gastronómicos. Menú público que arma el pedido y
lo manda por WhatsApp, y un tablero de comandas en vivo del lado del comercio.

SaaS multi-tenant: un negocio = una sucursal, aislado por Row Level Security. Instalable como
PWA en celular y tablet.

---

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Estilos | Tailwind CSS v4 + Radix primitives |
| Base / Auth / Realtime / Storage | Supabase (PostgreSQL) |
| PWA | `@serwist/next` + Web Push (VAPID) |
| Drag & drop | `@dnd-kit` (PointerSensor, táctil) |
| Deploy | Vercel |

**`next build --webpack` no es un descuido.** Next 16 usa Turbopack por defecto, pero
`@serwist/next` es un plugin de webpack y todavía no lo soporta. La alternativa (configurator
mode) genera `public/sw.js` en un paso posterior al build, lo que agrega riesgo en el deploy.
Cuando Serwist tenga soporte estable de Turbopack, se migra y se saca el flag.

---

## Puesta en marcha

```bash
npm install
```

Copiá `.env.example` a `.env.local` y completá:

| Variable | Dónde sale |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Dashboard → Project Settings → API Keys → anon |
| `SUPABASE_SERVICE_ROLE_KEY` | Dashboard → Project Settings → API Keys → service_role |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | `npm run push:keys` |

### Base de datos

```bash
npx supabase db push --db-url "postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres"
```

### Hook de JWT (obligatorio, se configura una sola vez)

Las políticas de RLS leen `business_id` y `user_role` de los claims del token. Sin el hook,
esos claims no existen y **toda consulta de un usuario logueado devuelve cero filas**.

En el Dashboard: **Authentication → Hooks → Customize Access Token (JWT) Claims** → habilitar y
elegir `public.custom_access_token_hook`.

(En desarrollo local esto ya está en `supabase/config.toml`; el proyecto hosteado no lee ese
archivo.)

### Datos de prueba

```bash
npm run db:seed
```

Crea dos locales con menú real (`/m/burger-house-tuc` y `/m/pizzeria-don-jose`), su staff y el
superadmin. Dos negocios no es decoración: los tests de RLS necesitan un segundo inquilino
contra el cual probar el aislamiento.

---

## Comandos

```bash
npm run dev
```

| Comando | Qué hace |
|---|---|
| `npm run build` | Build de producción (webpack + service worker) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test:unit` | Precios, estados y mensaje de WhatsApp |
| `npm run test:rls` | Aislamiento entre negocios |
| `npm run test:e2e` | Playwright |
| `npm run icons` | Regenera los íconos de la PWA |
| `npm run db:seed` | Datos de prueba |
| `npm run push:keys` | Par de claves VAPID |

`npm run db:types` requiere Docker. Sin Docker, `src/types/database.ts` se mantiene a mano y
tiene que seguir a `supabase/migrations/`.

---

## Decisiones que conviene no revertir sin leer

- **La plata es siempre entero en centavos.** Nunca `float`, nunca `numeric`. `$15.400` es
  `1_540_000`.
- **El navegador nunca manda precios.** `POST /api/orders` recibe ids y cantidades, y vuelve a
  leer los precios de la base. Ver `src/lib/pricing.ts`.
- **El pedido se persiste ANTES de redirigir a WhatsApp.** Si el cliente se arrepiente a mitad
  de camino, el local igual ve la comanda, marcada como "sin confirmar".
- **`on_the_way` y `ready_for_pickup` son dos estados distintos en la base pero una sola
  columna del tablero.** Separarlos es lo que después permite medir tiempos de delivery y
  alimentar la pantalla de cocina sin migrar nada.
- **Los enums son `text` + `CHECK`, no tipos `ENUM` de Postgres.** Agregar `dine_in` cuando
  entre el módulo de mesas tiene que ser una migración de una línea.
- **Nada relacionado con pedidos se cachea en el service worker.** Una comanda vieja es peor
  que ninguna comanda.
- **`past_due` sigue funcionando, solo `suspended` corta.** Nadie apaga un local un viernes a
  la noche porque una transferencia llegó tarde.
- **Los tipos de fila en `src/types/database.ts` se declaran con `type`, nunca `interface`.**
  supabase-js exige `Record<string, unknown>`; una interface no tiene índice implícito y
  resuelve el tipo de Insert a `never` sin ningún error que lo explique.

---

## Estado

- [x] Fase 0 — Esquema, RLS, hook de JWT, base PWA, motor de precios
- [x] Fase 1 — Menú público y toma de pedido
- [x] Fase 2 — Tablero de comandas
- [x] Fase 3 — Operación diaria
- [x] Fase 4 — Panel del negocio
- [ ] Fase 5 — Panel de superadmin

### Fase 1 — qué incluye

- Menú público (`/m/[slug]`) con categorías, ficha de producto con variantes/extras/quitar
  ingredientes, validación en vivo de grupos obligatorios y máximos.
- Carrito persistente (Zustand + localStorage), checkout en 4 pasos (modalidad → datos → pago
  → notas).
- `POST /api/orders`: recalcula precios en el servidor con `src/lib/pricing.ts` — el navegador
  nunca manda precios — y crea el pedido de forma atómica vía la función SQL
  `create_priced_order` (persiste antes de redirigir, así el pedido existe aunque el cliente
  nunca llegue a enviar el WhatsApp).
- Página de confirmación con el motivo visual del "ticket rasgado" (`TicketEdge`, SVG
  determinístico) y redirección automática a WhatsApp con fallback manual.
- Manifest dinámico por negocio (`/m/[slug]/manifest.webmanifest`): cada local se instala con
  su propio nombre, ícono y color, no como "Menú Digital".
- Sistema de diseño propio (ver `globals.css`): paleta kraft/parchment en vez de la cream+serif
  genérica de moda, tipografía Big Shoulders (display) + Schibsted Grotesk (texto) + IBM Plex
  Mono (precios/códigos), colores de estado donde la saturación mapea a urgencia.
- Suite E2E de Playwright que arma un pedido real con opciones, completa el checkout y verifica
  que llegue a WhatsApp con el pedido ya persistido (`tests/e2e/ordering.spec.ts`).
