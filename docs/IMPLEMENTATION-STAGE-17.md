# IMPLEMENTATION STAGE 17 — Analytics e Eventos

> Fase 17 do roadmap. Implementa uma camada única de analytics (`lib/analytics/`,
> `features/analytics/`), 12 eventos de funil sem dado pessoal, sessão anônima compartilhada com a
> Fase 14, captura de UTM/first-touch, GA4/Meta Pixel opcionais (sem IDs inventados), um provider
> interno (Supabase) e uma "Visão geral" simples no admin. Não implementa Design System, UI final,
> motion avançado, GSAP ou ScrollTrigger — reservados à Fase 18.

---

## 1. Camada implementada

`lib/analytics/`: `events.ts` (contrato + validação Zod), `consent.ts`, `session.ts`,
`trackEvent.ts` (`trackEvent`/`trackFunnelMilestone`, o único ponto de entrada), `providers/`
(`ga4.ts`, `metaPixel.ts`, `internal.ts`, `loadScriptOnce.ts`). `features/analytics/`:
`actions/recordEvent.ts` (Server Action de ingestão) e `components/AnalyticsPageView.tsx` (dispara
`page_view`, montado em `app/layout.tsx`). Nenhum componente do Builder/lead conhece um SDK
específico — todos chamam só `trackEvent`/`trackFunnelMilestone`. Ver `docs/ANALYTICS.md` para o
detalhamento completo.

## 2. Providers

GA4 e Meta Pixel — opcionais, ativos só com `NEXT_PUBLIC_GA4_MEASUREMENT_ID`/
`NEXT_PUBLIC_META_PIXEL_ID` definidas (`.env.example`); nenhum ID foi inventado. Interno (Supabase,
`analytics_events`) — sempre ativo, escreve via a Server Action `recordEvent` usando o cliente de
SERVICE ROLE (nunca a chave anônima do navegador, nenhum grant de INSERT para `anon`). GA4 recebe
todos os 12 eventos; Meta Pixel só `lead_submitted` (mapeado para `Lead`).

## 3. Eventos

12 implementados (`docs/ANALYTICS-EVENTS.md` tem a tabela completa): `page_view`,
`builder_started`, `service_selected`, `service_completed`, `service_edited`, `service_removed`,
`upgrade_reviewed`, `contact_started`, `lead_submit_attempted`, `lead_submitted`,
`lead_submit_failed`, `whatsapp_clicked` (contrato pronto, sem ponto de disparo real ainda).
`question_answered` e um `service_started` separado foram avaliados e não implementados — análise
completa em `docs/ANALYTICS.md`, Seção 4, e `docs/DECISIONS.md`.

Pontos de disparo: `ServiceSelector.tsx` (`service_selected`), `QuestionRenderer.tsx`
(`service_completed` no auto-save de uma configuração nova, `service_edited` ao confirmar uma
edição), `ProjectReview.tsx`/`MyUpgrade.tsx` (`service_removed`), `ProjectReview.tsx`
(`upgrade_reviewed`, montagem), `LeadForm.tsx` (`contact_started` na montagem,
`lead_submit_attempted`/`lead_submitted`/`lead_submit_failed` em torno de `submitLead`),
`useBuilderSessionPersistence.ts` (`builder_started`, na hidratação), `AnalyticsPageView.tsx`
(`page_view`, toda mudança de `pathname`).

## 4. Migrations

`supabase/migrations/20260918000000_analytics_events.sql` — tabela `analytics_events`
(`session_id`, `event_name`, `event_category`, `properties` JSONB, `project_id` nullable
preparado, `created_at`), RLS (só admin lê, via `is_admin()` da Fase 16; nenhum grant para `anon`),
e a função `analytics_overview(period_start)` (agregação do funil + serviço mais escolhido, usada
pela "Visão geral" do admin).

`supabase/migrations/20260918000001_analytics_events_grant_insert.sql` — correção descoberta ao
testar contra o Supabase real: faltava `grant insert on analytics_events to service_role`. RLS
bypassada pela service role não dispensa o GRANT de privilégio da tabela (camadas independentes) —
ver `docs/DECISIONS.md`, Fase 17.

## 5. UTM

Capturado na criação da sessão (`utm_source/medium/campaign/content/term`), com first-touch
preservado através de navegação interna (nunca substituído por uma página sem UTM depois). Sem UTM,
origem classificada como `direct`/`organic` (heurística pequena, motores de busca comuns)/
`referral`, a partir de `document.referrer` (só o hostname). Ver `docs/ANALYTICS.md`, Seção 8.

## 6. Sessão

