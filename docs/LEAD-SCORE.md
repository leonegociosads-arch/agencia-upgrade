# LEAD SCORE — Pontuação Comercial Interna

> Fase 15 do roadmap. Documenta o cálculo do Lead Score — exclusivamente interno, nunca exibido ao
> cliente, nunca altera o Builder. Implementação em `features/lead/logic/{leadScoreConfig,
> calculateLeadScore, getLeadScoreTier}.ts`.

---

## 1. Objetivo

Ajudar futuramente a Upgrade a **priorizar comercialmente** os leads recebidos — nada mais. Não é
uma nota de qualidade do cliente, não influencia nenhuma tela pública, não decide nada sozinho.

## 2. O que o score representa

**Potencial comercial + complexidade/valor provável do projeto**, medidos a partir de dados que o
próprio visitante já forneceu no Builder (serviços escolhidos, tipo de site, investimento em
tráfego). Um score alto significa "este projeto, pelo que foi informado, tende a ser maior/mais
valioso e vale atenção comercial prioritária" — nada além disso.

## 3. O que ele NÃO representa

- Qualidade da pessoa, caráter ou "chance real de fechar" — não temos dado para medir isso.
- Capacidade financeira da empresa — não é perguntada, não é inferida.
- Urgência — nenhuma pergunta do Builder pergunta isso; nenhuma foi adicionada só para alimentar o
  score (pedido explícito desta fase).
- Porte da empresa — nunca inferido pelo nome ou domínio do e-mail.
- "Lead ruim" — um score baixo é **prioridade relativa menor no momento**, não um julgamento de
  valor. Por isso a nomenclatura interna evita termos como `BAD_LEAD`/`WORTHLESS`.

## 4. Escala

`0` a `100`, sempre um número inteiro. `score = clamp(soma dos pontos das regras que se aplicam, 0, 100)`.

## 5. Tiers

| Faixa | Tier |
|---|---|
| 0–29 | `LOW` |
| 30–59 | `MEDIUM` |
| 60–79 | `HIGH` |
| 80–100 | `PRIORITY` |

Os identificadores (`LOW`/`MEDIUM`/`HIGH`/`PRIORITY`) são estáveis — uma futura tela administrativa
pode traduzi-los para "Baixo/Médio/Alto/Prioritário" na exibição, sem mudar o valor persistido.
Limites centralizados em `leadScoreConfig.ts` (`LEAD_SCORE_TIER_THRESHOLDS`) — nunca duplicados em
outro arquivo.

## 6. Sinais usados

Só dados do `ProjectSnapshot` confirmado (nunca `serviceDraft`, `leadDraft` ou qualquer estado de
sessão/visual):

- **Quantidade de serviços confirmados** (1, 2 ou 3) — único sinal de "multisserviço" usado (ver
  Seção 8, "por que não também um bônus por combinação").
- **`site_tipo`** (Landing Page / Site Institucional / E-commerce / Plataforma-Sistema / Ainda não
  sei) — a pergunta mais direta sobre a complexidade/valor provável de um projeto de site.
- **`trafego_investimento`** (as 5 faixas reais do Builder) — o sinal comercial mais direto que
  existe hoje.
- **`trafego_experiencia`** (já anunciou antes vs. nunca anunciou) — maturidade comercial,
  dimensão diferente do investimento.
- **`design_servico`** (um dos 5 serviços, ou a combinação via "Montar um pacote").

## 7. Sinais ignorados (e por quê)

- **Nome, e-mail, WhatsApp, empresa, domínio do e-mail** — nenhum dado de contato entra no cálculo;
  a função recebe `ProjectSnapshot`, nem tem acesso a `contact`.
- **Navegador, dispositivo, localização, horário, tempo no site** — nenhum desses dados é
  coletado hoje; não seria confiável mesmo se fosse.
- **`site_recursos`/`site_situacao`** — sinalizam escopo/preço (`PRICE_SIGNAL`,
  `docs/BUSINESS-RULES.md`), não prioridade comercial; pontuá-los de novo aqui duplicaria o sinal já
  capturado por `site_tipo`.
- **`trafego_negocio`/`trafego_destino`** — o tipo de negócio ou o destino do anúncio não
  correlaciona de forma clara com valor/prioridade (um "evento" não é inerentemente maior ou menor
  que "serviços"); incluir seria criar uma regra fraca só para ter mais regras.
- **Abrangência geográfica** (local/regional/nacional) — mencionada em `docs/BUSINESS-RULES.md`
  (versão anterior à simplificação do Builder), mas **não existe mais nenhuma pergunta sobre isso**
  no Builder atual — não há dado real para usar.
- **Urgência, porte da empresa** — não perguntados; não inventados só para o score (pedido
  explícito desta fase).

## 8. Regras

Centralizadas em `features/lead/logic/leadScoreConfig.ts` (`LEAD_SCORE_RULES`) — cada uma com
`ruleId`, `points`, `description` (uso interno) e `condition`. Resumo (pesos completos no arquivo):

