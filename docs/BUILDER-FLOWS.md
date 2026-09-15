# BUILDER FLOWS — Perguntas e Ramificações do Upgrade Builder

> Fase 3 do roadmap. Este documento define a lógica completa de perguntas, ramificações, recomendações
> e comportamento de navegação do Upgrade Builder, com base no catálogo aprovado em
> `docs/SERVICES-MAP.md` e nos princípios de `docs/PROJECT-OVERVIEW.md`. Nenhum componente, página,
> banco de dados ou animação é implementado aqui — apenas a lógica.
> A lista completa e estruturada de cada pergunta está em `docs/BUILDER-QUESTIONS.md`; este documento
> descreve o fluxo narrativo e as regras de ramificação.
>
> **Correção de escopo (Fase 5)**: onde este documento trata "Ainda não sei o que preciso" como uma
> quarta entrada principal de mesmo peso que as outras três, isso está corrigido — não existe quarta
> categoria. Também não existe mais o motor de recomendações cruzadas entre serviços descrito nas
> Seções 6/11 abaixo, nem a função de diagnóstico com perguntas e recomendação automática de categoria
> (Seção 6) — ambos foram avaliados e descartados na revisão final da Fase 5 por deixarem o Builder
> parecido com um consultor automático. A função oficial para o visitante indeciso hoje é apenas um link
> simples ("Fale com a Upgrade", sem pergunta nem recomendação) — ver `docs/USER-FLOW.md`, Seção 12. O
> conteúdo das Seções 6/11 abaixo permanece só como registro histórico do raciocínio original, não como
> comportamento ativo do Builder.
>
> **Nota adicional**: este documento é a proposta conceitual original da Fase 3. O Upgrade Builder
> realmente implementado em código usa um conjunto de perguntas mais enxuto e, em alguns pontos,
> diferente (ver `docs/USER-FLOW.md`, seção "Nota sobre BUILDER-FLOWS.md e BUILDER-QUESTIONS.md"). Para
> o comportamento real do Builder, `lib/builder/config/*.ts` prevalece sobre este documento.

---

## 1. Princípios das perguntas

- **Regra de existência**: uma pergunta só existe se sua resposta alterar pelo menos um destes pontos:
  necessidade, solução recomendada, complexidade, escala, estratégia, investimento, qualificação
  comercial, ou a próxima pergunta. Toda pergunta deste documento foi checada contra essa regra.
- **Meta de quantidade**: 3 a 6 perguntas por serviço configurado; ramificações específicas podem somar
  1–2 perguntas extras quando o ganho de informação justificar.
- **Linguagem simples**: nenhuma pergunta usa termos técnicos de marketing/tecnologia sem tradução
  direta em situação prática (ver exemplos na Seção 9 de `PROJECT-OVERVIEW.md` e nos exemplos abaixo).
- **Sensação de montagem, não de questionário**: cada resposta é tratada visualmente/narrativamente
  como uma peça sendo encaixada no projeto, nunca como um campo de formulário sendo preenchido.
- **Toda pergunta tem uma saída "não sei"** sempre que a incerteza for uma resposta comercialmente
  plausível (ex.: "ainda não sei", "não defini") — isso evita travar o visitante e ainda assim gera
  informação útil (sinaliza menor maturidade/prioridade comercial).

## 2. Fluxo global

```
[Tela inicial: 3 entradas principais + 1 função auxiliar]
   1. Sites e Desenvolvimento
   2. Tráfego Pago
   3. Design / Social Media
   (secundário) "Me ajude a descobrir" → diagnóstico → recomenda uma ou mais das 3 acima
        │
        ▼
[Fluxo de perguntas da entrada escolhida]
        │
        ▼
[Tela de confirmação do serviço configurado]
   → Adicionar ao "Meu Upgrade"
   → Editar respostas antes de adicionar
   → Descartar e voltar à escolha de entrada
        │
        ▼
[Serviço adicionado ao "Meu Upgrade"]
        │
        ▼
[Pergunta de continuidade: "Quer configurar outro serviço?"]
   → Sim → volta para [Tela inicial: 3 entradas] (estado do Meu Upgrade preservado)
   → Não → [Resumo do projeto] → [Captura de dados de contato] → [Conversão em lead]
```

Regras globais válidas para todas as categorias:

