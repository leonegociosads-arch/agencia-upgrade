# IMPLEMENTATION STAGE 15 — Lead Score

> Fase 15 do roadmap. Implementa uma pontuação interna e determinística por lead
> (`calculateLeadScore`), calculada no servidor a partir do `ProjectSnapshot` já validado, nunca
> exibida ao cliente nem aceita do cliente. Persistida em `upgrade_leads`. Não implementa painel
> administrativo, filtros visuais, dashboard, analytics, WhatsApp/e-mail finais nem UI premium.

---

## 1. Implementação

Três módulos novos em `features/lead/logic/`, mais integração em `submitLead.ts`/`leads.ts` e uma
migration. Ver `docs/LEAD-SCORE.md` para o racional completo de cada regra/peso.

## 2. Arquivos

- `features/lead/logic/leadScoreConfig.ts` — `LEAD_SCORE_VERSION`, `LEAD_SCORE_TIER_THRESHOLDS`,
  `LeadScoreContext`, `LEAD_SCORE_RULES` (18 regras).
- `features/lead/logic/calculateLeadScore.ts` — a função central + `LeadScoreResult`/`LeadScoreReason`.
- `features/lead/logic/getLeadScoreTier.ts` — `LeadScoreTier` + `getLeadScoreTier(score)`.
- `features/lead/actions/submitLead.ts` (alterado) — calcula o score depois de validar o payload.
- `lib/repositories/leads.ts` (alterado) — `createLead` recebe o score já calculado e persiste.
- `supabase/migrations/20260916000000_add_lead_score_to_upgrade_leads.sql` (novo).

## 3. Função central

```ts
calculateLeadScore(snapshot: ProjectSnapshot): {
  score: number;        // 0-100
  tier: "LOW" | "MEDIUM" | "HIGH" | "PRIORITY";
  reasons: { ruleId: string; points: number }[];
  version: number;
}
```

Pura e determinística — sem I/O, sem `Date.now()`, sem aleatoriedade. Recebe `ProjectSnapshot`, não
`LeadPayload` inteiro: dados de contato nunca chegam perto do cálculo.

## 4. Configuração das regras

18 regras em `LEAD_SCORE_RULES`, cada uma com `ruleId` (estável), `points`, `description` (uso
interno) e `condition: (ctx) => boolean`. Somar os `points` das regras cuja `condition` é
verdadeira, depois `clamp(0, 100)`. Nenhum número mágico espalhado pelo resto do código.

## 5. Tiers

`getLeadScoreTier` lê `LEAD_SCORE_TIER_THRESHOLDS` (única fonte dos limites 30/60/80) —
`docs/LEAD-SCORE.md`, Seção 5.

## 6. Integração server-side

```
LeadPayload validado (leadPayloadSchema)
  → calculateLeadScore(parsed.data.project)
  → createLead(parsed.data, leadScoreResult)
```

Tudo dentro de `submitLead.ts` (Server Action) — o repositório (`leads.ts`) só persiste o que
recebe, nunca recalcula nem confia em nada vindo do `payload` para o score.

**Segurança**: `LeadPayload`/`leadPayloadSchema` não declaram nenhum campo de
score/tier/breakdown/version — mesmo que um cliente malicioso injete esses campos no corpo da
requisição, o Zod (modo "strip" por padrão) os descarta antes de `parsed.data` existir. O score
usado é sempre o resultado de `calculateLeadScore` rodando de novo no servidor — testado
explicitamente (Seção 8).

## 7. Migration

`supabase/migrations/20260916000000_add_lead_score_to_upgrade_leads.sql` adiciona `lead_score`
(integer, `check` 0–100), `lead_score_tier` (text, `check` num dos 4 valores), `lead_score_version`
(integer), `lead_score_breakdown` (jsonb) a `upgrade_leads` — não uma tabela `projects` separada
(explicado no próprio arquivo da migration e em `docs/LEAD-SCORE.md`, Seção 11: esta arquitetura
nunca teve uma tabela `projects` própria, o Project Snapshot já vive embutido como JSONB na mesma
linha do lead). Inclui um índice em `lead_score desc` para a futura tela administrativa (Fase 16).
Leads antigos ficam com essas colunas `NULL` — sem backfill automático, como já documentado como
aceitável nesta fase.

## 8. Testes

42 novos/alterados:

- `calculateLeadScore.test.ts` (17) — os cenários Básicos, Tráfego, Múltiplos Serviços, Limites,
  Breakdown, Version, mais determinismo e "nunca pontua contato".
- `getLeadScoreTier.test.ts` (8) — todos os limites de tier pedidos (29/30/59/60/79/80/100).
- `submitLead.test.ts` (+2) — score calculado no servidor corresponde a `calculateLeadScore`
  chamado com o mesmo projeto; score/tier injetados pelo cliente são ignorados.
- `leads.test.ts` (+2, e as 5 existentes ajustadas para a nova assinatura de `createLead`) — score,
  tier, version e breakdown persistidos correspondem exatamente ao resultado calculado.

## 9. Perfis simulados

Ver `docs/LEAD-SCORE.md`, Seção 14 — tabela completa (A a G, scores 11 a 91, LOW a PRIORITY, sem
saturação em 100).

## 10. Calibração aplicada

Pesos ajustados uma vez, comparando a distribuição inicial dos 7 perfis contra o objetivo explícito
desta fase ("não deixar Perfil A perto de Perfil G", "diferenciação útil"). Resultado final: LOW
(11–26) para projetos únicos e simples, MEDIUM (32–39) para um único serviço de alto valor ou bem
financiado, PRIORITY (91) só para a combinação dos três. Nenhuma calibração estatística — apenas
julgamento direto sobre os pesos, como pedido ("não fingir precisão").

## 11. Limitações

Ver `docs/LEAD-SCORE.md`, Seção 13 (leads antigos sem score, sem painel para exibir ainda, pesos
por julgamento não por dados históricos).

**Verificação manual**: sem a migration aplicada no Supabase do usuário, o envio de um lead volta a
falhar (mensagem já conhecida, "Não conseguimos enviar agora...") — confirmado deliberadamente antes
de pedir a migration, para garantir que a falta das colunas nunca produz um crash/500, só o mesmo
erro genérico já tratado desde a Fase 13.

## 12. Pendências para a Etapa 16 (Painel Administrativo / Mini-CRM)

- Exibir `lead_score`/`lead_score_tier`/`lead_score_breakdown` numa tela administrativa (ordenar,
  filtrar, destacar prioridade) — nenhuma UI foi construída nesta fase.
- Autenticação da área administrativa.
- `recalculateLeadScore(leadId)` como ação administrativa explícita, se necessário.
