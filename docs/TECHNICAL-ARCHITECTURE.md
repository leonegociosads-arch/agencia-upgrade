# TECHNICAL ARCHITECTURE — Arquitetura Técnica do Site da Agência Upgrade

> Fase 6 do roadmap. Define a base técnica sobre a qual as próximas fases serão construídas. Nenhum
> componente de produção, biblioteca nova ou integração é criado aqui — apenas a arquitetura. Onde a
> arquitetura proposta difere do que já existe em código (`lib/builder/`, `components/builder/`,
> `app/builder/`), isso é sinalizado explicitamente como migração para a Fase 8 (Estrutura Next.js), não
> como algo a fazer agora.

---

## 1. Stack

- **Next.js (App Router)** — já inicializado no projeto (`app/`, sem `pages/`).
- **React 19** + **TypeScript** — já em uso.
- **CSS Modules** — já em uso para os componentes do Builder; mantido como abordagem de estilização
  padrão nesta fase (decisão já tomada na Etapa 3, ver `DECISIONS.md`).
- **GSAP + ScrollTrigger, Lenis** — planejados, ainda não instalados. Arquitetura preparada para eles nas
  Seções 18–19.
- **Supabase** — planejado, ainda não instalado. Arquitetura preparada na Seção 15.
- **Zod** — recomendado para a fronteira de validação servidor/persistência (Seção 13); ainda não
  instalado.
- **React Hook Form** — recomendado apenas para o formulário de captura de lead (Seção 17); ainda não
  instalado.

Nenhuma dessas bibliotecas é instalada nesta fase.

## 2. Princípios

A arquitetura separa 7 camadas, e nenhuma camada deve conhecer detalhes de implementação da outra além
de sua interface pública:

| Camada | Responsabilidade | Não deve conter |
|---|---|---|
| **Dados** | Perguntas, serviços, opções (o "o quê") | Lógica de decisão, JSX |
| **Lógica** | Ramificação, validação, invalidação, resumo (o "como decidir") | Estado do React, DOM |
| **Estado** | Respostas atuais, Meu Upgrade, etapa do fluxo | Regras de negócio, chamadas de rede |
| **UI** | O que o usuário vê e clica | Regras de ramificação, acesso a dados externos |
| **Persistência** | Como e onde os dados são salvos (futuro) | Regras de negócio, JSX |
| **Integrações** | Supabase, analytics, WhatsApp | Lógica do Builder |
| **Animações** | Transições e motion design | Lógica comercial, estado que decide o fluxo |

Consequência prática: um componente de pergunta nunca decide sozinho "que pergunta vem depois" (isso é
Lógica lendo Dados); uma animação nunca decide "o serviço foi selecionado" (isso é Estado, já decidido
antes da animação começar).

## 3. Estrutura de diretórios (resumo — árvore completa em `docs/FOLDER-STRUCTURE.md`)

Organização por **feature**, não por tipo de arquivo — `builder`, `lead`, `admin`, `analytics` e `motion`
crescem de forma independente, e `lib/` fica reservado para infraestrutura cross-cutting (Supabase,
repositórios, utilitários genéricos). Ver justificativa completa na Seção 5.

## 4. Rotas

| Rota | Tipo | Conteúdo |
|---|---|---|
| `/` | Server Component | Home institucional (apresentação, CTA "Monte seu Upgrade") |
| `/builder` | Server shell + Client subtree | Upgrade Builder (já implementado como Client Component) |
| `/projetos` | Server Component | Cases/portfólio |
| `/sobre` | Server Component (opcional) | Institucional |
| `/privacidade` | Server Component | Política de privacidade (LGPD) |
| `/admin` | Server Component + middleware de auth | Painel administrativo futuro |
| `/admin/leads` | Server Component + Client para interações | Listagem de leads |

