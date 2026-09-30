-- ============================================================================
-- SCRIPT DE PERMISSÕES PARA EQUIPAMENTOS (PTAs E PALETEIRAS) E HISTÓRICO
-- Execute este script no SQL Editor do Supabase para liberar o acesso direto
-- às tabelas public.equipments e public.history
-- ============================================================================

-- 1. Permissões na tabela equipments
grant select, insert, update, delete on table public.equipments to anon, authenticated;
alter table public.equipments enable row level security;

drop policy if exists "obraflow_all_equipments" on public.equipments;
create policy "obraflow_all_equipments"
  on public.equipments
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- 2. Permissões na tabela history
grant select, insert, update, delete on table public.history to anon, authenticated;
alter table public.history enable row level security;

drop policy if exists "obraflow_all_history" on public.history;
create policy "obraflow_all_history"
  on public.history
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- 3. Garantir permissões em app_metadata (para sincronização entre computadores)
create table if not exists public.app_metadata (
  key text primary key,
  value jsonb not null default '{}'::jsonb
);
grant select, insert, update, delete on table public.app_metadata to anon, authenticated;
alter table public.app_metadata enable row level security;

drop policy if exists "obraflow_all_app_metadata" on public.app_metadata;
create policy "obraflow_all_app_metadata"
  on public.app_metadata
  for all
  to anon, authenticated
  using (true)
  with check (true);
