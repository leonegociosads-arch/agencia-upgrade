# IMPLEMENTATION STAGE 16 — Painel Administrativo / Mini-CRM

> Fase 16 do roadmap. Implementa `/admin`: autenticação via Supabase Auth, controle de acesso por
> `admin_users`, lista/filtros/busca/paginação de projetos, tela de detalhe (contato, respostas,
> score, status, notas), status comercial com histórico, e contato rápido (WhatsApp/e-mail). Não
> implementa analytics completo, automação comercial, e-mail/WhatsApp reais, UI premium nem
> Kanban — reservados às fases seguintes.

---

## 1. O que foi implementado

Toda a área administrativa: login/logout, proteção de rota em duas camadas (Proxy otimista + DAL
real), leitura/atualização de leads sob RLS, notas internas, histórico de status, e as telas de
lista e detalhe. Ver `docs/ADMIN-CRM.md` para o comportamento completo.

## 2. Rotas

```
app/admin/login/page.tsx                 → pública, formulário de login
app/admin/(protected)/layout.tsx         → chrome comum (logout), chama requireAdminSession()
app/admin/(protected)/page.tsx           → /admin — lista + resumo
app/admin/(protected)/leads/[id]/page.tsx → /admin/leads/[id] — detalhe
proxy.ts                                 → protege /admin/** (renomeado de middleware.ts no Next 16)
```

O grupo de rotas `(protected)` não aparece na URL — só separa o login (sem checagem de auth) do
resto (com checagem), sem duplicar o prefixo `/admin`.

## 3. Componentes

`features/admin/components/`: `LoginForm`, `DashboardSummary`, `LeadsFilters`, `LeadsList`,
`Pagination`, `LeadDetail`, `StatusSelect`, `NoteForm`, `NotesList`, `StatusHistoryList`,
`EmptyState`, `ErrorState`. A maioria são Server Components; só `StatusSelect`, `NoteForm` e
`ErrorState` (que precisam de interatividade/estado local) são `"use client"`.

`features/admin/logic/`: `leadStatus.ts` (valores/labels), `leadScoreDisplay.ts` (labels de tier),
`noteContentSchema.ts`, `buildWhatsAppLink.ts`, `buildMailtoLink.ts`, `buildAdminProjectSummary.ts`,
`formatDate.ts`.

## 4. Queries

Todas em `lib/repositories/leads.ts` (`listLeads`, `getLeadById`, `getLeadStatus`,
`getAdminLeadCounts`), `lib/repositories/leadNotes.ts` e `lib/repositories/leadStatusHistory.ts` —
todas recebem o cliente de SESSÃO já autenticado (`lib/auth/adminSession.ts`) como parâmetro, nunca
criam seu próprio cliente (diferente de `createLead`, que usa service role porque roda sem sessão
nenhuma, no fluxo público). Uma única consulta por listagem — `project`/score/status já vivem na
mesma linha de `upgrade_leads`, então não existe "N+1" possível aqui (não há tabela relacionada
para juntar).

## 5. Mutations

Duas Server Actions específicas e nomeadas (nunca uma função genérica):

- `updateLeadStatus(leadId, newStatus)` — valida `leadId` (UUID) e `newStatus` (um dos 6 valores),
  lê o status atual, atualiza, grava uma entrada de histórico. Falha ao gravar o histórico não
  desfaz a mudança de status já aplicada.
- `addLeadNote(leadId, content)` — valida `leadId` e `content` (1–2000 caracteres, texto puro).

Mais `signInAdmin`/`signOutAdmin` para autenticação.

## 6. Migrations

`supabase/migrations/20260917000000_admin_crm.sql` — `status`/`archived_at` em `upgrade_leads`,
tabela `admin_users`, função `is_admin()`, tabelas `upgrade_lead_status_history` e
`upgrade_lead_notes`, todas as policies de RLS e os `GRANT`s (incluindo o `GRANT UPDATE (status)`
restrito a uma única coluna). Nomeação `upgrade_lead_*` (não `project_*`, como o briefing sugeria)
para ficar consistente com a tabela que já existe.

## 7. Auth