Nenhuma dessas rotas (exceto `/builder`, já existente) precisa ser implementada agora — é a estrutura
prevista. Rotas futuras podem ser adicionadas sem redesenhar as existentes.

## 5. Features

```
features/
  builder/     → Upgrade Builder (perguntas, ramificações, Meu Upgrade)
  lead/        → captura de contato, geração de mensagem de WhatsApp, envio
  admin/       → painel administrativo (consome os mesmos repositórios do lead/builder)
  analytics/   → camada única de rastreamento de eventos
  motion/      → hooks/providers de GSAP, ScrollTrigger, Lenis
```

Cada feature possui, quando fizer sentido, suas próprias `components/`, `logic/`, `data/`, `state/` e
`types.ts` — nunca lógica de uma feature dentro de componentes de outra (ex.: `admin` nunca importa
componentes de `builder`; ambos importam de `lib/repositories`, que é infraestrutura compartilhada, não
uma feature).

## 6. Separação de responsabilidades dentro do Builder

```
features/builder/
  data/          → definição de perguntas/serviços (hoje: lib/builder/config/*.ts)
  logic/         → funções puras: visibilidade, validação, invalidação, conclusão, resumo
  state/         → reducer/contexto do Builder (hoje: BuilderContext.tsx)
  components/    → EntryScreen, QuestionScreen, CompletionScreen, UpgradeBuilder (UI pura)
  types.ts       → tipos do domínio do Builder
```

Regra central: **`components/` só lê o estado e chama ações — nunca decide ramificação sozinho.**
`logic/` nunca importa React. `data/` nunca importa `logic/` nem `components/` (a dependência é sempre
`components → state → logic → data`, nunca o inverso).

## 7. Modelo de estado

Estado que o Builder precisa conhecer (conforme pedido nesta fase):

```ts
type BuilderStep =
  | "idle"
  | "choosing_service"
  | "configuring"
  | "service_complete"
  | "reviewing"
  | "contact"
  | "submitting"
  | "success"
  | "error";

interface BuilderState {
  step: BuilderStep;
  activeService: ServiceId | null;       // serviço sendo configurado agora
  editingService: ServiceId | null;      // não-nulo = modo de edição (rascunho)
  draft: Partial<Record<ServiceId, Record<string, AnswerValue>>>; // respostas temporárias durante edição
  answers: Record<ServiceId, Record<string, AnswerValue>>;        // respostas confirmadas (Meu Upgrade)
  upgrade: Partial<Record<ServiceId, UpgradeItem>>;                // itens concluídos do Meu Upgrade
  history: Record<ServiceId, HistoryEntry[]>;                     // pilha de "voltar" por categoria
  contact: ContactDraft;                                          // dados de contato em preenchimento
  sessionId: string | null;                                       // futuro — Fase 14
  error: { step: BuilderStep; message: string } | null;
}
```

Isso estende o `BuilderContext` já implementado (que hoje cobre `answers`, `activeCategory` e
`history`) com `step` explícito, `editingService`/`draft` (mecanismo de edição com rascunho, já
identificado como pendência nas Fases 4–5), `contact` e `sessionId`. Nenhuma dessas extensões é
implementada nesta fase — ver `docs/DECISIONS.md`.

## 8. Abordagem de state management

**Decisão: manter React Context + `useReducer`** (já implementado), não adicionar Zustand nem outra
biblioteca de estado nesta fase.

Justificativa:

- O estado do Builder é usado por uma árvore relativamente pequena e contida (`/builder` e seus
  componentes filhos), não por widgets independentes espalhados pela aplicação inteira — o cenário onde
  Zustand (assinatura seletiva, sem re-render em cascata) traria ganho real ainda não existe.
- `useReducer` com um tipo de ação discriminado (`type Action = {type:"ANSWER"; ...} | {type:"BACK"; ...}
  | ...`) já dá previsibilidade e testabilidade equivalentes a uma store dedicada, sem dependência nova.
