-- Planejamento e diário de produção por data, Data Hall e engenheiro.
-- Execute uma vez no SQL Editor do projeto Supabase usado pelo ObraFlow.

create table if not exists public.daily_work_reports (
  id text primary key,
  work_date date not null,
  dh text not null,
  engineer_name text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint daily_work_reports_id_not_blank check (btrim(id) <> ''),
  constraint daily_work_reports_dh_not_blank check (btrim(dh) <> ''),
  constraint daily_work_reports_engineer_not_blank check (btrim(engineer_name) <> ''),
  constraint daily_work_reports_data_is_object check (jsonb_typeof(data) = 'object')
);

create index if not exists daily_work_reports_date_idx
  on public.daily_work_reports (work_date desc);

create index if not exists daily_work_reports_dh_date_idx
  on public.daily_work_reports (dh, work_date desc);

create index if not exists daily_work_reports_engineer_date_idx
  on public.daily_work_reports (lower(engineer_name), work_date desc);

alter table public.daily_work_reports enable row level security;

-- O app usa login próprio e a chave publicável do Supabase, sem sessão Auth.
-- Estas políticas seguem o acesso atual compartilhado entre os módulos.
-- Migre a autorização do app para Supabase Auth antes de publicar a API aberta.
revoke all on table public.daily_work_reports from anon, authenticated;
grant select, insert, update, delete on table public.daily_work_reports to anon, authenticated;

drop policy if exists "obraflow_read_daily_work_reports" on public.daily_work_reports;
create policy "obraflow_read_daily_work_reports"
  on public.daily_work_reports for select
  to anon, authenticated
  using (true);

drop policy if exists "obraflow_insert_daily_work_reports" on public.daily_work_reports;
create policy "obraflow_insert_daily_work_reports"
  on public.daily_work_reports for insert
  to anon, authenticated
  with check (
    btrim(id) <> ''
    and btrim(dh) <> ''
    and btrim(engineer_name) <> ''
    and jsonb_typeof(data) = 'object'
  );

drop policy if exists "obraflow_update_daily_work_reports" on public.daily_work_reports;
create policy "obraflow_update_daily_work_reports"
  on public.daily_work_reports for update
  to anon, authenticated
  using (true)
  with check (
    btrim(id) <> ''
    and btrim(dh) <> ''
    and btrim(engineer_name) <> ''
    and jsonb_typeof(data) = 'object'
  );

drop policy if exists "obraflow_delete_daily_work_reports" on public.daily_work_reports;
create policy "obraflow_delete_daily_work_reports"
  on public.daily_work_reports for delete
  to anon, authenticated
  using (true);

comment on table public.daily_work_reports is
  'Planejamento semanal, check-in/out e apontamento diário por engenheiro e Data Hall.';
