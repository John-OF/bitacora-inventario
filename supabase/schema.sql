-- ============================================================================
--  Bitácora de Inventario — Esquema de base de datos (Supabase / PostgreSQL)
-- ============================================================================
--  Cómo usarlo:
--    1. Entra a tu proyecto en https://supabase.com
--    2. Menú lateral:  SQL Editor  ->  New query
--    3. Pega TODO este archivo y presiona  Run.
--
--  Es seguro ejecutarlo más de una vez (usa CREATE ... IF NOT EXISTS y
--  DROP POLICY IF EXISTS / CREATE OR REPLACE VIEW).
-- ============================================================================


-- ----------------------------------------------------------------------------
--  Tabla: productos
-- ----------------------------------------------------------------------------
create table if not exists public.productos (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nombre        text not null,
  descripcion   text,
  archivado_en  timestamptz,                       -- NULL = activo;  con fecha = "borrado" (archivado)
  creado_en     timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
--  Tabla: movimientos
--  "quedan" es una COLUMNA GENERADA: la calcula PostgreSQL automáticamente
--  como  inicio + llegan - salen.  Así nunca se puede desincronizar.
-- ----------------------------------------------------------------------------
create table if not exists public.movimientos (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  producto_id  uuid not null references public.productos (id) on delete restrict,
  fecha        date not null default current_date,
  lote         text not null,
  inicio       integer not null default 0 check (inicio >= 0),
  llegan       integer not null default 0 check (llegan >= 0),
  salen        integer not null default 0 check (salen >= 0),
  quedan       integer generated always as (inicio + llegan - salen) stored,
  creado_en    timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
--  Índices (para listar y filtrar rápido)
-- ----------------------------------------------------------------------------
create index if not exists idx_productos_user         on public.productos (user_id);
create index if not exists idx_movimientos_user_fecha on public.movimientos (user_id, fecha desc, creado_en desc);
create index if not exists idx_movimientos_producto   on public.movimientos (producto_id);


-- ----------------------------------------------------------------------------
--  Regla de negocio: el resultado (inicio + llegan - salen) NUNCA puede ser
--  negativo. En la práctica no existe el stock negativo; siempre es un error
--  de captura. Se agrega de forma segura (sin error si ya existe).
--  Nota: si tu tabla ya tuviera filas con resultado negativo, primero
--  corrígelas o bórralas, porque esta restricción valida los datos actuales.
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'movimientos_no_negativo') then
    alter table public.movimientos
      add constraint movimientos_no_negativo check (inicio + llegan - salen >= 0);
  end if;
end $$;


-- ----------------------------------------------------------------------------
--  Seguridad a nivel de fila (RLS)
--  Cada usuario SOLO puede ver y modificar SUS propias filas.
-- ----------------------------------------------------------------------------
alter table public.productos   enable row level security;
alter table public.movimientos enable row level security;

drop policy if exists "productos_propios"   on public.productos;
drop policy if exists "movimientos_propios" on public.movimientos;

create policy "productos_propios" on public.productos
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "movimientos_propios" on public.movimientos
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
--  Vista: existencia_actual
--  La existencia de cada producto = el "quedan" del movimiento MÁS RECIENTE
--  (por fecha; en empate, por creado_en).  Solo productos NO archivados.
--  security_invoker = on  ->  la vista respeta el RLS del usuario que consulta.
-- ----------------------------------------------------------------------------
create or replace view public.existencia_actual
with (security_invoker = on) as
select distinct on (m.producto_id)
  m.producto_id,
  p.nombre as producto_nombre,
  m.fecha,
  m.lote,
  m.quedan
from public.movimientos m
join public.productos p on p.id = m.producto_id
where p.archivado_en is null
order by m.producto_id, m.fecha desc, m.creado_en desc;

grant select on public.existencia_actual to authenticated;