- O volume de dados (3 categorias, poucas dezenas de campos) não justifica infraestrutura de estado mais
  pesada.

**Gatilho de revisão** (quando reconsiderar Zustand ou dividir o contexto): se, ao implementar o painel
"Meu Upgrade" persistente + animações GSAP simultâneas + múltiplos widgets independentes lendo partes
diferentes do estado, o re-render em cascata do Context se tornar mensurável (perceptível em produção,
não hipotético) — nesse momento, dividir em contextos menores (`BuilderAnswersContext`,
`BuilderUIContext`) é o primeiro passo, e só então considerar uma biblioteca externa.

## 9. Máquina de estados: enum + reducer, não XState

**Decisão: enum discriminado (`BuilderStep`) + `useReducer`, sem biblioteca de state machine.**

Justificativa: os 9 estados listados no briefing (`IDLE`...`ERROR`) formam um fluxo majoritariamente
linear com poucos desvios (editar, erro, voltar) — o `switch` exaustivo do TypeScript sobre um union type
já garante que nenhuma transição fica esquecida, que é o principal benefício que uma lib de state machine
ofereceria aqui. XState (ou similar) traria valor em cenários com estados paralelos, histórico profundo
ou muitos guards assíncronos concorrentes — não é o caso do Builder. Reavaliar apenas se o fluxo crescer
nessa direção (ex.: múltiplos serviços sendo editados simultaneamente em paralelo).

## 10. Estado local vs. global

| Local ao componente | Estado global do Builder |
|---|---|
| Hover de um card | Respostas de cada categoria |
| Modal aberto/fechado (ex.: confirmação de remoção) | Serviços concluídos / Meu Upgrade |
| Progresso de uma animação em execução | Etapa atual do fluxo (`step`) |
| Seleção temporária de `multi_choice` antes de confirmar (já implementado em `QuestionScreen`) | Categoria ativa, modo de edição |
| Estado de foco/validação instantânea de um campo do formulário de contato | Dados de contato já confirmados/enviados |

Regra: **se a informação precisa sobreviver a uma troca de tela dentro do Builder ou ser lida por mais de
um componente distante na árvore, ela é global; caso contrário, é local.**

## 11. Regras do Builder — organização

Nenhuma regra condicional (`if siteType === "ecommerce"`) deve existir dentro de componentes de UI.
Responsabilidades divididas em funções puras (`features/builder/logic/`):

| Responsabilidade | Função conceitual | Hoje (código real) |
|---|---|---|
| Visibilidade de pergunta | `isQuestionVisible(question, answers)` | Embutida em `getNextXQuestion` por categoria |
| Validação de resposta | `validateAnswer(question, value)` | Implícita (obrigatoriedade via UI) |
| Invalidação de dependentes | `invalidateDependentAnswers(serviceId, changedField, answers)` | Feita via histórico linear (`BACK`) em `BuilderContext` |
| Conclusão de serviço | `isServiceComplete(serviceId, answers)` | `isCategoryComplete` em `lib/builder/flow.ts` |
| Geração de resumo | `buildServiceSummary` / `buildProjectSummary` | `summarize.ts` (por categoria; falta a versão "projeto inteiro") |

A arquitetura-alvo nomeia essas funções explicitamente para que, ao crescer (mais serviços, mais
perguntas), cada responsabilidade tenha um único lugar para mudar — não various componentes.

## 12. Dependências entre respostas (invalidação em cascata)

Função central única, testável isoladamente, sem tocar em UI:

```ts
function invalidateDependentAnswers(
  serviceId: ServiceId,
  changedFieldId: string,
  currentAnswers: Record<string, AnswerValue>,
): Record<string, AnswerValue> {
  // remove apenas os campos cuja pergunta deixou de ser alcançável
  // a partir de changedFieldId, preservando os demais.
}
```