- SE visitante sair no meio de um fluxo (fecha/abandona) → nada é adicionado ao "Meu Upgrade"; apenas
  o serviço já confirmado anteriormente permanece.
- SE visitante volta uma pergunta → respostas seguintes daquele mini-fluxo são preservadas até serem
  efetivamente alteradas (evita perder progresso por um "voltar" acidental).
- SE visitante edita um serviço já adicionado → o mini-fluxo correspondente reabre com todas as
  respostas anteriores pré-preenchidas, posicionado na última pergunta, com possibilidade de voltar
  ainda mais para alterar respostas anteriores.
- O "Meu Upgrade" é visível/acessível durante todo o processo, mesmo em um fluxo de perguntas em
  andamento — não apenas nas transições.

## 3. Fluxo completo — Sites e Desenvolvimento

### Estrutura

```
site_tipo
├── landing_page → lp_objetivo → lp_vai_anunciar → lp_integracao → site_experiencia → confirmação
├── institucional → inst_objetivo → inst_tamanho → inst_venda_online → inst_integracao → site_experiencia → confirmação
├── ecommerce → ecom_qtd_produtos → ecom_pagamento → ecom_frete → ecom_marketplace → site_experiencia → confirmação
├── sistema → sys_area_privada → [sys_tipos_usuario] → sys_integracao → sys_pagamento → site_experiencia → confirmação
└── nao_sei → redireciona para o fluxo de diagnóstico (Seção 6)
```

### Decisão de estrutura importante

A pergunta inicial `site_tipo` **não inclui** "Site Comercial" nem "Site Premium/Interativo" como
opções — conforme decidido na Fase 2 (`DECISIONS.md`):

- O objetivo comercial vs. institucional é capturado por `inst_objetivo`, dentro do caminho
  "Site Institucional", não como um tipo de site separado.
- O nível "Premium/Interativo" é capturado por `site_experiencia`, uma pergunta **transversal aplicada
  ao final de qualquer um dos quatro caminhos**, não como um quinto tipo de site.

### Ramificações

```
SE site_tipo = landing_page
→ pular todas as perguntas sobre login, produtos, área privada e pagamento recorrente

SE site_tipo = institucional E inst_venda_online = sim
→ recomendar (não forçar) reavaliação para E-commerce, ou adicionar E-commerce como serviço
  complementar no "Meu Upgrade"

SE site_tipo = ecommerce
→ perguntar ecom_qtd_produtos, ecom_pagamento, ecom_frete, ecom_marketplace

SE site_tipo = sistema
→ perguntar sys_area_privada
   SE sys_area_privada = sim
   → perguntar sys_tipos_usuario
   SE sys_area_privada = não
   → pular sys_tipos_usuario

SE site_tipo = nao_sei
→ encaminhar para o fluxo de diagnóstico (Seção 6), sem repetir perguntas já respondidas
```

### Recomendações possíveis geradas por este fluxo

- `landing_page` + `lp_vai_anunciar = sim` → recomendar **Tráfego Pago** como complementar.
- `institucional` sem identidade visual prévia (pergunta não feita aqui, mas cruzada com estado da
  sessão — ver Seção 13) → recomendar **Identidade Visual**.
- `ecommerce` → recomendar **Tráfego Pago** e **Criativos para Anúncios** como complementares.
- `sistema` → recomendar **Site Institucional** como complementar (para apresentar o sistema).

### Quantidade de perguntas por caminho

| Caminho | Perguntas | Total |
|---|---|---|
| Landing Page | site_tipo, lp_objetivo, lp_vai_anunciar, lp_integracao, site_experiencia | 5 |
| Site Institucional | site_tipo, inst_objetivo, inst_tamanho, inst_venda_online, inst_integracao, site_experiencia | 6 |
| E-commerce | site_tipo, ecom_qtd_produtos, ecom_pagamento, ecom_frete, ecom_marketplace, site_experiencia | 6 |
| Sistema (sem área privada) | site_tipo, sys_area_privada, sys_integracao, sys_pagamento, site_experiencia | 5 |
| Sistema (com área privada) | + sys_tipos_usuario | 6 |

## 4. Fluxo completo — Tráfego Pago

### Estrutura

```
traf_divulgar → traf_objetivo → traf_abrangencia → traf_ja_anuncia → traf_investimento → confirmação
```