| Grupo | Regras |
|---|---|
| Quantidade de serviços | 1 → 6 pontos · 2 → 14 · 3 → 22 |
| Site (`site_tipo`) | Landing Page 5 · Institucional 9 · E-commerce 20 · Plataforma/Sistema 26 · Ainda não sei 4 |
| Tráfego — investimento | até R$1.000 → 6 · R$1.000–3.000 → 12 · R$3.000–5.000 → 20 · acima de R$5.000 → 27 · ainda não sei → 4 |
| Tráfego — experiência | já anunciou antes (qualquer resultado) → +6 |
| Design/Social (`design_servico`) | Identidade Visual 8 · Design p/ Redes Sociais 4 · Gestão de Social Media 10 · Criativos p/ Anúncios 6 · Edição de Vídeo 8 · "Montar um pacote" → 15 (fixo, substitui a soma dos itens individuais) |

**Por que não um bônus adicional de "multisserviço"**: o briefing descrevia duas estratégias
possíveis para o mesmo sinal (contagem de serviços vs. bônus por combinação) e pedia para escolher
uma só. A contagem de serviços já captura integralmente esse sinal; um bônus adicional pontuaria a
mesma característica duas vezes.

**Por que "Montar um pacote" não soma cada item**: o pacote é uma característica própria (o
cliente quer VÁRIOS serviços de design ao mesmo tempo), pontuada como seu próprio bônus fixo — não
como a soma dos pesos individuais de cada serviço incluído, o que inflaria demais um projeto que já
ganha pontos por multisserviço (se Design vier combinado com Site/Tráfego) e por conteúdo do pacote
em si.

**Complexidade duplicada**: não existe hoje nenhuma classificação de complexidade
(`LOW`/`MEDIUM`/`HIGH`/`PREMIUM`) em nenhum outro lugar do código para reutilizar — `site_tipo` já
É, na prática, essa classificação; não há uma segunda camada para duplicar.

## 9. Score version

`LEAD_SCORE_VERSION = 1` (`leadScoreConfig.ts`), persistida em `lead_score_version` junto com cada
lead. Quando as regras mudarem de forma que um score antigo deixe de ser comparável, a versão sobe
— um lead pontuado pela v1 nunca deve ser lido como se tivesse sido calculado pelas regras da v3.

## 10. Breakdown

Cada regra que disparou vira um item `{ ruleId, points }` em `reasons` — a soma de `reasons` é o
score antes do clamp (quando o clamp não é aplicado, os dois valores são idênticos; ver testes).
Persistido como `lead_score_breakdown` (JSONB). Formato técnico/interno de propósito — sem textos
longos, só o suficiente para auditoria futura ("por que 72?").

## 11. Persistência

Colunas em `upgrade_leads` (não uma tabela `projects` separada — ver
`supabase/migrations/20260916000000_add_lead_score_to_upgrade_leads.sql` para a justificativa
completa dessa escolha): `lead_score` (integer, 0–100), `lead_score_tier` (text, um dos 4 valores),
`lead_score_version` (integer), `lead_score_breakdown` (jsonb). Calculado no servidor
(`features/lead/actions/submitLead.ts`), sempre a partir do `project` já validado pelo Zod — nunca
aceito do cliente (Seção 13).

## 12. Recalculação futura

Nenhum job automático criado nesta fase (pedido explícito: "não criar job complexo agora"). Como
`calculateLeadScore` é pura e recebe só o `ProjectSnapshot` (já armazenado em `project`, JSONB, em
cada linha existente), uma futura `recalculateLeadScore(leadId)` é só: ler `project` da linha,
chamar `calculateLeadScore` de novo, sobrescrever as 4 colunas — nenhuma mudança de arquitetura
necessária para isso existir depois.

## 13. Limitações

- Leads gravados antes desta migration ficam com as 4 colunas `NULL` — sem backfill automático.
- Sem painel administrativo ainda para exibir/filtrar por score (Fase 16).
- Pesos calibrados por julgamento (Seção 14), não por dados históricos reais — ainda não existem.
- `idempotencyKey`/retry não recalculam o score de um lead já gravado (o mesmo `project` sempre
  produziria o mesmo score de qualquer forma, então isso não é um problema de consistência, só uma
  observação: o score é fixado no momento do primeiro `insert` bem-sucedido).

## 14. Calibração (perfis simulados, sem dados históricos reais)

| Perfil | Cenário | Score | Tier |
|---|---|---|---|
| A | Landing Page simples | 11 | LOW |
| B | Site Institucional | 15 | LOW |
| C | E-commerce | 26 | LOW |
| D | Plataforma/Sistema ("premium") | 32 | MEDIUM |
| E | Tráfego local, até R$1.000, nunca anunciou | 12 | LOW |
| F | Tráfego acima de R$5.000, já anuncia | 39 | MEDIUM |
| G | Plataforma/Sistema + Tráfego alto (já anuncia) + Gestão de Social Media | 91 | PRIORITY |

Distribuição considerada razoável: nenhum perfil isolado bate o teto, o perfil mais combinado (G)
chega a `PRIORITY` sem saturar em 100, e há diferenciação clara entre um projeto simples (A, 11) e
um combinado e maduro comercialmente (G, 91) — exatamente o "quero diferenciação útil" pedido nesta
fase. Recalibração real (ajustar pesos com base em conversão de vendas de verdade) fica para quando
existirem dados históricos suficientes — nenhuma precisão estatística é fingida agora.
