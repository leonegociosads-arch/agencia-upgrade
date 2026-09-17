# ADMIN CRM — Painel Administrativo / Mini-CRM

> Fase 16 do roadmap. Documenta a área administrativa interna (`/admin`) — autenticação, controle
> de acesso, lista/filtros/busca/paginação de projetos, detalhe, status comercial, notas internas e
> contato rápido (WhatsApp/e-mail). Implementação em `features/admin/`, `lib/auth/adminSession.ts`,
> `lib/repositories/{leads,leadNotes,leadStatusHistory}.ts` e `proxy.ts`.

---

## 1. Objetivo

Uma **central de oportunidades** para o time da Upgrade acompanhar os projetos recebidos pelo
Builder — ver, priorizar, abrir detalhes, mudar status, anotar — nunca um "dashboard cheio de
gráficos". Sem automação comercial, sem funil visual com drag-and-drop, sem analytics completo
(Fase 17).

## 2. Autenticação

Supabase Auth (e-mail/senha) — nenhum sistema de senha caseiro. Dois clientes distintos coexistem
de propósito:

- `lib/supabase/server.ts` — service role, ignora RLS, usado só pelo envio público do lead
  (Fase 13). Nunca usado pelo admin.
- `lib/supabase/serverSessionClient.ts` — chave anônima + cookie de sessão do usuário logado
  (`@supabase/ssr`, novo nesta fase). É esse cliente que o admin usa para tudo — as consultas
  passam pelo RLS como o próprio usuário, nunca com privilégio elevado.

Login em `/admin/login` (Server Action `signInAdmin`, `useActionState`) — só e-mail e senha, sem
cadastro público. Logout via um `<form>` simples (`signOutAdmin`, sem JavaScript necessário).

**Proxy vs. checagem real** — `proxy.ts` (não `middleware.ts`: este projeto está no Next.js 16, que
depreciou `middleware` em favor de `proxy`, mesmo arquivo/propósito) faz só uma checagem
**otimista** (existe uma sessão?) e renova o cookie de sessão a cada requisição. A checagem REAL
(é admin de verdade?) vive em `lib/auth/adminSession.ts` (`requireAdminSession`), chamada
explicitamente em toda página e Server Action do admin — a própria documentação do Next recomenda
não confiar só numa Proxy/layout para autorização, porque layouts não re-executam em toda navegação
client-side dentro da mesma rota.

## 3. Admin users

Estar autenticado no Supabase Auth **não** concede acesso — só quem também está na tabela
`admin_users` (`user_id`, `role` fixo em `'admin'`, `created_at`) é considerado admin. Sem UI para
gerenciar admins nesta fase (V1): o primeiro admin (e qualquer outro) é criado via SQL Editor,
nunca pelo próprio app — ver `docs/DEPLOYMENT.md`, Seção 8 ("Primeiro admin"), para o processo
exato passo a passo. *(Corrigido na Etapa 33 — esta referência apontava para uma seção que nunca
existiu de fato em `docs/IMPLEMENTATION-STAGE-16.md`.)*

## 4. Permissões

| Quem | SELECT em `upgrade_leads` | UPDATE em `upgrade_leads` | Notas/Histórico |
|---|---|---|---|
| Visitante público (`anon`) | Não | Não | Não |
| Autenticado, não-admin | Não | Não | Não |
| Admin (`admin_users`) | Sim | Só a coluna `status` | Sim (SELECT + INSERT) |

Reforçada em duas camadas independentes: RLS (linha) + `GRANT` restrito à coluna `status` (mesmo
que um bug futuro tentasse enviar outro campo, o Postgres já rejeitaria no nível de privilégio).

## 5. Lista

Home do admin (`/admin`) — cada linha é um `upgrade_leads` (que já é "lead + projeto" na mesma
linha; não existe uma tabela `projects` separada para juntar, então a lista nunca corre risco de
N+1). Colunas: nome, empresa, serviços, score/tier, status, data, um link "Abrir". Mais recentes
primeiro por padrão (`ORDER BY created_at DESC`).

## 6. Filtros

Status, tier e serviço — um `<form method="get">` puro, sem JavaScript: escolher um filtro recarrega
a página com novos parâmetros de busca, que o Server Component lê diretamente (`searchParams`).
Trocar qualquer filtro reresete a página para 1 automaticamente (o formulário não inclui `page`).

## 7. Busca

Por nome, empresa, e-mail ou WhatsApp, num único campo — todos combinados com `OR` numa única
consulta (`ilike` em cada coluna). Caracteres que quebrariam a sintaxe do filtro (`,` e `()`) são
removidos antes de montar a consulta — não é um escapador genérico de SQL, só o suficiente para não
quebrar essa sintaxe específica.

## 8. Score

Mostrado como número + tier (badge de texto, prioritário com destaque discreto — nunca só cor). O
detalhe também mostra o `breakdown` completo (cada regra que contribuiu, com seus pontos) — nunca
uma interface gamificada, só uma lista técnica para auditoria.

## 9. Detalhe

