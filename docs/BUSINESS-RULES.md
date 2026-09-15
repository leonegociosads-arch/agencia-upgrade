# BUSINESS RULES — Regras de Triagem, Resumo e Entrega Comercial

> Fase 5 do roadmap (corrigida). Define a lógica que o Upgrade Builder usa para exibir perguntas
> condicionalmente, validar respostas, montar o resumo do projeto e preparar os dados para a captura de
> lead. Nenhuma regra aqui foi implementada em código.
>
> **Correção de escopo em relação à primeira versão desta fase**: a versão anterior deste documento
> incluía um motor de recomendações automáticas entre serviços (ex.: sugerir Tráfego Pago depois de Site,
> sugerir Identidade Visual depois de Social Media) e uma classificação de prioridade de recomendação
> (`PRIMARY`/`COMPLEMENTARY`/`OPTIONAL`/`WARNING`). **Essa lógica foi removida.** O Upgrade Builder não é
> um consultor automático — ele organiza o interesse do cliente através de uma triagem curta; a análise
> estratégica e qualquer sugestão de serviço adicional é feita posteriormente por uma pessoa da Upgrade,
> não pelo site. O histórico dessa lógica removida (`RECOMMENDATION-RULES.md`, `DIAGNOSTIC-RULES.md`)
> não foi mantido como documentação morta — os arquivos foram excluídos por não terem mais função no
> projeto (ver `docs/DECISIONS.md`, seção "Correção da Fase 5").
>
> **Fonte de verdade dos campos**: todas as regras usam exclusivamente os campos já implementados em
> `lib/builder/config/site.ts`, `trafego.ts` e `design.ts`. Nenhuma pergunta nova foi criada.

---

## 1. Princípios gerais

- **O Builder é uma triagem curta, não um diagnóstico avançado.** Seu papel é organizar o interesse do
  cliente — decidir o que recomendar, complementar ou vender é trabalho humano, feito depois, pelo time
  comercial da Upgrade.
- **Nenhuma recomendação automática de serviço é exibida durante o Builder.** Se o cliente quiser mais de
  um serviço, ele adiciona manualmente pelo "Meu Upgrade" — o sistema nunca sugere isso por conta própria.
- **Determinismo nas perguntas, não nas vendas**: a única inteligência do Builder é decidir *quais
  perguntas mostrar* e *quando uma resposta invalida outra* — nunca decidir *o que mais vender*.
- **A linguagem do sistema é neutra e informativa, nunca comercial** — ele confirma o que foi entendido
  ("Recebemos o que você procura"), não avalia ("Você precisa disso").
- **Nenhum preço e nenhuma pontuação são calculados nesta fase.** Sinais (`PRICE_SIGNAL`,
  `LEAD_SCORE_SIGNAL`) são apenas identificados como metadados para uso futuro — eles não alteram o
  fluxo, não mudam perguntas e não influenciam nada que o cliente vê.

## 2. Regras de exibição e dependência entre perguntas

Princípio único, válido para as 3 categorias: **uma pergunta só é exibida se a resposta anterior tornar
essa pergunta relevante; uma pergunta deixa de ser exibida quando a resposta que a habilitava muda.**
Isso é lógica de triagem (organizar o que perguntar), não lógica comercial.

### Sites e Desenvolvimento

```
site_tipo
   ↓
SE site_tipo ≠ nao_sei → mostrar site_recursos (opções variam conforme site_tipo)
SE site_tipo = nao_sei → não mostrar site_recursos (nenhuma pergunta técnica extra)
   ↓
site_situacao (sempre exibida, igual para todos os tipos)
```

Exemplo de dependência (conforme o próprio briefing desta fase): se `site_tipo = ecommerce`, faz sentido
perguntar sobre recursos de venda (catálogo, pagamento); se `site_tipo = sistema_plataforma`, faz
sentido perguntar sobre login/integrações. Isso é triagem — ajuda a entender o que a pessoa quer, não é
recomendação de outro serviço.

### Tráfego Pago

Fluxo fixo, sem dependência entre perguntas: `trafego_negocio` → `trafego_destino` →
`trafego_experiencia` → `trafego_investimento`, sempre nessa ordem, sempre as 4 (a quarta pergunta foi
adicionada no alinhamento pré-Etapa 8 — ver `docs/DECISIONS.md`). `trafego_investimento` pergunta o
investimento mensal em mídia paga, não o orçamento do projeto — é informação operacional específica de
Tráfego Pago, da mesma natureza de `site_recursos` para Site.

### Design / Social Media

