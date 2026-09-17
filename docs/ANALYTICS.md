# ANALYTICS — Funil, Eventos e Conversão

> Fase 17 do roadmap. Documenta a camada de analytics (`lib/analytics/`, `features/analytics/`):
> uma camada única e desacoplada de qualquer provedor, eventos pequenos e sem dado pessoal,
> associados a uma sessão anônima compartilhada com a persistência do Builder (Fase 14). Não é um
> dashboard de marketing nem um sistema de automação comercial — mede o funil já existente, nunca o
> controla. Ver `docs/ANALYTICS-EVENTS.md` para a tabela completa de eventos e
> `docs/IMPLEMENTATION-STAGE-17.md` para o resumo técnico da implementação.

---

## 1. Objetivo

Responder, de forma confiável, às perguntas de negócio que o briefing desta fase listou: quantas
pessoas visitam o site, quantas começam o Builder, qual serviço é mais escolhido, onde as pessoas
abandonam, quantas chegam ao resumo/contato/envio, qual a taxa de conversão, quais origens (UTM)
geram mais leads. Nada além disso — sem fingerprinting, sem dezenas de eventos, sem dashboard
gigantesco, sem automação comercial.

## 2. Princípios

- **A aplicação nunca depende de analytics para funcionar.** A regra é sempre "aplicação faz algo →
  evento é disparado", nunca o inverso. Se todo provedor estiver desligado, mal configurado ou
  falhando, o Builder continua 100% funcional.
- **Componentes nunca conhecem um provedor específico.** Nenhum lugar do código chama `gtag`/`fbq`/
  Supabase diretamente fora de `lib/analytics/providers/*` — todo o resto chama só
  `trackEvent`/`trackFunnelMilestone` (`lib/analytics/trackEvent.ts`).
- **Nunca bloqueia, nunca lança.** Toda chamada de analytics é non-blocking (nenhum `await` no
  caminho de interação do usuário) e nunca propaga uma exceção para quem chamou — nem daqui, nem de
  dentro de um provedor individual.
- **Nunca contém dado pessoal.** Ver Seção 13.

## 3. Camada única

```
lib/analytics/
  events.ts        — contrato de eventos (AnalyticsEventMap) e seus schemas de validação
  consent.ts        — analyticsEnabled / marketingEnabled
  session.ts         — session_id canônico, first-touch (UTM/referrer), marcos "uma vez por sessão"
  trackEvent.ts       — trackEvent / trackFunnelMilestone — o único ponto de entrada
  providers/
    ga4.ts            — Google Analytics 4
    metaPixel.ts       — Meta Pixel
    internal.ts         — Supabase (analytics_events), via Server Action
```

`features/analytics/` tem só o que precisa rodar no App Router: a Server Action de ingestão
(`actions/recordEvent.ts`) e o componente que dispara `page_view`
(`components/AnalyticsPageView.tsx`, montado uma vez em `app/layout.tsx`).

## 4. Eventos

Ver `docs/ANALYTICS-EVENTS.md` para a tabela completa (nome, momento, propriedades, finalidade,
provedor, consentimento, se é conversão). Resumo: 12 eventos implementados, em `snake_case`,
cobrindo o funil VISIT → BUILDER_STARTED → SERVICE_SELECTED → SERVICE_COMPLETED → UPGRADE_REVIEWED
→ CONTACT_STARTED → LEAD_SUBMITTED, mais `service_edited`/`service_removed` (fora do funil linear,
podem acontecer várias vezes) e os eventos de falha (`lead_submit_failed`)/tentativa
(`lead_submit_attempted`).

**Dois eventos do conjunto sugerido pelo briefing não foram implementados nesta fase** — decisão
registrada em `docs/DECISIONS.md`, Fase 17:

- `question_answered` — avaliado e descartado para V1 (volume alto, sem uma pergunta de negócio
  concreta que precise dessa granularidade; `service_selected`/`service_completed` já respondem
  "onde as pessoas abandonam" no nível de serviço/etapa).
- `service_started` — considerado semanticamente igual a `service_selected` neste fluxo (escolher
  um serviço novo já inicia a configuração, sem uma etapa própria de "abrir").

`whatsapp_clicked` existe no contrato de tipos (arquitetura pronta), mas sem nenhum ponto de
disparo real: o site público não tem hoje um botão de WhatsApp para o visitante, e o botão que já
existe (Fase 16, dentro do admin) é uma ação do administrador — disparar o mesmo evento por ali
misturaria o funil público com uma ação interna.

## 5. Contrato de eventos e type safety

`AnalyticsEventMap` (`lib/analytics/events.ts`) relaciona cada nome de evento às propriedades que
ele aceita. `trackEvent("service_selected", { serviceId: "site" })` é válido;
`trackEvent("service_selected", { foo: 1 })` ou `trackEvent("evento_inventado", {})` são erros de
**compilação** — `lib/analytics/events.typecheck.ts` prova isso com `@ts-expect-error` (verificado
a cada `npm run typecheck`, Seção "Testes"). No servidor, o mesmo contrato é reforçado em tempo de
execução: `EVENT_PROPERTIES_SCHEMAS` (Zod, `strictObject`) rejeita qualquer nome desconhecido ou
qualquer propriedade fora do formato exato daquele evento — mesmo que alguém chame a Server Action
`recordEvent` diretamente, sem passar por `trackEvent`.