Exemplo do próprio briefing: `site_tipo` muda de `ecommerce` para `site_institucional` → `site_recursos`
(que continha opções específicas de e-commerce) é removido; `site_situacao` e qualquer configuração de
Tráfego Pago ou Design permanecem intactos, porque a função opera **apenas sobre o `serviceId` afetado**.
Esta é a formalização, como função pura e nomeada, do comportamento que hoje existe implicitamente no
histórico linear (`BACK`) do `BuilderContext`.

## 13. Modelo de dados das perguntas (tipos conceituais)

```ts
type ServiceId = "site" | "trafego" | "design";

type QuestionType = "single_choice" | "multi_choice" | "short_text";

interface QuestionOption {
  id: string;
  label: string;
  description?: string;
}

type QuestionCondition =
  | { field: string; equals: string }
  | { field: string; in: string[] }
  | ((answers: Record<string, AnswerValue>) => boolean); // escape hatch para casos como a
                                                          // combinação de serviços em Design

interface Question {
  id: string;
  service: ServiceId;
  text: string;
  description?: string;
  type: QuestionType;
  options: QuestionOption[] | ((answers: Record<string, AnswerValue>) => QuestionOption[]);
  required: boolean;
  condition?: QuestionCondition;
  dependencies?: string[]; // campos cuja mudança pode invalidar esta pergunta
  metadata?: {
    priceSignal?: boolean;
    leadScoreSignal?: boolean;
  };
}

interface ServiceConfig {
  id: ServiceId;
  label: string;          // texto exibido — pode mudar sem afetar `id`
  description: string;
  entryQuestionId: string;
}

type AnswerValue = string | string[];

interface BuilderAnswer {
  questionId: string;
  value: AnswerValue;
  answeredAt: string; // ISO timestamp
}

interface UpgradeItem {
  serviceId: ServiceId;
  answers: Record<string, AnswerValue>;
  status: "configuring" | "complete";
  createdAt: string;
  updatedAt: string;
}
```

O código real hoje representa `Question`/`QuestionOption` de forma equivalente (`lib/builder/types.ts`),
mas sem `required`, `condition` ou `metadata` como campos explícitos — essas informações estão embutidas
na lógica de cada `getNextXQuestion`. Formalizá-las como dados é uma evolução, não uma correção de bug;
fica registrada aqui para orientar a Fase 8, não implementada agora.

## 14. Identificadores de serviço

```ts
const SERVICES: Record<ServiceId, ServiceConfig> = {
  site: { id: "site", label: "Sites e Desenvolvimento", ... },
  trafego: { id: "trafego", label: "Tráfego Pago", ... },
  design: { id: "design", label: "Design / Social Media", ... },
};
```

`id` interno (`site`, `trafego`, `design`) nunca muda; `label` (o texto mostrado) pode ser ajustado a
qualquer momento (ex.: testes de copy) sem tocar em nenhuma regra de lógica ou nos dados salvos. O código
real já segue esse princípio (`CategoryId = "site" | "trafego" | "design"` em `lib/builder/types.ts`,
com `CATEGORY_LABELS` separado) — mantido como está.

## 15. Arquitetura do "Meu Upgrade"

```ts
interface UpgradeItem {
  serviceId: ServiceId;
  answers: Record<string, AnswerValue>;
  status: "configuring" | "complete";
  createdAt: string;
  updatedAt: string;
}

type MyUpgrade = Partial<Record<ServiceId, UpgradeItem>>; // no máximo 1 item por categoria
```

**Decisão confirmada nesta fase**: cada categoria aceita **apenas uma configuração ativa por projeto**
na V1 — um Site, uma configuração de Tráfego, uma de Design/Social. Isso já era uma decisão da Fase 4 e
é reafirmada aqui no nível de tipo: `MyUpgrade` é um `Record` por `ServiceId`, não uma lista — a própria
estrutura de dados torna impossível ter duas instâncias da mesma categoria sem uma mudança de tipo
deliberada. Editar substitui o item existente; nunca cria um segundo.