```
design_servico (um serviço ou uma combinação)
   ↓
Cada serviço escolhido habilita suas próprias 2 perguntas (ver docs/USER-FLOW.md, Seção 5)
   ↓
SE dois serviços combinados compartilham uma pergunta idêntica (ex.: marca_identidade)
→ ela é exibida apenas uma vez, reaproveitada entre os dois
```

Essa deduplicação (`resolveDesignSteps`) é uma decisão do próprio cliente, que escolheu combinar
serviços manualmente — não é o sistema recomendando nada, é apenas evitar perguntar a mesma coisa duas
vezes.

## 3. Validações e alertas de consistência

Diferente de recomendação (sugerir outro serviço), validação é **checar se as respostas dadas dentro do
mesmo serviço fazem sentido entre si**. Nunca bloqueia o avanço — apenas avisa, de forma neutra, e deixa
o cliente decidir se quer ajustar.

```
VALIDAÇÃO SITE-01
SE site_tipo = ecommerce
E site_recursos não inclui nem catalogo_pedidos nem pagamento_online
ENTÃO avisar: "Você escolheu Loja Virtual / E-commerce, mas não marcou catálogo nem pagamento online —
     pretende vender diretamente pelo site, ou o foco é outro?"
     (não bloqueia; o cliente pode manter a resposta como está)

VALIDAÇÃO DESIGN-01
SE design_servico inclui, ao mesmo tempo, design_redes_sociais E gestao_social_media
     (via "Montar um pacote")
ENTÃO avisar: "Gestão de Social Media já inclui a produção das artes — normalmente não é necessário
     contratar os dois juntos. Quer mesmo manter as duas opções?"
     (não bloqueia; pode ser um caso legítimo, ex.: reforço pontual de artes)
```

> Nota: a validação de Tráfego Pago sobre e-commerce/WhatsApp e as regras de abrangência × orçamento de
> mídia da versão anterior deste documento foram removidas junto com o motor de recomendação — eram, na
> prática, uma orientação estratégica ("considere vender pela loja também"), o que passou a ser papel do
> atendimento humano, não do Builder.

## 4. Invalidação em cascata (resposta que deixa de valer)

Regra geral, já registrada em `docs/USER-FLOW.md` (Seção 9): se uma resposta anterior é alterada durante
uma edição e isso torna uma resposta posterior incompatível, **apenas a resposta dependente da mesma
categoria é apagada** — nunca as respostas de outra categoria.

```
Exemplo: site_tipo estava ecommerce, com site_recursos = [pagamento_online, area_cliente].
Cliente edita site_tipo para landing_page.
→ site_recursos é apagado (as opções de e-commerce não existem em Landing Page).
→ site_situacao, e qualquer configuração de Tráfego Pago ou Design, permanecem intactos.
```

## 5. Como um serviço é considerado concluído

Um mini-fluxo está concluído quando não há mais nenhuma pergunta pendente para as respostas já dadas
(ex.: `site_tipo` + `site_recursos` + `site_situacao` todos respondidos). Não existe uma etapa separada
de "confirmar e adicionar" — a conclusão do mini-fluxo **é** o que adiciona o serviço ao "Meu Upgrade".

## 6. Como os serviços entram no "Meu Upgrade"

Automaticamente, no momento da conclusão (Seção 5). Cada categoria (Site, Tráfego Pago, Design/Social)
aceita uma configuração principal por projeto; o "Meu Upgrade" pode conter 1, 2 ou os 3 serviços, sempre
adicionados manualmente pelo cliente — nunca sugeridos pelo sistema.

## 7. Dependências técnicas dos serviços

Classificação usada apenas para descrever o que cada serviço tecnicamente pressupõe — não é uma
recomendação de contratar outro serviço da Upgrade, é só organização do escopo:

- `REQUIRED` — necessário para a solução funcionar.
- `OPTIONAL` — complemento, não afeta o funcionamento central.
- `EXTERNAL` — depende de um serviço/decisão fora do escopo direto da Upgrade (ex.: conta em gateway de
  pagamento do próprio cliente).

| Serviço | Dependência | Classificação |
|---|---|---|
| E-commerce | Catálogo de produtos | `REQUIRED` |
| E-commerce | Pagamento online | `REQUIRED` |
| E-commerce | Logística/frete | `EXTERNAL` |
| E-commerce | Área do cliente | `OPTIONAL` |
| Sistema/Plataforma | Login/autenticação | `REQUIRED` se `site_recursos` incluir `login_area_restrita` |
| Sistema/Plataforma | Integração com outro sistema | `EXTERNAL` |
| Gestão de Social Media | Contas de redes sociais já existentes | `EXTERNAL` |