## 6. Funil

```
VISIT (page_view)
  ↓
BUILDER_STARTED
  ↓
SERVICE_SELECTED  ←→  SERVICE_COMPLETED   (podem se repetir — várias vezes na mesma sessão)
  ↓
UPGRADE_REVIEWED
  ↓
CONTACT_STARTED
  ↓
LEAD_SUBMITTED
```

`service_edited`/`service_removed` não fazem parte da progressão linear — podem acontecer a
qualquer momento com um serviço já configurado. Uma sessão com dois serviços configurados dispara
`service_selected`/`service_completed` duas vezes, mas só UM `upgrade_reviewed` (com
`service_count: 2`) — a sessão inteira continua sendo uma sessão, nunca duas conversões.

**Taxas** (`features/admin/logic/computeFunnelRates.ts`, exibidas na "Visão geral" do admin):
Builder Start Rate (`builder_started / page_view`), Service Completion Rate
(`service_completed / builder_started`), Review Rate (`upgrade_reviewed / builder_started`),
Contact Start Rate (`contact_started / upgrade_reviewed`), Lead Conversion Rate
(`lead_submitted / builder_started`), Visitor Conversion Rate (`lead_submitted / page_view`).
Denominador zero sempre vira `null` (exibido como "—"), nunca `Infinity`/`NaN`.

## 7. `session_id`

Um único id anônimo (`crypto.randomUUID()`) por jornada, agora com um dono canônico:
`lib/analytics/session.ts` (`getOrCreateAnalyticsSession`). Até a Fase 16, o `session_id` só
existia dentro do Builder (`useBuilderSessionPersistence.ts`, Fase 14); esta fase precisa de
`page_view` em qualquer página (Home, `/projetos`), então o id passou a ser gerado/reutilizado por
este módulo site-wide, e o Builder passou a ADOTAR o mesmo id em vez de gerar o seu — satisfazendo
o pedido explícito do briefing ("todos os eventos do mesmo fluxo devem compartilhar o mesmo
session_id"). Guardado em `localStorage` (`upgrade-analytics:session:v1`), TTL de 7 dias (mesma
política já validada na Fase 14 para a sessão do Builder) — nunca um id novo a cada `page_view`, só
quando a sessão expira ou quando "Começar de novo" é usado (é uma jornada anônima diferente por
decisão de produto já tomada na Fase 14).

## 8. UTM e first touch

