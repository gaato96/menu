# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Menú Digital: multi-tenant SaaS for restaurants. Diners order from a public menu
(`/m/[slug]`) and the order gets confirmed via a WhatsApp redirect; staff run the kitchen from
a real-time Kanban board (`/panel`). One business = one location (no multi-branch support by
design). Installable as a PWA on phone (diner) and tablet (counter).

## Commands

```bash
npm run dev              # next dev --webpack (see "Why --webpack" below)
npm run build            # production build
npm run typecheck        # tsc --noEmit
npm run lint              # eslint
npm run test:unit         # vitest run tests/unit — pure logic, no network
npm run test:rls          # vitest run tests/rls — hits the REAL Supabase project
npm run test:e2e          # playwright test — also hits the real project
npm run db:seed           # wipes and reseeds the two demo businesses
npm run icons             # regenerates PWA icons from scripts/generate-icons.ts
npm run push:keys         # generates a new VAPID key pair for Web Push
```

Run a single test file: `npx vitest run tests/unit/pricing.test.ts` or
`npx playwright test tests/e2e/ordering.spec.ts --project=phone` (projects: `tablet`, `phone` —
see `playwright.config.ts`).

**`test:rls` and `test:e2e` are not mocked.** There is no local Supabase instance (no Docker on
this machine — see below), so both suites run against the actual hosted project using
`.env.local`. `test:rls` signs in as the seeded demo users and mutates `subscriptions`/
`business_hours` temporarily; it is not safe to run against a project with real customer data.

**Database migrations**: write a new file in `supabase/migrations/` (never edit an applied
one), then apply with:

```bash
npx supabase db push --db-url "postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres"
```

There is no Docker on this machine, so `supabase start`, `supabase db reset`, and
`supabase gen types` do not work here. `src/types/database.ts` is hand-maintained to mirror
`supabase/migrations/` — update it manually when a migration changes the schema.

## Architecture

### Trust boundary: RLS is the authority, not application code

Every tenant-scoped table has `business_id` and Row Level Security policies (see
`supabase/migrations/20260727120200_rls.sql`). Staff pages read/write through the
session-bound client (`src/lib/supabase/server.ts` / `client.ts`) and **never filter by
`business_id` in application code** — if the policies are right, a query returns exactly one
business's rows; if they're wrong, `tests/rls/isolation.test.ts` fails before a customer would
notice. Board status changes go straight from the client to `supabase.from("orders").update()`
(no API route) — the `orders_update_guard` trigger (`20260727120300_order_functions.sql`) is
what actually enforces which role may make which transition, and raises the Spanish error
message the UI shows on rejection.

Tenant scoping in JWTs comes from a **Custom Access Token Hook**
(`custom_access_token_hook`, `20260727120100_auth_claims.sql`) that stamps `business_id` and
`user_role` as claims at sign-in — policies read `auth.jwt()` directly instead of querying
`profiles` per row (which would also recurse on the `profiles` table itself). If a signed-in
user sees empty data everywhere, the hook is probably not enabled for the project (Dashboard →
Authentication → Hooks).

The **admin client** (`src/lib/supabase/admin.ts`, service role) is used only where RLS
genuinely cannot apply: pricing/creating an order for an anonymous diner, sending Web Push,
uploading to Storage, and `auth.admin.createUser` when inviting staff. Every admin-client call
site re-validates the caller's own session/business membership first — see
`uploadProductImage` and `inviteStaff` for the pattern.

### Pricing is never trusted from the browser

`src/lib/pricing.ts` (`priceOrder`/`priceLine`) is a pure function: cart + menu snapshot in,
priced order or validation errors out. It's called twice — client-side in the product sheet for
live totals, and server-side in `src/lib/orders/create-order.ts` after re-reading the menu with
the admin client — and the two must agree to the cent. The browser only ever sends product/option
**ids and quantities**. Order creation itself is one atomic Postgres function
(`create_priced_order`, `20260727130000_create_order.sql`) so a comanda can never exist with a
priced order row but no items.

**The order is persisted before the WhatsApp redirect fires**, not after. If the diner never
sends the WhatsApp message, the board still shows the order with a "not confirmed" badge
instead of the business never finding out about it.

### Board realtime has three independent channels

