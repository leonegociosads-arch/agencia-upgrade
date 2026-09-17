# DECISIONS — Registro de decisões do projeto

> Registro cumulativo de decisões já tomadas. Cada decisão nova (nas próximas fases) deve ser adicionada
> aqui com data e fase, nunca removida — apenas marcada como substituída se for revista.

Formato: `[Fase X] Decisão — justificativa`

---

## Produto e escopo

- **[Fase 1] O site não é apenas institucional** — funciona simultaneamente como site institucional,
  vitrine de capacidade da agência, experiência interativa, configurador de serviços, ferramenta de
  diagnóstico, sistema de captura de leads, qualificação comercial e entrada de um futuro mini-CRM.
- **[Fase 1] Nome da experiência é provisório** — "Meu Upgrade" ou "Monte seu Upgrade"; a escolha final
  fica pendente e não bloqueia as próximas fases.
- **[Fase 1] Quatro grupos de serviço iniciais** — Sites e Desenvolvimento; Tráfego Pago;
  Design/Social Media; "Ainda não sei o que preciso" (tratado como caminho de triagem legítimo, não
  como formulário genérico).

## Seleção e fluxo

- **[Fase 1] Seleção múltipla de serviços é obrigatória** — o usuário pode combinar quantos grupos de
  serviço quiser (ex.: Site + Tráfego Pago + Social Media) na mesma sessão. Nenhuma lógica do sistema
  pode assumir seleção única.
- **[Fase 1] Perguntas curtas e com propósito** — nenhuma pergunta existe "porque sim"; toda pergunta
  precisa influenciar complexidade, solução, estratégia, orçamento, prioridade comercial ou a próxima
  pergunta. Formulários longos são explicitamente rejeitados.
- **[Fase 1] Fluxo é reversível** — adicionar, remover, editar serviços e voltar a etapas anteriores são
  ações sempre disponíveis, não exceções tratadas à parte.
- **[Fase 1] Resumo do projeto é obrigatório antes da captura de dados** — o visitante revisa o que
  configurou antes de ser convidado a fornecer contato.
- **[Fase 1] Captura de contato acontece só na finalização** — nome, empresa, WhatsApp, e-mail e
  (opcionalmente) Instagram/site atual são pedidos apenas depois do resumo do projeto, nunca antes.
- **[Fase 1] Lead só existe oficialmente após envio dos dados de contato** — sessões anônimas e
  projetos em configuração não são leads; viram lead no momento da identificação.

## "Meu Upgrade" (conceito)

- **[Fase 1] "Meu Upgrade" funciona como carrinho, mas não pode parecer um carrinho de e-commerce** —
  sem iconografia, linguagem ou estética de loja online (sem "sacola", "checkout", "produto"). A
  metáfora é de montagem de projeto, não de compra de itens.

## Dados e persistência

- **[Fase 1] Supabase é a solução de persistência planejada** — para lead, projeto, serviços
  escolhidos, respostas, origem, eventos de navegação, lead score e status comercial. Implementação
  adiada para a Fase 13.
- **[Fase 1] Sessão anônima é uma entidade distinta do lead** — eventos de navegação e progresso no
  Upgrade Builder podem existir antes de qualquer identificação; o vínculo entre sessão e lead se dá no
  momento da conversão.
- **[Fase 1] Área administrativa protegida é planejada** — para visualização de leads pelo time da
  agência; implementação adiada para a Fase 16, mas já considerada na arquitetura de dados.

## Experiência visual e motion

- **[Fase 1] Referência conceitual é nodeck.online, sem cópia** — a referência é usada apenas como
  parâmetro de nível de interatividade, motion design e sensação premium. Layout, identidade, textos e
  elementos visuais do Nodeck não devem ser replicados.
- **[Fase 1] Mobile é prioridade real, não adaptação** — a experiência é pensada para mobile como
  cenário primário de uso, não apenas testada em mobile depois de pronta para desktop.
- **[Fase 1] Animação nunca pode prejudicar UX, performance, mobile ou acessibilidade** — motion design
  é aditivo; a funcionalidade essencial do fluxo precisa operar corretamente mesmo sem ele.
- **[Fase 1] Ordem de prioridade de construção é fixa**: UX → lógica → funcionalidade → responsividade
  → performance → UI → animação avançada. Decisões de UI e motion não podem anteceder a validação
  funcional do fluxo.

## Processo de construção

- **[Fase 1] Construção em fases sequenciais (36 fases definidas)** — cada fase tem escopo próprio;
  fases de UI final e motion design só ocorrem após o fluxo funcional (Upgrade Builder, Meu Upgrade,
  captura de lead) estar validado.
- **[Fase 1] Nesta etapa (Fase 1), nenhuma implementação de código foi feita** — apenas documentação
  conceitual e técnica (`PROJECT-OVERVIEW.md` e este arquivo). A Fase 2 não é iniciada automaticamente.

## Mapa de serviços (Fase 2)

- **[Fase 2] Catálogo final tem 4 entradas de topo e 9 serviços reais** — Sites e Desenvolvimento
  (Landing Page, Site Institucional, E-commerce, Sistema/Plataforma), Tráfego Pago (serviço único),
  Design/Social Media (Identidade Visual, Design para Redes Sociais, Gestão de Social Media, Criativos
  para Anúncios), além da entrada por diagnóstico "Ainda não sei o que preciso".
- **[Fase 2] "Site Institucional" e "Site Comercial" foram unificados em uma única categoria** — a
  diferença entre eles é de objetivo (credibilidade vs. geração de contato), não de estrutura, e será
  capturada por pergunta na Fase 3, não por categoria separada.
- **[Fase 2] "Site Premium/Interativo" não é uma categoria de site, é um tier transversal** —
  aplicável a qualquer um dos quatro tipos de site, evitando sobreposição com todas as outras
  categorias.
- **[Fase 2] "Tráfego Pago" é um serviço único no catálogo, não uma família de serviços separados por
  tipo de negócio ou abrangência geográfica** — tipo de negócio, objetivo (leads/vendas/WhatsApp/
  reconhecimento/remarketing), plataforma (Meta/Google) e abrangência geográfica serão perguntas dentro
  do serviço, definidas na Fase 3.
- **[Fase 2] "Design para Redes Sociais" e "Gestão de Social Media" são serviços distintos e
  normalmente não devem ser contratados juntos** — Design para Redes Sociais entrega apenas as artes
  (cliente publica sozinho); Gestão de Social Media já inclui o design como parte da publicação
  recorrente. A combinação dos dois é sinalizada como atípica, não bloqueada nesta fase.
- **[Fase 2] "Vídeos/Reels" não é categoria própria** — é um complemento transversal, anexável à
  Gestão de Social Media ou aos Criativos para Anúncios.
- **[Fase 2] "Pacotes de Conteúdo" não faz parte do catálogo lógico de serviços** — é uma forma de
  empacotamento comercial/precificação, a ser tratada em fase futura de pricing, não como serviço com
  identidade própria.
- **[Fase 2] Formatos de arte (post, story, banner, flyer, capa, thumbnail) nunca são serviços
  individuais** — são variações de formato dentro de "Design para Redes Sociais" ou "Criativos para
  Anúncios".
- **[Fase 2] "Ainda não sei o que preciso" funciona por diagnóstico de problema, não por formulário
  genérico** — cada problema relatado pelo visitante aponta para uma ou mais categorias já existentes
  do catálogo (relação muitos-para-muitos); a lógica de perguntas de triagem é conteúdo da Fase 3.
- **[Fase 2] Nomes internos com jargão devem ter explicação simples voltada ao cliente** — termos como
  "Landing Page", "Tráfego Pago" e "Criativos" são mantidos internamente, mas exigem tradução em
  linguagem simples na interface (requisito registrado para a Fase 18/19, sem implementação ainda).

## Perguntas e ramificações do Upgrade Builder (Fase 3)

~~**[Fase 3] Meta de 3 a 6 perguntas por serviço, com até 1–2 extras por ramificação** — aplicada a
  todos os fluxos; o único caminho que ultrapassa isso é o atalho "Pacote completo" em Design/Social,
  por somar 3 mini-fluxos completos, não por ser um único fluxo longo.~~ — **substituída na segunda
  correção da Fase 7** (ver "Correção de princípio — não existe quantidade padrão de perguntas" abaixo):
  mesmo uma faixa-alvo ("3 a 6") é rejeitada como meta numérica geral; o único critério válido é a
  quantidade mínima necessária para triagem comercial útil, decidida e aprovada individualmente por
  serviço, sem relação com o número de outro serviço.
- **[Fase 3] "Site Comercial" não é uma opção da primeira pergunta de Sites** — o objetivo comercial
  vs. institucional é capturado pela pergunta `inst_objetivo`, dentro do caminho Site Institucional,
  confirmando a unificação decidida na Fase 2.
- **[Fase 3] "Premium/Interativo" é capturado por uma pergunta transversal (`site_experiencia`)
  aplicada ao final de qualquer tipo de site**, não como uma opção da primeira pergunta — confirma o
  tratamento como tier definido na Fase 2.
- **[Fase 3] Tráfego Pago é um fluxo único e linear de 5 perguntas** — a pergunta "já anuncia?" e a
  pergunta "qual plataforma?" foram fundidas em uma só (`traf_ja_anuncia`) para eliminar uma pergunta
  sem perder informação.
- **[Fase 3] "Pacote completo" em Design/Social é um atalho de experiência, não um serviço** — ao ser
  escolhido, encadeia os mini-fluxos reais (Identidade Visual, Gestão de Social Media, Criativos para
  Anúncios) e adiciona os três como itens independentes e editáveis ao "Meu Upgrade".
- **[Fase 3] Vídeos/Reels não tem serviço próprio de destino** — a pergunta `video_finalidade` decide
  se o vídeo é anexado ao contexto de Gestão de Social Media, de Criativos para Anúncios, ou a ambos.
- **[Fase 3] Respostas logicamente idênticas são reaproveitadas entre mini-fluxos na mesma sessão**
  (ex.: "já tem identidade visual", "já tem site", "já anuncia") para evitar perguntas repetidas —
  vale apenas quando a pergunta é de fato a mesma, nunca para perguntas apenas parecidas.
- **[Fase 3] O diagnóstico ("Ainda não sei o que preciso") pergunta sobre problemas, nunca sobre
  serviços**, e sempre termina em uma recomendação explícita de combinação de serviços ou, no caso da
  opção "outro", em encaminhamento comercial manual sem recomendação automática.
- **[Fase 3] Toda recomendação entre serviços é uma sugestão não bloqueante** — aparece na confirmação
  ou no resumo do "Meu Upgrade", mas nunca impede o visitante de prosseguir sem aceitá-la.
- **[Fase 3] Progresso é comunicado por rótulo contextual + barra visual não numérica**, nunca por
  "pergunta X de Y", para preservar a sensação de "montar um projeto" em vez de "preencher formulário".
- **[Fase 3] Toda pergunta tem uma saída de incerteza** ("ainda não sei" / "não defini") quando a
  incerteza for uma resposta comercialmente plausível, para nunca travar o visitante.

## User Flow completo (Fase 4)

- **[Fase 4] Cada categoria de serviço (Sites, Tráfego Pago, Design/Social Media) aceita apenas uma
  configuração principal por projeto** — clicar numa categoria já configurada abre edição, nunca cria
  uma segunda instância. Isso substitui a permissão de repetição ilimitada registrada em
  `BUILDER-FLOWS.md` (Fase 3); a regra nova é a que vale a partir de agora. Criar múltiplas instâncias
  da mesma categoria (ex.: duas Landing Pages) fica fora de escopo, podendo ser revisto se houver
  demanda real.
- **[Fase 4] O fluxo não depende de o usuário passar pela Home** — entrada direta ao Builder (menu,
  seção da Home, campanha de tráfego, URL direta) é uma via de primeira classe, não uma exceção.
- ~~**[Fase 4] "Adicionar outro serviço" recebe o maior destaque visual na tela de conclusão de um
  serviço**, à frente de "Ver Meu Upgrade" e "Finalizar projeto"~~ — **substituída na revisão da Fase 4**
  (ver "Correção da Fase 4" abaixo): "Finalizar meu projeto" passou a ser o CTA principal, para não
  pressionar o usuário a configurar mais serviços do que veio buscar.
- **[Fase 4] Edição funciona em modo de rascunho**: alterações feitas durante a edição de um serviço só
  substituem a configuração anterior ao serem concluídas; "Cancelar edição" descarta o rascunho e
  preserva a configuração anterior intacta.
- **[Fase 4] Edição em cascata**: mudar uma resposta que invalida perguntas posteriores remove
  automaticamente apenas as respostas dependentes daquela mesma categoria; nenhuma outra categoria é
  afetada.
