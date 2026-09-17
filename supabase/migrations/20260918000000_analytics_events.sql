-- Fase 17 do roadmap — Analytics e Eventos. Cria `analytics_events` (funil/UTM/abandono, sempre
-- sem dado pessoal) e a função `analytics_overview`, usada pela "Visão geral" do admin (Fase 16).
--
-- Escrita: exclusivamente pela service role (`lib/repositories/analyticsEvents.ts`, chamada só a
-- partir da Server Action `features/analytics/actions/recordEvent.ts`) — por isso não existe
-- NENHUM grant de INSERT para `anon`/`authenticated` aqui. A service role ignora RLS, então a
-- escrita funciona mesmo com a tabela travada para todo mundo.
--
-- Leitura: só o admin, via `is_admin()` (já criada pela migration da Fase 16,
-- `20260917000000_admin_crm.sql`) — nenhum SELECT público, como pedido explicitamente pelo
-- briefing ("Não conceder SELECT público").

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  event_name text not null,
  event_category text not null,
  properties jsonb not null default '{}'::jsonb,
  -- Preparado para uma futura associação direta sessão -> lead convertido (hoje, a associação em
  -- V1 é feita via `properties->>'idempotencyKey'` = `upgrade_leads.idempotency_key` — ver
  -- `docs/ANALYTICS.md`, Seção "Conversão", para a justificativa de não popular esta coluna ainda).
  project_id uuid references public.upgrade_leads (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.analytics_events enable row level security;

create policy "admins can select analytics events"
  on public.analytics_events
  for select
  using (public.is_admin());

grant select on public.analytics_events to authenticated;

create index if not exists analytics_events_session_id_idx on public.analytics_events (session_id, created_at);
create index if not exists analytics_events_event_name_idx on public.analytics_events (event_name, created_at);
create index if not exists analytics_events_created_at_idx on public.analytics_events (created_at desc);

-- `analytics_overview` — agregação server-side para a "Visão geral" do admin
-- (`lib/repositories/analyticsEvents.ts`, `getAnalyticsOverview`). Deliberadamente NÃO
-- `security definer`: roda com o privilégio de quem chamou, então a própria RLS acima decide o
-- que a função enxerga — um usuário autenticado que não é admin recebe agregados vazios/zerados
-- (nunca um erro, nunca dado de verdade), e `anon` não tem nem `execute` para chamar a função.
create or replace function public.analytics_overview(period_start timestamptz)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'funnel', coalesce((
      select jsonb_object_agg(counts.event_name, counts.distinct_sessions)
      from (
        select event_name, count(distinct session_id) as distinct_sessions
        from public.analytics_events
        where created_at >= period_start
        group by event_name
      ) counts
    ), '{}'::jsonb),
    'topService', (
      select top.service_id
      from (
        select properties ->> 'serviceId' as service_id, count(*) as total
        from public.analytics_events
        where event_name = 'service_selected' and created_at >= period_start
        group by 1
        order by 2 desc
        limit 1
      ) top
    )
  );
$$;

grant execute on function public.analytics_overview(timestamptz) to authenticated;