## 16. Regras — resumo da estratégia geral

Ver Seções 11–12. Resumo da estratégia: toda regra de ramificação/validação/invalidação vive em
`features/builder/logic/`, como funções puras que recebem dados e retornam dados — nunca lêem `window`,
`document`, nem hooks do React. Isso é o que viabiliza a Seção 22 (Testabilidade).

## 17. Validação

Duas camadas, com ferramentas diferentes para cada uma:

1. **Camada de experiência (dentro do Builder)**: validação simples (campo obrigatório respondido,
   pelo menos uma opção marcada em `multi_choice`) — já suficiente com funções próprias
   (`validateAnswer`), sem necessidade de uma biblioteca de schema. É feedback imediato, não é a
   fronteira de segurança.
2. **Camada de persistência (antes de gravar em qualquer lugar, incluindo Supabase no futuro)**: aqui,
   **Zod é recomendado**. Motivo: essa é a fronteira onde dados deixam de ser "confiáveis por
   construção" (vindos de um fluxo controlado) e passam a ser tratados como entrada externa — o
   formulário de contato aceita texto livre (nome, empresa, Instagram/site), e uma Server Action nunca
   deve confiar apenas na validação que rodou no navegador. Um schema Zod (`LeadInputSchema`,
   `ProjectPayloadSchema`) valida no servidor antes de qualquer gravação, e pode ser reaproveitado no
   cliente (React Hook Form) para gerar mensagens de erro consistentes sem duplicar regras.

Zod não é instalado nesta fase — apenas recomendado, com o ponto exato de uso definido.

## 18. Formulários (captura de lead)

**Decisão: React Hook Form + Zod, apenas para o formulário de contato** — não para as telas de perguntas
do Builder (que são cards clicáveis, não inputs de formulário tradicional, e já têm seu próprio
mecanismo de estado/validação).

Justificativa: o formulário de contato é o único ponto da experiência com múltiplos campos de texto
livre, necessidade de validação por campo (e-mail, WhatsApp), e submissão real — exatamente o caso de
uso para o qual React Hook Form + Zod (via `zodResolver`) existem. Usá-los aqui evita reinventar
validação de formulário; não usá-los no restante do Builder evita uma dependência desnecessária onde o
padrão de interação é diferente (seleção de cards, não digitação).

## 19. Supabase (isolamento futuro)

Supabase **não é integrado nesta fase**. Estrutura prevista para quando for:

```
lib/
  supabase/
    client.ts     → cliente do navegador (chave anônima apenas)
    server.ts     → cliente do servidor (service role key — nunca exposto ao cliente)
repositories/
  leads.ts        → createLead(), updateLeadStatus()
  projects.ts     → saveProjectSnapshot(), loadProject()
  sessions.ts     → loadSession(), saveSession()
  events.ts       → recordEvent()
```

A UI e as Server Actions **nunca chamam o cliente Supabase diretamente** — sempre through
`repositories/*`. Ver Seção 20 para a justificativa dessa camada.

## 20. Repository / camada de acesso a dados

**Decisão: sim, usar uma camada de repositório fina.** `createLead()`, `saveProjectSnapshot()`,
`loadSession()` são as funções que o resto da aplicação chama; a implementação interna delas usa
Supabase hoje planejado, mas poderia usar outro backend sem que nada fora de `repositories/` precisasse
mudar. Isso reduz o acoplamento entre "Upgrade Builder" e "Supabase especificamente" a um único ponto,
o que responde diretamente ao cenário de revisão nº 11 (Supabase substituível sem reescrever a UI).

## 21. Server Components vs. Client Components

Princípio: **Client Component é a exceção, não o padrão.**

