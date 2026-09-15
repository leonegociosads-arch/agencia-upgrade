# PROJECT OVERVIEW — Site Agência Upgrade

> Documento vivo. Define a arquitetura conceitual e técnica do projeto antes de qualquer implementação.
> Esta é a Fase 1 (Fundação do projeto e objetivo) do roadmap de 36 fases. Nenhum código, componente,
> animação ou banco de dados foi implementado nesta etapa.

---

## 1. Visão do produto

O site da Agência Upgrade não é um site institucional convencional. Ele é um **produto digital híbrido**
que existe simultaneamente como:

1. Site institucional premium (apresentação da agência, portfólio, posicionamento);
2. Vitrine viva da capacidade técnica e criativa da própria agência (o site é a prova do serviço vendido);
3. Experiência interativa de descoberta (motion design, transições, sensação "fora do padrão");
4. Configurador de serviços ("Upgrade Builder");
5. Ferramenta de diagnóstico comercial inicial (perguntas que revelam necessidade real do visitante);
6. Sistema de captura de leads;
7. Sistema de qualificação comercial (lead score, prioridade, dados de contexto);
8. Porta de entrada de dados para um futuro mini-CRM interno.

O produto final entregue ao visitante é um **projeto configurado** ("Meu Upgrade"), não apenas um
formulário de contato. O produto final entregue à agência é um **lead qualificado com contexto rico**
(o que a pessoa quer, com que complexidade, com que urgência, e como ela chegou até ali).

## 2. Objetivo comercial

- Substituir o contato comercial genérico ("me manda mensagem") por um processo de **auto-diagnóstico
  guiado**, que já chega ao time comercial com escopo, intenção e contexto.
- Elevar a percepção de valor da agência antes mesmo da primeira conversa humana — o site precisa
  demonstrar, na própria experiência, o padrão de qualidade que a agência entrega aos clientes.
- Aumentar a taxa de conversão de visitante → lead qualificado, reduzindo fricção (poucas perguntas,
  fluxo claro) sem perder profundidade de qualificação.
- Permitir priorização comercial imediata via lead score, para que a equipe saiba quais leads atacar
  primeiro.
- Criar a base de dados (respostas, escolhas, eventos) que futuramente alimentará um mini-CRM interno,
  eliminando retrabalho de reconstrução de contexto em cada novo lead.

## 3. Objetivo de UX

- Fazer o visitante sentir que está **montando algo seu**, não preenchendo um formulário.
- Reduzir carga cognitiva: poucas perguntas por vez, linguagem simples, decisões pequenas e reversíveis.
- Garantir que o visitante nunca se sinta preso: pode voltar, editar, remover ou adicionar serviços a
  qualquer momento antes de finalizar.
- Comunicar progresso e clareza de onde está no processo (não é uma "caixa preta").
- Fazer a experiência funcionar igualmente bem — em clareza e fluidez — em mobile e desktop, já que a
  maior parte do tráfego real tende a ser mobile.
- Usar motion design como **reforço de comunicação e percepção premium**, nunca como obstáculo à tarefa
  que o usuário veio realizar.

## 4. Perfil do usuário

Público misto, com pelo menos três perfis de entrada que a experiência deve acomodar:

- **Decisor com necessidade clara**: sabe que quer site, tráfego pago ou social media, e busca validar
  escopo e orçamento rapidamente.
- **Decisor sem clareza técnica**: sabe que "precisa melhorar a presença digital", mas não sabe nomear
  o serviço certo — para esse perfil existe um link simples e direto ("Fale com a Upgrade", ver Fase 5)
  que leva a contato humano, sem tentar diagnosticar ou recomendar uma categoria automaticamente. Essa
  saída é secundária na hierarquia visual da tela de entrada, propositalmente simples.
- **Avaliador de agências (comparação)**: está testando a agência, comparando experiência e qualidade
  percebida antes de decidir com quem falar — para esse perfil, a experiência interativa em si é parte
  da decisão de compra.