- **[Fase 4] Remoção de serviço exige uma confirmação simples de uma pergunta** ("Remover [Serviço] do
  seu Upgrade?"), sem fricção adicional. Projeto vazio após remoção desabilita "Finalizar projeto" e
  troca o CTA principal do Meu Upgrade por "Adicionar um serviço".
- **[Fase 4] Recomendações (entre serviços ou vindas do diagnóstico) aparecem no máximo uma vez por
  sessão para cada sugestão** — se descartadas, não voltam a ser exibidas automaticamente, evitando
  upsell repetitivo; o usuário sempre pode adicionar aquele serviço manualmente depois.
- **[Fase 4] Aceitar uma recomendação nunca pula as perguntas do serviço recomendado** — sempre abre o
  mini-fluxo real daquela categoria (reaproveitando respostas equivalentes já dadas), garantindo dados
  comerciais reais em vez de um item vazio.
- **[Fase 4] "Voltar" é sempre uma ação própria da interface do Builder**, não depende do botão nativo
  do navegador, e nunca apaga respostas de uma categoria diferente da que está sendo navegada.
- **[Fase 4] Nenhum erro (validação, envio, sessão) pode forçar o usuário a recomeçar o projeto do
  zero** — todo estado de erro carrega uma referência de retorno e preserva os dados já fornecidos.
- **[Fase 4] Persistência de sessão (sobreviver a F5/fechar o navegador) é uma expectativa de produto
  registrada para a Fase 14, não uma implementação desta fase** — o comportamento atual do código
  (perda de estado ao atualizar a página) é uma limitação conhecida, não o padrão final aceito.
- **[Fase 4] O fluxo lógico é idêntico em desktop e mobile; apenas a apresentação do "Meu Upgrade" muda
  de forma conceitual** (painel lateral no desktop vs. botão fixo com drawer/modal no mobile) — decisão
  visual definitiva fica para a Fase 7 (Wireframe) e Fase 20 (Responsividade).
- ~~**[Fase 4] Identificada divergência entre este User Flow e o Builder já implementado na Fase 3**
  (...) — pendência a resolver conscientemente antes da Fase 5, e não decidida a favor de um lado nesta
  fase.~~ — **resolvida na revisão da Fase 4** (ver "Correção da Fase 4" abaixo): a Fase 3 implementada
  passou a ser a fonte de verdade oficial; o User Flow foi corrigido para segui-la.

## Correção da Fase 4 — User Flow alinhado à Fase 3 implementada

- **[Fase 4 - revisão] A Fase 3 implementada é a fonte de verdade oficial das perguntas do Builder** —
  `lib/builder/config/site.ts`, `trafego.ts` e `design.ts` prevalecem sobre qualquer documento conceitual
  anterior (`BUILDER-FLOWS.md`, `BUILDER-QUESTIONS.md`) quando houver divergência. Esses dois documentos
  passam a ser registro histórico da proposta original, não referência ativa.
- **[Fase 4 - revisão] A entrada do Builder tem exatamente 3 categorias**: Site, Tráfego Pago, e Design +
  Social Media. Não existe uma quarta categoria de entrada. "Ainda não sei" deixa de ser uma categoria
  própria e passa a existir apenas como a opção `nao_sei` dentro da pergunta `site_tipo` (Site), com o
  único efeito prático de pular a pergunta `site_recursos`.
- ~~**[Fase 4 - revisão] Não existe, no Builder implementado, um sistema de diagnóstico por problema com
  recomendação automática** (...) Reintroduzi-la exigiria uma decisão consciente e uma extensão
  deliberada do Builder~~ — essa decisão foi tomada e depois **revertida na revisão final da Fase 5** (ver
  "Correção da Fase 5" abaixo): o diagnóstico automático foi testado, avaliado como excessivo para o
  objetivo do produto, e substituído por um link simples de contato ("Fale com a Upgrade"), sem pergunta
  nem recomendação.
- **[Fase 4 - revisão] CTA da tela de conclusão de serviço: "Finalizar meu projeto" é o principal;
  "Adicionar outro serviço" é secundário** — a experiência não deve pressionar o usuário a configurar
  mais serviços do que veio buscar; adicionar outro serviço continua fácil e visível, só não compete
  visualmente com finalizar.
- **[Fase 4 - revisão] Um serviço passa a fazer parte do "Meu Upgrade" automaticamente ao concluir seu
  mini-fluxo** — não existe um clique explícito e separado de "adicionar"; isso já corresponde ao
  comportamento real do Builder implementado (uma categoria só é considerada concluída quando não há
  mais perguntas pendentes).
- **[Fase 4 - revisão] Edição continua sendo um modo de rascunho temporário** (abre configuração
  existente → altera → confirma ou cancela → retorna para onde foi iniciada — Meu Upgrade ou Resumo),
  mas fica registrado que o `BuilderContext` atual **ainda não implementa** esse mecanismo (hoje grava
  cada resposta imediatamente e só permite desfazer um passo por vez). A extensão necessária está
  detalhada em `USER-FLOW.md` ("Incompatibilidades identificadas com o código") e não foi feita nesta
  tarefa — não é bloqueante para a Fase 5, mas é pré-requisito para implementar o "Meu Upgrade" e a
  edição real em código.
- **[Fase 4 - revisão] Nenhuma pergunta foi criada, removida ou alterada nesta correção** — o User Flow
  foi ajustado para descrever exatamente as perguntas já existentes em `lib/builder/config/`.
- ~~**[Fase 4 - revisão] Ponto em aberto, fora do escopo desta correção**: `PROJECT-OVERVIEW.md` e
  `SERVICES-MAP.md` (Fases 1 e 2) ainda descrevem 4 grupos de serviço com diagnóstico próprio~~ —
  **resolvido na Fase 5**: ambos os documentos foram corrigidos para 3 categorias + função auxiliar de
  diagnóstico (ver abaixo).

## Correção de escopo — 3 categorias + função auxiliar (Fase 5, primeira versão)

- **[Fase 5] A arquitetura oficial do Upgrade Builder tem exatamente 3 categorias principais**: Sites e
  Desenvolvimento, Tráfego Pago, Design/Social Media. Não existe e não deve existir uma quarta categoria
  de mesmo peso hierárquico. **(mantida — reafirmada na correção final abaixo)**
- ~~**[Fase 5] "Ainda não sei o que preciso" volta a existir, oficialmente, como função auxiliar** — "Me
  ajude a descobrir" — acessível como opção secundária na tela de escolha de categoria (...).
  Especificação completa em `docs/DIAGNOSTIC-RULES.md`.~~ — **substituída na correção final da Fase 5**:
  esse diagnóstico com pergunta e recomendação automática foi removido; `docs/DIAGNOSTIC-RULES.md` foi
  excluído. Ver "Correção da Fase 5" abaixo.
- **[Fase 5] `PROJECT-OVERVIEW.md`, `SERVICES-MAP.md`, `BUILDER-FLOWS.md`, `BUILDER-QUESTIONS.md` e
  `USER-FLOW.md`/`USER-FLOW-DIAGRAM.md` foram corrigidos** nos pontos em que tratavam "Ainda não sei"
  como quarta categoria — sem alterar o restante do conteúdo desses documentos.

## Regras de negócio e recomendações automáticas (Fase 5, primeira versão — em grande parte substituída)

- **[Fase 5] Todas as regras de negócio usam exclusivamente os campos já implementados** em
  `lib/builder/config/site.ts`, `trafego.ts` e `design.ts` — nenhuma pergunta nova foi criada para
  sustentar uma regra. **(mantida)**
- ~~**[Fase 5] Recomendações seguem 4 níveis de prioridade**: `PRIMARY`, `COMPLEMENTARY`, `OPTIONAL` e
  `WARNING`.~~ — **removida na correção final**: não existe mais motor de recomendação nem classificação
  de prioridade. `docs/RECOMMENDATION-RULES.md` foi excluído.
- ~~**[Fase 5] No máximo uma recomendação é exibida por vez** (...) com deduplicação por serviço-alvo.~~
  — **removida**: não há mais recomendações a deduplicar.
- **[Fase 5] Duplicidade em Design é checada no nível do serviço específico** (`identidade_visual`,
  `design_redes_sociais` etc.), nunca no nível da categoria inteira — **mantida**, mas agora relevante
  apenas para a regra de uma-configuração-por-categoria (Seção 4 de `USER-FLOW.md`), não para
  recomendação.
- **[Fase 5] Validações internas geram orientação consultiva, nunca bloqueiam o avanço** — **mantida**,
  reformulada em `docs/BUSINESS-RULES.md` (Seção 3) sem a taxonomia formal de tipos de recomendação.
- **[Fase 5] Classificação de complexidade interna usa 3 níveis (`LOW`/`MEDIUM`/`HIGH`) mais
  `UNDETERMINED`** — **mantida**, sem alteração.
- **[Fase 5] `PRICE_SIGNAL` e `LEAD_SCORE_SIGNAL` são apenas marcados, nunca pontuados ou precificados,
  e não influenciam a experiência do cliente nesta fase** — **mantida e reforçada** na correção final.
- ~~**[Fase 5] Regras que dependeriam de campos inexistentes (...) foram documentadas como "regras
  conceituais futuras"**~~ — **removida**: essas regras eram parte do motor de recomendação/orientação
  estratégica descartado; não fazem mais parte do escopo do Builder.

## Correção da Fase 5 — remoção do motor de recomendações e do diagnóstico avançado

- **[Fase 5 - correção] A Etapa 5 passa a se chamar "Regras de Triagem, Resumo e Entrega Comercial"** —
  seu objetivo é organizar o interesse do cliente (exibição condicional de perguntas, validação,
  resumo, preparação de dados), não analisar ou recomendar automaticamente.
- **[Fase 5 - correção] Nenhuma recomendação automática de serviço complementar existe no Builder** —
  nem entre categorias (ex.: Tráfego Pago após Site), nem dentro de uma categoria (ex.: Identidade
  Visual após Social Media). Se o cliente quiser mais de um serviço, adiciona manualmente pelo "Meu
  Upgrade".
- **[Fase 5 - correção] `docs/RECOMMENDATION-RULES.md` e `docs/DIAGNOSTIC-RULES.md` foram excluídos** —
  não tinham mais função no projeto; suas referências foram removidas ou corrigidas em todos os outros
  documentos.
- **[Fase 5 - correção] O diagnóstico avançado "Me ajude a descobrir" (pergunta + recomendação
  determinística de categoria) foi removido.** A única saída para o visitante indeciso é um link simples
  — "Não sabe exatamente do que precisa? Fale com a Upgrade" — que leva a contato humano direto, sem
  nenhuma pergunta ou recomendação.
- **[Fase 5 - correção] A análise estratégica e qualquer sugestão de serviço adicional ficam a cargo do
  atendimento humano da Upgrade**, sempre depois que o lead é recebido — nunca do Builder.
- **[Fase 5 - correção] Lógica de triagem (perguntas condicionais, dependências, validação, invalidação
  em cascata, edição, remoção, múltiplos serviços manuais, Meu Upgrade, resumo, sinais de complexidade e
  de preço) foi preservada integralmente** — nada disso é recomendação comercial, é organização da
  experiência.
- **[Fase 5 - correção] O resumo final apenas compila as respostas do cliente** — não analisa, não
  classifica, não sugere.
- **[Fase 5 - correção] O lead é considerado salvo (ou preparado para salvar) antes de qualquer
  redirecionamento a um CTA de WhatsApp** — para não perder o interesse do cliente caso ele não envie a
  mensagem. O CTA de WhatsApp é uma continuidade comercial planejada, não implementada nesta fase.
- **[Fase 5 - correção] Supabase continua planejado** para as Fases 12/13, sem mudança de direção.
- **[Fase 5 - correção] `PRICE_SIGNAL` pode continuar existindo internamente**, sem cálculo automático
  de preço nesta fase.
- **[Fase 5 - correção] Lead Score será tratado na Fase 15 e não influencia o Builder nesta fase** — os
  sinais já identificados (`LEAD_SCORE_SIGNAL`) permanecem apenas como metadados.

## Arquitetura técnica (Fase 6)

- **[Fase 6] Organização de código por feature** (`features/builder`, `lead`, `admin`, `analytics`,
  `motion`), com `lib/` reservado para infraestrutura cross-cutting (Supabase, repositórios, utils
  genéricos) — ver `docs/FOLDER-STRUCTURE.md`. Nenhum arquivo é movido nesta fase; a migração acontece
  na Fase 8.
- **[Fase 6] State management do Builder permanece React Context + `useReducer`** — Zustand ou outra
  biblioteca não foi adotada por falta de necessidade real (árvore de estado contida, volume de dados
  pequeno). Gatilho de revisão registrado em `TECHNICAL-ARCHITECTURE.md`, Seção 8.
  Se as próximas fases atingirem esse gatilho, revisar aqui antes de adicionar a dependência.
- **[Fase 6] Máquina de estados do Builder é um enum discriminado (`BuilderStep`) + `useReducer`** — não
  XState nem equivalente. Reavaliar apenas se o fluxo ganhar estados paralelos ou histórico profundo.
- **[Fase 6] Zod é recomendado exclusivamente para a fronteira de validação servidor/persistência**
  (dados de contato antes de gravar) — não para a validação interna das perguntas do Builder, que
  continua com funções próprias mais simples.
- **[Fase 6] React Hook Form + Zod são recomendados exclusivamente para o formulário de captura de
  lead** — as telas de pergunta do Builder (cards clicáveis) não usam essas bibliotecas.
- **[Fase 6] Camada de repositório (`lib/repositories/*`) isola todo acesso a dados** — a UI e as Server
  Actions nunca chamam Supabase diretamente; isso é o que permite trocar o backend sem reescrever a UI.
- **[Fase 6] Supabase terá clientes separados para navegador e servidor** (`lib/supabase/client.ts` e
  `server.ts`) — a service role key nunca é exposta ao cliente.
- **[Fase 6] Server Actions são o mecanismo principal para o envio do lead** — Route Handlers ficam
  reservados para casos que exigem um endpoint HTTP real (webhooks, integrações externas), nenhum
  previsto ainda.
- **[Fase 6] Persistência de sessão segue estratégia evolutiva**: `localStorage` versionado primeiro
  (Fase 14), sincronização com `session_id` no Supabase depois (Fase 13/14) — não implementado agora.
- **[Fase 6] Analytics passa sempre por uma função única `trackEvent()`** — nenhuma chamada direta a
  GA4/Meta Pixel/outra plataforma é permitida espalhada pelo código.
- **[Fase 6] Geração da mensagem de WhatsApp é uma função pura (`generateWhatsAppMessage`)**, separada
  do componente do botão que a usa.
- **[Fase 6] Animações (GSAP/ScrollTrigger/Lenis) só leem estado já commitado do Builder — nunca o
  escrevem.** Nenhuma lógica de dados pode depender de uma animação ter terminado. Bibliotecas de
  animação são carregadas sob demanda, nunca no layout raiz.
- **[Fase 6] `prefers-reduced-motion` é uma decisão arquitetural desde já** — a funcionalidade do
  Builder nunca pode depender de uma animação ter rodado.
- **[Fase 6] Modelo de dados da V1 embute `answers` como JSON dentro de `ServiceConfiguration`**, sem
  normalizar numa tabela `Answer` própria — reavaliar apenas se houver necessidade real de consultar
  respostas individuais entre projetos.
- **[Fase 6] `MyUpgrade` é modelado como um registro por `ServiceId` (no máximo 1 item por categoria)**,
  reafirmando em nível de tipo a decisão de "uma configuração ativa por categoria" já tomada na Fase 4.
- **[Fase 6] Toda lógica de regras do Builder (visibilidade, validação, invalidação, conclusão, resumo)
  é escrita como funções puras, sem React nem DOM** — é o que viabiliza testes isolados futuramente.
- **[Fase 6] Nenhuma biblioteca foi instalada e nenhum arquivo de código foi movido nesta fase** — esta
  fase é só planejamento; a execução começa na Fase 8.

## Wireframe funcional (Fase 7)

- **[Fase 7] Blocos da Home foram reduzidos de 6 para 5** — "Demonstração/experiência" não virou seção
  própria; foi fundida ao Hero e ao bloco de Prova de Capacidade, para manter ritmo e evitar página
  institucional longa. Estrutura final: Hero, Posicionamento, Serviços/Capacidades, Prova de Capacidade,
  CTA Builder repetido, Contato/Footer.
- **[Fase 7] "Adicionar outro serviço" reaproveita a tela de seleção de categoria (WF-03)** — não é uma
  tela nova; o único diferencial é o estado "Configurado" por categoria.
- **[Fase 7] Tipos de resposta realmente usados hoje são apenas `single_choice` e `multi_choice`** —
  "sim/não", "faixa de valor" e "texto curto" não correspondem a nenhuma pergunta do Builder atual
  (`faixa de valor` é explicitamente rejeitada, pois o Builder não pergunta orçamento). "Texto curto" é
  usado apenas na Captura de Contato (WF-10), que não é uma pergunta do Builder.
- **[Fase 7] Progresso confirmado como rótulo contextual + barra discreta não numérica** — decisão da
  Fase 3 aplicada concretamente ao wireframe da tela de pergunta (WF-04).
- **[Fase 7] Meu Upgrade é painel lateral recolhível no desktop e botão fixo + drawer/bottom sheet no
  mobile** — mesma estrutura de dados, apresentação diferente por plataforma (consistente com
  `TECHNICAL-ARCHITECTURE.md`, Seção 28).
- **[Fase 7] CTA do Resumo mantém o texto já decidido na Fase 4: "Seguir para contato"** — não foi criado
  um texto alternativo ("Receber retorno da Upgrade"), pois a captura de contato acontece imediatamente
  após o Resumo nesta arquitetura.
- **[Fase 7] Nenhuma informação interna (`complexity score`, `PRICE_SIGNAL`, `LEAD_SCORE_SIGNAL`, IDs) é
  exibida em nenhuma tela do wireframe** — confirmado explicitamente no Resumo (WF-09) e no Meu Upgrade
  (WF-06).
- **[Fase 7] CTA de WhatsApp na tela de confirmação (WF-11) é apenas um ponto reservado no wireframe** —
  sem geração de link ou integração; a função pura `generateWhatsAppMessage` (já desenhada na Fase 6)
  permanece não implementada.
- **[Fase 7] Abandono do Builder não usa confirmação/pop-up a cada tentativa de saída** — no máximo uma
  mensagem informativa ("Seu progresso ficará salvo neste dispositivo."), nunca um bloqueio recorrente.
- **[Fase 7] Inventário final do wireframe tem 13 telas/estados** (WF-01 a WF-13, ver
  `docs/WIREFRAME-SCREENS.md`) — nenhuma tela adicional foi identificada como necessária na revisão
  obrigatória dos 6 cenários.
- **[Fase 7] Nenhum código de produção, biblioteca ou integração foi alterado nesta fase** — apenas
  documentação (`WIREFRAME.md`, `WIREFRAME-FLOW.md`, `WIREFRAME-SCREENS.md`). A eventual página de
  protótipo visual (`/prototype`) mencionada no briefing não foi criada — fica como proposta para decisão
  consciente antes da Fase 8, não implementada automaticamente.

## Correção da Fase 7 — eliminação de ambiguidade sobre quantidade de perguntas

- **[Fase 7 - correção] O Builder não gera, nunca gerou e não deve gerar perguntas dinamicamente** —
  reafirmado explicitamente após uma ambiguidade de redação identificada em `docs/WIREFRAME-FLOW.md`
  (`WF-04 QUESTION x2-6` e o texto "varia por categoria/ramificação (2 a 6 perguntas)"), que sugeria
  quantidade indefinida decidida em tempo de execução. Essa redação foi removida e substituída por
  sequências explícitas por categoria.
- **[Fase 7 - correção] Quantidade exata de perguntas, fixada e documentada**: Site = 3 perguntas
  (`site_tipo`, `site_recursos`, `site_situacao`; 2 se `site_tipo = "Ainda não sei"`, pois
  `site_recursos` não é exibida); Tráfego Pago = 3 perguntas fixas, sempre (`trafego_negocio`,
  `trafego_destino`, `trafego_experiencia`); Design/Social Media = 3 perguntas por mini-fluxo individual
  (`design_servico` + 2 perguntas específicas do serviço escolhido), para qualquer um dos 5 serviços.
  Contagem lida diretamente de `lib/builder/config/site.ts`, `trafego.ts` e `design.ts` — nenhum número
  foi inventado nesta correção. ⚠️ **Tráfego Pago passou a ter 4 perguntas no "Alinhamento pré-Etapa 8"**
  (ver seção mais abaixo) — a contagem de 3 acima reflete o estado do código no momento em que esta
  correção foi escrita, não o estado atual.
- **[Fase 7 - correção] "Quero combinar serviços" concatena mini-fluxos fixos, não gera um fluxo
  arbitrário** — o total de perguntas nesse caminho é a soma determinística dos mini-fluxos fixos que o
  próprio usuário escolheu combinar, com deduplicação de campos compartilhados (ex.: `marca_identidade`).
  A variação de total nesse caminho vem exclusivamente da escolha manual do usuário sobre quais serviços
  combinar — nunca de uma decisão do sistema. ⚠️ **O rótulo "Quero combinar serviços" foi renomeado para
  "Montar um pacote" no "Alinhamento pré-Etapa 8"** (ver seção mais abaixo); o campo interno
  (`design_servico` = `quero_combinar_servicos`) não mudou.
- **[Fase 7 - correção] `docs/WIREFRAME.md`, `docs/WIREFRAME-FLOW.md` e `docs/WIREFRAME-SCREENS.md`
  foram corrigidos** para remover toda linguagem de quantidade variável/indefinida e para citar a
  contagem exata de perguntas por categoria, com referência direta a `lib/builder/config/*.ts` como fonte
  de verdade.
- **[Fase 7 - correção] Nenhuma pergunta foi criada, removida, renomeada ou teve suas opções alteradas
  nesta correção** — o trabalho foi exclusivamente de documentação, alinhando o wireframe ao que já está
  implementado desde a Etapa 3.

## Correção de princípio — não existe quantidade padrão de perguntas (Fase 7, segunda correção)

- **[Fase 7 - correção 2] Não existe quantidade padrão/fixa de perguntas por serviço.** A primeira
  correção da Fase 7 (acima) eliminou a ambiguidade de "quantidade variável decidida em tempo de
  execução", mas descreveu os números resultantes (3 para Site, 3 para Tráfego Pago, 3 por mini-fluxo de
  Design) de um jeito que podia ser lido como uma meta comum de "3 perguntas por serviço". Não é: cada
  número é uma coincidência de conteúdo entre serviços aprovados independentemente, não uma regra de
  arquitetura a ser replicada.
- **[Fase 7 - correção 2] Critério único e válido: a quantidade mínima necessária para gerar uma triagem
  comercial útil daquele serviço específico** — nem "meta de 3 a 6" (Fase 3, agora substituída), nem "3
  fixo", nem qualquer outro número-alvo geral. Um serviço futuro pode ter 2, 4 ou outra quantidade,
  desde que seja o mínimo suficiente para aquele caso.
- **[Fase 7 - correção 2] Toda pergunta deve ser definida e aprovada antes da programação** — reforça o
  que já valia desde a Fase 1 ("nenhuma pergunta existe porque sim"), agora explícito também como
  processo: primeiro aprova-se o conteúdo das perguntas, depois se programa o fluxo fixo correspondente.
- **[Fase 7 - correção 2] Depois de aprovado, o fluxo é executado exatamente como definido — reafirmação,
  não mudança, da regra já registrada na primeira correção da Fase 7**: o Builder não gera perguntas
  dinamicamente, não decide quantas perguntas fará em tempo de execução e não inventa perguntas com base
  em respostas.
- **[Fase 7 - correção 2] `docs/USER-FLOW.md`, `docs/WIREFRAME.md`, `docs/WIREFRAME-FLOW.md` e
  `docs/WIREFRAME-SCREENS.md` foram ajustados** para deixar claro que as contagens hoje documentadas
  (2–3 por mini-fluxo) são o retrato do que já foi aprovado, não uma meta numérica a preservar em
  serviços futuros.