| Área | Tipo | Motivo |
|---|---|---|
| `app/layout.tsx`, Home, `/projetos`, `/sobre`, `/privacidade` | Server | Conteúdo majoritariamente estático, beneficia SEO e performance |
| `app/builder/page.tsx` | Server (shell) | Já implementado assim — só renderiza o Provider |
| `BuilderProvider`, `UpgradeBuilder` e componentes filhos | Client | Precisam de estado interativo (já marcados `"use client"`) |
| `/admin` (listagem/leitura) | Server | Busca de dados pode ser Server Component com `repositories/*` |
| `/admin` (filtros, tabelas interativas) | Client (pontual) | Só a parte realmente interativa |

O código atual já segue esse princípio corretamente (o `"use client"` está isolado em
`lib/builder/BuilderContext.tsx` e nos componentes de `components/builder/`, não no layout raiz nem na
Home). Manter essa disciplina conforme novas páginas forem adicionadas.

## 22. API / Server Actions

**Decisão: Server Actions como mecanismo principal** para o envio do lead (`submitLead(formData)`), não
Route Handlers separados.

Justificativa:
- O envio do lead é uma ação colocada com a própria página/fluxo do Builder — não precisa ser chamada
  por nenhum cliente externo (não é um webhook nem uma API pública).
- Server Actions do Next.js já mitigam CSRF nativamente e reduzem boilerplate comparado a criar uma
  Route Handler + `fetch` manual do cliente.
- Validação (Zod, Seção 17), rate limiting futuro, e a chamada a `repositories/leads.ts` (Seção 20)
  ficam todas colocadas na mesma função de servidor, sem expor lógica de negócio ao bundle do cliente.

**Route Handlers ficam reservados** para casos que exigem um endpoint HTTP de verdade (ex.: um futuro
webhook de confirmação do WhatsApp, ou uma integração externa que precise chamar o Next.js de fora) —
nenhum previsto ainda.

## 23. Sessão temporária

Estratégia evolutiva, não implementada agora:

- **V1 (quando a persistência de sessão for implementada, Fase 14)**: estado do Builder serializado em
  `localStorage`, sob uma chave versionada (ex.: `upgrade-builder:v1`) para permitir invalidar/migrar
  com segurança se o formato do estado mudar. Hidratação feita só depois do primeiro render no cliente,
  para não gerar mismatch de SSR.
- **Evolução (Fase 13/14, com Supabase)**: um `session_id` anônimo (cookie ou `localStorage`) passa a
  sincronizar com uma tabela de sessão no Supabase, permitindo recuperar o progresso mesmo trocando de
  dispositivo, e sendo o vínculo entre eventos de navegação anônimos e o Lead criado no momento da
  conversão (consistente com `PROJECT-OVERVIEW.md`, Seção 8).

## 24. Analytics

Camada única, nenhuma chamada direta a uma plataforma específica espalhada pelo código:

```ts
// features/analytics/trackEvent.ts
function trackEvent(name: AnalyticsEventName, payload?: Record<string, unknown>): void {
  // fan-out interno para os "sinks" registrados (GA4, Meta Pixel, console em dev, etc.)
}
```

A lógica do Builder (e futuramente do formulário de contato) chama só `trackEvent(...)`; qual
plataforma realmente recebe o evento é um detalhe de implementação de `features/analytics/`, trocável
sem tocar em `builder/` ou `lead/`. `AnalyticsEventName` é um union type dos nomes já definidos em
`docs/USER-FLOW.md` (`builder_started`, `service_started`, `question_answered`, `service_completed`,
`project_summary_viewed`, `contact_started`, `lead_submitted`, etc.) — nomes centralizados em
`config/analytics-events.ts`, nunca strings soltas nos componentes.

## 25. WhatsApp

```ts
// features/lead/logic/generateWhatsAppMessage.ts
function generateWhatsAppMessage(summary: ProjectSummary): string {
  // monta o texto a partir do resumo do projeto (docs/BUSINESS-RULES.md, Seção 11)
}
```