`/admin/leads/[id]` — Contato, Projeto (respostas com labels humanas via
`buildAdminProjectSummary`, que reaproveita `buildServiceSummary`, a mesma função pura do Resumo
público — nunca JSON bruto como experiência principal), Score (com breakdown), Status (seletor),
Histórico de status, Notas internas, Metadados (data de criação, ID). Um `<details>` recolhido por
padrão ("Ver dados brutos") existe como opção técnica secundária, nunca como a exibição padrão.

## 10. Status

6 valores: `new` → Novo, `contacted` → Contatado, `meeting` → Reunião, `proposal` → Proposta,
`won` → Fechado, `lost` → Perdido. `qualified` foi avaliado e descartado — ficaria ambíguo entre
`contacted` e `meeting`, sem uma ação própria clara. Todo projeto novo nasce com `status = 'new'`.
Alterado direto no `<select>` do detalhe (`StatusSelect`, salva sozinho ao trocar — otimista, com
reversão automática se o servidor rejeitar). Cada mudança grava uma linha em
`upgrade_lead_status_history` (`old_status`, `new_status`, `changed_by`, `created_at`) — histórico
que nunca é editado nem apagado.

## 11. Notas

Texto puro (nunca HTML — `dangerouslySetInnerHTML` nunca usado para renderizar uma nota), até 2000
caracteres, validado tanto no cliente quanto no servidor. Só adicionar é suportado em V1 (sem
editar/apagar notas existentes). Vinculadas ao projeto (`lead_id`) e ao autor (`created_by`), nunca
misturadas com nenhum dado visível ao cliente (`ProjectSnapshot`, `LeadPayload`, resumo público).

## 12. WhatsApp

Botão "Abrir WhatsApp" gera um link `wa.me/<número normalizado>?text=<mensagem curta>` — não é
WhatsApp API. Mensagem inicial breve e genérica ("Olá, {nome}! Aqui é da Agência Upgrade. Recebemos
seu projeto pelo nosso site."), nunca um resumo do projeto embutido automaticamente — o
administrador continua a conversa manualmente depois.

## 13. E-mail

Botão "Enviar e-mail" usa `mailto:` — não é um sistema de envio completo (isso pertence a fases
futuras, fora de escopo aqui).

## 14. RLS

Ver `supabase/migrations/20260917000000_admin_crm.sql` para o SQL completo. Resumo: RLS habilitada
em `upgrade_leads`, `admin_users`, `upgrade_lead_notes` e `upgrade_lead_status_history`; uma função
auxiliar `public.is_admin()` (`security definer`, consulta `admin_users` pelo `auth.uid()` atual)
evita repetir a mesma subquery em cada policy. `admin_users` só permite que um usuário confira A SI
MESMO (nunca listar quem mais é admin).

## 15. Segurança

- Cliente nunca controla `lead_score`/`tier`/`breakdown`/`version` — calculados e persistidos só
  pelo fluxo de envio do lead (Fase 15); o admin só LÊ esses campos, nunca escreve.
- Server Actions específicas e nomeadas (`updateLeadStatus`, `addLeadNote`) — nunca uma função
  genérica `updateAnything(table, data)`.
- Toda Server Action do admin chama `requireAdminSession()` antes de qualquer outra coisa.
- `projectId`/`leadId` validado como UUID (`z.uuid()`) no servidor antes de qualquer consulta.
- Nota validada no servidor (1–2000 caracteres), nunca só no cliente.
- Nunca logado no console: e-mail, telefone, conteúdo de notas (só mensagens de erro genéricas).
- `changed_by`/`created_by` sempre preenchidos com o `user.id` do admin autenticado — nunca aceito
  do cliente.

## 16. Paginação

`limit`/`offset` via `.range()` do Supabase — 20 por página (configurável até um teto de 100, nunca
"carregar tudo"). Links "Anterior"/"Próxima" preservam os filtros atuais.

## 17. Mobile

Mesma marcação, CSS decide: tabela no desktop, cards empilhados no mobile
(`features/admin/components/LeadsList.module.css`, `@media (max-width: 640px)`). Sem gestos, sem
menu escondido — os mesmos controles (filtros, ações) continuam visíveis e utilizáveis.

## 18. Limitações

- Sem UI para gerenciar admins (criar/remover) — só via SQL Editor.
- `changed_by`/`created_by` não são resolvidos para um nome/e-mail de exibição (mostrado só como
  ID técnico no histórico bruto) — aceitável com um admin só; um join com `admin_users`/exibição de
  nome passa a valer a pena quando existir mais de um.
- Sem ações em lote, sem exclusão de lead (arquivamento é o caminho futuro —
  `archived_at` já existe na tabela, preparado, mas nenhuma UI o usa ainda).
- Filtro de serviço depende de uma consulta de containment em JSONB (`project->services`) — correto
  para o volume de dados esperado agora; se a base crescer muito, um índice GIN dedicado pode ser
  necessário (não criado nesta fase, sem necessidade concreta ainda).
- Sem sincronização em tempo real — a lista só atualiza ao recarregar a página.