Fluxo único e linear (sem ramificações profundas), conforme decisão da Fase 2 de manter Tráfego Pago
como serviço único. As variações por tipo de negócio, objetivo, plataforma e abrangência — citadas no
mapa de serviços como "eixos futuros" — foram transformadas exatamente nestas cinco perguntas.

### Simplificação aplicada

O briefing desta fase sugeria uma pergunta "já anuncia? (sim/não)" seguida de uma pergunta separada
"qual plataforma atual?". Essas duas foram **fundidas em uma única pergunta** (`traf_ja_anuncia`), cujas
próprias opções já indicam a plataforma quando a resposta é afirmativa (ex.: "sim, uso Meta Ads").
Isso preserva 100% da informação com uma pergunta a menos — mantendo o fluxo em 5 perguntas em vez de 6.

### Ramificações

```
SE traf_objetivo = vender_online E nenhum serviço de Site/E-commerce estiver no "Meu Upgrade"
→ recomendar Landing Page ou E-commerce como complementar

SE traf_objetivo = whatsapp OU gerar_leads
→ recomendar Landing Page como destino do anúncio, se ainda não houver site no "Meu Upgrade"

SE traf_ja_anuncia ≠ nao
→ nenhuma pergunta extra é necessária (a plataforma já veio embutida na resposta)

SE traf_divulgar = evento
→ nenhuma pergunta extra; traf_abrangencia e traf_objetivo já cobrem o necessário
```

### Recomendações possíveis geradas por este fluxo

- Sem site/landing page no projeto → recomendar Site/Landing Page.
- `traf_objetivo` voltado a vendas/produto → recomendar Criativos para Anúncios.

### Quantidade de perguntas

5 perguntas fixas, sempre. Nenhum caminho ultrapassa isso — é o fluxo mais previsível do catálogo.

## 5. Fluxo completo — Design / Social Media

### Estrutura

```
design_necessidade
├── identidade_visual → iv_tem_marca → iv_aplicacoes → confirmação
├── design_redes_sociais → drs_tem_identidade → drs_volume → drs_formatos → confirmação
├── gestao_social_media → gsm_tem_identidade → gsm_canais → gsm_producao_conteudo → gsm_frequencia → confirmação
├── criativos_anuncios → crt_uso_anuncios → crt_formato → confirmação
├── video_reels → video_finalidade → video_material_bruto → confirmação
│                    (video_finalidade determina se o vídeo é anexado como parte de
│                     Gestão de Social Media, de Criativos para Anúncios, ou ambos)
├── pacote_completo → encadeia automaticamente: Identidade Visual → Gestão de Social Media →
│                      Criativos para Anúncios (ver nota abaixo)
└── nao_sei → redireciona para o fluxo de diagnóstico (Seção 6)
```

### Nota sobre "pacote completo"

Conforme decidido na Fase 2, um "Pacote Completo" **não é um serviço catalogado** — é um atalho de
experiência. Ao escolher essa opção, o visitante é conduzido, em sequência, pelos três mini-fluxos reais
(Identidade Visual, Gestão de Social Media, Criativos para Anúncios), com uma pergunta já eliminada por
dependência (ver Seção 13: se `iv_tem_marca` já foi respondida, `gsm_tem_identidade` não é repetida).
Ao final, os três serviços são adicionados ao "Meu Upgrade" como itens independentes e editáveis — não
como um pacote fixo.

### Diferença comunicada entre "Design para Redes Sociais" e "Gestão de Social Media"

A própria primeira pergunta (`design_necessidade`) já separa as duas com descrições curtas (ver
`BUILDER-QUESTIONS.md`), evitando que o visitante escolha por engano. Adicionalmente:

```
SE design_necessidade = design_redes_sociais E, na mesma sessão, gestao_social_media também for
selecionado
→ exibir aviso não bloqueante: "Você já contratou Gestão de Social Media, que inclui a produção das
  artes — normalmente não é necessário contratar os dois juntos." Visitante pode prosseguir mesmo assim.
```

### Ramificações

```
SE drs_tem_identidade = não OU gsm_tem_identidade = não
→ recomendar Identidade Visual como complementar

SE crt_uso_anuncios = sim E Tráfego Pago não estiver no "Meu Upgrade"
→ recomendar Tráfego Pago como complementar

SE video_finalidade = organico
→ anexar o vídeo ao contexto de Gestão de Social Media
SE video_finalidade = anuncios
→ anexar o vídeo ao contexto de Criativos para Anúncios
SE video_finalidade = ambos
→ anexar a ambos
```