Implicações de design: a navegação não pode assumir conhecimento técnico prévio; a opção "não sei o que
preciso" precisa de perguntas de triagem próprias (não pode ser um beco sem saída); e a experiência
precisa ser convincente mesmo para quem não vai converter na primeira visita.

## 5. Experiência principal

Nome provisório: **"Meu Upgrade"** ou **"Monte seu Upgrade"** (decisão final de naming pendente —
ver Seção 20).

Fluxo conceitual em alto nível:

```
Entrada → Escolha de grupo(s) de serviço → Perguntas curtas por grupo → 
Adiciona ao "Meu Upgrade" → (loop: adicionar outro serviço?) → 
Resumo do projeto → Dados de contato → Envio → Lead oficial criado
```

A experiência é orientada por **decisões pequenas e sucessivas**, não por um formulário longo. Cada
etapa é uma pergunta ou uma confirmação, nunca uma tela densa de campos simultâneos.

## 6. Estrutura conceitual do Upgrade Builder

O "Upgrade Builder" é o motor de perguntas e ramificações que conduz o visitante do interesse inicial
até um serviço configurado e adicionado ao "Meu Upgrade".

Conceitualmente, ele é composto por:

- **Grupos de serviço** (entidades de topo, exatamente três): Sites e Desenvolvimento; Tráfego Pago;
  Design/Social Media. Cada grupo é independente e pluggable — novos grupos devem poder ser adicionados
  sem redesenhar o motor. **Não existe um quarto grupo de topo.** Para o visitante indeciso existe apenas
  um link simples ("Fale com a Upgrade" — ver Fase 5, `docs/USER-FLOW.md`) que leva a contato humano,
  fora do motor de perguntas — nunca um diagnóstico automático nem um grupo de serviço próprio.
- **Árvore de perguntas por grupo**: cada grupo tem seu próprio conjunto pequeno de perguntas. Uma
  pergunta só existe se sua resposta influenciar complexidade, solução, estratégia, orçamento,
  prioridade comercial ou a próxima pergunta (regra de existência da pergunta — ver DECISIONS.md).
- **Motor de ramificação**: a resposta de uma pergunta pode determinar (a) a próxima pergunta, (b) o
  encerramento antecipado do questionário daquele grupo (quando já há informação suficiente), ou
  (c) um encaminhamento para outro grupo (ex.: "não sei o que preciso" pode redirecionar para uma
  pergunta de triagem que aponta para Sites, Tráfego ou Design).
- **Resultado por grupo**: ao final das perguntas de um grupo, o motor produz um "item de serviço"
  configurado (com metadados de complexidade/estratégia/orçamento/prioridade) pronto para entrar no
  "Meu Upgrade".
- **Multiplicidade**: o Upgrade Builder deve poder ser executado várias vezes na mesma sessão — uma vez
  por grupo escolhido — sem perder o estado dos grupos já configurados. O motor nunca assume seleção
  única.

O Upgrade Builder é conceitualmente um **motor orientado a configuração** (perguntas, ramificações e
regras descritas como dados), não uma sequência de telas fixas codificadas uma a uma. Isso é o que
permite adicionar/editar perguntas no futuro sem reescrever fluxo.

## 7. Conceito do "Meu Upgrade"

"Meu Upgrade" é o estado agregado de todos os serviços que o visitante configurou na sessão atual.

Funcionalmente, ele se comporta como um carrinho:

- Acumula itens (serviços configurados) ao longo da sessão;
- Permite adicionar, remover e editar itens (reabrindo o Upgrade Builder daquele grupo com as respostas
  anteriores pré-carregadas);
- Permite visualizar um resumo consolidado a qualquer momento;
- É a estrutura que, ao ser finalizada, se transforma em "projeto" e depois em lead.

