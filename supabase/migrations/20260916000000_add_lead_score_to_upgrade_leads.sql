-- Fase 15 do roadmap — Lead Score interno. Adiciona o resultado do cálculo
-- (features/lead/logic/calculateLeadScore.ts) à tabela já existente `upgrade_leads`.
--
-- Por que em `upgrade_leads` e não numa tabela `projects` separada: o briefing desta fase sugeria
-- "projects" como preferência (o score depende do projeto, não da pessoa) — mas esta arquitetura
-- (Fase 13) nunca criou uma tabela `projects` própria; o Project Snapshot vive embutido como JSONB
-- dentro da própria linha do lead (docs/DATA-MODEL-CONCEPT.md já registrava essa decisão para
-- ServiceConfiguration.answers). Criar uma tabela nova agora, só para o score, seria reestruturar
-- o schema sem necessidade concreta — o score entra ao lado do `project` que já existe, na mesma
-- linha de onde ele foi calculado.

alter table public.upgrade_leads
  add column if not exists lead_score integer,
  add column if not exists lead_score_tier text,
  add column if not exists lead_score_version integer,
  add column if not exists lead_score_breakdown jsonb;

-- Leads gravados antes desta migration ficam com essas colunas NULL — nenhum backfill automático
-- é feito agora (não pedido nesta fase). Um recálculo futuro é possível porque o `project` (JSONB)
-- de cada linha já existente contém tudo que `calculateLeadScore` precisa.

alter table public.upgrade_leads
  add constraint upgrade_leads_lead_score_range
    check (lead_score is null or (lead_score >= 0 and lead_score <= 100)),
  add constraint upgrade_leads_lead_score_tier_valid
    check (lead_score_tier is null or lead_score_tier in ('LOW', 'MEDIUM', 'HIGH', 'PRIORITY'));

-- Índice para a futura tela administrativa (Fase 16) ordenar/filtrar por prioridade comercial.
create index if not exists upgrade_leads_lead_score_idx on public.upgrade_leads (lead_score desc);