### Quantidade de perguntas por caminho

| Caminho | Perguntas | Total |
|---|---|---|
| Identidade Visual | design_necessidade, iv_tem_marca, iv_aplicacoes | 3 |
| Design para Redes Sociais | design_necessidade, drs_tem_identidade, drs_volume, drs_formatos | 4 |
| Gestão de Social Media | design_necessidade, gsm_tem_identidade, gsm_canais, gsm_producao_conteudo, gsm_frequencia | 5 |
| Criativos para Anúncios | design_necessidade, crt_uso_anuncios, crt_formato | 3 |
| Vídeos/Reels | design_necessidade, video_finalidade, video_material_bruto | 3 |
| Pacote completo (3 serviços encadeados, com 1 pergunta economizada por dependência) | — | 8 (soma de 3 fluxos, não um único caminho de 3–6) |

## 6. Fluxo completo — "Me ajude a descobrir" (função auxiliar, não categoria principal)

### Estrutura

```
diag_problema
├── mais_clientes → diag_tem_site → diag_ja_anuncia → recomendação
├── nao_aparece_internet → diag_tem_site → diag_tem_marca → recomendação
├── marca_amadora → diag_tem_marca → recomendação
├── redes_fracas → diag_situacao_redes → recomendação
├── sem_site → diag_intencao_site → recomendação
├── site_antigo_ruim → diag_natureza_problema_site → recomendação
├── visitas_sem_contato → diag_ja_anuncia → recomendação
├── quero_vender → diag_tem_site → diag_qtd_produtos_intencao → recomendação
├── profissionalizar → diag_tem_marca → diag_tem_site → recomendação
├── crescer_regioes → diag_abrangencia → recomendação
└── outro → campo curto opcional de texto → encaminhamento comercial direto (sem recomendação automática)
```

Cada ramo usa no máximo 2 perguntas de acompanhamento (a maioria usa 1), respeitando o limite do
briefing de "no máximo 2 ou 3 perguntas adicionais".

### Tabela de recomendação (problema → perguntas → serviços sugeridos)

| Problema | Perguntas extras | Recomendação típica |
|---|---|---|
| Preciso conseguir mais clientes | tem site? / já anuncia? | Tráfego Pago + Site ou Landing Page (se não tiver) |
| Minha empresa quase não aparece na internet | tem site? / tem marca? | Site Institucional + Identidade Visual (se faltar) |
| Minha marca parece amadora | tem marca? | Identidade Visual + Design para Redes Sociais |
| Minhas redes sociais estão fracas | posta pouco ou nada? | Gestão de Social Media (ou Design para Redes Sociais, se só falta arte) |
| Não tenho site | quer vender ou atrair contato? | Landing Page, Site Institucional ou E-commerce, conforme resposta |
| Meu site está antigo ou ruim | o problema é aparência, uso ou resultado? | Site Institucional (redesign) + tier Premium/Interativo se for aparência |
| Recebo visitas mas poucas pessoas entram em contato | já anuncia? | Revisão de Site/Landing Page + Tráfego Pago (qualificação de público) |
| Quero vender pela internet | tem site? / quantos produtos? | E-commerce + Tráfego Pago |
| Quero profissionalizar minha presença digital | tem marca? / tem site? | Identidade Visual + Site Institucional |
| Quero crescer para outras regiões | qual região? | Tráfego Pago (abrangência ampliada) |
| Outro | (texto livre curto) | Sem recomendação automática — sinalizado para contato comercial direto |

### Regra central do diagnóstico

```
SE diag_problema aponta para 1 ou mais categorias
→ ao final das perguntas extras, exibir uma recomendação explícita (não uma pergunta técnica) do tipo:
  "Pelo que você nos contou, o combo mais indicado é: [Serviço A] + [Serviço B]."
→ visitante pode aceitar a recomendação (o que abre cada mini-fluxo já com contexto pré-carregado,
  reduzindo perguntas repetidas — ver Seção 13) ou ignorá-la e escolher outra entrada manualmente.

SE diag_problema = outro
→ não gerar recomendação automática; oferecer campo curto opcional e destacar que a Upgrade fará
  contato para entender melhor (qualificação manual, fora do escopo do motor de regras).
```