> A versão anterior desta tabela incluía uma linha ligando Tráfego Pago a "Site publicado
> (`RECOMMENDED`)" — removida por ser, na prática, a mesma lógica de recomendação cruzada já eliminada.

## 8. Sinais de complexidade interna

Escala: `LOW`, `MEDIUM`, `HIGH`, ou `UNDETERMINED` quando não há informação suficiente. Não exibida ao
cliente — uso interno para organização e, futuramente, estimativa.

### Sites

| `site_tipo` | Complexidade-base | Ajuste por `site_recursos` |
|---|---|---|
| `landing_page` | `LOW` | Sobe para `MEDIUM` se incluir `integracoes_ferramentas` ou `agendamento_orcamento`. |
| `site_institucional` | `LOW` | Sobe para `MEDIUM` se incluir `integracoes_ferramentas` ou 3+ opções marcadas. |
| `ecommerce` | `MEDIUM` | Sobe para `HIGH` se incluir `integracoes_estoque_pagamentos`, ou 3+ das 4 opções marcadas. |
| `sistema_plataforma` | `HIGH` | Permanece `HIGH`. |
| `nao_sei` | `UNDETERMINED` | Não classificar precocemente. |

### Tráfego Pago

| Situação | Complexidade-base |
|---|---|
| `trafego_destino = whatsapp` | `LOW` |
| `trafego_destino = site_landing_page` ou `delivery_plataforma` | `MEDIUM` |
| `trafego_destino = loja_virtual` ou `trafego_negocio = ecommerce` | `HIGH` |

### Design / Social Media

| Serviço | Campo decisivo | `LOW` | `MEDIUM` | `HIGH` |
|---|---|---|---|---|
| Identidade Visual | `identidade_escopo` | `identidade_essencial` | `identidade_completa` | — |
| Design para Redes Sociais | `design_formato` | `pacote_artes`, `campanha_especifica` | `conteudo_recorrente` | — |
| Gestão de Social Media | `social_necessidade` | — | `planejamento_conteudo`, `criacao_recorrente` | `gestao_completa` |
| Criativos para Anúncios | `criativos_formato` + `criativos_material` | `imagens` + `tenho_tudo` | `videos`/`imagens_videos` | qualquer formato + `preciso_desenvolver` |
| Edição de Vídeo | `video_material` | `videos_gravados`, `videos_fotos` | `fotos_imagens` | `criar_materiais_graficos` |

Quando `design_servico` é uma combinação, a complexidade do projeto de Design é o maior nível entre os
serviços combinados.

## 9. `PRICE_SIGNAL`

Mantido apenas como metadado interno — não calcula preço, não é mostrado ao cliente, e **não influencia
nenhuma pergunta ou recomendação**.

| Campo | Valor | Sinal |
|---|---|---|
| `site_tipo` | qualquer | `PRICE_SIGNAL` (fator base de escopo) |
| `site_recursos` | cada opção marcada | `PRICE_SIGNAL` (soma de escopo) |
| `site_situacao` | `refazer` | `PRICE_SIGNAL` (possível migração de conteúdo) |
| `trafego_destino` | `loja_virtual` | `PRICE_SIGNAL` (setup de campanha de e-commerce é mais elaborado) |
| `trafego_investimento` | qualquer valor informado | `PRICE_SIGNAL` (indica a faixa de investimento em mídia que o cliente já tem em mente) |
| `design_formato` | `conteudo_recorrente` | `PRICE_SIGNAL` (indica recorrência mensal) |
| `social_necessidade` | `gestao_completa` | `PRICE_SIGNAL` (maior escopo de gestão) |
| `criativos_formato` | `imagens_videos` | `PRICE_SIGNAL` (dois formatos = mais produção) |
| `criativos_material` | `preciso_desenvolver` | `PRICE_SIGNAL` (trabalho adicional de base de marca) |
| `video_material` | `criar_materiais_graficos` | `PRICE_SIGNAL` (produção do zero) |
| Nº de serviços no "Meu Upgrade" | 2 ou mais | `PRICE_SIGNAL` (projeto combinado) |

## 10. `LEAD_SCORE_SIGNAL`

Mantido apenas como metadado interno para uma fase futura (Fase 15). **Nesta fase, esses sinais não são
usados para nada** — não mudam perguntas, não geram recomendação, não alteram prioridade visível.