`src/hooks/use-order-realtime.ts` combines Supabase Realtime (`postgres_changes` on `orders`),
a 30s poll + refetch-on-focus (catches a socket that died silently), and Web Push
(`src/lib/push/`, reaches a device with the tab closed). They're deliberately redundant — see
the comment at the top of that file before "simplifying" it down to just Realtime.

### Route groups map to trust levels, not URL structure

- `(public)/m/[slug]` — anonymous diners, anon Supabase client only.
- `(auth)` — login/no-access, no session required.
- `(panel)` — signed-in staff of one business (`requireStaff()` in `src/lib/auth/context.ts`
  redirects otherwise); layout applies the business's brand color as CSS vars.
- `(admin)` — superadmin only (`requireSuperadmin()`), cross-tenant.

### Order status model

`src/lib/orders/status.ts` is the single source of truth for the state machine, mirrored by a
matching check in the `orders_update_guard` DB trigger (both must change together if you add a
status). Two DB statuses — `on_the_way` and `ready_for_pickup` — collapse into one board column
(`ready`) because a Kanban column can't have two names; `statusForColumn`/`columnForStatus`
handle the mapping based on the order's `fulfillment_type`.

### Server Actions over API routes for staff mutations

The `(panel)` ABM screens (`src/app/(panel)/panel/menu|config|usuarios/actions.ts`) use
`"use server"` actions bound with `.bind(null, id)`, called directly from plain
`<form action={...}>` (works without client JS) or from small client islands
(`src/components/panel/async-toggle.tsx`, `role-select.tsx`) for things that need to feel
instant. `POST /api/orders` and `/api/push/subscribe` are real API routes because they're called
by unauthenticated/cross-context clients (the diner's browser, the service worker).

### Why `next build --webpack`

Next 16 defaults to Turbopack, but `@serwist/next` (PWA service worker bundling) is a webpack
plugin without stable Turbopack support yet. The alternative ("configurator mode") generates
`public/sw.js` in a separate post-build step, which is a worse failure mode for a deploy. Revisit
when Serwist ships Turbopack support.

## Non-obvious conventions

- **Money is always integer cents** (`base_price_cents`, `total_cents`, etc.) — never float or
  `numeric`. `src/lib/money.ts` has the only formatting/parsing logic.
- **Enum-like DB columns are `text` + `CHECK`, not Postgres `ENUM` types** — e.g. adding
  `dine_in` to `fulfillment_type` for a future tables module is a one-line migration instead of
  an `ALTER TYPE`.
- **`src/types/database.ts` row shapes use `type`, never `interface`.** supabase-js requires
  `Record<string, unknown>`; an `interface` has no implicit index signature and silently
  resolves `Insert` types to `never` with no useful error.
- **The service worker never caches anything order/auth-related** — only the app shell, fonts,
  and product images. A stale cached comanda is worse than no comanda.
- **Subscription gate has two levels**: `past_due` still serves everything (nobody wants a
  business locked out on a Friday night over a late bank transfer) — only `suspended` actually
  blocks the public menu.
- **Business hours support overnight ranges** (e.g. 20:00–01:00); `src/lib/business/hours.ts`
  and `date-range.ts` handle the midnight-crossing math and assume a fixed UTC offset
  (Argentina has no DST since 2009) — read the comments there before reusing for another region.
- **Rate limiting (`src/lib/rate-limit.ts`) is in-memory, not distributed.** There's no shared
  Redis, so this only throttles a burst hitting the same warm Vercel instance. It exists for the
  real failure mode (double tap, stuck retry loop), not as a defense against a distributed
  attacker — if that's ever needed, it's an Upstash Redis swap, not a rewrite.
- **`src/proxy.ts` is this project's middleware** (Next 16 renamed the file, not just a
  convention here) — it's a UX gate only, not the security boundary. RLS is what actually
  authorizes every read/write; someone who defeats the proxy still reads nothing.
- **Never `fetch()` right before `window.location.assign()` to a different origin.** The browser
  can abort a plain fetch mid-flight when the page unloads in the same tick — `keepalive: true`
  is not reliably enough to survive it in practice. Use `navigator.sendBeacon` instead (see
  `whatsapp-redirect.tsx`), which exists specifically for fire-and-forget-then-navigate.