### Quantidade de perguntas

Entre 2 e 4 perguntas (diag_problema + 1–2 extras + tela de recomendação), sempre abaixo do teto de 6 —
o diagnóstico é propositalmente o caminho mais curto do sistema, já que seu papel é direcionar, não
configurar em detalhe (o detalhamento acontece nos mini-fluxos recomendados, que o visitante pode
aceitar ou não).

## 7. Perguntas

Ver `docs/BUILDER-QUESTIONS.md` para a lista estruturada completa (ID, categoria, texto, tipo, opções,
condição, dependências, impacto, obrigatoriedade, padrão).

## 8. Respostas possíveis

Cada pergunta define seu próprio conjunto fechado de opções (single_choice ou multi_choice), sempre
incluindo uma saída de incerteza ("ainda não sei" / "não defini") quando aplicável. Ver
`BUILDER-QUESTIONS.md` para o conjunto completo por pergunta.

## 9. Condições

Toda pergunta que não é a primeira de seu fluxo carrega uma condição de exibição, expressa no formato
`SE <pergunta_anterior> = <valor> → mostrar`. Perguntas sem condição (ex.: `site_tipo`, `traf_divulgar`,
`design_necessidade`, `diag_problema`) são sempre exibidas como ponto de entrada de sua categoria. As
condições completas de cada pergunta estão listadas individualmente em `BUILDER-QUESTIONS.md`.

## 10. Ramificações

Consolidadas por categoria nas Seções 3–6 acima, no formato `SE condição → ação` (mostrar pergunta,
pular pergunta, ou recomendar serviço).

## 11. Recomendações possíveis

Resumo consolidado de todas as recomendações cruzadas entre categorias (independente de qual fluxo o
visitante iniciou primeiro):

| Situação detectada | Recomendação |
|---|---|
| Landing Page/E-commerce sem Tráfego Pago no projeto | Sugerir Tráfego Pago |
| Tráfego Pago sem nenhum site/landing page no projeto | Sugerir Landing Page (ou Site Institucional) |
| Tráfego Pago com objetivo de vendas de produto | Sugerir Criativos para Anúncios |
| Design para Redes Sociais ou Gestão de Social Media sem Identidade Visual no projeto | Sugerir Identidade Visual |
| Criativos para Anúncios sem Tráfego Pago no projeto | Sugerir Tráfego Pago |
| Site Institucional com `inst_venda_online = sim` | Sugerir avaliação de E-commerce |
| Qualquer resultado do diagnóstico (Seção 6) | Sugerir a combinação da tabela correspondente |

Recomendações são sempre **sugestões não bloqueantes**, exibidas na tela de confirmação ou no resumo do
"Meu Upgrade" — nunca impedem o visitante de prosseguir sem aceitá-las.

## 12. Pontos de saída

- O visitante pode sair de qualquer pergunta a qualquer momento (fechar/navegar para outra parte do
  site); nada é salvo no "Meu Upgrade" até a confirmação explícita do serviço.
- O visitante pode abandonar um mini-fluxo no meio e voltar à tela das 3 entradas sem penalidade — os
  serviços já confirmados permanecem no "Meu Upgrade".
- O caminho `nao_sei` (em Sites e em Design/Social) e o próprio fluxo de Diagnóstico nunca terminam sem
  produzir ao menos uma recomendação ou um encaminhamento comercial manual (opção "outro") — não existe
  beco sem saída.

## 13. Retorno e edição

- **Voltar uma pergunta**: disponível em toda pergunta que não seja a primeira do mini-fluxo; a resposta
  da pergunta atual é descartada, as anteriores são preservadas.
- **Editar um serviço já confirmado**: reabre o mini-fluxo correspondente com todas as respostas
  anteriores pré-carregadas, a partir da última pergunta, com opção de voltar mais.
- **Reaproveitamento de respostas entre mini-fluxos na mesma sessão** (evita repetir perguntas
  equivalentes): 
  ```
  SE iv_tem_marca já foi respondida nesta sessão
  → pular gsm_tem_identidade e drs_tem_identidade, reaproveitando a resposta

  SE diag_tem_site já foi respondida no Diagnóstico
  → pular pergunta equivalente dentro do fluxo de Sites, se o visitante aceitar a recomendação
  ```
  Essa regra vale apenas para perguntas **logicamente idênticas** (mesma pergunta de fato, categorias
  diferentes) — nunca para perguntas que pareçam similares mas capturem informação distinta.

