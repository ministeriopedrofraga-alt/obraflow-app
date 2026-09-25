begin;

create table if not exists public.radio_assets (
  id text primary key,
  code text not null unique,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint radio_assets_id_not_blank check (btrim(id) <> ''),
  constraint radio_assets_code_not_blank check (btrim(code) <> '')
);

create index if not exists radio_assets_updated_at_idx
  on public.radio_assets (updated_at desc);

alter table public.radio_assets enable row level security;
grant select, insert, update, delete on table public.radio_assets to anon, authenticated;

drop policy if exists "obraflow_read_radio_assets" on public.radio_assets;
create policy "obraflow_read_radio_assets"
  on public.radio_assets for select to anon, authenticated using (true);
drop policy if exists "obraflow_insert_radio_assets" on public.radio_assets;
create policy "obraflow_insert_radio_assets"
  on public.radio_assets for insert to anon, authenticated
  with check (btrim(id) <> '' and btrim(code) <> '');
drop policy if exists "obraflow_update_radio_assets" on public.radio_assets;
create policy "obraflow_update_radio_assets"
  on public.radio_assets for update to anon, authenticated
  using (true)
  with check (btrim(id) <> '' and btrim(code) <> '');
drop policy if exists "obraflow_delete_radio_assets" on public.radio_assets;
create policy "obraflow_delete_radio_assets"
  on public.radio_assets for delete to anon, authenticated using (true);

create table if not exists public.radio_movements (
  id text primary key,
  radio_id text not null references public.radio_assets(id) on delete cascade,
  occurred_at timestamptz not null default now(),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint radio_movements_id_not_blank check (btrim(id) <> '')
);

create index if not exists radio_movements_radio_idx
  on public.radio_movements (radio_id);
create index if not exists radio_movements_date_idx
  on public.radio_movements (occurred_at desc);

alter table public.radio_movements enable row level security;
grant select, insert, update, delete on table public.radio_movements to anon, authenticated;

drop policy if exists "obraflow_read_radio_movements" on public.radio_movements;
create policy "obraflow_read_radio_movements"
  on public.radio_movements for select to anon, authenticated using (true);
drop policy if exists "obraflow_insert_radio_movements" on public.radio_movements;
create policy "obraflow_insert_radio_movements"
  on public.radio_movements for insert to anon, authenticated
  with check (btrim(id) <> '');
drop policy if exists "obraflow_update_radio_movements" on public.radio_movements;
create policy "obraflow_update_radio_movements"
  on public.radio_movements for update to anon, authenticated
  using (true)
  with check (btrim(id) <> '');
drop policy if exists "obraflow_delete_radio_movements" on public.radio_movements;
create policy "obraflow_delete_radio_movements"
  on public.radio_movements for delete to anon, authenticated using (true);

comment on table public.radio_assets is 'Cadastro dos radios comunicadores controlados pelo almoxarifado.';
comment on table public.radio_movements is 'Historico de entregas assinadas e devolucoes de radios.';

commit;

notify pgrst, 'reload schema';