`@supabase/ssr` instalado (reversão consciente da decisão da Fase 13 de não instalá-lo — na ocasião
não havia necessidade de sessão de usuário; agora há). `lib/supabase/client.ts` migrado de
`createClient` para `createBrowserClient` (mesmo pacote, cookies compatíveis com o servidor —
continua sem consumidor real, reservado). Novo `lib/supabase/serverSessionClient.ts`
(`createServerClient`, cookies via `next/headers`). `lib/auth/adminSession.ts` é a Data Access
Layer real (`getAdminSession`/`requireAdminSession`, `cache()` por requisição) — segue o padrão que
a própria documentação do Next recomenda para autorização (checagem explícita em cada
página/Server Action, não só na layout ou na Proxy).

## 8. RLS

Ver `docs/ADMIN-CRM.md`, Seção 14, e o SQL da migration. Testado via mocks nos testes automatizados
(o comportamento da FUNÇÃO que monta cada consulta); as policies em si só podem ser confirmadas de
verdade contra o Postgres real do usuário — ver Seção 9 (testes) e o roteiro de teste manual.

## 9. Testes

76 novos, cobrindo os 27 cenários obrigatórios do briefing (onde aplicável em nível de unidade —
RLS de verdade exige o Postgres real, ver abaixo):

- `lib/auth/adminSession.test.ts` (6) — sem sessão, autenticado-não-admin, admin válido; cada
  cenário reimporta o módulo (`vi.resetModules()`) para isolar o `cache()` do React entre testes.
- `features/admin/actions/signIn.test.ts` (5) — validação, credenciais erradas, conta sem acesso
  (desloga de novo), admin válido redireciona.
- `features/admin/actions/updateLeadStatus.test.ts` (6) — id/status inválidos rejeitados no
  servidor, lead inexistente, transição válida grava histórico, falha não grava histórico,
  `requireAdminSession` sempre chamada primeiro.
- `features/admin/actions/addLeadNote.test.ts` (5) — id inválido, conteúdo vazio/longo rejeitados
  no servidor, nota válida vinculada ao lead e ao autor.
- `lib/repositories/leadsAdmin.test.ts` (16) — lista (ordenação padrão e por score, todos os
  filtros, busca sanitizada, paginação sem sobreposição entre páginas), detalhe, atualização de
  status, contagens do resumo.
- `lib/repositories/leadNotes.test.ts` (4) e `leadStatusHistory.test.ts` (4).
- `features/admin/logic/*.test.ts` (18) — status, schema de nota, links de WhatsApp/e-mail, resumo
  do projeto com labels humanas.

**Descoberta real durante os testes**: `z.string().uuid()` retornava `success: false` mesmo para
UUIDs válidos nesta versão do Zod v4 (a API mudou — o validador correto agora é o `z.uuid()` de
nível superior, o mesmo padrão já usado para `z.email()` desde a Fase 12). Descoberto porque o
teste do "caminho feliz" de `updateLeadStatus` falhava com "Identificador de projeto inválido" para
um UUID genuinamente válido — corrigido em `updateLeadStatus.ts` e `addLeadNote.ts`.

**Testes 22–24 (RLS: público/não-admin bloqueados, admin permitido)**: verificados na prática via
teste manual contra o Supabase real do usuário (Teste Manual G, `docs/IMPLEMENTATION-STAGE-16.md`
Seção "Teste manual") — Vitest não sobe um Postgres real com RLS, então o comportamento das
policies em si (não a lógica das funções que montam a consulta) só pode ser confirmado assim.

## 10. Limitações

Ver `docs/ADMIN-CRM.md`, Seção 18.

## 11. Pendências para a Etapa 17 (Analytics e Eventos)

- Nenhuma funcionalidade de analytics/tracking de funil foi tocada nesta fase.
- Resolver `changed_by`/`created_by` para um nome de exibição quando existir mais de um admin.
- UI para gerenciar `admin_users` (se/quando fizer sentido ter mais de um admin frequentemente).
- Considerar um índice GIN em `project` se o filtro por serviço se tornar lento com o crescimento
  da base.