## 14. Comportamento ao adicionar outro serviço

Ao confirmar um serviço, o visitante retorna à tela das 3 entradas principais (não à tela inicial do
site) com o "Meu Upgrade" visível e atualizado. Ele pode escolher qualquer entrada novamente, inclusive
uma já usada (ex.: configurar uma segunda Landing Page), sem limite de repetições por categoria.

## 15. Comportamento ao finalizar

Ao optar por não adicionar mais serviços, o sistema avança para o Resumo do projeto (revisão de todos
os itens do "Meu Upgrade", com opção de editar/remover qualquer um antes de prosseguir), seguido da
captura de dados de contato (nome, empresa, WhatsApp, e-mail, Instagram/site atual opcional) e, só então,
da conversão oficial em lead — conforme já definido em `PROJECT-OVERVIEW.md` (Seção 8, Visão do funil).

---

## Comunicação de progresso (proposta de UX)

Em vez de um contador numérico ("Pergunta 3 de 17"), o progresso é comunicado de duas formas
complementares:

1. **Rótulo contextual por bloco de perguntas**, trocado conforme o momento do mini-fluxo:
   - Início do fluxo: nome da categoria (ex.: "Sobre seu site", "Sobre seu tráfego pago").
   - Meio do fluxo: algo como "Mais alguns detalhes".
   - Última pergunta do fluxo: "Só mais uma coisa" ou "Quase pronto".
2. **Indicador visual discreto e não numérico**: uma barra fina de progresso que se preenche
   proporcionalmente às perguntas restantes *estimadas* daquele mini-fluxo específico (recalculada
   dinamicamente quando uma ramificação pula ou adiciona perguntas), sem exibir texto de fração.

Essa combinação comunica avanço sem impor a sensação de formulário longo, e continua correta mesmo
quando o número real de perguntas varia por ramificação.

---

## Revisão obrigatória desta fase

- **Perguntas redundantes**: identificadas e eliminadas — "criar do zero ou atualizar" (redundante com
  `iv_tem_marca`); pergunta separada de "qual plataforma anuncia hoje" (fundida em `traf_ja_anuncia`);
  `gsm_tem_identidade`/`drs_tem_identidade` são puladas quando `iv_tem_marca` já foi respondida na
  mesma sessão (Seção 13).
- **Perguntas técnicas demais**: nenhuma pergunta usa jargão sem tradução prática (checado contra a
  Seção 9 de linguagem simples); exemplos de reformulação estão em `BUILDER-QUESTIONS.md`.
- **Perguntas sem utilidade**: "Quantos usuários terão login" removida do caminho Landing Page (não se
  aplica); nenhuma pergunta ficou sem impacto declarado (ver coluna "impacto" em cada pergunta).
- **Caminhos longos**: o único caminho combinado que ultrapassa 6 perguntas é o "Pacote completo" em
  Design/Social (soma de 3 mini-fluxos = 8 perguntas), o que é esperado e aceitável, pois ele configura
  três serviços simultaneamente, não um único serviço — cada mini-fluxo individual permanece dentro do
  limite de 3–6.
- **Loops**: nenhum identificado — toda pergunta avança para outra pergunta, para uma confirmação, ou
  para um redirecionamento de categoria (nao_sei), nunca de volta a si mesma.
- **Caminhos sem saída**: nenhum identificado — ver Seção 12.
- **Perguntas repetidas entre serviços**: identificadas (tema "já tem identidade visual", tema "já tem
  site", tema "já anuncia") e resolvidas via reaproveitamento de resposta na mesma sessão (Seção 13),
  não por duplicação de pergunta.
- **Recomendações contraditórias**: nenhuma encontrada — todas as recomendações são aditivas
  (sugerem adicionar um serviço complementar) e não bloqueiam nem contradizem a escolha do visitante.
- **Opções ambíguas**: a opção "Pacote completo" no Design/Social foi a mais próxima de gerar ambiguidade
  com o catálogo (poderia parecer um serviço próprio); resolvida explicitamente como atalho de
  experiência, não como categoria (Seção 5).

---

*Este documento é a lógica de conteúdo para a Fase 4 (User Flow) e Fase 5 (Regras de Negócio). Nenhuma
tela, componente ou schema de banco foi definido aqui.*