Capturados na criação da sessão (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`,
`utm_term`), junto com `document.referrer` (só o hostname, nunca a URL inteira) e o caminho de
entrada (`landingPath`). Classificação simples de origem quando não há UTM: `direct` (sem
referrer), `organic` (referrer de um motor de busca comum — heurística pequena e não-exaustiva,
`google.`/`bing.`/`duckduckgo.`/`yahoo.`/`baidu.`/`yandex.`), `referral` (qualquer outro referrer
externo). Sem tentativa de construir um sistema de atribuição avançado (pedido explícito do
briefing).

**Nunca substituído por navegação interna** — o first-touch é capturado uma única vez, na criação
da sessão; visitar `/builder` depois de `/` com UTM só na Home não perde a origem original.

## 9. Providers

Três, atrás da mesma interface (`send(eventName, properties)`, mais `sessionId` para o interno):

- **GA4** (`lib/analytics/providers/ga4.ts`) — recebe todos os 12 eventos (é para isso que existe).
- **Meta Pixel** (`lib/analytics/providers/metaPixel.ts`) — recebe só `lead_submitted`, mapeado
  para o evento padrão `Lead`. Nunca dispara `Lead` para `contact_started` (formulário abriu) nem
  `lead_submit_failed` (submit falhou) — restrição explícita do briefing.
- **Interno** (`lib/analytics/providers/internal.ts`) — grava em `analytics_events`
  (Supabase) via a Server Action `recordEvent`, recebe todos os 12 eventos.

## 10. GA4

Ativo só se `NEXT_PUBLIC_GA4_MEASUREMENT_ID` estiver definida (`.env.example`) — nenhum Measurement
ID foi inventado. Sem a variável, a arquitetura fica pronta e documentada, sem enviar nada e sem
quebrar nada.

## 11. Meta Pixel

Ativo só se `NEXT_PUBLIC_META_PIXEL_ID` estiver definida — nenhum Pixel ID foi inventado. Ver
Seção 9 para o mapeamento restrito de eventos.

## 12. Analytics interno

Tabela `analytics_events` (Supabase, migration `20260918000000_analytics_events.sql`) — permite
responder às perguntas específicas do Builder (funil por etapa, abandono, associação com sessão)
sem depender só do GA4. Escrita exclusivamente pelo servidor (Server Action `recordEvent`, usando o
cliente de SERVICE ROLE — nunca a chave anônima do navegador), então nenhum grant de INSERT
existe para `anon`/`authenticated` na tabela. Leitura só para admins (RLS com `is_admin()`, Fase
16), agregada dentro do próprio Postgres via a função `analytics_overview` (nunca busca linha a
linha para somar no Node — ver Seção 15, "Volume").

## 13. PII (dado pessoal)

Nenhuma propriedade de nenhum evento contém nome, e-mail, telefone, conteúdo de nota ou qualquer
resposta livre — só IDs e categorias fixas (garantido pelo contrato de tipos e reforçado pela
validação estrita no servidor, Seção 5). `idempotencyKey` (em `lead_submitted`) não é dado pessoal
— é um UUID gerado no navegador, sem nenhum significado além de evitar duplicidade de envio (Fase
13). `referrerHost` guarda só o hostname de quem indicou o clique, nunca a URL completa (que
poderia carregar um termo de busca ou outro dado da pessoa que compartilhou o link).

## 14. Consentimento

`lib/analytics/consent.ts` — o MECANISMO (`getConsent`/`setConsent`) já existia desde esta fase,
mas sem nenhuma UI de banner (pedido explícito do briefing da época: aprofundar LGPD só na Fase
28). **Atualizado na Fase LGPD** (Etapa 28) — ver `docs/PRIVACY-LGPD.md` e
`docs/IMPLEMENTATION-STAGE-28.md` para a documentação completa: a UI real
(`features/privacy/components/ConsentBanner.tsx`) foi construída, a decisão passou a ser
persistida (`lib/privacy/consentStorage.ts`) e o padrão dos dois interruptores mudou de
`{analytics: true, marketing: false}` para `{analytics: false, marketing: false}` (privacy by
default — nenhuma categoria não essencial fica ligada antes de uma decisão explícita).

**Essencial × Analytics × Marketing**: a sessão do Builder (persistência local, Fase 14) é
ESSENCIAL — necessária para o próprio funcionamento do produto — e nunca passa por este módulo de
consentimento; só as duas outras categorias (medição de uso, publicidade) passam por ele.

## 15. Abandono

Cada evento de funil carrega `session_id`, então uma consulta simples em `analytics_events`
(contagem de sessões distintas por `event_name`, já feita pela RPC `analytics_overview`) mostra
exatamente onde as sessões param de avançar — "100 sessões começaram, 78 selecionaram um serviço,
61 concluíram..." (exemplo do próprio briefing). Não foi criado nenhum job/processo de "marcar uma
sessão como abandonada depois de X minutos de inatividade" — a Fase 14 já havia preparado
conceitualmente essa estrutura (`lib/persistence/buildAbandonmentSnapshot.ts`), que continua sem
nenhum consumidor real; o funil por contagem de eventos já responde à pergunta de negócio sem
precisar de um processo em segundo plano.

## 16. Métricas administrativas

"Visão geral" (`features/admin/components/AnalyticsOverview.tsx`), dentro da mesma página `/admin`
— funil (7 contagens), 6 taxas de conversão, serviço mais escolhido no período. Período: hoje/7
dias/30 dias (sem date picker, pedido explícito do briefing), num parâmetro de busca próprio
(`analyticsPeriod`) que não colide com os filtros de lead já existentes na mesma URL. Sem gráfico —
só números, no mesmo espírito de "central de oportunidades" da Fase 16.

## 17. Performance

Toda chamada de `trackEvent` é non-blocking: o provider interno chama uma Server Action sem
`await` no caminho de interação (`void recordEvent(...).catch(...)`); GA4/Meta Pixel só empilham no
`dataLayer`/`fbq.queue` deles. Nenhuma tela do Builder espera analytics terminar para avançar.

## 18. Limitações

- `project_id` existe na tabela `analytics_events` (preparado, nullable) mas não é populado em V1
  — a associação sessão → projeto convertido é feita via `properties->>'idempotencyKey'` (ver
  `docs/DECISIONS.md`, Fase 17, para a justificativa completa).
- Sem sincronização em tempo real na "Visão geral" — atualiza só ao recarregar a página (mesma
  limitação já aceita para a lista de leads, Fase 16).
- Heurística de origem `organic` cobre só os motores de busca mais comuns — não é um sistema de
  atribuição completo.
- ~~Sem UI de consentimento real~~ — resolvido na Fase LGPD (Etapa 28): ver
  `docs/PRIVACY-LGPD.md`.
- Migração de sessões existentes: quem já tinha uma sessão do Builder persistida ANTES desta fase
  recebe, na primeira visita depois do deploy, um `session_id` de analytics novo (não o antigo
  salvo em `upgrade-builder:v1`) — uma única descontinuidade de identidade por usuário, sem
  nenhuma perda de dados do projeto em si.
