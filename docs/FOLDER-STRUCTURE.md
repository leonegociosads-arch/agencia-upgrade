# FOLDER STRUCTURE — Estrutura de Diretórios Planejada

> Fase 6 do roadmap. Árvore de diretórios alvo para o projeto, organizada por feature. **Isto é um
> planejamento, não uma migração executada** — os arquivos já existentes (`lib/builder/`,
> `components/builder/`) continuam onde estão; a reorganização física para esta estrutura acontece na
> Fase 8 (Estrutura Next.js), quando o restante das features começar a ser construído.

---

## Por que organização por feature (e não por tipo de arquivo)

Um projeto pequeno com uma única tela interativa se organiza bem por tipo (`components/`, `hooks/`,
`lib/`). Este projeto vai crescer em direções relativamente independentes — o Builder ganha mais
perguntas, o `lead` ganha formulário e envio, o `admin` ganha telas próprias, `analytics` e `motion`
crescem por conta própria — e cada uma dessas frentes deveria poder mudar sem tocar nas outras. Agrupar
por feature mantém cada mudança localizada; `lib/` fica reservado para infraestrutura genuinamente
compartilhada (Supabase, repositórios de dados, utilitários sem regra de negócio).

## Árvore planejada

```
app/
  layout.tsx                    # layout raiz (Server Component)
  page.tsx                      # Home institucional
  globals.css
  projetos/
    page.tsx                    # cases/portfólio (Server Component)
  sobre/
    page.tsx                    # institucional opcional (Server Component)
  privacidade/
    page.tsx                    # política de privacidade (Server Component)
  builder/
    page.tsx                    # shell que monta a feature builder (já existe)
  admin/
    layout.tsx                  # aplica autenticação antes de qualquer render
    page.tsx
    leads/
      page.tsx                  # listagem de leads (futuro)

features/
  builder/
    components/                 # EntryScreen, QuestionScreen, CompletionScreen, UpgradeBuilder
    logic/                      # isQuestionVisible, validateAnswer, invalidateDependentAnswers,
                                 # isServiceComplete, buildServiceSummary, buildProjectSummary
    state/                      # BuilderContext/reducer (hoje lib/builder/BuilderContext.tsx)
    data/                       # definição de perguntas/serviços (hoje lib/builder/config/*.ts)
    types.ts                    # tipos do domínio do Builder
  lead/
    components/                 # formulário de contato (futuro)
    logic/                      # generateWhatsAppMessage, schemas Zod do lead
    actions/                    # Server Actions (submitLead)
  admin/
    components/                 # telas/tabelas do painel (futuro)
    logic/                      # regras específicas de administração (futuro)
  analytics/
    trackEvent.ts               # camada única de rastreamento
    events.ts                   # tipos/nomes de evento
  motion/
    hooks/                      # useGsapReveal, useScrollTrigger, usePrefersReducedMotion
    providers/                  # provider do Lenis (smooth scroll)

lib/
  supabase/
    client.ts                   # cliente do navegador (chave anônima)
    server.ts                   # cliente do servidor (service role key — nunca no cliente)
  repositories/
    leads.ts                    # createLead, updateLeadStatus
    projects.ts                 # saveProjectSnapshot, loadProject
    sessions.ts                 # loadSession, saveSession
    events.ts                   # recordEvent
  utils/                        # helpers genéricos sem regra de negócio (formatação, datas, etc.)

types/
  index.ts                      # tipos compartilhados entre features (poucos, deliberadamente)

config/
  services.ts                   # ServiceId, ServiceConfig (id interno + label exibido)
  routes.ts                     # constantes de rota
  analytics-events.ts           # nomes de evento centralizados
  limits.ts                     # limites (ex.: tentativas de envio)

styles/
  (tokens/variáveis globais, se deixarem de caber em app/globals.css)

middleware.ts                   # proteção de rota (ex.: /admin) — futuro
```

## Responsabilidade de cada pasta importante

| Pasta | Responsabilidade | O que NÃO deve conter |
|---|---|---|
| `app/` | Rotas, layout, o que é Server Component por padrão | Regras de negócio, lógica de ramificação |
| `features/builder/data` | O que perguntar, opções, serviços | Como decidir (isso é `logic/`) |
| `features/builder/logic` | Regras puras de ramificação/validação/resumo | JSX, hooks do React, `window`/`document` |
| `features/builder/state` | Estado do Builder (reducer/contexto) | Regras de negócio detalhadas (chama `logic/`) |
| `features/builder/components` | UI do Builder | Decisão de ramificação (lê o estado, chama ações) |
| `features/lead` | Formulário de contato, geração de mensagem de WhatsApp, envio | Perguntas do Builder |
| `features/admin` | Painel administrativo | Componentes/lógica do Builder público |
| `features/analytics` | Uma interface (`trackEvent`) para qualquer plataforma de analytics | Chamadas diretas a GA4/Meta Pixel espalhadas |
| `features/motion` | Hooks/providers de animação | Lógica comercial ou de estado do Builder |
| `lib/supabase` | Clientes Supabase (browser/server) | Regras de negócio |
| `lib/repositories` | Funções de acesso a dados (`createLead`, etc.), única porta de entrada para Supabase | Detalhes de UI |
| `config/` | Constantes e identificadores estáveis | Lógica, JSX |
| `types/` | Tipos verdadeiramente compartilhados entre features | Tipos específicos de uma única feature (ficam na própria feature) |

## Mapeamento do código já existente para a estrutura alvo

| Hoje | Estrutura alvo (Fase 8) |
|---|---|
| `lib/builder/config/site.ts`, `trafego.ts`, `design.ts` | `features/builder/data/` |
| `lib/builder/flow.ts`, `summarize.ts` | `features/builder/logic/` |
| `lib/builder/BuilderContext.tsx` | `features/builder/state/` |
| `lib/builder/types.ts` | `features/builder/types.ts` |
| `components/builder/*` | `features/builder/components/` |
| `app/builder/page.tsx` | permanece em `app/builder/page.tsx` (rota) |

Nenhum arquivo é movido nesta fase — a tabela acima é o plano de migração para quando a Fase 8 começar a
tocar nesse código.