| Campo | Valor | Sinal |
|---|---|---|
| `site_tipo` | `ecommerce` ou `sistema_plataforma` | `LEAD_SCORE_SIGNAL` |
| `site_recursos` | inclui `formularios_leads`/`agendamento_orcamento` | `LEAD_SCORE_SIGNAL` |
| `site_tipo` | `nao_sei` | `LEAD_SCORE_SIGNAL` |
| `trafego_experiencia` | `anuncio_atualmente` / `anunciei_algumas_vezes` | `LEAD_SCORE_SIGNAL` |
| `trafego_experiencia` | `anunciei_sem_resultado` | `LEAD_SCORE_SIGNAL` |
| `trafego_negocio` | `evento` | `LEAD_SCORE_SIGNAL` |
| `trafego_investimento` | `de_3000_a_5000` ou `acima_5000` | `LEAD_SCORE_SIGNAL` (maior investimento em mídia sinaliza operação maior) |
| `design_servico` | é uma lista (combinação) | `LEAD_SCORE_SIGNAL` |
| Quantidade de categorias no "Meu Upgrade" | 2 ou 3 | `LEAD_SCORE_SIGNAL` |

## 11. Resumo final

O resumo apenas **compila o que o cliente informou** — não analisa, não classifica, não sugere.

```
MEU UPGRADE

SITE
  Site Institucional
  [demais respostas relevantes de site_recursos/site_situacao, em linguagem simples]

TRÁFEGO PAGO
  [respostas relevantes de trafego_negocio/trafego_destino/trafego_experiencia/trafego_investimento]

DESIGN
  [serviço(s) escolhido(s) e suas respostas]
```

Cada serviço mostra suas respostas-chave, na mesma linguagem simples usada durante o Builder (sem
jargão técnico). Ações disponíveis no resumo: editar, remover, voltar, seguir para contato — nenhuma
delas envolve uma sugestão de novo serviço.

## 12. Preparação de dados para captura de lead

Ao seguir do resumo para o contato, o Builder precisa reunir, conceitualmente, um pacote de dados
pronto para ser salvo (implementação real pertence à Fase 12/13):

- Serviços configurados (categoria + respostas de cada um).
- `PRICE_SIGNAL` e `LEAD_SCORE_SIGNAL` associados (metadados, não exibidos).
- Origem da sessão (Home, menu, campanha, URL direta — ver `USER-FLOW.md`, Seção 2).
- Dados de contato (nome, empresa, WhatsApp, e-mail, Instagram/site atual opcional).

Nenhum desses dados é usado para decidir o que mostrar ao cliente — servem só para a entrega comercial
(Seção 13) e para análise humana posterior.

## 13. Entrega comercial

O papel do Builder termina ao entregar um projeto compilado — a análise estratégica é sempre humana.

```
Resumo → Contato → Validação → Envio → Lead criado (preparado para salvar no Supabase, Fase 13)
   ↓
Confirmação: "Recebemos o que você procura." (nunca "Você precisa disso.")
   ↓
CTA possível (planejado, não implementado agora): "Falar com a Upgrade pelo WhatsApp"
   → gera uma mensagem pré-preenchida com o resumo do projeto, ex.:
     "Olá! Montei meu projeto pelo site da Upgrade. Tenho interesse em: Site Institucional + Tráfego
     Pago. [resumo]. Gostaria de receber um retorno."
```

**Regra de ordem importante**: o lead deve ser considerado salvo (ou preparado para salvar) **antes** de
qualquer redirecionamento ao WhatsApp — para não perder o interesse do cliente caso ele abra o WhatsApp e
não chegue a enviar a mensagem. O envio ao WhatsApp é uma continuidade comercial opcional, não o momento
em que o lead passa a existir.

Depois da entrega, cabe à Upgrade (pessoa, não sistema): analisar o projeto, entrar em contato,
recomendar ajustes, apresentar orçamento, marcar reunião. Nada disso é responsabilidade do Builder.

## 14. Casos especiais

- **`site_tipo = nao_sei`**: nenhuma pergunta técnica extra é feita; o serviço ainda é considerado
  concluído normalmente ao final de `site_situacao`, sem qualquer tentativa de classificar ou recomendar
  algo a partir disso.
- **Projeto vazio**: "Finalizar projeto" fica indisponível enquanto não houver ao menos um serviço
  concluído no "Meu Upgrade" (ver `USER-FLOW.md`, Seção 10 e 22).
- **Cliente indeciso**: não existe uma árvore de diagnóstico. A saída prevista é simples — um convite
  direto a falar com a Upgrade (ver `docs/USER-FLOW.md`, Seção 12, e `docs/DECISIONS.md`).
