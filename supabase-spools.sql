-- Controle compartilhado de projetos e spools.
-- Execute este arquivo uma vez no SQL Editor do projeto Supabase do ObraFlow.

create table if not exists public.spool_projects (
  id text primary key,
  code text not null,
  name text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint spool_projects_id_not_blank check (btrim(id) <> ''),
  constraint spool_projects_code_not_blank check (btrim(code) <> ''),
  constraint spool_projects_name_not_blank check (btrim(name) <> ''),
  constraint spool_projects_data_is_object check (jsonb_typeof(data) = 'object')
);

create index if not exists spool_projects_code_idx
  on public.spool_projects (lower(code));

create index if not exists spool_projects_updated_at_idx
  on public.spool_projects (updated_at desc);

alter table public.spool_projects enable row level security;

-- Grants explícitos são necessários para projetos Supabase com exposição
-- automática de novas tabelas desativada. O app atual usa a chave publicável
-- também antes de estabelecer uma sessão Supabase, portanto mantém o papel anon.
revoke all on table public.spool_projects from anon, authenticated;
grant select, insert, update, delete on table public.spool_projects to anon, authenticated;

drop policy if exists "obraflow_read_spool_projects" on public.spool_projects;
create policy "obraflow_read_spool_projects"
  on public.spool_projects for select
  to anon, authenticated
  using (true);

drop policy if exists "obraflow_insert_spool_projects" on public.spool_projects;
create policy "obraflow_insert_spool_projects"
  on public.spool_projects for insert
  to anon, authenticated
  with check (btrim(id) <> '' and btrim(code) <> '' and btrim(name) <> '');

drop policy if exists "obraflow_update_spool_projects" on public.spool_projects;
create policy "obraflow_update_spool_projects"
  on public.spool_projects for update
  to anon, authenticated
  using (true)
  with check (btrim(id) <> '' and btrim(code) <> '' and btrim(name) <> '');

drop policy if exists "obraflow_delete_spool_projects" on public.spool_projects;
create policy "obraflow_delete_spool_projects"
  on public.spool_projects for delete
  to anon, authenticated
  using (true);

comment on table public.spool_projects is
  'Projetos de tubulação, cadastro de spools, posições na prancha e histórico de status.';

-- Desenhos originais e pranchas visuais. O bucket é privado: a leitura passa
-- pelo endpoint autenticado do Storage e não por uma URL pública permanente.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'spool-drawings',
  'spool-drawings',
  false,
  52428800,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/acad',
    'application/x-acad',
    'application/dwg',
    'image/vnd.dwg',
    'application/octet-stream'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "obraflow_read_spool_drawings" on storage.objects;
create policy "obraflow_read_spool_drawings"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'spool-drawings');

drop policy if exists "obraflow_insert_spool_drawings" on storage.objects;
create policy "obraflow_insert_spool_drawings"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'spool-drawings' and btrim(name) <> '');

drop policy if exists "obraflow_update_spool_drawings" on storage.objects;
create policy "obraflow_update_spool_drawings"
  on storage.objects for update
  to anon, authenticated
  using (bucket_id = 'spool-drawings')
  with check (bucket_id = 'spool-drawings' and btrim(name) <> '');

drop policy if exists "obraflow_delete_spool_drawings" on storage.objects;
create policy "obraflow_delete_spool_drawings"
  on storage.objects for delete
  to anon, authenticated
  using (bucket_id = 'spool-drawings');