- **[Fase 7 - correção 2] Nenhuma pergunta foi criada, removida ou alterada** — esta é, novamente, uma
  correção exclusivamente de redação/princípio, não de conteúdo do Builder. ⚠️ Isso mudou logo em
  seguida, no "Alinhamento pré-Etapa 8" abaixo, onde uma pergunta foi de fato adicionada (com aprovação
  explícita, antes de qualquer programação) — ver seção seguinte.

## Alinhamento pré-Etapa 8 — árvore visual oficial e reconciliação final

> Contexto: uma imagem ("Upgrade Builder — Árvore de Escolhas") foi apresentada como referência visual
> oficial da lógica do Builder, ao lado das Etapas 3, 4 e 7. A imagem revelou duas divergências reais
> entre o que estava aprovado e o que o negócio agora quer confirmar como padrão: uma pergunta nova no
> fluxo de Tráfego Pago, e uma mudança de rótulo em Design/Social Media. Diferente das fases anteriores,
> esta reconciliação **envolveu alteração de código**, com aprovação explícita do conteúdo antes da
> programação, lint e build executados em seguida.

- **[Alinhamento pré-Etapa 8] A imagem "Upgrade Builder — Árvore de Escolhas" é referência visual oficial
  da lógica do Builder**, ao lado de `docs/USER-FLOW.md`, `docs/USER-FLOW-DIAGRAM.md` e do código em
  `lib/builder/config/*.ts`. Em caso de conflito entre a imagem e o texto/código aprovado, o texto/código
  prevalece — a imagem existe para eliminar ambiguidade visual, não para substituir a fonte de verdade.
- **[Alinhamento pré-Etapa 8] Tráfego Pago ganhou uma quarta pergunta, `trafego_investimento`**:
  "Quanto pretende investir em anúncios por mês?", com opções `ate_1000`, `de_1000_a_3000`,
  `de_3000_a_5000`, `acima_5000`, `nao_sei`. Adicionada depois de aprovação explícita do conteúdo (a
  imagem e a instrução do alinhamento), antes de qualquer programação — não foi inventada durante o
  desenvolvimento. Fica marcada como `PRICE_SIGNAL` e, para os dois valores mais altos, também
  `LEAD_SCORE_SIGNAL` em `docs/BUSINESS-RULES.md`.
- **[Alinhamento pré-Etapa 8] `trafego_investimento` é uma exceção explícita e delimitada à regra "o
  Builder não pergunta orçamento"** (`docs/PROJECT-OVERVIEW.md`, `docs/USER-FLOW.md`) — a regra original
  proíbe perguntar o orçamento do **projeto/contrato com a Upgrade** (o que o cliente vai pagar pelo
  serviço), o que continua proibido. `trafego_investimento` pergunta o investimento em **mídia paga**
  (Meta Ads/Google Ads), informação operacional específica de Tráfego Pago, da mesma natureza de
  `site_recursos` para Site — não uma pergunta de orçamento geral, e não transformada em cálculo
  automático de preço. Essa distinção já existia na proposta conceitual original da Fase 3
  (`docs/BUILDER-QUESTIONS.md`, campo histórico `traf_investimento`), que também isolava investimento em
  mídia como pergunta própria de Tráfego Pago.