Função pura, sem JSX e sem acesso a `window` — recebe o resumo já calculado e devolve uma string. O
componente do botão (futuro) só chama essa função e monta o link `https://wa.me/...?text=...`; a lógica
de como o texto é montado nunca fica dentro do componente do botão (facilita testar e alterar o texto
sem tocar em UI).

## 26. Animações (GSAP, ScrollTrigger, Lenis)

Princípios:

- Animações vivem em `features/motion/` — hooks (`useGsapReveal`, `useScrollTrigger`,
  `usePrefersReducedMotion`) e providers (ex.: Lenis) que **leem** estado já commitado do Builder como
  props, e nunca escrevem de volta nele.
- **Nunca**: "quando a animação termina, então o dado passa a existir". A ordem correta é sempre: o
  sistema já registrou `activeService = "site"` (Estado) → a camada visual anima a transição para essa
  tela (Animação). Se a animação falhar, for desabilitada, ou o usuário tiver `prefers-reduced-motion`
  ativado, a navegação e os dados continuam funcionando exatamente igual.
- GSAP/ScrollTrigger são carregados sob demanda (import dinâmico) apenas nas rotas/telas que os usam —
  nunca no layout raiz — para não pesar o bundle inicial do Builder (Seção 27).

## 27. `prefers-reduced-motion`

Um hook único (`usePrefersReducedMotion`) consulta a media query uma vez e é reutilizado por toda a
camada de motion. Componentes de animação recebem esse valor e decidem reduzir/pular efeitos — a
funcionalidade (clicar, responder, navegar, enviar) nunca depende de a animação ter rodado. Essa decisão
é arquitetural (não uma feature de UI a ser "lembrada depois"): nenhuma lógica do Builder pode assumir
que uma animação vai acontecer.

## 28. Responsividade

A lógica (Seções 11–12) nunca sabe se está rodando em desktop ou mobile — ela só lê/escreve o mesmo
`BuilderState`. O que muda entre plataformas é só a camada de UI: "Meu Upgrade" como painel lateral no
desktop vs. drawer/modal no mobile (já registrado em `USER-FLOW.md`, Seção 21) são duas apresentações
diferentes do mesmíssimo estado — nunca dois estados diferentes.

## 29. Admin (reserva de arquitetura)

`features/admin/` não é construído nesta fase. Reservas arquiteturais:

- Rota `app/admin/**` protegida por `middleware.ts` (checagem de sessão/role antes de qualquer render).
- Consome `repositories/leads.ts`, `repositories/projects.ts` (mesma camada usada pelo Builder/lead) —
  nunca acessa Supabase diretamente, nem duplica lógica de acesso a dados.
- Componentes e lógica próprios em `features/admin/`, nunca importados por `features/builder/` (a
  dependência é sempre admin → repositories, nunca builder → admin nem admin → builder).

## 30. Segurança (princípios, sem implementação)

- Segredos (service role key, chaves de API) só existem no servidor — nunca em variáveis
  `NEXT_PUBLIC_*`, nunca no bundle do cliente.
- Toda validação do cliente é redundada no servidor (Seção 17) — o cliente nunca é a única barreira.
- RLS (Row Level Security) no Supabase, quando implementado, restringe acesso por padrão.
- Sanitização de qualquer campo de texto livre do usuário (ex.: Instagram/site atual) antes de
  armazenar ou exibir.
- `/admin` protegido por autenticação desde o primeiro commit dessa rota — nunca publicado "aberto por
  enquanto".
- Rate limiting na Server Action de envio de lead, quando implementado (ex.: por IP/sessão).

## 31. Performance (princípios)

- Server Components por padrão (Seção 21); `"use client"` só onde há interatividade real.
- Imagens via `next/image`; carregamento sob demanda de efeitos pesados (GSAP/ScrollTrigger/Three.js,
  se algum dia necessário) via import dinâmico, nunca no bundle inicial.
