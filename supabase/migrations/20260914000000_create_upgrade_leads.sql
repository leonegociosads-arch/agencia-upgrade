-- Fase 13 do roadmap — infraestrutura de persistência para o formulário de contato (WF-10),
-- implementado nas Fases 11/12 (Resumo do Projeto + Captura do Lead). Cria apenas a tabela
-- necessária agora (`upgrade_leads`) — Session/Project/Event/Lead Score, descritos em
-- docs/DATA-MODEL-CONCEPT.md, ficam para fases futuras (não avançar para CRM/Lead Score/Analytics).

create extension if not exists pgcrypto;

create table if not exists public.upgrade_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Dados de contato (WF-10) — mesmos 5 campos de features/lead/types.ts (LeadContactData).
  name text not null,
  company text not null,
  whatsapp text not null,
  email text not null,
  website_or_instagram text,

  -- PROJECT SNAPSHOT (features/builder/types.ts, ProjectSnapshot) — "o que o cliente quer
  -- contratar", embutido como JSONB (mesma decisão de docs/DATA-MODEL-CONCEPT.md para
  -- ServiceConfiguration.answers: volume pequeno, sem necessidade de consultar respostas
  -- individuais fora do contexto do projeto).
  project jsonb not null,

  -- Prevenção de duplicidade por reenvio (ex.: "Tentar novamente" depois de uma falha, ou uma
  -- requisição duplicada na rede) — a mesma idempotency_key nunca grava duas linhas.
  idempotency_key text not null,

  constraint upgrade_leads_idempotency_key_key unique (idempotency_key),
  constraint upgrade_leads_name_not_blank check (char_length(trim(name)) > 0),
  constraint upgrade_leads_company_not_blank check (char_length(trim(company)) > 0),
  constraint upgrade_leads_whatsapp_not_blank check (char_length(trim(whatsapp)) > 0),
  constraint upgrade_leads_email_not_blank check (char_length(trim(email)) > 0)
);

-- Índice para a futura listagem de leads (Fase 16, admin) ordenada por data — barato de manter e
-- evita um "sequential scan" quando essa tela existir; nenhuma outra consulta é esperada agora.
create index if not exists upgrade_leads_created_at_idx on public.upgrade_leads (created_at desc);

-- RLS: habilitada e, de propósito, SEM nenhuma policy. Com RLS ligada e zero policies, toda
-- operação (select/insert/update/delete) via chave "anon" ou "authenticated" é negada por padrão —
-- exatamente o requisito "o visitante público não pode listar, ler, alterar ou deletar leads".
-- Apenas a service role key (usada exclusivamente em lib/supabase/server.ts, nunca no navegador)
-- ignora RLS e consegue gravar um lead — é assim que o fluxo Browser -> Server Action -> Supabase
-- é reforçado também no nível do banco, não só na camada de aplicação.
alter table public.upgrade_leads enable row level security;

-- Reforço explícito (defesa em profundidade): revoga qualquer privilégio que os papéis padrão do
-- PostgREST/Supabase possam ter recebido nesta tabela. Com RLS habilitada isso já seria redundante
-- para leitura/escrita normais, mas remove qualquer dúvida sobre GRANTs herdados do schema.
revoke all on public.upgrade_leads from anon, authenticated;

-- RLS e GRANT são camadas independentes no Postgres: "service_role" tem o atributo BYPASSRLS (por
-- isso ignora a ausência de policies acima), mas ainda precisa do privilégio de tabela em si — sem
-- este GRANT, o Supabase retorna "permission denied for table upgrade_leads" (42501) mesmo para a
-- service role key, porque este schema não concede privilégios em tabelas novas por padrão.
grant select, insert, update, delete on public.upgrade_leads to service_role;
