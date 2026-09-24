-- Execute uma vez no SQL Editor do projeto Supabase usado pelo ObraFlow.
-- O app atual usa uma chave publicável sem Supabase Auth; por isso as políticas
-- abaixo reproduzem o modelo de acesso já usado pelos módulos de equipamentos.
-- Antes de disponibilizar o app em URL pública, migre os gestores para Supabase
-- Auth e restrinja estas políticas por usuário/obra.

create table if not exists public.packing_slips (
  id text primary key,
  number text not null unique,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint packing_slips_id_not_blank check (btrim(id) <> ''),
  constraint packing_slips_number_not_blank check (btrim(number) <> '')
);

create index if not exists packing_slips_updated_at_idx
  on public.packing_slips (updated_at desc);

alter table public.packing_slips enable row level security;

grant select, insert, update, delete on table public.packing_slips to anon, authenticated;

drop policy if exists "obraflow_read_packing_slips" on public.packing_slips;
create policy "obraflow_read_packing_slips"
  on public.packing_slips
  for select
  to anon, authenticated
  using (true);

drop policy if exists "obraflow_insert_packing_slips" on public.packing_slips;
create policy "obraflow_insert_packing_slips"
  on public.packing_slips
  for insert
  to anon, authenticated
  with check (btrim(id) <> '' and btrim(number) <> '');

drop policy if exists "obraflow_update_packing_slips" on public.packing_slips;
create policy "obraflow_update_packing_slips"
  on public.packing_slips
  for update
  to anon, authenticated
  using (true)
  with check (btrim(id) <> '' and btrim(number) <> '');

drop policy if exists "obraflow_delete_packing_slips" on public.packing_slips;
create policy "obraflow_delete_packing_slips"
  on public.packing_slips
  for delete
  to anon, authenticated
  using (true);

comment on table public.packing_slips is
  'Romaneios de materiais expedidos pelo almoxarifado do ObraFlow.';

create table if not exists public.receiving_inspections (
  id text primary key,
  number text not null unique,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint receiving_inspections_id_not_blank check (btrim(id) <> ''),
  constraint receiving_inspections_number_not_blank check (btrim(number) <> '')
);

create index if not exists receiving_inspections_updated_at_idx
  on public.receiving_inspections (updated_at desc);

alter table public.receiving_inspections enable row level security;

grant select, insert, update, delete on table public.receiving_inspections to anon, authenticated;

drop policy if exists "obraflow_read_receiving_inspections" on public.receiving_inspections;
create policy "obraflow_read_receiving_inspections"
  on public.receiving_inspections for select to anon, authenticated using (true);

drop policy if exists "obraflow_insert_receiving_inspections" on public.receiving_inspections;
create policy "obraflow_insert_receiving_inspections"
  on public.receiving_inspections for insert to anon, authenticated
  with check (btrim(id) <> '' and btrim(number) <> '');

drop policy if exists "obraflow_update_receiving_inspections" on public.receiving_inspections;
create policy "obraflow_update_receiving_inspections"
  on public.receiving_inspections for update to anon, authenticated
  using (true)
  with check (btrim(id) <> '' and btrim(number) <> '');

drop policy if exists "obraflow_delete_receiving_inspections" on public.receiving_inspections;
create policy "obraflow_delete_receiving_inspections"
  on public.receiving_inspections for delete to anon, authenticated using (true);

comment on table public.receiving_inspections is
  'Registros preenchidos dos formulários oficiais de recebimento e vistoria.';

-- ============================================================================
-- MÓDULO DE ESTOQUE UNIFICADO
-- ============================================================================

-- Cadastro único de produtos
create table if not exists public.products (
  code text primary key,
  description text not null,
  unit text not null,
  category text,
  min_stock numeric default 0,
  updated_at timestamptz not null default now(),
  constraint products_code_not_blank check (btrim(code) <> ''),
  constraint products_description_not_blank check (btrim(description) <> ''),
  constraint products_unit_not_blank check (btrim(unit) <> '')
);

create index if not exists products_updated_at_idx
  on public.products (updated_at desc);

alter table public.products enable row level security;
grant select, insert, update, delete on table public.products to anon, authenticated;

drop policy if exists "obraflow_read_products" on public.products;
create policy "obraflow_read_products" on public.products for select to anon, authenticated using (true);

drop policy if exists "obraflow_insert_products" on public.products;
create policy "obraflow_insert_products" on public.products for insert to anon, authenticated with check (btrim(code) <> '');

drop policy if exists "obraflow_update_products" on public.products;
create policy "obraflow_update_products" on public.products for update to anon, authenticated using (true) with check (btrim(code) <> '');

drop policy if exists "obraflow_delete_products" on public.products;
create policy "obraflow_delete_products" on public.products for delete to anon, authenticated using (true);

comment on table public.products is 'Cadastro unificado de materiais e equipamentos.';

-- Tipo de movimentação
do $$ begin
  create type public.movement_type as enum ('IN', 'OUT', 'RETURN');
exception
  when duplicate_object then null;
end $$;

