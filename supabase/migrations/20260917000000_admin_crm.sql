-- Fase 16 do roadmap — Painel Administrativo / Mini-CRM.
--
-- Cria: status comercial em `upgrade_leads`, `admin_users` (identifica quem pode acessar o
-- painel), `upgrade_lead_status_history` (histórico de mudanças de status) e
-- `upgrade_lead_notes` (observações internas). Nomeação `upgrade_lead_*` (não `project_*`, como o
-- briefing sugeria) para ficar consistente com a tabela que já existe (`upgrade_leads`) — esta
-- arquitetura nunca teve uma tabela `projects` separada (mesma decisão já registrada na migration
-- da Fase 15).

-- ==========================================================================
-- 1. STATUS COMERCIAL + ARQUIVAMENTO (preparado, não usado ainda) em upgrade_leads
-- ==========================================================================

alter table public.upgrade_leads
  add column if not exists status text not null default 'new',
  add column if not exists archived_at timestamptz;

alter table public.upgrade_leads
  add constraint upgrade_leads_status_valid
    check (status in ('new', 'contacted', 'meeting', 'proposal', 'won', 'lost'));

create index if not exists upgrade_leads_status_idx on public.upgrade_leads (status);

-- ==========================================================================
-- 2. ADMIN USERS — quem pode acessar o painel (estar autenticado não basta)
-- ==========================================================================

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'admin' check (role = 'admin'),
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- Um usuário só pode verificar SE ELE MESMO é admin — nunca listar quem mais é admin.
create policy "users can check their own admin row"
  on public.admin_users
  for select
  using (user_id = auth.uid());

grant select on public.admin_users to authenticated;
-- Sem GRANT de insert/update/delete para "authenticated" — o primeiro admin (e qualquer outro) só
-- é criado via SQL Editor (service_role/postgres, que ignora RLS), nunca pelo próprio app.

-- ==========================================================================
-- 3. Função auxiliar — evita repetir o mesmo "exists (select ...)" em cada policy
-- ==========================================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

-- ==========================================================================
-- 4. upgrade_leads — acesso de leitura/atualização para admins
-- ==========================================================================

create policy "admins can select leads"
  on public.upgrade_leads
  for select
  using (public.is_admin());

create policy "admins can update lead status"
  on public.upgrade_leads
  for update
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.upgrade_leads to authenticated;
-- GRANT restrito à coluna `status`: mesmo que um bug futuro tente atualizar outra coluna pela
-- sessão de um admin, o Postgres já rejeita no nível de privilégio — nunca lead_score, contato,
-- idempotency_key, etc. (não é suficiente confiar só na Server Action para essa garantia).
grant update (status) on public.upgrade_leads to authenticated;

-- ==========================================================================
-- 5. Histórico de status
-- ==========================================================================

create table if not exists public.upgrade_lead_status_history (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.upgrade_leads (id) on delete cascade,
  old_status text,
  new_status text not null,
  changed_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

alter table public.upgrade_lead_status_history enable row level security;

create policy "admins can select status history"
  on public.upgrade_lead_status_history
  for select
  using (public.is_admin());

create policy "admins can insert status history"
  on public.upgrade_lead_status_history
  for insert
  with check (public.is_admin());

grant select, insert on public.upgrade_lead_status_history to authenticated;

create index if not exists upgrade_lead_status_history_lead_id_idx
  on public.upgrade_lead_status_history (lead_id, created_at desc);

-- ==========================================================================
-- 6. Observações internas (nunca visíveis ao cliente — nenhuma rota pública as lê)
-- ==========================================================================

create table if not exists public.upgrade_lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.upgrade_leads (id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

alter table public.upgrade_lead_notes enable row level security;

create policy "admins can select notes"
  on public.upgrade_lead_notes
  for select
  using (public.is_admin());

create policy "admins can insert notes"
  on public.upgrade_lead_notes
  for insert
  with check (public.is_admin());

grant select, insert on public.upgrade_lead_notes to authenticated;

create index if not exists upgrade_lead_notes_lead_id_idx
  on public.upgrade_lead_notes (lead_id, created_at desc);
