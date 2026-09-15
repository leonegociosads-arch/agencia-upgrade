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

---

*Decisões futuras devem ser adicionadas ao final de sua seção correspondente (ou em nova seção, se
necessário), sempre indicando a fase em que foram tomadas.*