-- Histórico unificado de movimentações (Entradas, Saídas, Retornos)
create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_code text references public.products(code) not null,
  type public.movement_type not null,
  quantity numeric not null,
  date timestamptz not null default now(),
  document_reference text, -- Referência a romaneios ou NFs
  notes text,
  created_at timestamptz not null default now(),
  constraint stock_movements_quantity_positive check (quantity > 0)
);

create index if not exists stock_movements_product_code_idx
  on public.stock_movements (product_code);
create index if not exists stock_movements_date_idx
  on public.stock_movements (date desc);

alter table public.stock_movements enable row level security;
grant select, insert, update, delete on table public.stock_movements to anon, authenticated;

drop policy if exists "obraflow_read_stock_movements" on public.stock_movements;
create policy "obraflow_read_stock_movements" on public.stock_movements for select to anon, authenticated using (true);

drop policy if exists "obraflow_insert_stock_movements" on public.stock_movements;
create policy "obraflow_insert_stock_movements" on public.stock_movements for insert to anon, authenticated with check (true);

drop policy if exists "obraflow_update_stock_movements" on public.stock_movements;
create policy "obraflow_update_stock_movements" on public.stock_movements for update to anon, authenticated using (true) with check (true);

drop policy if exists "obraflow_delete_stock_movements" on public.stock_movements;
create policy "obraflow_delete_stock_movements" on public.stock_movements for delete to anon, authenticated using (true);

comment on table public.stock_movements is 'Histórico unificado de todas as movimentações de estoque.';

-- View para calcular o estoque atualizado dinamicamente
create or replace view public.current_stock as
select
  p.code,
  p.description,
  p.unit,
  coalesce(sum(
    case
      when m.type = 'IN' or m.type = 'RETURN' then m.quantity
      when m.type = 'OUT' then -m.quantity
      else 0
    end
  ), 0) as available_quantity
from
  public.products p
left join
  public.stock_movements m on p.code = m.product_code
group by
  p.code, p.description, p.unit;

grant select on public.current_stock to anon, authenticated;

comment on view public.current_stock is 'Visão em tempo real do estoque disponível com base no histórico de movimentações.';

-- Arquivo original das notas de entrada. O bucket é privado; os PDFs são
-- gravados em caminhos únicos no formato ano/id-da-entrada/arquivo.pdf.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('material-invoices', 'material-invoices', false, 6291456, array['application/pdf'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "obraflow_insert_material_invoices" on storage.objects;
create policy "obraflow_insert_material_invoices"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'material-invoices'
  and lower(name) like '%.pdf'
);

drop policy if exists "obraflow_read_material_invoices" on storage.objects;
create policy "obraflow_read_material_invoices"
on storage.objects for select to authenticated
using (
  bucket_id = 'material-invoices'
  and owner = (select auth.uid())
);

drop policy if exists "obraflow_delete_material_invoices" on storage.objects;
create policy "obraflow_delete_material_invoices"
on storage.objects for delete to authenticated
using (
  bucket_id = 'material-invoices'
  and owner = (select auth.uid())
);

-- ============================================================================
-- MÓDULO DE GESTÃO DE USUÁRIOS E APROVAÇÕES DE ACESSO
-- ============================================================================

create table if not exists public.user_approvals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email text not null unique,
  name text not null,
  role text not null default 'operador',
  company text,
  status text not null default 'pending',
  invite_token text,
  invited_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by text,
  constraint user_approvals_email_not_blank check (btrim(email) <> '')
);

create index if not exists user_approvals_email_idx on public.user_approvals (lower(email));
create index if not exists user_approvals_status_idx on public.user_approvals (status);

alter table public.user_approvals enable row level security;
grant select, insert, update, delete on table public.user_approvals to anon, authenticated;

drop policy if exists "obraflow_read_user_approvals" on public.user_approvals;
create policy "obraflow_read_user_approvals" on public.user_approvals for select to anon, authenticated using (true);

drop policy if exists "obraflow_insert_user_approvals" on public.user_approvals;
create policy "obraflow_insert_user_approvals" on public.user_approvals for insert to anon, authenticated with check (true);

drop policy if exists "obraflow_update_user_approvals" on public.user_approvals;
create policy "obraflow_update_user_approvals" on public.user_approvals for update to anon, authenticated using (true) with check (true);

drop policy if exists "obraflow_delete_user_approvals" on public.user_approvals;
create policy "obraflow_delete_user_approvals" on public.user_approvals for delete to anon, authenticated using (true);

comment on table public.user_approvals is 'Cadastro e solicitações de aprovação de acesso de usuários ao sistema.';

-- ============================================================================
-- MÓDULO DE CAUTELAS E EPIs (FERRAMENTAS E EQUIPAMENTOS)
-- ============================================================================