- **[Alinhamento pré-Etapa 8] O rótulo "Quero combinar serviços" foi renomeado para "Montar um pacote"**
  em Design/Social Media, por ser linguagem mais natural para o cliente. O campo interno
  (`design_servico`, valor `quero_combinar_servicos`) **não mudou** — troca de rótulo apenas, consistente
  com o princípio já registrado na Fase 6 ("id interno nunca muda; label pode ser ajustado a qualquer
  momento", `docs/TECHNICAL-ARCHITECTURE.md`, Seção 14). A segunda pergunta desse caminho também mudou de
  texto: "Quais serviços você quer combinar?" → "Quais serviços você quer incluir no seu pacote?".
- **[Alinhamento pré-Etapa 8] A descrição de "Edição de Vídeo" foi revisada** para reforçar que o serviço
  parte de materiais que o cliente já possui (vídeos, fotos) — a Upgrade não é apresentada como serviço
  de filmagem/captação presencial. A descrição em `docs/USER-FLOW.md` já estava correta; a descrição em
  `lib/builder/config/design.ts` foi ajustada para o mesmo padrão.
- **[Alinhamento pré-Etapa 8] Arquivos de código alterados**: `lib/builder/types.ts` (campo
  `trafego_investimento` em `TrafegoAnswers`), `lib/builder/config/trafego.ts` (nova pergunta, nova
  contagem de passos), `lib/builder/summarize.ts` (resumo inclui a nova resposta),
  `lib/builder/config/design.ts` (rótulos atualizados). Nenhum componente de UI precisou mudar — o motor
  já era orientado a configuração (Fase 1/6), então uma pergunta nova ou um rótulo novo não exigem
  alteração de tela.
- **[Alinhamento pré-Etapa 8] `npm run lint` e `npm run build` executados com sucesso após as mudanças**
  — sem erros de tipo, sem warnings novos. O projeto ainda não tem um framework de testes automatizados
  configurado (sem script `test` em `package.json`, sem arquivos de teste do projeto); lint + build
  (incluindo checagem de TypeScript) foi a verificação disponível. Adicionar testes automatizados para a
  camada de lógica pura do Builder (já preparada para isso desde a Fase 6, `docs/TECHNICAL-ARCHITECTURE.md`
  Seção 33) é uma recomendação para a Fase 8, não uma pendência desta reconciliação.
- **[Alinhamento pré-Etapa 8] `docs/USER-FLOW.md`, `docs/USER-FLOW-DIAGRAM.md`, `docs/BUSINESS-RULES.md`,
  `docs/WIREFRAME.md`, `docs/WIREFRAME-FLOW.md` e `docs/WIREFRAME-SCREENS.md` foram atualizados** para
  refletir a quarta pergunta de Tráfego Pago e o rótulo "Montar um pacote", incluindo a contagem exata,
  as tabelas de `PRICE_SIGNAL`/`LEAD_SCORE_SIGNAL`, e o exemplo de resumo final.
- **[Alinhamento pré-Etapa 8] Nenhuma categoria, regra de ramificação, navegação conceitual ou decisão de
  UX foi redesenhada** — a Etapa 8 continua não devendo redesenhar essas decisões; este alinhamento só
  ajustou o conteúdo de um fluxo (Tráfego Pago) e um rótulo (Design), ambos já registrados aqui antes de
  qualquer programação adicional.

## Estrutura inicial em Next.js (Fase 8)

> Primeira fase com implementação de código real. Detalhes completos em
> `docs/IMPLEMENTATION-STAGE-08.md`; aqui só as decisões formais.

- **[Fase 8] Migração de `lib/builder/` e `components/builder/` para `features/builder/*`
  executada** — exatamente a estrutura já planejada em `docs/FOLDER-STRUCTURE.md` (Fase 6), que
  reservava essa migração física para esta fase. Nenhum arquivo duplicado ficou para trás.
- **[Fase 8] Pendência crítica das Fases 4/6/7 implementada: separação real entre estado
  confirmado (`confirmedServices`) e rascunho de edição (`serviceDraft`/`editingService`)** —
  nenhuma ação além de `SAVE_SERVICE_DRAFT` escreve no estado confirmado; cancelar descarta o
  rascunho sem tocar no confirmado. Coberto por 18 testes unitários do reducer, incluindo os 7
  cenários obrigatórios do briefing desta fase.
- **[Fase 8] `CategoryId` foi renomeado para `ServiceId`** — só o nome do tipo; os valores
  internos (`site`, `trafego`, `design`) **não mudaram**. O briefing desta fase deu como exemplo
  ilustrativo os valores `site`/`traffic`/`design_social`, mas `docs/TECHNICAL-ARCHITECTURE.md`
  (Fase 6, já aprovada) havia fixado `ServiceId = "site" | "trafego" | "design"` — mantidos os
  valores já aprovados para não invalidar toda a documentação de conteúdo já escrita em cima
  deles. Se o negócio realmente quiser os ids em inglês, isso exige uma decisão consciente e
  separada (ver `docs/IMPLEMENTATION-STAGE-08.md`).
- **[Fase 8] Perguntas de Site, Tráfego Pago e Design/Social Media reescritas como dados
  declarativos (`Question[]`, com `condition` para visibilidade)** — sem alterar nenhum texto,
  opção ou comportamento já aprovado. O dispatcher "qual a próxima pergunta" continua usando
  funções dedicadas por serviço (não um único walker genérico), porque a ramificação de Design
  (combinação de serviços com deduplicação) não é representável como uma lista estática única sem
  perder a ordem correta — decisão de engenharia registrada, não uma limitação de conteúdo.
- **[Fase 8] Salvamento automático de um serviço NOVO ao concluir o mini-fluxo fica na camada de
  UI (efeito do componente), não no reducer** — o reducer nunca dispara ações sozinho; quem decide
  "está completo, pode salvar" e chama a ação é o componente, usando a função pura exportada
  `isDraftReadyToAutoSave`. Editar sempre exige confirmação explícita, nunca salva sozinho.
- **[Fase 8] Nova ação de reducer `EDIT_DRAFT_FIELD`, para reabrir uma pergunta específica já
  respondida dentro de um rascunho de edição** — sem isso, entrar em modo de edição de um serviço
  já completo não tinha como levar a uma pergunta específica para trocá-la (o dispatcher só sabe
  ir para "a próxima pergunta não respondida", que não existe se tudo já foi respondido). A tela
  de revisão de edição lista cada resposta com um link "Alterar" que aciona essa ação; a cascata de
  invalidação já existente é reaproveitada, não duplicada.
- **[Fase 8] Vitest é o framework de testes adotado** — nenhuma solução de teste existia no
  projeto; Vitest foi escolhido por rodar nativamente em TypeScript/ESM sem configuração de
  transpilação adicional. `@testing-library/react` não foi instalado — nesta fase só há testes de
  lógica pura (sem DOM), rodando em ambiente `"node"`.
- **[Fase 8] Remoção de serviço usa confirmação simples de navegador (`window.confirm`)** — a tela
  dedicada de confirmação (WF-08) fica para a construção da UI final (Fase 9+); usar uma tela
  elaborada agora seria antecipar decisão visual fora do escopo desta fase.
- **[Fase 8] `/admin` não foi criado** — o briefing permitia uma estrutura vazia "caso faça
  sentido"; como não haveria nenhum conteúdo real para proteger ainda, criar a rota vazia seria
  código morto. Fica para quando o painel administrativo (Fase 16) começar a ser construído.
- **[Fase 8] Nenhuma pergunta, categoria, regra de ramificação ou navegação conceitual foi
  redesenhada** — esta fase só transformou decisões já aprovadas em código; qualquer divergência
  encontrada durante a implementação foi registrada aqui, não corrigida silenciosamente.

## Motor do Upgrade Builder (Fase 9)

> Detalhes completos em `docs/IMPLEMENTATION-STAGE-09.md`; aqui só as decisões formais.

- **[Fase 9] Nova função central `getVisibleQuestions(serviceId, answers)`** consolida a
  introspecção de visibilidade já usada implicitamente desde a Fase 8 (`getServiceQuestions` +
  `isQuestionVisible`). Não substitui os dispatchers específicos por serviço
  (`getNextSiteQuestion`/`getNextTrafegoQuestion`/`getNextDesignQuestion`) como "qual é a próxima
  pergunta" — essa continuidade da decisão de arquitetura da Fase 8 foi reavaliada nesta fase e
  mantida, porque o combo de Design (`design_servico` reaproveitado em dois formatos — seleção
  única e depois lista) segue não sendo representável como uma única lista estática sem perder a
  ordem correta.
- **[Fase 9] `invalidateDependentAnswers` foi refatorada para reaproveitar uma função genérica,
  `invalidateAnswersForQuestions(questions, changedFieldId, answers)`**, que opera sobre qualquer
  `Question[]`, não apenas sobre as perguntas reais de um `serviceId`. Motivo: nenhum serviço real
  hoje tem uma cadeia de dependência de 3 níveis (A → B → C) para testar o comportamento recursivo
  pedido nesta fase; extrair a função genérica permitiu um teste isolado com uma cadeia fabricada,
  sem inventar uma pergunta real só para ter o que testar. O comportamento de produção não mudou.
- **[Fase 9] Progresso (`current`/`total`/`percentage`) passou a ser calculado por uma função do
  motor, `getProgress`, em vez de inline dentro de `QuestionRenderer`** — a conta em si
  (`draftHistory.length` vs. `estimateTotalSteps`) já existia desde a Fase 8; só mudou de camada,
  para não deixar regra de negócio dentro de um componente de UI (`docs/TECHNICAL-ARCHITECTURE.md`,
  Seção 6).
- **[Fase 9] Nova função de validação, `validateAnswer(question, value)`**, cobrindo só o que o
  briefing pediu: obrigatoriedade e "ao menos uma opção" em `multi_choice`. Tipos `boolean` e texto
  livre não foram implementados — nenhuma pergunta do catálogo já aprovado precisa deles (perguntas
  sim/não já são `single_choice`); teriam sido código morto.
- **[Fase 9] Dev guard novo, `validateBuilderConfig`, chamado uma vez em desenvolvimento** (efeito
  em `BuilderProvider`, nunca em produção) para detectar id de pergunta ou opção duplicados na
  configuração de dados. Detecção de ciclo de dependência ou de "condição aponta para pergunta
  inexistente" **não foi implementada** — `condition` é uma função opaca (`QuestionCondition`),
  não uma referência declarativa a outro campo, e não há como inspecioná-la estaticamente sem
  executá-la. Registrado como limitação conhecida, não como pendência a resolver na próxima fase.
- **[Fase 9] "Retomar edição na pergunta certa" (sugestão do briefing: abrir na primeira pergunta
  já respondida) não foi adotada literalmente** — a Fase 8 já havia implementado algo mais completo
  (tela de revisão com todas as respostas confirmadas de uma vez, cada uma com "Alterar" próprio),
  que já cumpre o objetivo real (previsibilidade da revisão) de forma mais direta que abrir numa
  única pergunta (primeira ou última). Mantido como estava, com a nova função `getVisibleQuestions`
  alimentando essa lista em vez de um filtro manual repetido.
- **[Fase 9] `single_choice` continua avançando sozinho ao clicar numa opção** (não existe botão
  "Continuar" separado para esse tipo) — comportamento que já existia desde a Fase 8, reavaliado
  contra a seção de "auto-advance" desta fase e mantido como está: já é simples, previsível e
  acessível (`<button>` nativo), sem necessidade de um mecanismo de configuração por pergunta.
- **[Fase 9] Ambiente de testes ganhou suporte a testes de componente**: `@testing-library/react` e
  `jsdom` foram adicionados como devDependencies (a Fase 8 havia deliberadamente deixado isso de
  fora, só com testes de lógica pura em ambiente `"node"`). O ambiente padrão do Vitest continua
  `"node"`; os arquivos `.test.tsx` que precisam de DOM declaram `// @vitest-environment jsdom` no
  próprio arquivo, em vez de mudar o ambiente padrão de toda a suíte.
- **[Fase 9] Nenhuma pergunta, categoria, regra de ramificação ou navegação conceitual foi
  redesenhada** — esta fase só implementou lógica funcional sobre decisões já aprovadas.

## Sistema Meu Upgrade (Fase 10)

> Detalhes completos em `docs/IMPLEMENTATION-STAGE-10.md`; aqui só as decisões formais.

- **[Fase 10] O "Meu Upgrade" é confirmado, nesta fase, como uma seção persistente do Builder, não
  um modal nem uma rota** — decisão já implícita desde a Fase 8, agora formalizada porque ela evita
  a necessidade de um mecanismo de `returnContext` para "voltar depois de editar" que o briefing
  desta fase cogitava: como o painel nunca sai da tela, salvar/cancelar uma edição só atualiza o que
  ele mostra, sem navegação de volta a lugar nenhum. Contrapartida aceita: a UI permite, na prática,
  ver "Editar" e "Remover" do mesmo item ao mesmo tempo em dois lugares (o painel e a tela de
  edição); a correção de consistência (Seção 9 do documento de implementação) foi feita no reducer,
  não eliminando essa sobreposição na UI.
- **[Fase 10] Correção real de bug: `REMOVE_SERVICE` agora limpa `activeService`/`editingService`/
  `serviceDraft` quando o serviço removido é o mesmo que está ativo/em edição no momento** — antes,
  remover pelo painel um serviço que estava sendo editado ao mesmo tempo deixava esses campos
  apontando para um item que não existe mais em `confirmedServices`.
- **[Fase 10] Nova função `hasPendingDraft(state)` não é `activeService !== null`** — logo após uma
  configuração NOVA salvar sozinha (Fase 8), `activeService` continua preenchido só para a tela de
  conclusão saber o que mostrar, com `serviceDraft` já vazio; tratar isso como "rascunho pendente"
  seria um falso positivo, bloqueando "Finalizar projeto" sem nenhum motivo real. A função considera
  pendente apenas uma edição aberta (`editingService` não-nulo) ou uma configuração nova com pelo
  menos uma resposta já dada.
- **[Fase 10] "Finalizar projeto" com rascunho pendente não é resolvido com `window.confirm`,
  nem bloqueando o botão silenciosamente** — abre um aviso inline com "Continuar edição"/"Descartar
  alterações", reaproveitando a mesma `cancelServiceDraft()` já usada em qualquer cancelamento
  (nenhuma lógica de descarte paralela). O reducer também recusa `FINALIZE_PROJECT` nessas
  condições, como segunda camada de garantia.
- **[Fase 10] `window.confirm` da remoção (decisão provisória da Fase 8) foi substituído por um
  componente real, `RemoveServiceDialog`** — não só por fidelidade ao WF-08, mas porque
  `window.confirm` não é automatizável de forma confiável nos testes de componente que esta fase
  exige. Ainda não é a UI final (sem *focus trap* completo), apenas deixou de ser um stub do
  navegador.
- **[Fase 10] Dois gaps reais da Fase 8 corrigidos**: (1) o botão de estado vazio do Meu Upgrade
  chamava `startNewService("site")` diretamente, em vez de levar ao seletor como o próprio texto do
  botão ("Adicionar um serviço") sugeria; (2) não existia nenhum "+ Adicionar outro serviço" visível
  quando já havia 1+ serviço confirmado — só havia o botão (desabilitado) de finalizar. Os dois
  contrariavam WF-06/WF-13 já aprovados; corrigidos nesta fase, não redesenhados.
- **[Fase 10] `BuilderProvider` ganhou uma prop opcional `initialState`, só para testes** — permite
  montar o Provider já num estado específico (ex.: "Site confirmado") sem precisar simular cliques
  por toda a árvore de perguntas em cada teste de componente do Meu Upgrade. Nunca usada em
  produção (o app real sempre monta a partir de `initialBuilderState`, o valor padrão do parâmetro).
- **[Fase 10] Nenhuma pergunta, categoria, regra de ramificação ou navegação conceitual foi
  redesenhada** — esta fase só implementou o gerenciamento dos serviços já confirmados.

## Resumo Final do Projeto (Fase 11)

> Detalhes completos em `docs/IMPLEMENTATION-STAGE-11.md`; aqui só as decisões formais.

- **[Fase 11] Não foi criada uma segunda função de lógica para o "resumo detalhado"** — analisada a
  função existente (`buildServiceSummary`, Fase 9), a diferença entre "resumo curto" (Meu Upgrade,
  Fase 10) e "resumo detalhado" (Resumo do Projeto, Fase 11) nunca foi uma diferença de dados, só de
  quantos itens a UI decide mostrar. `buildServiceSummary` já retornava a lista completa desde a
  Fase 9; a Fase 10 apenas cortava essa lista em 3 itens na camada de exibição
  (`MyUpgradeItem`). O Resumo do Projeto usa a mesma função, sem cortar. Evita "funções
  praticamente idênticas", como pedido no briefing desta fase.
- **[Fase 11] Duas novas funções paralelas, `buildProjectSummary` (DISPLAY SUMMARY) e
  `buildProjectSnapshot` (PROJECT SNAPSHOT)** — deliberadamente separadas (uma para apresentação,
  outra para dados), mas garantidamente consistentes entre si por lerem o mesmo
  `confirmedServices` e iterarem na mesma ordem (`Object.entries`, preserva a ordem de inserção,
  mesmo princípio já usado no Meu Upgrade da Fase 10).
- **[Fase 11] Novo campo `returnStep` em `BuilderState`, o "returnContext" pedido no briefing** — a
  Fase 10 havia decidido conscientemente não precisar de um mecanismo assim, porque o Meu Upgrade
  nunca saía da tela. O Resumo do Projeto é diferente (é uma tela própria, da qual se sai e para a
  qual se volta), então esse mecanismo passou a ser necessário de verdade nesta fase — implementado
  do jeito mais simples possível: um campo com dois valores possíveis
  (`"choosing_service"` | `"reviewing"`), não uma pilha de navegação genérica.
- **[Fase 11] Correção real encontrada no teste manual: o painel "Meu Upgrade" duplicava as ações
  de Editar/Remover da nova tela de Resumo do Projeto**, por ficar visível ao mesmo tempo (a
  decisão da Fase 10 de mantê-lo como seção persistente não previa uma segunda tela com as mesmas
  ações). Corrigido: o painel não é mais renderizado durante `"reviewing"`/`"contact"` — essas
  telas já têm sua própria forma de editar/remover/navegar. Nenhum teste automatizado pegou isso
  (cada teste de componente verificava seu próprio widget isoladamente) — foi o teste manual
  exigido nesta fase que revelou o problema.
- **[Fase 11] `buildServiceSummary` ganhou uma segunda camada defensiva de filtragem** (checagem
  explícita de `isQuestionVisible`, além de `value !== undefined`) e um aviso de desenvolvimento
  (`console.warn`, nunca em produção) para campo desconhecido em `answers` — nenhuma das duas é
  uma correção de bug encontrado; são defesas em profundidade pedidas explicitamente pelo briefing
  desta fase ("Filtragem", "Erros").
- **[Fase 11] Nova ação de reducer `CONTINUE_TO_CONTACT` e componente `ContactPlaceholder`** — só
  confirmam a transição para o estado `"contact"`; nenhum formulário real foi implementado (Etapa
  12).
- **[Fase 11] Nenhuma pergunta, categoria, regra de ramificação ou navegação conceitual foi
  redesenhada** — esta fase só implementou a revisão final sobre decisões já aprovadas.

## Captura e Validação do Lead (Fase 12)

> Detalhes completos em `docs/IMPLEMENTATION-STAGE-12.md`; aqui só as decisões formais.

- **[Fase 12] React Hook Form + Zod usados exatamente como já aprovado na Fase 6**
  (`docs/TECHNICAL-ARCHITECTURE.md`, Seção 18, especificamente para o formulário de contato) — duas
  dependências novas instaladas (`react-hook-form`, `zod`, mais `@hookform/resolvers` para o
  `zodResolver`). Zod instalado na versão 4 (mais recente disponível no momento), não a versão 3
  implícita na redação original da Fase 6 — a API usada (`z.object`, `.transform`, `.pipe`,
  `z.email()`) foi validada compatível.
- **[Fase 12] `leadDraft` vive num `LeadProvider` totalmente separado de `BuilderState`, montado ao
  lado de (não dentro de) `BuilderProvider`** — necessário porque o componente do formulário é
  desmontado/remontado pela própria navegação do Builder (`BuilderShell` troca de tela por
  `state.step`), e um estado local dentro do componente não sobreviveria a isso. `useState` simples
  (não um reducer), porque a única operação necessária é substituir o rascunho inteiro.
- **[Fase 12] `buildLeadPayload` recebe `LeadContactData` (já normalizado pelo schema) e
  `ProjectSnapshot`, e só monta a estrutura final** — nenhuma normalização é repetida ali. O
  `Project Snapshot` é recalculado a partir de `confirmedServices` no momento exato do submit, nunca
  guardado com antecedência, para nunca correr o risco de enviar uma versão desatualizada do
  projeto.
- **[Fase 12] Descoberta real: `mode: "onBlur"` + `reValidateMode: "onChange"` (o padrão do React
  Hook Form) não estava revalidando um campo de forma confiável nesta combinação de versões (RHF 7
  + `@hookform/resolvers` + Zod 4)** — reproduzido isoladamente antes de assumir que fosse um erro
  de implementação deste projeto. Corrigido com `trigger(field)` explícito no `onChange` de cada
  campo, disparado só quando aquele campo já tem um erro exibido. `@testing-library/user-event` foi
  adicionado como devDependency durante essa investigação (mais realista que `fireEvent` para
  simular digitação em formulários RHF), mas o problema raiz não era o método de teste — se
  confirmou reproduzível com ambos.
- **[Fase 12] O submit provisório aceita um `simulateFailure` acionável via `?simulateLeadFailure=1`
  na URL, só para permitir testar manualmente o estado de falha (WF-12) no navegador** — sem
  nenhuma outra forma de disparar uma falha real nesta fase (não existe backend ainda). Documentado
  explicitamente como conveniência de QA a ser removida quando a Etapa 13 acrescentar uma chamada
  de rede real.
- **[Fase 12] Texto de sucesso é "Projeto validado com sucesso.", não "Recebemos seu projeto."** —
  em qualquer ambiente (não varia por `NODE_ENV`), porque a razão de não afirmar recebimento não é
  sobre modo de build, é sobre a integração comercial real ainda não existir em nenhum ambiente
  desta fase.
- **[Fase 12] Nenhuma pergunta, categoria, regra de ramificação ou navegação conceitual foi
  redesenhada** — esta fase só implementou a captura e validação do lead sobre decisões já
  aprovadas.

## Infraestrutura Supabase (Fase 13)

> Detalhes completos em `docs/IMPLEMENTATION-STAGE-13.md`; aqui só as decisões formais.

- **[Fase 13] Estrutura implementada exatamente como já planejada nas Fases 1/6**
  (`docs/DECISIONS.md`, Fase 1/6; `docs/FOLDER-STRUCTURE.md`) — `lib/supabase/{client,server}.ts`,
  `lib/repositories/leads.ts`, `features/lead/actions/submitLead.ts` como Server Action (não Route
  Handler — decisão da Fase 6 mantida: "Server Actions são o mecanismo principal para o envio do
  lead"). Nenhuma estrutura paralela foi criada.
- **[Fase 13] Biblioteca instalada: `@supabase/supabase-js`** (cliente oficial). `@supabase/ssr` não
  foi instalada — ela existe para sincronizar sessão de autenticação via cookies, e este projeto
  ainda não usa Supabase Auth; adicionar essa dependência agora seria antecipar uma necessidade que
  não existe. Também instalado `server-only` (pacote oficial do React/Next), como trava adicional
  em `lib/supabase/server.ts` e `lib/repositories/leads.ts` contra importação acidental a partir de
  um Client Component.
- **[Fase 13] `server-only` precisou de um alias no Vitest** (`vitest.config.ts`, resolve.alias)
  apontando para a própria variante vazia (`node_modules/server-only/empty.js`) que o pacote já
  publica. Fora do bundler do Next (que resolve `server-only` como no-op via a condição de exports
  `"react-server"`), o pacote lança um erro incondicional — reproduzido isoladamente antes de mudar
  a configuração. A proteção real continua acontecendo no build do Next; o alias só evita que os
  testes quebrem por rodarem em Node puro.
- **[Fase 13] Apenas uma tabela criada agora: `upgrade_leads`** (nome sugerido no briefing desta
  fase, sem conflito com `docs/DATA-MODEL-CONCEPT.md`, que não define nomes de tabela). `Session`,
  `Project` e `Event` (entidades conceituais do modelo de dados) continuam fora de escopo — não
  avançar para CRM/Lead Score/Analytics nesta fase.
- **[Fase 13] `project` (o PROJECT SNAPSHOT) é gravado como uma coluna `jsonb` única**, não
  normalizado em tabelas próprias — mesma justificativa já registrada em
  `docs/DATA-MODEL-CONCEPT.md` para `ServiceConfiguration.answers` (volume pequeno, sem necessidade
  de consultar respostas individuais fora do contexto do lead).
- **[Fase 13] RLS habilitada em `upgrade_leads` sem nenhuma policy, mais um `revoke all` explícito
  para `anon`/`authenticated`** — com RLS ligada e zero policies, toda operação via chave anônima ou
  autenticada já é negada por padrão; o `revoke` é defesa em profundidade contra qualquer GRANT
  herdado do schema. Apenas a service role key (exclusiva do servidor) grava leads.
- **[Fase 13] `idempotencyKey` novo em `LeadPayload.meta`, gerado uma vez por `LeadProvider`**
  (`crypto.randomUUID()`, com um fallback simples se indisponível) e reutilizado em qualquer
  reenvio dentro da mesma sessão de página (ex.: "Tentar novamente" depois de uma falha). A coluna
  `idempotency_key` no banco tem constraint UNIQUE; uma violação de unicidade (Postgres `23505`) é
  tratada como sucesso do ponto de vista de quem enviou — o lead já existe.
- **[Fase 13] Segunda camada de validação criada no servidor: `leadPayloadSchema`, usada só dentro
  de `submitLead`** — não reaproveita `leadFormSchema` (que valida a ENTRADA bruta do formulário e
  normaliza) porque o formato que chega numa Server Action já é a SAÍDA normalizada; um schema que
  valida forma/sanidade da saída é uma responsabilidade genuinamente diferente, não uma duplicata
  ("evitar funções praticamente idênticas" continua valendo, e aqui as duas funções fazem coisas
  diferentes o bastante para justificar existirem separadas).
- **[Fase 13] O simulador local do submit (`features/lead/logic/submitLeadPayload.ts`, Fase 12) foi
  removido e substituído pela chamada real a `submitLead`** — exatamente como a Fase 12 já havia
  documentado ("removível quando a Etapa 13 acrescentar uma chamada de rede real"). Pelo mesmo
  motivo, a conveniência de QA `?simulateLeadFailure=1` também foi removida: com a chamada real,
  qualquer ambiente sem credenciais do Supabase já produz uma falha genuína e recuperável, sem
  precisar de um atalho de URL para ser testada manualmente. Os testes de componente que dependiam
  desse parâmetro agora mockam `submitLead` diretamente (`vi.mock`), um padrão mais correto para
  testar o `LeadForm` sem depender de rede/banco.
- **[Fase 13] Ausência de credenciais nunca quebra `next build`/`next dev`** — os clientes Supabase
  só são instanciados sob demanda (dentro de uma função, nunca no topo do módulo); o erro só ocorre
  quando uma operação real de banco é tentada, e nesse caso ele é logado no servidor e devolvido à
  UI como a mesma mensagem genérica de falha já usada na Fase 12 ("Não conseguimos enviar agora.
  Seus dados continuam preenchidos.") — nunca escondido, nunca fingindo sucesso.
- **[Fase 13] Nenhuma pergunta, categoria, regra de ramificação ou navegação conceitual foi
  redesenhada; nenhum painel administrativo, Lead Score, analytics, WhatsApp ou e-mail reais foram
  implementados** — esta fase só preparou a infraestrutura de persistência do lead.
- **[Fase 13 - correção] A migração original esquecia o `GRANT` explícito para `service_role`** —
  descoberto ao testar a conexão real com o Supabase do usuário: RLS habilitada e `service_role` com
  o atributo `BYPASSRLS` não bastam sozinhos; sem um `GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.upgrade_leads TO service_role` explícito, o Postgres ainda nega no nível de privilégio de
  tabela (`42501 — permission denied`), antes mesmo de RLS entrar em jogo. Corrigido em
  `supabase/migrations/20260914000000_create_upgrade_leads.sql`. RLS e `GRANT` são duas camadas
  independentes no Postgres — lição registrada aqui para não repetir o mesmo esquecimento em
  futuras tabelas.

## Salvamento de Sessões e Abandono (Fase 14)

> Detalhes completos em `docs/SESSION-PERSISTENCE.md` e `docs/IMPLEMENTATION-STAGE-14.md`; aqui só
> as decisões formais.

- **[Fase 14] `sessionId` fica fora de `BuilderState`, como estado local do hook de persistência**
  — `docs/TECHNICAL-ARCHITECTURE.md` (Fase 6) esboçava um campo `sessionId` dentro do reducer, mas
  esse esboço é anterior à forma real que `BuilderState` tomou depois (Fase 8+). Nada na UI precisa
  ler `sessionId` reativamente hoje, e misturar uma preocupação de infraestrutura dentro do estado
  de negócio puro do Builder não trazia benefício concreto.
- **[Fase 14] `localStorage`, chave versionada `upgrade-builder:v1`, TTL de 7 dias** — exatamente a
  estratégia já planejada em `docs/TECHNICAL-ARCHITECTURE.md`, Seção 23, mantida sem mudança de
  direção.
- **[Fase 14] Validação em duas etapas separadas**: `validateStoredSession` (Zod — forma, version,
  TTL; descarta a sessão inteira só nesses casos) e `sanitizeRestoredSession` (coerência de negócio —
  serviceId desconhecido, edição sem rascunho, step incoerente; neutraliza só o campo afetado, nunca
  descarta a sessão inteira por um único valor ruim).
- **[Fase 14] Descoberta real durante o teste manual: um único debounce cobrindo Builder e
  `leadDraft` causava perda de dados** — um `setTimeout` agendado num efeito que só depende de
  `leadDraft` fecha sobre o `state` de quando foi agendado, não o de quando dispara; um refresh
  rápido depois de uma ação discreta (ex.: "Cancelar edição") podia perder exatamente essa mudança.
  Corrigido separando os dois auto-saves (Builder imediato, `leadDraft` com debounce de 300ms via
  `useRef` para sempre ler o `state` mais atual). Documentado em detalhe em
  `docs/SESSION-PERSISTENCE.md`, Seção 9.
- **[Fase 14] Sessão anônima no Supabase avaliada e não implementada** — sem consumidor real ainda
  (analytics é Fase 17); `buildAbandonmentSnapshot` prepara a estrutura conceitual sem conectá-la a
  nada. `session_id` também não foi adicionado a `upgrade_leads` pelo mesmo motivo — sem utilidade
  concreta hoje.
- **[Fase 14] `idempotencyKey` (Fase 13) não é persistida entre refreshes** — continua gerada uma
  vez por carregamento de página; como nada é enviado com a chave antiga antes de um refresh, isso
  não tem efeito colateral real.
- **[Fase 14] Sem sincronização multi-tab** — "a última gravação vence", limitação conhecida e
  aceitável (o briefing marcou isso como opcional).
- **[Fase 14] Nenhuma pergunta, categoria, regra de ramificação ou navegação conceitual foi
  redesenhada; nenhum Lead Score, admin, analytics completo, e-mail/WhatsApp finais ou UI/motion
  premium foram implementados** — esta fase só implementou persistência local e a preparação
  conceitual de abandono.

## Lead Score (Fase 15)

> Detalhes completos em `docs/LEAD-SCORE.md` e `docs/IMPLEMENTATION-STAGE-15.md`; aqui só as
> decisões formais.

- **[Fase 15] Sinais do `PRICE_SIGNAL`/`LEAD_SCORE_SIGNAL` originais (`docs/BUSINESS-RULES.md`)
  foram revisados, não reaproveitados literalmente** — vários campos que aquela tabela cita
  (`trafego_negocio`, `design_formato`, `social_necessidade`, uma pergunta de "abrangência")
  pertenciam a uma versão do Builder anterior à simplificação da Fase 8, ou nunca chegaram a
  existir como pergunta real. O score usa apenas os campos que realmente existem hoje:
  `site_tipo`, `trafego_investimento`, `trafego_experiencia`, `design_servico`, e a contagem de
  serviços confirmados.
- **[Fase 15] Nenhum bônus adicional de "multisserviço" além da contagem de serviços** — o
  briefing descrevia as duas estratégias como alternativas, nunca como soma; usar as duas
  pontuaria o mesmo sinal (múltiplos serviços) duas vezes.
- **[Fase 15] "Montar um pacote" (Design combinado) pontua como bônus fixo, não como soma dos
  itens individuais** — evita inflar um projeto que já ganha pontos por ser multisserviço (se
  combinado com Site/Tráfego) e pelo próprio conteúdo do pacote.
- **[Fase 15] Nenhuma classificação de complexidade (`LOW`/`MEDIUM`/`HIGH`/`PREMIUM`) foi
  introduzida** — não existia nenhuma no código para reaproveitar, e `site_tipo` já cumpre esse
  papel; criar uma camada nova só duplicaria o mesmo sinal.
- **[Fase 15] Colunas de score em `upgrade_leads`, não numa tabela `projects` separada** — o
  briefing preferia "projects" (o score depende do projeto), mas esta arquitetura (Fase 13) nunca
  criou essa tabela; o Project Snapshot já vive como JSONB na mesma linha do lead. Criar uma tabela
  nova agora seria reestruturar o schema sem necessidade concreta desta fase.
- **[Fase 15] Cálculo inteiramente em TypeScript no servidor (`submitLead.ts`), nada em SQL** —
  consistente com a Fase 6 ("regra comercial em TypeScript server-side"); a persistência
  (`leads.ts`) só grava o resultado já calculado.
- **[Fase 15] Sem backfill automático para leads gravados antes da migration** — ficam com as 4
  colunas novas `NULL`; um recálculo é possível depois porque `project` (JSONB) já tem tudo que
  `calculateLeadScore` precisa, mas nenhum job foi criado agora (não pedido nesta fase).
- **[Fase 15] Nenhuma pergunta nova foi adicionada ao Builder só para alimentar o score** (ex.:
  urgência, porte da empresa) — se o dado não existe, o sinal simplesmente não é usado.
- **[Fase 15] Nenhuma pergunta, categoria, regra de ramificação ou navegação conceitual foi
  redesenhada; nenhum painel administrativo, filtro visual, dashboard, analytics, e-mail/WhatsApp
  finais ou UI premium foram implementados** — esta fase só calculou e persistiu o Lead Score.

## Painel Administrativo / Mini-CRM (Fase 16)

> Detalhes completos em `docs/ADMIN-CRM.md` e `docs/IMPLEMENTATION-STAGE-16.md`; aqui só as
> decisões formais.

- **[Fase 16] `middleware.ts` planejado na Fase 6 virou `proxy.ts`** — o Next.js 16 (a versão real
  usada neste projeto) depreciou o arquivo `middleware.js/ts` em favor de `proxy.js/ts`; mesmo
  arquivo, mesmo propósito, nome novo. Descoberto ao consultar
  `node_modules/next/dist/docs/.../file-conventions/middleware.md` antes de escrever o código,
  como o projeto exige para toda API do Next.
- **[Fase 16] `@supabase/ssr` instalado agora, revertendo a decisão da Fase 13 de não instalá-lo**
  — na ocasião não havia necessidade real de sessão de usuário (só o envio público do lead, via
  service role); agora existe login de admin de verdade, e `@supabase/ssr` é o pacote oficial para
  sincronizar sessão via cookies entre cliente e servidor no App Router.
- **[Fase 16] Duas checagens de acesso deliberadamente redundantes**: `proxy.ts` faz uma checagem
  OTIMISTA (existe sessão?) e renova o cookie; `lib/auth/adminSession.ts` (`requireAdminSession`)
  faz a checagem REAL (é admin de verdade?), chamada explicitamente em cada página/Server Action —
  não confiar só na Proxy ou só na layout é a recomendação da própria documentação do Next
  (`.../authentication.md`, "Layouts and auth checks": layouts não re-executam em toda navegação
  client-side dentro da mesma rota).
- **[Fase 16] "Estar autenticado" não implica ser admin** — tabela `admin_users` própria, RLS
  restrita a "um usuário só confere a si mesmo". Sem UI para gerenciar admins nesta fase; o
  primeiro (e qualquer) admin é criado via SQL Editor.
- **[Fase 16] Tabelas novas nomeadas `upgrade_lead_notes`/`upgrade_lead_status_history`, não
  `project_notes`/`project_status_history`** (como o briefing sugeria) — consistente com
  `upgrade_leads`, a única tabela que esta arquitetura já tem (mesma decisão já registrada na Fase
  15 para as colunas de score).
- **[Fase 16] `status` ganhou só 6 valores; `qualified` foi avaliado e descartado** — ficaria
  ambíguo entre `contacted` e `meeting`, sem uma ação própria clara que o justificasse.
- **[Fase 16] Histórico de status implementado (não só preparado)** — o briefing pedia para
  preferir implementar quando "barato estruturalmente"; uma tabela append-only simples
  (`upgrade_lead_status_history`) atendeu isso sem complexidade extra.
- **[Fase 16] Reaproveitamento deliberado de `buildServiceSummary` (`features/builder/logic`) a
  partir de `features/admin`** — uma exceção estreita à regra da Fase 6 ("nunca admin → builder"),
  que foi pensada para never acoplar COMPONENTES/ESTADO entre as duas features, não para proibir
  reúso de uma função pura de formatação/labels. Duplicar essa lógica em vez de reaproveitá-la
  contrariaria um princípio mais forte e já estabelecido ("evitar funções praticamente idênticas",
  Etapa 11). `features/admin` continua sem importar nada de `features/builder/components` ou
  `features/builder/state`.
- **[Fase 16] Coluna `archived_at` criada, mas sem nenhuma UI/ação que a use** — preparação barata
  (uma coluna nullable) para o "arquivar em vez de excluir" que o briefing pediu para não
  implementar ainda.
- **[Fase 16] GRANT restrito à coluna `status`** (`grant update (status) on upgrade_leads to
  authenticated`) — RLS restringe LINHAS, não colunas; sem esse grant específico, uma sessão de
  admin (ou um bug futuro na Server Action) poderia tentar atualizar qualquer coluna, incluindo
  `lead_score`. Descoberta já formalizada como padrão desde a correção da Fase 13 (RLS e GRANT são
  camadas independentes).
- **[Fase 16] Descoberta real: `z.string().uuid()` não funciona nesta versão do Zod v4** (retorna
  `success: false` mesmo para UUIDs válidos) — o validador correto é `z.uuid()` (nível superior),
  mesma mudança de API já documentada para `z.email()` desde a Fase 12. Corrigido em
  `updateLeadStatus.ts`/`addLeadNote.ts`, descoberto por um teste automatizado (não por inspeção
  manual) que falhava para um UUID genuinamente válido.
- **[Fase 16] Nenhuma pergunta, categoria, regra de ramificação ou navegação conceitual foi
  redesenhada; nenhum analytics completo, automação comercial, e-mail/WhatsApp reais, Kanban ou UI
  premium foram implementados** — esta fase só construiu o painel administrativo.

## Analytics e Eventos (Fase 17)

> Detalhes completos em `docs/ANALYTICS.md`, `docs/ANALYTICS-EVENTS.md` e
> `docs/IMPLEMENTATION-STAGE-17.md`; aqui só as decisões formais.

- **[Fase 17] `session_id` deixou de ser exclusivo do Builder — agora tem um dono canônico**
  (`lib/analytics/session.ts`) — a Fase 14 gerava o id dentro de
  `useBuilderSessionPersistence.ts` porque, até então, só o Builder precisava de um; esta fase
  precisa de `page_view` em QUALQUER página (Home, `/projetos`), então o id passou a ser gerado/
  reutilizado por um módulo próprio, site-wide, e o Builder passou a ADOTAR esse mesmo id em vez de
  gerar o seu. Nenhum formato/TTL mudou — só a origem do id.
- **`question_answered` avaliado e NÃO implementado** — o briefing pediu para analisar se valia a
  pena. Decisão: não, para V1. `service_selected`/`service_completed` já respondem "onde as pessoas
  abandonam" em granularidade de serviço/etapa, que é o que as 12 perguntas de negócio do briefing
  (Seção "Objetivo") realmente pedem; granularidade de pergunta-a-pergunta multiplicaria o volume
  de eventos sem uma pergunta de negócio concreta esperando por ela ainda.
- **`service_started` não existe como evento próprio** — combinado com `service_selected`, porque
  neste fluxo escolher um serviço novo já inicia a configuração imediatamente (não há uma etapa de
  "abrir o serviço" separada de "começar a responder"); o próprio briefing previu essa fusão como
  aceitável quando os dois são semanticamente iguais.
- **`whatsapp_clicked` existe só no contrato de tipos, sem nenhum ponto de disparo** — o site
  público não tem hoje nenhum botão de WhatsApp para o visitante (só o Builder → formulário), e o
  botão que existe (Fase 16, dentro do admin) é uma ação do administrador, não do visitante —
  disparar o mesmo evento por ali misturaria uma ação interna com o funil público, o que o próprio
  briefing pediu para evitar.
- **`lead_score_tier` deliberadamente EXCLUÍDO das propriedades de `lead_submitted`**, mesmo o
  briefing permitindo "se seguro e útil" — a Fase 15 estabeleceu que o score é um dado comercial
  interno que nunca chega ao cliente; um evento de analytics disparado no NAVEGADOR (visível em
  qualquer inspetor de rede) é, por definição, do lado do cliente. Incluir o tier ali reabriria
  exatamente o vazamento que a Fase 15 fechou.
- **Associação sessão → projeto convertido feita via `idempotencyKey` nas propriedades do evento,
  não por um `project_id` populado no momento da escrita** — a coluna `project_id` existe na
  tabela (preparada, nullable, com FK), mas populá-la exigiria devolver o `id` do lead recém-criado
  para o cliente disparar o evento (quebrando a Fase 15: o cliente nunca deveria precisar desse id)
  ou fazer o `submitLead` gravar o evento diretamente no servidor (criando uma segunda via de
  escrita assimétrica em relação a todo o resto do funil). Como `idempotencyKey` já é gravada tanto
  em `upgrade_leads.idempotency_key` quanto na propriedade do evento, um JOIN entre as duas tabelas
  resolve a mesma pergunta sem nenhuma das duas complicações — ver `docs/ANALYTICS.md`, Seção
  "Conversão".
- **`recordEvent` (`features/analytics/actions/recordEvent.ts`) é a única exceção deliberada à
  regra da Fase 16 ("nunca uma Server Action genérica")** — lá, a regra existia porque cada mutação
  do admin é uma operação de negócio distinta e sensível; aqui, ingestão de analytics É, por
  natureza, um funil único de entrada. O que impede um evento arbitrário não é ter uma função por
  evento, e sim a validação estrita (`z.strictObject`) contra o formato exato de cada evento
  conhecido — um nome desconhecido ou uma propriedade extra é sempre rejeitado.
- **Escrita de `analytics_events` sempre via service role, nunca `anon` com INSERT liberado** —
  Opção A das duas apresentadas pelo briefing ("envio pelo servidor" vs. "endpoint público
  controlado"); como a Server Action já É o servidor, não existe necessidade de nenhum grant
  público na tabela, e "não conceder SELECT público" fica automaticamente satisfeito (não há
  nenhum grant para `anon`, nem de leitura nem de escrita).
- **Consentimento padrão: `analytics: true`, `marketing: false`** (`lib/analytics/consent.ts`) —
  sem banner real ainda (adiado para a Fase 28, LGPD). `analytics` (GA4 + provider interno) ligado
  por padrão porque é a mesma classe de dado (anônimo, primeira-parte, sem PII) que a persistência
  de sessão da Fase 14 já usa sem exigir consentimento; `marketing` (Meta Pixel, rastreamento de
  publicidade de terceiro) desligado por padrão até existir uma tela real de consentimento.
- **Meta Pixel só recebe UM evento (`lead_submitted` → `Lead`), nunca o funil inteiro** — diferente
  do GA4 (que recebe todos os 12 eventos); um pixel de publicidade de terceiro não deveria replicar
  o funil de uso do produto, só a conversão que o briefing mapeou explicitamente.
- **`analytics_overview` (função SQL) NÃO é `security definer`** — roda com o privilégio de quem
  chamou, então a própria RLS de `analytics_events` decide o que a função enxerga: um admin vê os
  números reais, um autenticado não-admin recebe agregados zerados (nunca um erro), e `anon` nem
  tem `execute` para chamar a função. Mesma filosofia de `is_admin()` já estabelecida na Fase 16.
- **Agregação do funil feita dentro do Postgres (RPC), nunca buscando linha a linha para somar no
  Node** — evita o problema de volume que o próprio briefing alertou ("Analytics não pode travar
  interação... avalie se vale persistir tudo"), sem precisar limitar o que é gravado.
- **"Visão geral" (métricas do admin) vive dentro da MESMA página `/admin`, não numa rota nova** —
  consistente com "não criar dashboard avançado"; usa um parâmetro de busca próprio
  (`analyticsPeriod`) para o seletor de período não colidir com os filtros de lead já existentes na
  mesma URL (`status`/`tier`/`service`/`q`/`sort`/`page`).
- **`SubmitLeadResult` ganhou um campo `errorCategory`** (`"validation" | "persistence" | "unknown"`)
  — extensão mínima e deliberada só para alimentar `lead_submit_failed` com uma categoria segura,
  nunca a mensagem técnica/stack trace.
- **Nenhuma pergunta, categoria, regra de ramificação ou navegação conceitual foi redesenhada;
  nenhum Design System, UI premium, motion avançado, GSAP ou ScrollTrigger foram implementados** —
  esta fase só instrumentou o funil já existente.
- **Descoberta real (pós-deploy da migration): `service_role` também precisa de `GRANT INSERT`
  explícito em `analytics_events`, não só as policies de RLS** — `service_role` ignora RLS (a
  checagem de LINHA), mas isso nunca dispensa o GRANT (a checagem de PRIVILÉGIO da tabela, uma
  camada independente) — mesma lição já registrada nas Fases 13 e 16, agora descoberta também para
  `service_role`, não só para `authenticated`. A migration original concedia SELECT a
  `authenticated` mas não previa nenhum GRANT para `service_role`; corrigido em
  `20260918000001_analytics_events_grant_insert.sql` (nunca editando a migration já aplicada).

## Design System (Fase 18)

> Detalhes completos em `docs/DESIGN-SYSTEM.md` e `docs/IMPLEMENTATION-STAGE-18.md`; aqui só as
> decisões formais.

- **[Fase 18] Tema escuro como padrão/flagship desta identidade, não um "modo escuro opcional"** —
  a referência de marca fornecida mostrava tanto uma versão clara quanto uma escura; o fundo preto
  puro é o que melhor transmite as qualidades pedidas pelo briefing (tecnologia/sofisticação/
  premium). O tema claro continua totalmente tokenizado (`[data-theme="light"]`), mas sem nenhum
  mecanismo de alternância construído nesta fase — só os valores, prontos para quando/se algo
  precisar deles.
- **[Fase 18] Texto sobre uma superfície `--ds-color-accent` (o verde da marca) é sempre
  `--ds-color-on-accent` (quase preto), nunca branco** — medido, não estimado: branco sobre esse
  verde mede só ~2.5:1 de contraste nos dois temas (reprovado no WCAG); um tom quase preto mede
  ~7.5:1. Essa é também a razão de existir `--ds-color-accent-text` como um token separado no tema
  claro (`#158239`, mais escuro que o verde "de superfície") — o verde de marca puro, como TEXTO
  corrido sobre um fundo claro, também reprova o contraste (~2.5:1); como texto sobre fundo escuro,
  o mesmo verde puro já passa (~8:1), então nenhuma variante extra foi necessária lá.
- **[Fase 18] `success`/`warning`/`error`/`info` formam uma família de cor deliberadamente
  separada de `--ds-color-accent`** — o briefing pediu explicitamente para "não usar cores de
  status como identidade principal"; como o verde da marca já é usado como destaque/interação,
  reaproveitá-lo também como "sucesso" faria a marca parecer só mais um painel/dashboard genérico
  em vez de uma identidade própria.
- **[Fase 18] `Checkbox`/`Radio` usam o `<input>` nativo estilizado via `accent-color`, não uma
  caixa desenhada do zero** — um controle nativo já tem todo o comportamento de teclado/leitor de
  tela correto de graça; suficiente para a fundação desta fase, sem impedir um visual mais
  elaborado depois (a API do componente não precisaria mudar).
- **[Fase 18] Novo diretório `features/design-system/`** (componentes-base + `utils/cx.ts`) —
  preenche o `styles/` (só para tokens) e o padrão de organização por feature já reservados desde
  a Fase 6 (`docs/FOLDER-STRUCTURE.md`); nenhum componente-base foi colocado dentro de
  `features/builder`/`lead`/`admin`, para ficar disponível a todos igualmente na Etapa 19.
- **[Fase 18] `Montserrat`/`Inter` carregadas ao lado das fontes Geist já existentes, nunca as
  substituindo** — nenhuma tela atual foi migrada para a nova tipografia; `body { font-family }`
  em `app/globals.css` continua apontando para Geist, exatamente para não mudar visualmente nenhuma
  tela já existente nesta fase (isso é trabalho da Etapa 19).
- **[Fase 18] Rota de showcase (`/design-system`) bloqueada em produção via `notFound()`
  (`process.env.NODE_ENV === "production"`)** — é uma ferramenta de desenvolvimento/validação, não
  uma página real do site; mesmo padrão de guarda "só em desenvolvimento" já usado desde a Fase 9
  (`BuilderProvider`, validação de configuração das perguntas).
- **[Fase 18] Nenhuma dependência nova foi adicionada para os testes** — o projeto não tinha
  `@testing-library/jest-dom` instalado; os testes desta fase usam `expect()` puro sobre
  propriedades/atributos do DOM em vez de introduzir a dependência só para ter matchers mais
  expressivos.
- **[Fase 18] Nenhuma pergunta, categoria, regra de ramificação ou navegação conceitual foi
  redesenhada; nenhuma tela real (Home, Builder, admin) foi alterada visualmente** — esta fase só
  construiu a fundação (tokens + componentes-base), a aplicação real é a Etapa 19.

## UI Final (Fase 19)

> Detalhes completos em `docs/UI-FINAL.md` e `docs/IMPLEMENTATION-STAGE-19.md`; aqui só as decisões
> formais.

- **[Fase 19] Tema escuro único vira o tema real do site** (`app/globals.css`) — a Fase 18 só
  definiu os tokens (dark como flagship, light como alternativa não conectada); esta fase aplica o
  dark de verdade a `body`, confirmando a leitura do briefing ("escolha uma direção principal, não
  dois temas completos só porque a referência mostrava os dois").
- **[Fase 19] Logo oficial ainda não existe como arquivo no projeto — usado um placeholder
  geométrico** (`.logoMark`/`.brandMark`, um quadrado com gradiente diagonal branco→verde) no
  header da Home, do Builder e do admin. A referência de marca foi compartilhada como imagem no
  chat, nunca como um arquivo entregue ao repositório; o briefing pede explicitamente "não
  redesenhar a logo", então a escolha segura foi um placeholder claramente genérico (não uma
  tentativa de reproduzir o símbolo real) até o usuário fornecer o arquivo de verdade.
- **[Fase 19] Badge "Seu Upgrade" adicionado ao Resumo do Projeto sem trocar o título "Confira seu
  projeto"** — o briefing (Seção 15) pede para "mostrar: Seu Upgrade", mas o título atual já era
  usado em 14 asserções de teste diferentes, em 5 arquivos; em vez de reescrever todas por uma
  preferência de copy, um badge complementar acima do título satisfaz o pedido literal sem nenhum
  risco de regressão.
- **[Fase 19] Menu mobile (hambúrguer) criado no header institucional** — descoberto como uma
  lacuna real durante a própria revisão visual manual desta fase: sem ele, os links de navegação
  ("Início", "Projetos") simplesmente desapareciam abaixo de 768px, sem nenhuma forma de
  alcançá-los a não ser rolar até o footer. Não estava no briefing explicitamente, mas é exigido
  pelo próprio princípio da Seção 25 ("criar UI mobile de verdade, não apenas reduzir desktop").
- **[Fase 19] `LeadField` (Fase 12) reescrito para usar `FormField`/`Input` do Design System** —
  os dois já convergiam para o mesmo padrão de acessibilidade (label real, erro com
  `aria-describedby`/`aria-invalid`) de forma independente; mantê-los duplicados depois de o
  Design System existir contrariaria a Seção 30 do briefing ("antes de criar um componente novo,
  verifique se o Design System já tem equivalente — reutilizar, não duplicar").
- **[Fase 19] `data-testid="my-upgrade-panel"` adicionado ao painel do Meu Upgrade** — o cabeçalho
  do drawer ganhou uma estrutura própria (título + contador + botão de fechar), então o padrão de
  teste antigo (`heading.closest("div")`) deixou de alcançar o painel inteiro (parava num `<div>`
  intermediário do cabeçalho). Um `data-testid` estável é mais robusto a mudanças de marcação do
  que depender da distância exata entre um heading e seu ancestral.
- **[Fase 19] `LinkButton` criado como componente novo do Design System** — `Button` continua
  sempre um `<button>` de verdade (uma ação semântica); CTAs que são links de navegação de verdade
  (ex.: "Monte seu Upgrade" no header) precisavam do mesmo visual sem virar um botão que não
  navega. Reaproveita `Button.module.css` integralmente — nenhum token/estilo duplicado.
- **[Fase 19] Copy do `SubmissionSuccess` atualizada** — o aviso "a integração comercial real será
  implementada em uma etapa futura" datava da Etapa 12 e ficou desatualizado desde que a
  persistência real existe (Fase 13); substituído por uma nota de "próximo passo" factualmente
  correta. Nenhum CTA de WhatsApp foi adicionado (briefing, Seção 17, "quando aplicável") — não
  existe nenhum número da própria Upgrade configurado em lugar nenhum do projeto.
- **[Fase 19] Fontes Geist removidas de `app/layout.tsx`** — desde que Montserrat/Inter (Fase 18)
  passaram a ser a tipografia real de todo o site (não só dos componentes novos), Geist não tinha
  mais nenhum consumidor; mantê-las carregadas seria peso desnecessário (briefing, Seção 34,
  "evitar fontes demais").
- **[Fase 19] Nenhuma pergunta, categoria, regra de ramificação, navegação conceitual ou lógica de
  negócio foi alterada** — confirmado componente a componente: toda mudança ficou restrita a JSX
  de apresentação e CSS; nenhum reducer, Server Action, schema ou repositório foi tocado.
- **[Fase 20] Tipografia grande (`display`/`h1`/`h2`) passou a usar `clamp()` no token, não
  `@media` por componente** — o hero da Home (56px) quebrava em até 6 linhas gigantes em telas de
  360-390px; em vez de sobrescrever `font-size` tela a tela, os três tokens de `styles/tokens.css`
  viraram fluidos (mínimo confortável em mobile, o mesmo valor máximo de antes a partir de
  ~1432px) — resolve para todo `Heading` do projeto de uma vez, sem duplicar a regra.
- **[Fase 20] Bug real encontrado e corrigido: `<fieldset>` sem `min-width: 0` estourava a largura
  do formulário de lead em telas estreitas** — `<fieldset>` tem `min-width: min-content` por
  padrão do navegador (o reset global do projeto não cobre isso), então em ≤390px o formulário
  ficava ~28px mais largo que a viewport e o navegador rolava a página horizontalmente ao focar um
  campo, cortando labels e botões. Encontrado só ao testar o fluxo completo com Playwright em
  telas estreitas (não aparecia em nenhum teste automatizado existente, nem visualmente óbvio sem
  inspecionar `scrollLeft`) — corrigido com `min-width: 0` em `.fieldset`
  (`features/lead/components/LeadForm.module.css`). Ver `docs/IMPLEMENTATION-STAGE-20.md`, Seção
  "Problemas encontrados", para o diagnóstico completo.
- **[Fase 20] Breakpoints consolidados, não recriados** — o projeto já tinha `sm(480)/md(768)/
  lg(1024)/xl(1280)` documentados em `styles/tokens.css` desde a Fase 18; esta fase só alinhou os
  pontos que haviam sido usados soltos (ex.: grid de capacidades da Home em 900px) para um desses
  valores, sem introduzir nenhum breakpoint novo (briefing, Seção 1: "não criar dezenas de
  breakpoints").
- **[Fase 20] Nenhuma pergunta, categoria, regra de negócio, Server Action ou schema foi alterada**
  — toda mudança desta fase é CSS (breakpoints, `clamp()`, `min-width`, `dvh`, `safe-area-inset`) ou
  ajuste estrutural mínimo de layout (nenhum componente novo, nenhuma prop nova de comportamento).
- **[Identidade oficial] Manual de marca real recebido — cores e tipografia confirmadas, tokens de
  superfície reajustados** — o usuário enviou pela primeira vez páginas reais do manual de marca
  (antes só uma referência de chat, sem arquivo entregue). `--ds-color-bg` (#000000),
  `--ds-color-text-primary` (#FBFBFB) e `--ds-color-accent` (#2DB958) já batiam exatamente com o
  manual — nenhuma mudança. `--ds-color-surface`/`--ds-color-surface-elevated`/`--ds-color-border`/
  `--ds-color-border-strong` foram reajustados para a família "grafite azulado" (#22313B) do
  manual — `--ds-color-surface-elevated` agora usa esse tom oficial diretamente (antes era um
  cinza neutro mais escuro). Contraste reverificado antes de aplicar: texto primário e secundário
  sobre a nova superfície elevada medem 12.92:1 e 6.08:1 — ambos folgados acima do mínimo AA.
- **[Identidade oficial] Logo oficial aplicada como arquivo real** — inicialmente não encontrei
  nenhum arquivo de imagem correspondente (as imagens tinham chegado só como anexo da conversa);
  o usuário então indicou a pasta local `Downloads/upgrade/`, onde `logo upgrade.png` (fundo preto
  sólido, sem canal alpha — confirmado pixel a pixel) é o arquivo real da marca. Recortei só o
  símbolo "U" (sem o wordmark — "Upgrade" continua sendo texto real em Montserrat, não uma imagem
  rasterizada) e salvei em `public/logo-mark.png`. Os três lugares que usavam o placeholder
  geométrico (`SiteHeader`, `BuilderNavigation`, layout do admin) agora renderizam esse arquivo via
  `next/image` (não `<img>` puro — evita os avisos de lint de LCP/otimização e serve uma versão
  automaticamente redimensionada em vez do PNG de ~175KB inteiro em um ícone de ~22px). O fundo
  preto do arquivo só funciona porque os três cabeçalhos também são pretos/quase-pretos — não há
  ainda uma variante com transparência para uso sobre uma superfície clara.
- **[Identidade oficial] Novo componente `ServiceIcon`** (`features/design-system/components/
  ServiceIcon.tsx`) — o manual de marca pede "ícones lineares e consistentes"; antes cada card de
  serviço (Home e `ServiceSelector`) mostrava só um quadrado com gradiente decorativo, sem símbolo
  nenhum. Um ícone de traço simples (SVG inline, sem biblioteca externa) por `ServiceId` —
  reaproveitado nos dois lugares para a mesma categoria nunca ter dois símbolos diferentes.
- **[Motion Design] Transição de cena via `key` do React, não uma lib de animação** — para dar ao
  Builder a sensação de "cena sai → cena entra" sem adicionar GSAP/Framer Motion nesta fase,
  `SceneTransition` troca o `key` do wrapper de conteúdo a cada mudança de `getSceneKey(state)`,
  forçando remount e a animação CSS de entrada rodar de novo. Limitação aceita conscientemente:
  só a cena NOVA anima a entrada — a anterior desaparece instantaneamente (animar a saída também
  exigiria manter as duas montadas ao mesmo tempo, o que fica para a implementação real com GSAP).
- **[Motion Design] `--ds-easing-base` nunca renomeado** — o briefing pede os nomes "standard/
  emphasized/exit/smooth"; em vez de renomear `--ds-easing-base` (usado em dezenas de arquivos
  desde a Fase 18), foi criado `--ds-easing-standard: var(--ds-easing-base)` como alias semântico
  — o valor é o mesmo, só ganhou um segundo nome canônico, sem exigir tocar em nenhum componente
  existente.
- **[Motion Design] Som opt-in, não opt-out** — `features/design-system/motion/sound.ts` começa
  sempre desligado (`isSoundEnabled()` → `false` até `setSoundEnabled(true)` ser chamado
  explicitamente) porque ainda não existe nenhum controle de mute visível na interface; tocar som
  sem esse controle violaria a própria exigência do briefing ("com possibilidade clara de mute").
- **[Motion Design] `useReducedMotion` via `useSyncExternalStore`, não `useState`+`useEffect`** —
  a primeira versão usava `useState`+`useEffect` e chamava `setState` de forma síncrona dentro do
  efeito, o que o lint (`react-hooks/set-state-in-effect`) sinalizou corretamente como
  anti-padrão; `useSyncExternalStore` é o hook feito exatamente para "ler um valor externo ao
  React e assinar mudanças", com um `getServerSnapshot` dedicado que evita divergência entre o
  HTML do servidor e a primeira renderização do cliente (nenhuma das duas formas muda o
  comportamento observável do hook — só a segunda é o padrão correto do React para este caso).
- **[GSAP e Transições] `window.matchMedia` no ambiente de teste passa a simular
  `prefers-reduced-motion: reduce` por padrão** (`vitest.setup.ts`) — sem isso, 57 testes que não
  têm nada a ver com motion quebravam (`window.matchMedia` não existe em jsdom), e mesmo depois de
  um polyfill neutro, outros 22 continuavam falhando porque uma timeline GSAP real nunca termina
  em jsdom (sem `requestAnimationFrame` de verdade), deixando a cena de saída do crossfade presa
  na tela. Com motion reduzido, `SceneTransition`/`Drawer` resolvem via `gsap.set()` (sem
  timeline), tornando toda transição síncrona nos testes — exatamente a filosofia de teste já
  pedida desde a Fase Motion Design ("testar comportamento, não frame a frame"). Um teste
  específico que precise verificar o caminho de motion completo sobrescreve `window.matchMedia`
  localmente (ver `SceneTransition.test.tsx`).
- **[GSAP e Transições] `SceneTransition` reescrito para um crossfade real com direção** — a
  versão da Fase Motion Design só animava a ENTRADA (via CSS, remontando por `key`); esta fase
  troca para GSAP com saída+entrada coexistindo brevemente (a cena antiga fica sobreposta,
  `position: absolute`, enquanto desaparece) e uma direção (`forward`/`backward`) que os próprios
  botões marcam antes de disparar a ação real. Limitação aceita conscientemente: só a cena NOVA é
  sempre renderizada ao vivo — a de saída é um retrato congelado no instante da troca (necessário
  para ela continuar visível enquanto desaparece sem travar a interatividade da cena nova).
- **[GSAP e Transições] Nenhum plugin `CustomEase`** — os easings do Design System
  (`cubic-bezier`) são aproximados pelos eases nativos do GSAP mais parecidos (`power2.inOut`,
  `expo.out`, `power2.in`, `sine.inOut`) em vez de reproduzir a curva exata — evita depender de um
  plugin com licença própria (Club GreenSock) só para uma fidelidade de curva imperceptível a
  olho nu nesta escala de movimento.
- **[GSAP e Transições] Nenhuma pergunta, categoria, regra de negócio, reducer ou Server Action
  foi alterada** — `isTransitioning`/direção de cena vivem inteiramente no motion
  (`SceneTransition`/`useSceneNavigation`), nunca no `BuilderContext`; confirmado que `gsap` não é
  importado em nenhum arquivo de `features/builder/state/` ou `features/builder/logic/`.
- **[ScrollTrigger e Storytelling] `SectionContainer` ganhou `forwardRef`** — o motion de scroll da
  Home precisa do elemento `<section>` real (`trigger` do ScrollTrigger, escopo do
  `gsap.context`); um componente de função comum não permite isso. Mesmo padrão já usado em
  `Button`/`Input`/`Checkbox`/etc. desde a Fase 18 — nenhum comportamento visual do componente
  mudou, só passou a aceitar `ref`.
- **[ScrollTrigger e Storytelling] Home dividida em 4 Client Components, um por seção**
  (`features/site/components/home/`) — cada seção precisa do seu próprio hook de motion de scroll
  (`useEffect` + `ref`), o que exige "use client"; `app/page.tsx` continua Server Component, só
  compondo os 4 imports, então o HTML inicial da Home continua completo sem depender de JS
  (crawlers/SEO, briefing Etapa 23 Seção 39) — nenhuma copy mudou nessa divisão.
- **[ScrollTrigger e Storytelling] `gsap.matchMedia()` sempre próprio, nunca aninhado dentro do
  mesmo `gsap.context()` que cria outras animações** — aninhar os dois faz um `ScrollTrigger`
  criado dentro do `matchMedia` ser rastreado por ambos os mecanismos de limpeza ao mesmo tempo;
  ao desmontar, o segundo `revert()` encontra nós que o primeiro já moveu/removeu, um
  `NotFoundError` real (reproduzido fora de teste, com o `pin` do desktop de `CapabilitiesSection`
  — ver `docs/IMPLEMENTATION-STAGE-23.md`, Seção 5). Cada hook de scroll agora cria um
  `gsap.context()` (para a parte não-responsiva) e um `gsap.matchMedia()` independente (para a
  parte desktop/mobile), cada um só desfazendo o que criou.
- **[ScrollTrigger e Storytelling] `.fromTo()` em vez de `.from()` para itens sequenciais na mesma
  timeline** (`useRevealScrollMotion.ts`) — `.from()` provou não ser confiável para capturar o
  valor "de chegada" quando há mais de um item na mesma timeline com posicionamento relativo
  (`"<+…"`): o CTA final ficava permanentemente invisível mesmo com o `ScrollTrigger` disparando
  corretamente. Valores explícitos nos dois lados (`.fromTo`) eliminam a ambiguidade — nenhuma
  outra timeline do projeto usa esse padrão (item sequencial + posição relativa na mesma
  timeline), então o problema não se repete em nenhum outro hook.
- **[ScrollTrigger e Storytelling] `pin: true` não é testado no ambiente automatizado (jsdom)** —
  jsdom não tem motor de layout real (`getBoundingClientRect` sempre zero), e o `pin` do
  ScrollTrigger depende de medidas reais para restaurar a estrutura do DOM ao reverter; desmontar
  `CapabilitiesSection` com o pin ativo gera um `NotFoundError` só neste ambiente, nunca visto no
  navegador real (verificado manualmente via Playwright em 8 viewports, `next build` + `next
  start`). O teste correspondente tolera especificamente esse erro conhecido, documentado, e
  continua falhando para qualquer outro — mesma filosofia da Fase GSAP e Transições para o
  problema do `matchMedia`/timeline em jsdom (reconhecer a limitação do ambiente pelo nome, em vez
  de mascará-la ou forçar um teste que não reflete nenhum comportamento real de usuário).
- **[ScrollTrigger e Storytelling] Lenis não implementado** — como pedido explicitamente (Seção
  36/37 do briefing), todo o motion desta fase roda sobre scroll nativo; fica para a Etapa 25.
- **[Prova de Conceito — Experiência do Builder] Feature isolada, nunca dentro de `features/
  builder/`** — `features/builder-experience/` demonstra uma linguagem de interação nova (fundo
  persistente, cards flutuantes, seleção separada de avançar, transição "deck") para a Cena 1
  (escolha de serviço) do Builder, mas não modifica `ServiceSelector`, o reducer, nem nenhuma
  pergunta real — é uma pasta própria que só LÊ dados já aprovados (`SERVICES`,
  `getServiceQuestions`) para exibir conteúdo real na Cena 2, sem nunca salvar nada em
  `BuilderContext`. Só depois de aprovada é que essa linguagem vira candidata a substituir a tela
  real.
- **[Prova de Conceito] Rota de revisão bloqueada em produção** (`app/builder/experiencia/
  page.tsx`) — mesmo padrão de `/design-system` (`notFound()` quando `NODE_ENV === "production"`):
  ferramenta interna de validação, nunca uma tela pública, sem precisar de nenhum mecanismo de
  autenticação/feature-flag novo.
- **[Prova de Conceito] `DeckTransition` é um componente PRÓPRIO desta feature, não uma variante
  da `SceneTransition` real** (`features/design-system/motion/SceneTransition.tsx`, Fase GSAP e
  Transições) — mesmo esqueleto de crossfade (cena atual sempre ao vivo, saída como retrato
  congelado), mas com uma receita visual mais expressiva (escala + blur leve, não só deslocamento +
  opacidade). Mantê-los separados evita qualquer risco de regressão no motion já aprovado do
  Builder real enquanto esta linguagem ainda está em avaliação.
- **[Prova de Conceito] Estado "selecionado" nunca via seletor CSS entre módulos diferentes** —
  uma primeira versão tentou aplicar `.gridHasSelection .card:not(.selected)` a partir do CSS
  module da cena (`ServicePickerScene.module.css`) mirando classes que na verdade pertencem ao CSS
  module de `FloatingCard` — CSS Modules geram nomes de classe únicos por arquivo, então esse
  seletor nunca correspondia a nada de verdade. Corrigido levando o estado "outro card perdeu
  destaque" para uma prop (`dimmed`) do próprio `FloatingCard`, resolvida no CSS module onde
  `.card`/`.selected` de fato vivem.
- **[Prova de Conceito] `--ds-space-5`/`--ds-space-10` não existem na escala de espaçamento**
  (`styles/tokens.css` pula de `--ds-space-4` para `--ds-space-6`, e vai só até `--ds-space-24`) —
  usá-los em algumas regras novas (gap de grid, padding de botão, margem da barra de navegação)
  não gerava erro nenhum (um `var()` para uma custom property inexistente e sem fallback só faz a
  declaração inteira ser ignorada, silenciosamente), e o sintoma só apareceu como espaçamento
  zerado/incorreto numa captura de tela. Corrigido usando sempre um valor real da escala
  (`--ds-space-4`, `--ds-space-6`, `--ds-space-8`) — nenhum outro arquivo do projeto tinha esse
  problema (conferido com um comparativo de todo `var(--ds-*)` usado contra os tokens definidos).
- **[Microinterações] Sound design via síntese Web Audio, nunca um arquivo de áudio gravado** —
  o briefing pede "usar somente assets próprios/licenciados... documentar fonte/licença; não
  copiar áudios do Nodeck". Sem nenhum estúdio de áudio disponível nesta sessão, a saída
  responsável foi sintetizar tons curtos (osciladores + envelope de volume) em tempo real via Web
  Audio API — matematicamente gerados no navegador, sem nenhuma origem externa para licenciar.
  Resolve de graça a exigência de "não carregar biblioteca enorme" (não existe nenhum asset para
  carregar) e elimina qualquer risco de direito autoral.
- **[Microinterações] Cursor customizado como halo companheiro, nunca substituindo a seta
  nativa** — a implementação mais comum de "cursor customizado" esconde o cursor do sistema e
  desenha um substituto; optamos por um halo que só ACOMPANHA a seta nativa (que continua sempre
  visível), reduzindo drasticamente o risco: se o componente falhar por qualquer motivo, a
  navegação normal nunca é afetada, só o halo deixa de aparecer.
- **[Microinterações] `Card` e `LinkButton` ganharam `forwardRef`** — mesmo padrão já usado em
  `Button`/`SectionContainer`/`Input`, necessário para `useTilt`/`useMagneticHover` conseguirem
  medir/animar o elemento real. Nenhuma API pública mudou — só passaram a aceitar `ref`.
- **[Microinterações] Tilt/magnetismo/cursor gated por `useFinePointer()`
  (`(hover: hover) and (pointer: fine)`), nunca por `window.innerWidth`** — uma verificação manual
  inicial redimensionou a janela do navegador para simular "mobile" e concluiu erroneamente que o
  cursor customizado aparecia lá; redimensionar um Chromium de desktop não muda a capacidade real
  do ponteiro. Repetido com emulação de dispositivo touch de verdade (`devices["iPhone 13"]` do
  Playwright) confirmou o comportamento correto. Lição registrada em
  `docs/IMPLEMENTATION-STAGE-24.md` para não se repetir em testes manuais futuros.
- **[Microinterações] `useTilt` também controla o `scale` do clique, não só a rotação** — enquanto
  o ponteiro tilta um card, o GSAP passa a ser dono do `transform` inline dele, e um `transform`
  inline sempre vence qualquer regra de CSS para o mesmo elemento — mesmo um `:active { transform:
  scale(0.97) }` já existente desde fases anteriores. Sem incluir o `scale` do clique dentro do
  próprio `useTilt`, o feedback de pressionar ficaria mascarado sempre que o card já tivesse sido
  tiltado (praticamente sempre, em desktop). Ao sair do card (`pointerleave`), o hook limpa o
  `transform` inline por completo (`clearProps`), devolvendo o controle ao CSS.

- **[Smooth Scroll] Lenis via pacote raiz, provider escrito à mão — não `lenis/react`** — a lib
  oferece um `<ReactLenis>`/`useLenis` prontos, mas usá-los introduziria um padrão de
  componente/hook sem paralelo em nenhum outro lugar do projeto. `SmoothScrollProvider.tsx` segue
  o mesmo estilo de provider pequeno já usado em `Drawer.tsx`/`useReducedMotion.ts`, com controle
  explícito sobre o RAF único exigido pelo briefing (Seção 8).
- **[Smooth Scroll] Escopo por rota dentro de UM provider singleton, não um provider por página**
  — `isSmoothScrollRoute(pathname)` decide, dentro do único `SmoothScrollProvider` montado em
  `app/layout.tsx`, se a instância deve existir. Evita tanto uma árvore de layouts paralela (Seção
  51 do briefing: "não criar arquitetura excessiva") quanto duas instâncias vivas ao mesmo tempo
  (Seção 52).
- **[Smooth Scroll] Hash da URL NÃO tratado em JS próprio — removido depois de escrito** — uma
  primeira versão desta fase reagia a `window.location.hash` dentro do `SmoothScrollProvider`
  (`setTimeout` + `lenis.scrollTo` no mount). Checar
  `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` (exigência do `AGENTS.md`
  desta versão customizada do Next.js: ler a documentação real antes de codificar) revelou que o
  Next.js 16 já resolve `#id` nativamente via `scrollIntoView()`, tanto no carregamento quanto em
  navegação por `<Link>`, e documenta `scroll-padding-top` como a compensação correta para headers
  sticky. Duplicar esse tratamento arriscava os dois mecanismos brigarem pelo mesmo scroll — a
  lógica própria foi removida, ficando só `scroll-padding-top: 88px` em `app/globals.css`.
- **[Smooth Scroll] `useScrollLock` autocontido, nunca dependente de uma instância de Lenis** — o
  mecanismo real é `overflow: hidden` + compensação de scrollbar no `body`; parar/retomar o Lenis
  (`lenis?.stop()`/`lenis?.start()`) é um reforço opcional, encadeado via optional chaining. Uma
  implementação que dependesse do Lenis para travar o scroll quebraria o painel "Meu Upgrade" no
  Builder, que nunca tem uma instância (Seção 4 do briefing: "Builder não deve depender do Lenis
  para funcionar").
- **[Smooth Scroll] `setState` derivado removido do efeito do `SmoothScrollProvider`** — a
  primeira versão chamava `setLenis(null)` como primeira linha do efeito sempre que a rota estava
  desabilitada; o lint `react-hooks/set-state-in-effect` apontou (corretamente) que isso é estado
  derivável sem nenhum efeito. Corrigido expondo `enabled ? activeInstance : null` direto no corpo
  do componente; o único `setState` que continua dentro do efeito (capturar a instância real recém
  -criada) é uma exceção justificada — mesmo caso já documentado acima para `Drawer.tsx` capturando
  `document.activeElement`.

- **[3D/WebGL] Three.js puro, sem `@react-three/fiber`/`drei`** — a lib oficial `three` já resolve
  tudo que esta fase precisa (renderer, shapes, shaders); adicionar toda a camada de reconciliação
  React do R3F introduziria um paradigma sem nenhum paralelo no resto do projeto (que sempre trata
  bibliotecas imperativas — GSAP, Lenis — via hooks/componentes escritos à mão, nunca um
  reconciliador React próprio). `UpgradeLogo3D`/`ProceduralAura` seguem a mesma receita de
  `SmoothScrollProvider.tsx`/`Drawer.tsx`: um `useEffect` monta/desmonta a biblioteca imperativa,
  React só decide SE o componente existe.
- **[3D/WebGL] Nenhum modelo `.glb`/`.gltf` — geometria e shader 100% procedurais** — sem
  ferramenta de modelagem 3D disponível nesta sessão para gerar/exportar um asset real, a
  alternativa honesta (mesmo raciocínio da síntese de som via Web Audio na Fase Microinterações) é
  construir a peça em código: `buildUpgradeMonogramGeometry.ts` extrude formas `THREE.Shape`
  desenhadas à mão, interpretando livremente (não reproduzindo pixel a pixel) o monograma real da
  marca. Zero asset para licenciar, pesar o bundle ou versionar.
- **[3D/WebGL] Shader de transição em cases/projetos avaliado e ADIADO, não implementado** — a
  auditoria inicial confirmou que `app/projetos/page.tsx`/`ProjectsTeaserSection.tsx` são
  placeholders explícitos desde a Fase 8 ("os primeiros cases reais... ainda não existem"; nenhuma
  imagem de projeto no repositório). Implementar um shader de dissolve operando sobre imagens
  fictícias violaria a disciplina de "nunca inventar conteúdo" seguida em todas as fases
  anteriores. A arquitetura de shader (uniforms nomeados, GLSL isolado do componente) já foi
  construída via `ProceduralAura` e fica pronta para um `ImageDissolveTransition` futuro quando
  cases reais existirem.
- **[3D/WebGL] `.heroGraphic`/`.finalGraphic` viram só o "envelope" de posição/tamanho — o visual
  original migrou para `.heroGraphicFallback`/`.finalGraphicFallback`** — necessário porque
  `clip-path` num elemento também recorta seus filhos: manter o `clip-path` diagonal no mesmo
  elemento que hospeda o canvas cortaria o monograma/aura em uma fatia estreita. Com o recorte
  isolado numa camada-filha própria (que serve de fallback, sempre presente), o canvas por cima
  ganha a área retangular inteira, sem perder o fallback CSS original em nenhum cenário.
- **[3D/WebGL] `useAvoidCursor` removido de `.heroGraphic`** — essa era a única interação-surpresa
  do site (Fase Microinterações). Com o monograma 3D assumindo o mesmo espaço e ganhando sua
  própria reação (mais sutil) ao cursor, manter as duas juntas no mesmo objeto seria contraditório
  (uma foge do cursor, a outra é convidada a segui-lo) — a peça 3D substitui completamente esse
  papel de "momento de descoberta" no Hero.
- **[3D/WebGL] Bug de hydration real causado por uma tentativa de silenciar lint** — a primeira
  versão de `useInViewport` inicializava o estado via
  `useState(() => typeof IntersectionObserver === "undefined")`, achando que evitava um
  `setState` dentro do efeito. Isso quebrou o SSR: essa expressão vale `true` no servidor (Node) e
  `false` no primeiro render do cliente (browser), um mismatch de hydration real, reproduzido de
  imediato com Playwright. Corrigido voltando o estado inicial para sempre `false` (idêntico nos
  dois lados) — lição: nunca resolver um aviso de lint calculando, no valor inicial de um `useState`,
  algo que só existe/difere no navegador.
- **[3D/WebGL] Falha na criação do `WebGLRenderer` também precisa de `try/catch`, não só
  `hasWebGL()`** — `hasWebGL()` testa a criação de um contexto num canvas descartável no MOMENTO
  da checagem; isso não garante que o `WebGLRenderer` real, criado depois, também vai conseguir
  (driver instável, contexto perdido entre os dois momentos). Sem esse `try/catch` adicional, uma
  falha aí lançaria direto de dentro do `useEffect`, sem nenhum Error Boundary tratando isso
  especificamente — quebrando a página (violação direta da Seção 42 do briefing). Confirmado que
  esse cenário é real e não hipotético: o próprio ambiente de teste (`jsdom`, sem WebGL de
  verdade) reproduz exatamente essa falha sempre que `hasWebGL()` é mockado para `true`.

- **[SEO] OG image e ícones gerados via `next/og`/`ImageResponse`, nunca um arquivo de imagem
  novo** — sem acesso a ferramentas de design/edição de imagem nesta sessão, gerar a imagem de
  compartilhamento e os ícones em código (a partir do logo real, `public/logo-mark.png`) é a
  alternativa honesta — mesmo raciocínio já usado para o som sintetizado (Web Audio, Fase
  Microinterações) e a geometria procedural do monograma 3D (Fase 3D/WebGL). Nenhum asset binário
  novo entra no repositório.
- **[SEO] `/builder` recebe `noindex` via meta tag, nunca `Disallow` no `robots.txt`** — as duas
  juntas na mesma URL é um anti-padrão documentado pelo próprio Google: bloquear via `robots.txt`
  impede o crawler de sequer buscar a página para LER a diretiva `noindex`, então uma URL bloqueada
  dessa forma ainda pode aparecer indexada (sem snippet) se for referenciada externamente. A
  combinação correta é página rastreável + `noindex` via `<meta>` — só `/admin` (de fato privado,
  atrás de autenticação) é bloqueado no `robots.txt`.
- **[SEO] Dados estruturados deliberadamente mínimos — só `Organization`/`WebSite`, só na Home** —
  o briefing pede para avaliar `LocalBusiness`/`ProfessionalService`, mas a Upgrade não tem
  endereço/telefone/redes sociais oficiais publicados no projeto; incluir esses campos seria
  inventar dados verificáveis por qualquer ferramenta de rich results do Google. `makesOffer`
  reaproveita a mesma fonte de dados (`features/builder/data/services.ts`) que
  `CapabilitiesSection` já usa na Home — nunca uma descrição de serviço nova/paralela.
- **[SEO] `SITE_URL` cai num fallback de desenvolvimento (`localhost:3000`) em vez de travar o
  build** — nenhum domínio de produção existe no projeto ainda (confirmado por busca no código).
  Fazer `metadataBase`/sitemap/robots dependerem de uma variável de ambiente ausente e travarem o
  build seria mais disruptivo do que necessário nesta fase; o fallback é visível (qualquer um que
  olhe o sitemap/OG antes de configurar `NEXT_PUBLIC_SITE_URL` vê imediatamente que aponta para
  localhost) — nunca um domínio adivinhado silenciosamente, que seria o erro real a evitar.
- **[SEO] `ProjectsTeaserSection` ganha `as="h2"` sem mudar `variant="h3"`** — a seção é irmã de
  "O que fazemos"/CTA final (ambas `h2`) na estrutura da Home, não uma subseção delas; usar `h3`
  quebrava a hierarquia semântica do documento. `Heading.tsx` já separa tag semântica (`as`) de
  estilo visual (`variant`) desde a Fase 18 exatamente para casos como este — nenhuma mudança de
  CSS, só a tag HTML real.

- **[LGPD] Consentimento padrão de `analytics` muda de `true` (Fase 17) para `false`** — a Fase
  17 já registrava essa escolha como PROVISÓRIA, à espera de uma tela real de consentimento.
  Agora que ela existe (`ConsentBanner.tsx`), a postura mais alinhada com "privacy by default"
  (briefing desta fase, Seção 70) é não medir nada até a pessoa decidir — mesmo sendo dado
  anônimo, sem PII. Efeito prático: GA4/o provider interno só recebem eventos depois de uma
  decisão explícita (aceitar tudo ou configurar com analytics ligado).
- **[LGPD] `setConsent` passou a exigir o objeto completo (`{analytics, marketing}`), não mais um
  `Partial`** — o único chamador real (o banner) sempre resolve os dois campos de uma vez
  (Aceitar todos/Recusar/Salvar preferências nunca decidem só uma categoria por vez); um `Partial`
  permitia um estado ambíguo ("decidiu só metade") que nunca deveria existir depois que o banner
  existe. Nenhum outro chamador dependia da assinatura antiga.
- **[LGPD] Bug real de `useSyncExternalStore`: `getServerSnapshot` retornando objeto novo a cada
  chamada** — a primeira versão de `useConsent.ts` tinha `function getServerSnapshot() { return
  { analytics: false, marketing: false } }` — um literal novo por chamada. React trata isso como
  "o snapshot mudou" a cada render, lançando "The result of getServerSnapshot should be cached to
  avoid an infinite loop" — reproduzido de verdade com Playwright (nenhum teste `jsdom` pegou
  isso). Corrigido hoisting o objeto para uma constante de módulo, devolvida sempre pela mesma
  referência. Lição: todo `getServerSnapshot`/`getSnapshot` de `useSyncExternalStore` neste
  projeto precisa devolver uma referência estável quando nada mudou — `getConsent()` já seguia essa
  regra (retorna `currentConsent` diretamente, nunca uma cópia) exatamente por essa razão.
- **[LGPD] `SiteFooter.tsx` não pode ter um `onClick` inline — precisa de uma fronteira de Client
  Component dedicada** — `SiteFooter` é um Server Component usado a partir de páginas que também
  são Server Components (incluindo `app/not-found.tsx`); um `<button onClick={fn}>` direto ali
  quebra o build ("Event handlers cannot be passed to Client Component props"), um erro que só
  aparece em `next build` (prerendering), nunca em `next dev` comum. Corrigido extraindo
  `OpenConsentPreferencesButton` (`features/privacy/components/`) como a única parte que precisa
  de `"use client"`, mantendo `SiteFooter` um Server Component leve como antes.
- **[LGPD] Logs de erro do Supabase reduzidos a `code`/`message` nos dois pontos que gravam dado
  pessoal** (`createLead`, `addLeadNote`) — o objeto de erro completo do Postgres pode, em alguns
  tipos de falha, ecoar um fragmento do valor em `details`/`hint`. Os demais `console.error` do
  projeto (leitura/listagem, ou tabelas sem dado pessoal como `analytics_events`) não foram
  alterados — mudança proporcional, só onde o dado realmente gravado é pessoal.
- **[LGPD] Canal de solicitação de titular reaproveita o atendimento comercial (WhatsApp/e-mail
  já trocados), em vez de um e-mail de privacidade dedicado** — decisão tomada com o usuário: o
  site nunca teve nenhum canal de contato geral publicado (nem um e-mail institucional
  genérico), então inventar um e-mail "privacidade@..." só para a política pareceria mais real do
  que é. Registrado como aceitável para este estágio do projeto, não como solução final — ver
  `docs/PRIVACY-LGPD.md`, Seção 12.
- **[LGPD] Nenhuma rotina automática de exclusão/expurgo de leads antigos criada nesta fase** —
  avaliada e adiada (briefing, Seção 34: "não precisa criar job complexo se não for necessário
  agora"); sem nenhum pedido real de exclusão ainda e sem uma decisão de negócio sobre excluir vs.
  anonimizar, construir essa rotina agora seria arquitetura especulativa. Registrada como
  pendência explícita da Etapa 29.

- **[SEGURANÇA] Rate limit em memória, por processo, sem Redis/Upstash** (`lib/security/
  rateLimit.ts`) — proporcional ao tráfego real do projeto hoje: nenhuma infraestrutura nova só
  para isso. Limitação aceita e documentada (`docs/SECURITY.md`): num deploy serverless com várias
  instâncias frias, o limite efetivo pode ser um múltiplo do configurado, porque cada instância
  tem seu próprio contador. Ainda assim cria fricção real contra abuso automatizado simples — o
  mesmo critério de proporcionalidade já usado para "CAPTCHA só se abuso justificar" (briefing,
  Seção 37): um contador central vira necessário só se um abuso real acontecer.
- **[SEGURANÇA] Honeypot rejeita com a MESMA mensagem genérica de qualquer outra falha de
  validação** (`submitLead.ts`) — nunca um texto ou código diferente que revelasse ao remetente
  que foi identificado como automação; mantém o princípio já usado no login ("credenciais erradas
  não revela se o e-mail existe") aplicado a um novo caso.
- **[SEGURANÇA] CSP sem nonce, configurada em `next.config.ts` (`headers()`), não via `proxy.ts`**
  — a documentação do Next.js recomenda nonce (`node_modules/next/dist/docs/.../
  content-security-policy.md`) mas exige renderização dinâmica em toda página para funcionar; a
  maioria das rotas deste projeto é estática de propósito (Fases SEO/Performance). Adotar nonce
  agora jogaria fora esse trabalho sem um ganho de segurança proporcional — a própria documentação
  oficial descreve a variante "Without Nonces" (CSP estática, com `'unsafe-inline'` em
  `script-src`/`style-src`) como a alternativa correta para quem não tem requisito de compliance
  que exija CSP estrita. Ver `docs/SECURITY.md`, Seção "Headers e CSP", para a lista completa de
  diretivas e por que cada domínio de terceiro está ali.
- **[SEGURANÇA] `leadPayloadSchema`/`sanitizeSearchTerm` ganham limites de tamanho que não existiam
  antes** (Etapa 29, Seções 18/20/41/95/97) — nenhum limite restringe um uso legítimo: toda
  pergunta do Builder é de múltipla escolha (nunca texto livre), e nenhuma busca administrativa
  real passa de 100 caracteres. Os limites existem só para que um cliente malicioso não monte um
  payload/consulta arbitrariamente grande direto contra a Server Action/repositório.
- **[SEGURANÇA] Vulnerabilidades do `npm audit` (vite/esbuild/@vitest/mocker) não corrigidas por
  upgrade forçado** — todas as três são `devDependencies` (cadeia do Vitest), nunca entram no
  bundle de produção, e o fix disponível é um bump de major do Vitest (`5.0.1`), que poderia
  quebrar os 620 testes existentes sem necessidade real (briefing, Seção 80: "não atualizar tudo
  cegamente... avaliar impacto"). Registrado como pendência de manutenção dedicada, não como
  vulnerabilidade de produção — ver `docs/SECURITY.md`, Seção "Dependências".
- **[SEGURANÇA] Correção de contagem: `npm audit` reporta 5 vulnerabilidades (3 moderadas, 1 alta,
  1 crítica), não 3** — a auditoria da Etapa 29 leu uma saída truncada do comando (`| head -100`)
  e reportou só 3. Reexecutado por completo na Etapa 30 (auditoria de dependências de
  performance): a 4ª e 5ª entradas (`vite-node`, `vitest`) fazem parte da MESMA cadeia já
  documentada (Vitest/Vite, dev-only) — a entrada "crítica" (`vitest`) exige o servidor de UI do
  Vitest (`vitest --ui`) estar rodando e exposto, o que este projeto nunca faz (`package.json` só
  tem `vitest run`/`vitest`, nunca `--ui`). Não muda a decisão de não corrigir por upgrade forçado
  — só corrige o número relatado. `docs/SECURITY.md` atualizado.

- **[PERFORMANCE] `@next/bundle-analyzer` avaliado e NÃO adicionado como dependência** — instalado
  experimentalmente para medir o bundle, mas a própria instalação reescreveu boa parte do
  `package-lock.json` (efeito colateral de dedupe do npm) e trouxe consigo uma cadeia de pacotes
  (`webpack-bundle-analyzer`, `ws`, `express`-like tooling) desproporcional a uma única medição
  pontual. A análise de bundle desta fase foi feita manualmente (tamanho dos chunks em
  `.next/static/chunks`, `grep` pelo conteúdo de cada chunk para identificar three.js/GSAP, e os
  `<script>` referenciados no HTML de cada rota) — suficiente para confirmar que Three.js já vive
  isolado num chunk sob demanda (nunca no bundle inicial da Home) sem precisar da ferramenta.
  Revertido por completo (`git checkout` do `package.json`/`package-lock.json` + `npm ci`) antes de
  prosseguir.
- **[PERFORMANCE] Quase-incidente: `git checkout -- package.json package-lock.json` durante a
  reversão acima apagou TODAS as dependências reais do projeto** — este repositório tem só 2
  commits (`85fe85f`/`54330f4`); todo o `package.json` acumulado desde a Fase 11 (Supabase, GSAP,
  Lenis, Zod, React Hook Form, Three.js etc.) existia SÓ na árvore de trabalho, nunca commitado.
  `git checkout -- <arquivo>` reverte para o `HEAD` commitado, que ainda era o `package.json` do
  `create-next-app`. Detectado imediatamente pelo `next build` quebrando com "module not found", e
  recuperado reescrevendo o arquivo com o conteúdo exato lido momentos antes na mesma sessão (não
  uma reconstrução por memória). Lição operacional para este projeto especificamente: `git status`
  mostrando um arquivo como `M` (modificado) aqui quase sempre significa "todo o trabalho real está
  na árvore de trabalho, não no histórico" — nunca tratar `git checkout`/`restore` como uma reversão
  barata neste repositório sem primeiro conferir se o commit por trás tem o conteúdo esperado.
- **[PERFORMANCE] Entrada do Hero (badge → título → subtítulo → CTAs) migrada de GSAP
  (`gsap.set`/`.timeline()` dentro de um `useEffect`) para uma animação CSS pura
  (`@keyframes` em `HeroSection.module.css`)** — medição real via Lighthouse (mobile, CPU
  throttled) identificou o H1 do Hero como o elemento de LCP da Home, com ~2,2s de "element render
  delay": o texto já existe no HTML (SSR), mas `gsap.set(opacity:0)` o escondia até a hidratação +
  timeline rodarem, competindo por main thread com o bootstrap do GSAP/ScrollTrigger/Lenis/
  Three.js. Uma animação CSS começa a rodar assim que o stylesheet é aplicado, sem depender de
  JavaScript. Duração/easing/stagger reaproveitam os MESMOS tokens que `motionConfig.ts` já
  espelhava (`--ds-duration-slow`, `--ds-easing-emphasized`, `--ds-stagger-sm/md`) — coreografia
  visual idêntica, sem custo de JS no caminho crítico. A regra global de `prefers-reduced-motion`
  (`styles/tokens.css`) ganhou `animation-delay: 0ms !important` para não introduzir um atraso de
  até 300ms nesse cenário (antes, o efeito GSAP nem rodava sob reduced motion; a versão CSS precisa
  dessa linha extra para o mesmo comportamento).
- **[PERFORMANCE] `UpgradeLogo3D` (WebGL do Hero) não monta mais imediatamente — espera
  `requestIdleCallback` (com fallback `setTimeout(200ms)` para navegadores sem suporte)** — mesmo
  já sendo `next/dynamic({ssr:false})` (código-split desde a Fase 3D/WebGL), o `useEffect` que cria
  o `THREE.WebGLRenderer`/geometria ainda rodava de forma síncrona assim que o chunk terminava de
  carregar, competindo pelo main thread no momento mais sensível do carregamento. Adiar para uma
  folga do navegador (ou um teto de 1,5s) não muda nada visualmente — o gradiente CSS
  (`.heroGraphicFallback`) já preenche o espaço o tempo todo — só move QUANDO a inicialização
  pesada acontece.
- **[PERFORMANCE] `logo-mark.png` nos três usos de `<Image>` (header, nav do Builder, admin) passa
  de `width={556} height={731}` (tamanho do arquivo-fonte) para dimensões intrínsecas = 2x o
  tamanho realmente exibido em CSS (`40×52`, `33×44`, `30×40`)** — medido via `next/image`: sem
  essa correção, o otimizador do Next pedia até 1200px de largura para um logo nunca exibido com
  mais de ~26px, e como não dá para AMPLIAR além da fonte, o resultado prático era sempre servir o
  PNG original inteiro (~31KB) em toda página. Com as dimensões corretas, o maior candidato do
  `srcSet` (2x) cai para ~2,2KB — medido antes/depois via `curl` contra uma build de produção real.
  O arquivo-fonte em si (`public/logo-mark.png`, 556×731) continua intocado — `app/icon.tsx`/
  `app/apple-icon.tsx`/`app/opengraph-image.tsx` o leem diretamente (não via `next/image`) para
  gerar favicon/OG em alta resolução, onde o tamanho grande é necessário.
- **5 SVGs padrão do `create-next-app` removidos de `public/`** (`next.svg`, `globe.svg`,
  `window.svg`, `vercel.svg`, `file.svg`) — confirmados por busca como nunca referenciados em
  nenhum lugar do código; ficaram esquecidos desde o commit inicial do projeto.

- **[TESTES] Playwright escolhido como framework E2E, backend fake por injeção de dependência (não
  mock de rede do navegador)** — nenhum framework E2E existia; Vitest/Testing Library continuam
  cobrindo unitário/integração (nunca duplicados). A alternativa óbvia para não gravar no Supabase
  real (`page.route()` do Playwright interceptando a rede do navegador) não funciona aqui: toda
  escrita passa por Server Actions, que fazem a chamada ao Supabase NO SERVIDOR — o navegador nunca
  expõe essa requisição para interceptar. A alternativa real foi um `if (isE2ETestMode())` explícito
  no topo de cada função de repositório e das Server Actions de auth, trocando para um backend em
  memória (`lib/testing/e2eStore.ts`) só quando `E2E_TEST_MODE=true` — variável que só existe no
  processo do `webServer` do Playwright, nunca em `next dev`/`next start`/produção reais.
- **[TESTES] `webServer` do Playwright sobe `next dev`, não `next build && next start`** — o que
  está sob teste é comportamento funcional, não performance (já coberta em `docs/PERFORMANCE.md`);
  `next dev` itera mais rápido. Custo aceito: a primeira visita a uma rota fria pode levar dezenas
  de segundos de compilação JIT do Turbopack — por isso o timeout global subiu para 45s
  (`expect.timeout` para 15s), não os padrões do Playwright.
- **[TESTES] Quase-erro: a primeira correção do bug do painel "Meu Upgrade" bloqueando cliques foi
  fechar o drawer automaticamente ao editar/adicionar outro serviço** — quebrou 4 testes unitários
  já existentes (`MyUpgrade.test.tsx`) que confirmavam, de propósito, que esse painel NUNCA fecha
  sozinho ao editar (é documentadamente "uma seção persistente, não um modal"). Reconhecido a
  tempo pelos próprios testes quebrando; a correção certa foi de CSS (`pointer-events: none` no
  overlay, mantendo o painel clicável), preservando o comportamento intencional. Lição: quando um
  teste já existente e deliberado quebra com uma correção nova, o teste geralmente está certo — a
  correção que precisa mudar de abordagem.
- **[TESTES] Conta fixa de E2E (`admin@e2e.test`) isenta do rate limit de login, só quando
  `E2E_TEST_MODE=true`** — logins de teste paralelos e repetidos contra a mesma conta esbarravam no
  limite de 5/5min (Etapa 29, correto e intencional em produção). O rate limit real continua
  verificado de ponta a ponta com um e-mail exclusivo por execução (`e2e/security.spec.ts`) — só a
  conta fixa usada pelos OUTROS specs fica de fora, para não confundir "teste E2E rodando em
  paralelo" com "tentativa de força bruta".
- **[TESTES] `Strict-Transport-Security`/`upgrade-insecure-requests` (Etapa 29) tornados
  condicionais a `NODE_ENV !== "development"`** — bug real e sério encontrado ao adicionar WebKit à
  suíte de fumaça: o WebKit aplica HSTS mais estritamente que Chromium/Firefox mesmo em
  `localhost`, forçando toda requisição seguinte para HTTPS contra um `next dev` que só fala HTTP —
  quebrava a aplicação inteira nesse navegador, silenciosamente. Não afeta produção (lá o domínio
  já é HTTPS de verdade, o cenário em que HSTS deve valer) — mas teria impedido desenvolvimento/
  teste reais em Safari indefinidamente se não fosse pego agora.
- **[TESTES] `workers: 2` (nunca ilimitado, nem só em CI) + `admin.spec.ts` serializado
  internamente** — o backend fake (`e2eStore.ts`) é um único módulo em memória compartilhado por
  toda requisição concorrente ao mesmo `next dev`; sob paralelismo alto, testes que mutam os mesmos
  leads-fixture (mudar status, criar nota) entravam em corrida uns com os outros. Confirmado via
  `admin.spec.ts --workers=1` sozinho (10/10 passando sempre) vs. suíte completa em paralelo
  (flakiness ocasional) — mitigação aceita, não uma correção definitiva (registrada como pendência
  se a suíte crescer o bastante para justificar um backend com isolamento real).
- **[UX] Título de sucesso muda de "Projeto validado com sucesso." (Fase 12) para "Recebemos seu
  projeto." (Etapa 32)** — a redação da Fase 12 evitava "Recebemos" deliberadamente porque, naquela
  fase, nenhuma persistência/integração real existia; dizer "recebemos" teria sido falso. Essa razão
  não existe mais desde a Fase 13 (Supabase real): este texto só é alcançado depois de uma gravação
  bem-sucedida no banco (`submitLeadSuccess()`, chamado em `LeadForm.tsx` só quando a Server Action
  confirma). Com a razão original superada, "validado" passou a ser a pior opção: soa como uma
  etapa de aprovação ainda pendente, gerando a dúvida que o briefing de UX pede para eliminar
  ("será que meu projeto foi aceito?"). "Recebemos seu projeto." é a redação que `docs/USER-FLOW.md`
  já previa desde a Fase 4 — não é uma invenção desta etapa.
- **[UX] CTA principal de `ServiceComplete.tsx` muda de "Ver Meu Upgrade / Finalizar" para
  "Continuar" — comportamento (`goToEntry()`) inalterado** — bug de UX real encontrado ao testar a
  tela como uma pessoa que nunca viu o site: os dois botões desta tela (o "principal" e "Adicionar
  outro serviço") sempre chamaram exatamente a mesma função; nenhum dos dois finalizava nem
  mostrava o Meu Upgrade de verdade, só devolviam à tela de categorias — a pessoa precisava
  descobrir sozinha o botão "Meu Upgrade" da barra de navegação para dar o próximo passo real.
  **Primeira tentativa de correção (revertida)**: fazer o botão principal abrir o drawer "Meu
  Upgrade" de verdade além de navegar. Descartada ao rodar a suíte E2E completa: esse mesmo botão é
  o caminho compartilhado que praticamente todo teste usa para "voltar depois de concluir um
  serviço", inclusive para configurar um SEGUNDO serviço em seguida (Cenário 2 do
  `docs/USER-FLOW.md`, Site + Tráfego) — abrir o drawer automaticamente cobria a tela de categorias
  bem no momento em que a pessoa mais provavelmente quer clicar num cartão por baixo dele. Achado
  pela própria suíte (26 specs passaram a falhar por "elemento intercepta clique"), não só pelos
  testes unitários — a mesma lição da entrada anterior sobre `MyUpgrade`/`pointer-events`: um
  comportamento que parece uma melhoria isolada pode quebrar um fluxo maior que depende do estado
  anterior dele. **Correção final**: só o texto muda, para "Continuar" — sem prometer "Finalizar"
  nem "Ver Meu Upgrade", e sem nenhuma mudança de comportamento ou de estado.
- **[UX] Subtítulo novo no seletor de categoria (`ServiceSelector.tsx`) e legenda nova no Score do
  admin (`LeadDetail.tsx`)** — dois achados de "expectation setting" (briefing de UX, Seções 4/5/59):
  quem entra direto no Builder (sem passar pela Home) não tinha nenhuma linha explicando que o fluxo
  é uma sequência curta de perguntas terminando num resumo; e o Score do admin aparecia como um
  número só, sem indicar que é uma heurística interna (`docs/LEAD-SCORE.md`), não uma nota
  definitiva do lead. As duas correções são uma linha de texto cada — nenhuma pergunta, regra de
  negócio, cálculo de score ou fluxo de navegação foi alterado.
- **[DEPLOY] Histórico do Git reconstruído em 24 commits (um por Etapa 11-32, mais protótipo e
  infra) a partir do estado final do repositório** — achado crítico da Etapa 33: o repositório só
  tinha 2 commits reais (`Initial commit from Create Next App` e `Implementa Etapas 8-10`); todo o
  trabalho desde a Etapa 11 existia só na árvore de trabalho local, nunca commitado nem enviado ao
  GitHub. Como o projeto Vercel já está conectado a este repositório, ele não tinha nada real para
  buildar. Decisão tomada com o usuário: reconstruir em commits granulares por etapa (em vez de um
  commit único ou poucos commits agrupados) para preservar rollback/blame por etapa no futuro, na
  medida do possível a partir de um único snapshot final — arquivos cumulativos que várias etapas
  tocaram (`docs/DECISIONS.md`, `package.json`) ficaram inteiros em um commit só, não fatiados,
  limitação reconhecida e sem solução melhor possível sem as fotografias intermediárias reais (que
  nunca existiram). Push para `master` fica pendente da confirmação do usuário sobre o
  comportamento de auto-deploy da Vercel (`docs/DEPLOYMENT.md`, Seção 3).
- **[DEPLOY] `engines.node` fixado em `package.json` (`">=20.9.0"`)** — não existia nenhum pino de
  versão de Node (nem `engines`, nem `.nvmrc`); o valor usado é o mínimo que o próprio Next.js
  16.3.5 declara em seu `package.json` (`node_modules/next/package.json`), evitando divergência
  entre o que o framework exige e o que o projeto documenta.
- **[DEPLOY] Estratégia de banco para Preview: opção B do briefing (Preview usa o mesmo Supabase de
  Production, sem restrição especial)** — decisão explícita pela leitura de que este é um projeto
  V1 ainda pequeno (o próprio briefing recomenda isso nesse cenário); criar um Supabase de staging
  seria infraestrutura duplicada sem necessidade real ainda. Risco aceito e documentado
  (`docs/DEPLOYMENT.md`, Seção 16): um envio de teste feito através de uma Preview URL cria uma
  linha real no banco de produção — mitigado por cuidado manual, não por uma barreira técnica.
- **[AWARD] Quatro refinamentos de acabamento (Etapa 36), todos CSS/tokens — nenhuma feature nova**:
  `letter-spacing` negativo em `display`/`h1` (nunca em corpo de texto); sombra sutil
  (`--ds-shadow-sm`/`md`, tokens já existentes) nos cartões do Builder; parâmetro opcional
  `scaleFrom` em `useRevealScrollMotion` para diferenciar a entrada de `ProjectsTeaserSection` da de
  `FinalCtaSection` (que continuam com o mesmo hook, só variando um valor); traço decorativo na cor
  de destaque no topo do `SiteFooter`. Nenhum dos quatro foi encontrado como problema crítico — a
  auditoria completa (`docs/AWARD-AUDIT.md`) concluiu que o sistema de motion/sound/WebGL já estava
  maduro o suficiente para não precisar de mudança estrutural nesta etapa.

---

*Decisões futuras devem ser adicionadas ao final de sua seção correspondente (ou em nova seção, se
necessário), sempre indicando a fase em que foram tomadas.*