- Evitar barrels/re-exports que atrapalhem tree-shaking em `features/*`.
- Mobile pode receber uma versão com efeitos reduzidos, controlada pela mesma camada de motion (Seção
  26–27), sem duplicar lógica de negócio.

## 32. Configurações e constantes

Nada de strings mágicas espalhadas. Localização prevista:

| O quê | Onde |
|---|---|
| IDs e labels de serviço | `config/services.ts` |
| Rotas | `config/routes.ts` |
| Nomes de evento de analytics | `config/analytics-events.ts` |
| Limites (ex.: nº máx. de tentativas de envio) | `config/limits.ts` |
| Perguntas e opções | `features/builder/data/*` |

## 33. Testabilidade

Toda a lógica listada nas Seções 11–12 e 15 é escrita como **funções puras sem React nem DOM** —
`isQuestionVisible`, `validateAnswer`, `invalidateDependentAnswers`, `isServiceComplete`,
`buildServiceSummary`/`buildProjectSummary`, `generateWhatsAppMessage`. Isso permite testá-las
isoladamente (entrada → saída, sem renderizar nada) assim que uma ferramenta de teste for adicionada ao
projeto (decisão de qual ferramenta fica para quando os testes forem de fato escritos — fora do escopo
desta fase). Componentes de UI podem ser testados separadamente, sem precisar re-testar a lógica de
ramificação através deles.

---

## Revisão obrigatória — a arquitetura suporta estes cenários?

1. **Configurar Site** — sim: `features/builder/data/site` + `logic` + `state` já cobrem isso (código
   real já funciona).
2. **Site + Tráfego** — sim: `MyUpgrade` é um registro por `ServiceId`, suporta múltiplas categorias
   simultâneas sem conflito.
3. **Editar Site depois de adicionar Tráfego** — sim, com a extensão de `editingService`/`draft`
   (Seção 7) ainda não implementada em código — arquitetura já prevê o campo; falta construir.
4. **Resposta anterior invalida pergunta posterior** — sim: `invalidateDependentAnswers` (Seção 12) é
   escopada por `serviceId`, nunca afeta outra categoria.
5. **Resumo usa todos os serviços** — sim: `buildProjectSummary` (Seção 11) agrega sobre `MyUpgrade`
   inteiro, não por categoria isolada (função ainda não existe em código — hoje só há `summarize.ts` por
   categoria).
6. **Refresh recupera sessão (futuro)** — arquitetura prevista (Seção 23), não implementada; o campo
   `sessionId` já reservado no `BuilderState` (Seção 7).
7. **Lead salvo antes do WhatsApp** — sim: `repositories/leads.ts` (`createLead`) é chamado pela Server
   Action de envio (Seção 22) antes de qualquer geração de link de WhatsApp (Seção 25).
8. **Analytics sem depender de plataforma específica** — sim: `trackEvent` (Seção 24) é a única
   interface que o Builder conhece.
9. **GSAP removível sem quebrar o Builder** — sim: motion (Seção 26) só lê estado já commitado; nenhuma
   lógica de dados depende de uma animação ter rodado.
10. **Desktop e mobile compartilham a mesma lógica** — sim: Seção 28, um único `BuilderState`, duas
    apresentações.
11. **Supabase substituível sem reescrever a UI** — sim: `repositories/*` (Seção 20) é o único ponto de
    contato; trocar o backend é trocar a implementação interna dessas funções.
12. **Admin sem misturar código público/privado** — sim: `features/admin/` nunca é importado por
    `features/builder/`, e ambos só compartilham `lib/repositories/*` (Seção 29).

Nenhum problema arquitetural bloqueante foi encontrado. As lacunas identificadas (edição com rascunho,
resumo agregado do projeto inteiro, sessionId real) já eram conhecidas de fases anteriores e ficam
formalmente reservadas na arquitetura, não resolvidas agora.