do $$ begin
  create type public.checkout_type as enum ('TOOL', 'EPI', 'OTHER');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.checkout_status as enum ('PENDING_RETURN', 'RETURNED', 'NO_RETURN_NEEDED');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.employee_checkouts (
  id uuid primary key default gen_random_uuid(),
  checkout_type public.checkout_type not null default 'TOOL',
  
  -- Se o item estiver cadastrado no estoque, linka aqui (opcional)
  product_code text references public.products(code),
  
  -- Descrição avulsa (obrigatório, preenchido manual ou copiado do produto)
  item_description text not null,
  
  collaborator_name text not null,
  quantity numeric not null default 1,
  
  checkout_date timestamptz not null default now(),
  returned_date timestamptz,
  
  status public.checkout_status not null default 'PENDING_RETURN',
  
  -- URL ou base64 da assinatura coletada digitalmente
  signature_url text,
  
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint employee_checkouts_item_not_blank check (btrim(item_description) <> ''),
  constraint employee_checkouts_collab_not_blank check (btrim(collaborator_name) <> '')
);

-- Garante a evidência de assinatura também em bases criadas por versões antigas.
alter table public.employee_checkouts
  add column if not exists signature_url text;

create index if not exists employee_checkouts_collab_idx on public.employee_checkouts (collaborator_name);
create index if not exists employee_checkouts_status_idx on public.employee_checkouts (status);
create index if not exists employee_checkouts_date_idx on public.employee_checkouts (checkout_date desc);

alter table public.employee_checkouts enable row level security;
grant select, insert, update, delete on table public.employee_checkouts to anon, authenticated;

drop policy if exists "obraflow_read_employee_checkouts" on public.employee_checkouts;
create policy "obraflow_read_employee_checkouts" on public.employee_checkouts for select to anon, authenticated using (true);

drop policy if exists "obraflow_insert_employee_checkouts" on public.employee_checkouts;
create policy "obraflow_insert_employee_checkouts" on public.employee_checkouts for insert to anon, authenticated with check (true);

drop policy if exists "obraflow_update_employee_checkouts" on public.employee_checkouts;
create policy "obraflow_update_employee_checkouts" on public.employee_checkouts for update to anon, authenticated using (true) with check (true);

drop policy if exists "obraflow_delete_employee_checkouts" on public.employee_checkouts;
create policy "obraflow_delete_employee_checkouts" on public.employee_checkouts for delete to anon, authenticated using (true);

comment on table public.employee_checkouts is 'Controle de entrega e devolução de EPIs, Ferramentas e Equipamentos (com ou sem vínculo ao estoque).';

-- ============================================================================
-- CONTROLE DE RÁDIOS COMUNICADORES
-- ============================================================================

create table if not exists public.radio_assets (
  id text primary key,
  code text not null unique,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint radio_assets_id_not_blank check (btrim(id) <> ''),
  constraint radio_assets_code_not_blank check (btrim(code) <> '')
);

create index if not exists radio_assets_updated_at_idx on public.radio_assets (updated_at desc);
alter table public.radio_assets enable row level security;
grant select, insert, update, delete on table public.radio_assets to anon, authenticated;

drop policy if exists "obraflow_read_radio_assets" on public.radio_assets;
create policy "obraflow_read_radio_assets" on public.radio_assets for select to anon, authenticated using (true);
drop policy if exists "obraflow_insert_radio_assets" on public.radio_assets;
create policy "obraflow_insert_radio_assets" on public.radio_assets for insert to anon, authenticated with check (btrim(id) <> '' and btrim(code) <> '');
drop policy if exists "obraflow_update_radio_assets" on public.radio_assets;
create policy "obraflow_update_radio_assets" on public.radio_assets for update to anon, authenticated using (true) with check (btrim(id) <> '' and btrim(code) <> '');
drop policy if exists "obraflow_delete_radio_assets" on public.radio_assets;
create policy "obraflow_delete_radio_assets" on public.radio_assets for delete to anon, authenticated using (true);

create table if not exists public.radio_movements (
  id text primary key,
  radio_id text not null references public.radio_assets(id) on delete cascade,
  occurred_at timestamptz not null default now(),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint radio_movements_id_not_blank check (btrim(id) <> '')
);

create index if not exists radio_movements_radio_idx on public.radio_movements (radio_id);
create index if not exists radio_movements_date_idx on public.radio_movements (occurred_at desc);
alter table public.radio_movements enable row level security;
grant select, insert, update, delete on table public.radio_movements to anon, authenticated;

drop policy if exists "obraflow_read_radio_movements" on public.radio_movements;
create policy "obraflow_read_radio_movements" on public.radio_movements for select to anon, authenticated using (true);
drop policy if exists "obraflow_insert_radio_movements" on public.radio_movements;
create policy "obraflow_insert_radio_movements" on public.radio_movements for insert to anon, authenticated with check (btrim(id) <> '');
drop policy if exists "obraflow_update_radio_movements" on public.radio_movements;
create policy "obraflow_update_radio_movements" on public.radio_movements for update to anon, authenticated using (true) with check (btrim(id) <> '');
drop policy if exists "obraflow_delete_radio_movements" on public.radio_movements;
create policy "obraflow_delete_radio_movements" on public.radio_movements for delete to anon, authenticated using (true);

comment on table public.radio_assets is 'Cadastro dos rádios comunicadores controlados pelo almoxarifado.';
comment on table public.radio_movements is 'Histórico de entregas assinadas e devoluções de rádios.';
