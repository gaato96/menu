-- ===========================================================================
-- Video en la carta, vista vertical por defecto, y el llamado de mesa.
--
-- Tres cosas que van juntas porque las tres existen para el mismo momento:
-- alguien sentado a la mesa con el celular en la mano.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. Video por producto.
--
-- Un archivo propio, no un embed. Un iframe de Instagram o TikTok trae la
-- marca de la otra app, tarda, y en varios navegadores no autoplaya mudo —
-- justo lo que hace falta para que la carta se sienta continua. El costo es
-- storage, y por eso el límite es duro (ver el bucket abajo).
--
-- image_url sigue siendo obligatoria en la práctica: es el póster mientras el
-- video decodifica y el reemplazo cuando el navegador no puede reproducirlo.
-- ---------------------------------------------------------------------------

alter table public.products add column video_url text;

-- 8MB y solo formatos que reproduce cualquier navegador.
--
-- Deliberadamente SIN video/quicktime: un iPhone graba .mov con HEVC, que
-- Safari reproduce y Chrome en Android no. Aceptarlo significaría cartas que
-- se ven bien en el celular del dueño y quedan en negro en el del cliente,
-- que es el único que importa. Sin transcodificación del lado del servidor,
-- rechazarlo con un mensaje claro es más honesto que aceptarlo y fallar.
--
-- Mismo patrón de seguridad que los otros dos buckets: lectura pública, sin
-- RLS en storage.objects, y toda escritura pasa por un Server Action con el
-- cliente ADMIN después de verificar la sesión del staff.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-videos',
  'product-videos',
  true,
  8388608, -- 8MB
  array['video/mp4', 'video/webm']
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 2. Qué vista abre el QR.
--
-- catalog_view_enabled ya decidía si la vista vertical EXISTE. Esto decide si
-- además es la puerta de entrada. Son dos flags y no uno porque un local sin
-- fotos buenas necesita poder tener la vista disponible sin que sea lo
-- primero que ve el cliente: a pantalla completa, una foto mala es peor que
-- ninguna.
--
-- El default es false: ningún negocio ya existente cambia de comportamiento
-- por correr esta migración.
-- ---------------------------------------------------------------------------

alter table public.business_settings
  add column catalog_is_default boolean not null default false;

-- ---------------------------------------------------------------------------
-- 3. Llamados de mesa: "la cuenta, por favor" y "necesito al mozo".
--
-- No es un pedido, así que no es una fila en orders: no tiene ítems, ni
-- precio, ni pasa por la cocina, y mezclarlo con el tablero de comandas
-- ensuciaría la única pantalla que tiene que estar limpia durante el
-- servicio.
--
-- El insert lo hace el cliente ADMIN desde /api/table-calls, igual que la
-- creación de un pedido: quien llama es anónimo y hay que validar del lado
-- del servidor que la mesa existe, está activa y es de ese negocio. Por eso
-- acá no hay ninguna policy para anon.
-- ---------------------------------------------------------------------------

create table public.table_calls (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  table_id uuid not null,
  kind text not null check (kind in ('bill', 'waiter')),
  status text not null default 'pending' check (status in ('pending', 'done')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id),
  -- Par (id, business_id) como en orders: la mesa tiene que ser de ESTE
  -- negocio, no de cualquiera.
  constraint table_calls_table_fk foreign key (table_id, business_id)
    references public.restaurant_tables (id, business_id)
);

create index table_calls_pending_idx
  on public.table_calls (business_id, created_at)
  where status = 'pending';

-- Un llamado abierto por mesa y por tipo. Es el antídoto contra el cliente
-- que toca "pedir la cuenta" cinco veces porque nadie vino todavía: el
-- segundo toque choca contra este índice y la API lo trata como éxito, sin
-- llenar el salón de alertas repetidas por la misma mesa.
create unique index table_calls_one_open_idx
  on public.table_calls (table_id, kind)
  where status = 'pending';

alter table public.table_calls enable row level security;

create policy table_calls_staff_read on public.table_calls
  for select to authenticated
  using (business_id = public.auth_business_id() or public.is_superadmin());

-- Cualquiera del local puede darlo por atendido, incluido el mozo: es el que
-- efectivamente va a la mesa.
create policy table_calls_staff_update on public.table_calls
  for update to authenticated
  using (business_id = public.auth_business_id() or public.is_superadmin())
  with check (business_id = public.auth_business_id() or public.is_superadmin());

-- REPLICA IDENTITY FULL por la misma razón que orders: sin eso el evento de
-- UPDATE no trae business_id y el filtro del panel no matchea.
alter table public.table_calls replica identity full;
alter publication supabase_realtime add table public.table_calls;