Visualmente e narrativamente, ele **não deve parecer um carrinho de e-commerce**: sem ícones de sacola,
sem linguagem de "produto"/"preço unitário"/"checkout", sem estética transacional. A metáfora correta é
a de **montagem de um projeto** — uma lista viva de decisões tomadas, não de itens comprados. Preço,
quando existir, é tratado como estimativa/faixa de investimento associada ao projeto, não como carrinho
de compras com subtotal por item (essa é uma decisão de conteúdo/copy a refinar nas fases de UI).

## 8. Visão do funil

```
1. Descoberta/Entrada        → visitante chega ao site (institucional + interativo)
2. Exploração                → visitante entende o que a agência faz, decide explorar o Upgrade Builder
3. Configuração               → responde perguntas curtas por grupo de serviço (1+ grupos)
4. Acúmulo ("Meu Upgrade")   → cada grupo configurado vira um item; visitante pode repetir o passo 3
5. Resumo                     → visitante revisa o projeto completo antes de finalizar
6. Captura de contato          → nome, empresa, WhatsApp, e-mail, (Instagram/site atual opcional)
7. Conversão em lead          → só a partir daqui o registro passa a ser oficialmente um lead
8. Qualificação                → lead score calculado a partir de respostas + comportamento
9. Entrada no funil comercial  → lead priorizado aparece para o time comercial (futuro mini-CRM)
```

Ponto crítico de design: os passos 1–5 podem gerar **eventos de navegação e sessão anônima** (para
analytics e para não perder o progresso do visitante), mas o registro só se torna um **lead identificado**
no passo 7, quando os dados de contato são enviados. Sessão anônima e lead são conceitos distintos que
devem poder se conectar (merge) no momento da identificação — ver Seção 17.

## 9. Requisitos funcionais

- Selecionar um ou mais grupos de serviço na mesma sessão (seleção múltipla é obrigatória, não opcional).
- Responder a um conjunto curto e específico de perguntas por grupo de serviço escolhido.
- Receber ramificação de perguntas com base em respostas anteriores (motor de regras, não lista fixa).
- Suporte a um link simples "Fale com a Upgrade" para o visitante indeciso, acessível como opção
  secundária a partir da tela de entrada do Builder — sem diagnóstico, sem pergunta, sem quarta
  categoria principal.
- Adicionar múltiplos serviços ao "Meu Upgrade" ao longo da sessão.
- Remover um serviço já adicionado ao "Meu Upgrade".
- Editar um serviço já adicionado (reabrir suas respostas e alterar).
- Voltar a uma etapa/pergunta anterior dentro do fluxo de um grupo, sem perder respostas já dadas.
- Visualizar a qualquer momento um resumo do que já foi configurado.
- Finalizar o projeto, disparando a etapa de captura de dados de contato.
- Capturar dados de contato (nome, empresa, WhatsApp, e-mail; Instagram/site atual como campos
  complementares) apenas na finalização.
- Persistir (futuramente) lead, projeto, serviços escolhidos, respostas, origem, eventos de navegação,
  lead score e status comercial.
- Disponibilizar (futuramente) uma área administrativa protegida para visualização de leads.
- Registrar a origem do lead (de onde veio o tráfego / qual caminho percorreu no funil).

## 10. Requisitos não funcionais

- **Performance**: carregamento rápido mesmo com motion design; nenhuma animação pode bloquear
  interação ou aumentar significativamente o tempo até interatividade.
- **Responsividade real**: mobile tratado como cenário primário de uso, não como adaptação do desktop.
- **Acessibilidade**: navegação e finalização do fluxo devem ser possíveis sem depender de animações
  (respeito a `prefers-reduced-motion`, foco visível, contraste, navegação por teclado).
- **Clareza de ação**: em qualquer tela, o usuário deve entender qual é a próxima ação possível.
- **Segurança**: proteção de dados de leads, área administrativa protegida por autenticação.
- **Conformidade LGPD**: consentimento, finalidade clara de uso dos dados, minimização de dados
  coletados, possibilidade de solicitação de exclusão.