`session_id` passou a ter um dono canônico (`lib/analytics/session.ts`), site-wide — não só dentro
do Builder como na Fase 14. `useBuilderSessionPersistence.ts` foi ajustado para ADOTAR este mesmo
id em vez de gerar o seu próprio, satisfazendo o pedido do briefing de compartilhar um único
`session_id` por jornada. TTL de 7 dias (mesma política da Fase 14); "Começar de novo" gera uma
sessão de analytics nova também. Ver `docs/DECISIONS.md`, Fase 17, para a decisão completa.

## 7. Funil

`VISIT → BUILDER_STARTED → SERVICE_SELECTED → SERVICE_COMPLETED → UPGRADE_REVIEWED →
CONTACT_STARTED → LEAD_SUBMITTED`, com `service_selected`/`service_completed` podendo se repetir
por sessão (multi-serviço). 4 marcos (`builder_started`, `upgrade_reviewed`, `contact_started`,
`lead_submitted`) disparam no máximo uma vez por sessão via `trackFunnelMilestone`
(`markFunnelStepOnce`, `lib/analytics/session.ts`) — um refresh no meio do funil nunca conta um
marco duas vezes. Taxas de conversão calculadas em `features/admin/logic/computeFunnelRates.ts`.

## 8. Admin metrics

"Visão geral" (`features/admin/components/AnalyticsOverview.tsx`), dentro da mesma página `/admin`
— funil (7 contagens), 6 taxas, serviço mais escolhido. Período: hoje/7 dias/30 dias
(`?analyticsPeriod=`), preservando os filtros de lead já existentes na URL. Dados vêm da RPC
`analytics_overview`, agregada no Postgres (nunca busca linha a linha para somar no Node).

## 9. Testes

**70 testes novos** (381 no total do projeto) cobrindo os 22 cenários obrigatórios do briefing:

- `lib/analytics/events.test.ts` (5) — contrato, PII (Testes 13-15), validação estrita.
- `lib/analytics/consent.test.ts` (4) — padrões, `setConsent`.
- `lib/analytics/session.test.ts` (8) — reutilização (Testes 8/9), UTM (Testes 10/11), expiração,
  `markFunnelStepOnce`, reset.
- `lib/analytics/trackEvent.test.ts` (8) — consentimento (Testes 16/17), falha de provider isolada
  (Teste 19), `trackFunnelMilestone` dedupe.
- `lib/analytics/providers/{ga4,metaPixel,internal}.test.ts` (3+4+2) — configuração opcional,
  mapeamento restrito do Meta Pixel, nunca lança.
- `features/analytics/actions/recordEvent.test.ts` (6) — validação server-side, rejeição de
  propriedade extra tipo PII, nunca lança.
- `lib/repositories/analyticsEvents.test.ts` (5) — escrita via service role, leitura via RPC
  (Testes 21/22).
- `features/admin/logic/computeFunnelRates.test.ts` (3) e `resolvePeriodStart.test.ts` (4) — taxas, período.
- `features/admin/components/AnalyticsOverview.test.tsx` (4) — renderização, links de período.
- `features/analytics/components/AnalyticsPageView.test.tsx` (3) — `page_view` no carregamento
  inicial e em mudança de rota, sem duplicar.
- `lib/analytics/events.typecheck.ts` — prova de type safety (Teste 20), verificada pelo
  `npm run typecheck`, não pelo Vitest.
- `features/builder/components/BuilderShell.analytics.test.tsx` (10) — integração real via cliques
  (Testes 1-7): `builder_started` uma vez, `service_selected` só para configuração nova,
  `service_completed` só após confirmação (não seleção), `service_edited`/`service_removed`,
  `upgrade_reviewed`/`contact_started` com as propriedades corretas, `lead_submitted` só após
  sucesso real, `lead_submit_failed` sem `lead_submitted` quando o envio falha.
- `features/lead/actions/submitLead.test.ts` — 1 teste novo para `errorCategory` (mais um ajustado).

**Testes 21/22 (RLS: não-admin recebe agregados vazios, `anon` sem acesso)**: verificados no nível
de unidade (mock do `rpc`); o comportamento real das policies só pode ser confirmado contra o
Postgres do usuário, mesma limitação já registrada na Fase 16.

## 10. Limitações

Ver `docs/ANALYTICS.md`, Seção 18.

## 11. Pendências para a Etapa 18 (Design System)

- Nenhuma tela, cor, tipografia, motion ou componente visual final foi tocado nesta fase — só a
  camada de medição.
- UI de consentimento real (banner) permanece para a Fase 28 (LGPD).
- `project_id` em `analytics_events` continua sem população automática (associação via
  `idempotencyKey`, ver `docs/DECISIONS.md`).