- **Escalabilidade de conteúdo**: novos grupos de serviço e novas perguntas devem poder ser adicionados
  sem reescrever o motor de fluxo.
- **Manutenibilidade**: separação clara entre lógica de perguntas/ramificação, estado do "Meu Upgrade" e
  camada visual/animação.
- **SEO**: conteúdo institucional (não o fluxo interativo em si) precisa ser indexável e performático.
- **Resiliência de sessão**: idealmente, o progresso no Upgrade Builder não deve se perder em uma
  atualização de página acidental (decisão de mecanismo específico é técnica, a definir na Fase 6).

## 11. Stack planejada

Confirmada pelo briefing (uso ainda não implementado nesta fase):

- **Next.js** — framework de aplicação (SSR/SSG para a camada institucional/SEO + rotas de app para o
  fluxo interativo).
- **React** — camada de UI.
- **TypeScript** — tipagem em todo o projeto, especialmente crítica no motor de perguntas/ramificações
  e no estado do "Meu Upgrade".
- **GSAP + ScrollTrigger** — motion design e animações orientadas a scroll.
- **Lenis** — smooth scroll.
- **Supabase** — persistência de leads, projetos, respostas, eventos e (futuramente) autenticação da
  área administrativa.
- **Three.js/WebGL** — eventual, apenas se agregar valor real à experiência (não é um requisito, é uma
  possibilidade condicionada — ver Seção 19 e 20).

Itens de stack **não decididos** (estilização, gerenciamento de estado, analytics, hospedagem, etc.)
estão listados na Seção 20 e serão definidos na Fase 6 (Arquitetura técnica).

## 12. Princípios de arquitetura

- **Configuração antes de código**: grupos de serviço, perguntas e regras de ramificação devem ser
  modelados como dados/configuração, não como telas individuais codificadas manualmente.
- **Estado centralizado do "Meu Upgrade"**: uma única fonte de verdade para os itens configurados na
  sessão, independente de qual grupo está sendo editado no momento.
- **Separação de camadas**: lógica de perguntas/ramificação, estado do projeto, camada de dados
  (Supabase) e camada visual/animação devem ser independentes e substituíveis isoladamente.
- **Motor de fluxo desacoplado de conteúdo**: o motor que executa perguntas e ramificações não deve
  saber nada sobre o conteúdo específico de "Sites" vs "Tráfego Pago" — o conteúdo é injetado.
- **Eventos como cidadãos de primeira classe**: navegação, escolhas e marcos do funil devem ser
  emitidos como eventos rastreáveis desde o início, mesmo antes de o Supabase estar implementado
  (para não exigir retrabalho depois).
- **Progressive enhancement para motion**: a experiência funcional (navegar, escolher, finalizar) deve
  existir e funcionar corretamente mesmo se a camada de animação avançada falhar ou for desabilitada.

## 13. Princípios de UX

- Perguntas curtas, uma decisão por vez, sem telas com muitos campos simultâneos.
- Toda pergunta existe apenas se sua resposta tiver utilidade concreta (complexidade, solução,
  estratégia, orçamento, prioridade comercial ou próxima pergunta) — nunca perguntar por perguntar.
- Reversibilidade constante: voltar, editar e remover devem estar sempre acessíveis.
- Transparência de progresso: o usuário sabe onde está e o que falta.
- "Meu Upgrade" sempre visível/acessível como referência do que já foi decidido.
- Nenhuma ação destrutiva (remover serviço, sair do fluxo) deve acontecer sem confirmação clara.
- Para quem chega indeciso, existe apenas um link simples e direto para contato humano ("Fale com a
  Upgrade") — nenhuma tentativa de diagnosticar ou recomendar automaticamente. O Builder não é um
  consultor: ele organiza o interesse do cliente, a análise é sempre humana.

## 14. Princípios de performance

- Motion design é aditivo, nunca bloqueante: interações essenciais (avançar, voltar, adicionar, remover,
  finalizar) devem responder independentemente do estado de qualquer animação em curso.
- Carregamento incremental: código de animação pesado (GSAP plugins, eventual Three.js) carregado sob
  demanda, não no bundle inicial.
- Orçamento de performance definido antes da fase de motion design (métricas alvo definidas na Fase 30).
- Nenhuma decisão visual pode ser tomada sem considerar seu custo em dispositivos móveis de entrada.

## 15. Princípios de responsividade

- Mobile é tratado como prioridade real de uso, não apenas como breakpoint adicional.
- Nenhuma interação essencial do fluxo pode depender de hover ou de precisão de mouse.
- Áreas de toque, espaçamento e legibilidade dimensionados para uso com o polegar em uma mão.
- Animações e transições devem ter uma versão adequada (ou reduzida) para mobile, nunca apenas
  "encolhidas" da versão desktop.

## 16. Princípios de segurança

- Dados de leads e respostas tratados como dados sensíveis de negócio desde a concepção.
- Área administrativa protegida por autenticação (mecanismo específico a definir na Fase 6/16).
- Nenhuma chave de serviço (service role) do Supabase exposta ao cliente; toda escrita sensível passa
  por camada de servidor.
- Regras de acesso a dados (RLS ou equivalente) aplicadas antes de qualquer exposição pública de dados.
- Validação de entrada em todos os pontos de captura de dados (perguntas, formulário de contato).
- Conformidade com LGPD tratada como requisito de produto, não como item de checklist tardio.

## 17. Estrutura planejada de dados (conceitual — sem schema/implementação)

Entidades conceituais identificadas para modelagem futura:

- **Session** — sessão anônima do visitante; existe antes de qualquer identificação; acumula eventos
  de navegação e pode acumular um "Meu Upgrade" em progresso.
- **NavigationEvent** — evento individual de comportamento (entrou em X, respondeu Y, adicionou Z ao
  Meu Upgrade, voltou, removeu, finalizou).
- **Project ("Meu Upgrade")** — agregado dos serviços configurados em uma sessão; existe antes de virar
  lead oficial (pode ser abandonado sem nunca virar lead).
- **ServiceSelection** — um item dentro de um Project: qual grupo de serviço, com quais respostas e
  metadados resultantes (complexidade, estratégia sugerida, faixa de orçamento, prioridade).
- **Question / Answer** — pergunta configurável (pertence a um grupo, tem regras de ramificação) e a
  resposta dada dentro de uma ServiceSelection.
- **Lead** — criado somente quando dados de contato são enviados; referencia o Project e a Session de
  origem; é o ponto em que "anônimo" vira "identificado".
- **LeadScore** — pontuação derivada de respostas + comportamento de sessão, associada ao Lead.
- **CommercialStatus** — status do lead dentro do funil comercial (para uso futuro do mini-CRM).

Relação conceitual: `Session (1) → Project (0..N) → ServiceSelection (1..N) → Answer (1..N)`;
`Project (1) → Lead (0..1)` (um projeto só vira lead quando finalizado com dados de contato);
`Lead (1) → LeadScore (1)`, `Lead (1) → CommercialStatus (1..N ao longo do tempo)`.

Nenhum schema de banco, nome de tabela ou tipo de coluna é definido nesta fase — isso pertence à
Fase 6 (Arquitetura técnica) e à Fase 13 (Supabase).

## 18. Roadmap geral

O roadmap segue a ordem de 36 fases definida no briefing, agrupada aqui em macro-etapas para leitura:

1. **Fundação** (1): objetivo e arquitetura conceitual — *fase atual*.
2. **Definição de conteúdo e lógica** (2–5): mapa de serviços, perguntas/ramificações, user flow,
   regras de negócio.
3. **Arquitetura técnica e estrutural** (6–8): arquitetura técnica, wireframe, estrutura Next.js.
4. **Construção funcional do fluxo** (9–12): Upgrade Builder, Meu Upgrade, resumo, captura de lead.
5. **Camada de dados** (13–15): Supabase, sessões, lead score.
6. **Administração e mensuração** (16–17): painel administrativo, analytics.
7. **Design e interface** (18–21): design system, UI final, responsividade.
8. **Motion design** (21–26): motion design, GSAP, ScrollTrigger, microinterações, smooth scroll,
   3D/WebGL se necessário.
9. **Conformidade e qualidade** (27–32): SEO, LGPD, segurança, performance, testes, testes de UX.
10. **Lançamento e evolução** (33–36): deploy, monitoramento, otimização, evolução award-level.

Regra de ordem: nenhuma fase de motion/UI avançada deve anteceder a validação funcional do fluxo
(alinhado ao princípio UX → lógica → funcionalidade → responsividade → performance → UI → animação).

## 19. Riscos técnicos

- **Explosão de complexidade no motor de ramificação**: sem modelagem cuidadosa (Fase 3–6), o número de
  combinações de grupos × perguntas × ramificações pode crescer de forma difícil de manter.
- **Motion design competindo com performance mobile**: GSAP/ScrollTrigger/Lenis mal implementados podem
  degradar a experiência exatamente no dispositivo que é prioridade (mobile).
- **Risco de identidade visual**: manter a metáfora "não é um carrinho de e-commerce" exige disciplina
  de UI contínua; é fácil regredir para padrões de e-commerce por conveniência de componentes prontos.
- **Scope creep em direção ao mini-CRM**: há risco de investir esforço em funcionalidades de CRM antes
  de validar o fluxo básico de configuração e captura de lead.
- **Churn de schema no Supabase**: como o conjunto exato de perguntas/grupos ainda será definido nas
  Fases 2–3, um schema desenhado cedo demais tende a precisar de retrabalho.
- **Fórmula de lead score sem dados reais**: qualquer fórmula inicial de pontuação será uma hipótese;
  precisa ser tratada como versionável e revisável, não como definitiva.
- **Tensão SEO vs. interatividade**: a camada institucional precisa ser indexável mesmo que o fluxo
  interativo (Upgrade Builder) seja fortemente client-side.
- **Dependência de bibliotecas de animação**: GSAP e Three.js têm custo de bundle; decisão de uso
  precisa considerar impacto real, não apenas potencial estético.

## 20. Decisões que NÃO devem ser tomadas prematuramente

- Nome final da experiência ("Meu Upgrade" vs. "Monte seu Upgrade" vs. outro).
- Texto e ordem exata de cada pergunta dentro de cada grupo de serviço.
- Fórmula e pesos do lead score.
- Uso efetivo (ou não) de Three.js/WebGL — condicionado a agregar valor real, avaliado após o fluxo
  funcional estar validado.
- Biblioteca/abordagem de estilização (ex.: Tailwind, CSS Modules, vanilla-extract, styled-components).
- Biblioteca/abordagem de gerenciamento de estado (ex.: Context API, Zustand, Redux).
- Schema definitivo de tabelas do Supabase (nomes, colunas, tipos, índices).
- Mecanismo de autenticação da área administrativa.
- Ferramenta(s) de analytics (ex.: GA4, Plausible, PostHog) e eventos exatos a instrumentar.
- Provedor de hospedagem/deploy.
- Identidade visual final (paleta, tipografia, tokens de design) — pertence à Fase 18 (Design System).
- Estratégia de precificação exibida ao usuário (se haverá valores, faixas, ou apenas escopo sem preço).
- Estrutura de conteúdo institucional (textos, portfólio, cases) — não é o foco desta fase.

---

*Este documento é a referência conceitual para todas as fases seguintes. Qualquer decisão tomada nas
próximas fases deve ser compatível com os princípios aqui registrados ou deve atualizar explicitamente
este documento e `docs/DECISIONS.md`.*
