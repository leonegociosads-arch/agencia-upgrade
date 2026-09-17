# IMPLEMENTATION STAGE 13 — Infraestrutura Supabase

> Fase 13 do roadmap. Prepara toda a infraestrutura de persistência para o lead capturado nas Fases
> 11/12 (Resumo do Projeto + Captura do Lead): clientes Supabase separados por navegador/servidor,
> camada de repositório, Server Action de envio, segunda camada de validação, idempotência, e a
> migração SQL da tabela `upgrade_leads` com RLS. Não implementa painel administrativo, Lead Score,
> analytics, WhatsApp/e-mail reais nem CRM — reservados às fases seguintes.

---

## 1. Análise inicial do projeto

Antes de criar qualquer coisa, foi confirmado que:

- Supabase **não estava instalado** (nenhuma dependência, nenhum cliente, nenhuma variável de
  ambiente `.env*` versionada).
- **Não existiam** migrations, Route Handlers ou Server Actions.
- `docs/DECISIONS.md` (Fases 1 e 6) e `docs/FOLDER-STRUCTURE.md`/`docs/TECHNICAL-ARCHITECTURE.md`
  já tinham a arquitetura de destino **pré-aprovada e detalhada**: `lib/supabase/{client,server}.ts`,
  `lib/repositories/*` como única porta de entrada para o banco, e **Server Actions** (não Route
  Handlers) como mecanismo de envio do lead — "Route Handlers ficam reservados para casos que
  exigem um endpoint HTTP real (webhooks, integrações externas), nenhum previsto ainda".
- `docs/DATA-MODEL-CONCEPT.md` já descrevia a entidade `Lead` conceitualmente, sem nome de tabela
  definitivo — `upgrade_leads` (sugerido no briefing desta fase) não conflita com nada existente.
- `features/lead/logic/submitLeadPayload.ts` (Fase 12) já documentava explicitamente ser um
  placeholder "removível quando a Etapa 13 acrescentar uma chamada de rede real".

Toda a implementação seguiu essa arquitetura já decidida — nenhuma estrutura paralela foi criada.

## 2. Dependências instaladas

| Pacote | Tipo | Motivo |
|---|---|---|
| `@supabase/supabase-js` | dependency | Cliente oficial do Supabase. |
| `server-only` | dependency | Trava de build contra importar código server-only num Client Component. |

`@supabase/ssr` (sincronização de sessão via cookies) **não** foi instalada — o projeto ainda não
usa Supabase Auth; seria antecipar uma necessidade inexistente.

## 3. Variáveis de ambiente

`.env.example` criado (versionado; `.gitignore` ajustado com `!.env.example` para não ser
ignorado pela regra genérica `.env*`):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Nenhum valor real incluído. `NEXT_PUBLIC_SUPABASE_URL` é reaproveitada tanto no cliente do
navegador quanto no cliente do servidor (a URL do projeto não é secreta); apenas a service role key
fica fora do prefixo `NEXT_PUBLIC_`.

## 4. Clientes Supabase (`lib/supabase/`)

- `client.ts` — `getSupabaseBrowserClient()`, usa a chave anônima. Nenhum código do projeto ainda a
  consome (nada lê o Supabase diretamente do navegador); existe porque a Fase 6 já reservou essa
  separação para uso futuro.
- `server.ts` — `getSupabaseServerClient()`, usa a service role key. Marcado com `import
  "server-only"` para o build falhar caso seja importado por engano num Client Component.

Ambos criam o cliente **sob demanda** (dentro da função, nunca no topo do módulo) — a ausência das
variáveis de ambiente não impede `next build`/`next dev`; o erro só aparece quando uma operação real
é tentada.

## 5. Camada de repositório (`lib/repositories/leads.ts`)

`createLead(payload: LeadPayload)` — único ponto de acesso à tabela `upgrade_leads`. Mapeia os
campos de `LeadPayload` para as colunas da tabela, grava `project` como JSONB, e trata violação de
unicidade da `idempotency_key` (Postgres `23505`) como sucesso (o lead já existe). Qualquer outro
erro do Postgres, ou a ausência de credenciais (client lança), retorna a mesma mensagem genérica de
falha já usada na Fase 12.

## 6. Segunda camada de validação (`features/lead/logic/leadPayloadSchema.ts`)

Server Actions são tratadas pelo próprio Next.js como "endpoint POST alcançável por qualquer um, não
só pela UI que a chama" — por isso o payload é revalidado no servidor antes de gravar, mesmo já
tendo passado por `leadFormSchema` no navegador. Não reaproveita `leadFormSchema` (que valida a
ENTRADA bruta e normaliza) porque, no servidor, o formato que chega já é a SAÍDA normalizada — um
schema que valida forma/sanidade dessa saída (limites de tamanho, formato do WhatsApp já
normalizado, e-mail, estrutura do Project Snapshot, `meta`) é uma responsabilidade diferente o
bastante para não ser "praticamente idêntica" à primeira.

## 7. Server Action (`features/lead/actions/submitLead.ts`)

```ts
"use server";
export async function submitLead(payload: LeadPayload): Promise<SubmitLeadResult> {
  const parsed = leadPayloadSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, message: GENERIC_FAILURE_MESSAGE };
  return createLead(parsed.data);
}
```

Chamada diretamente por `LeadForm.tsx` (Client Component) — padrão suportado nativamente pelo Next
16 sem configuração adicional (confirmado em
`node_modules/next/dist/docs/01-app/02-guides/server-actions.md`).

## 8. Idempotência

- `features/lead/logic/generateIdempotencyKey.ts` — `crypto.randomUUID()` com um fallback simples
  se indisponível.
- Gerada **uma vez por `LeadProvider`** (não a cada render nem a cada submit) e exposta via
  `useLeadDraft().idempotencyKey` — sobrevive a "Tentar novamente" depois de uma falha, então um
  reenvio genuíno nunca cria dois leads.
- `LeadPayload.meta.idempotencyKey` (novo campo) viaja até `createLead`, que a grava na coluna
  `idempotency_key` (UNIQUE no banco).

## 9. Migração SQL (`supabase/migrations/20260914000000_create_upgrade_leads.sql`)

Cria `upgrade_leads` com `id`, `created_at`, os 5 campos de contato, `project jsonb`,
`idempotency_key` (UNIQUE), checks de não-vazio nos campos de texto obrigatórios, e um índice em
`created_at` (para a futura listagem administrativa). Habilita RLS **sem nenhuma policy** — com RLS
ligada e zero policies, toda operação via chave anônima/autenticada já é negada por padrão — mais um
`revoke all ... from anon, authenticated` explícito como defesa em profundidade. Apenas a service
role key (exclusiva do servidor) grava leads. Ver Seção 13 (SQL para colar) para o texto completo e
o passo a passo.

## 10. Mudanças no fluxo existente

- `features/lead/logic/submitLeadPayload.ts` (o simulador da Fase 12) foi **removido** — a própria
  Fase 12 já o documentava como "removível quando a Etapa 13 acrescentar uma chamada de rede real".
- A conveniência de QA `?simulateLeadFailure=1` (URL) também foi **removida** pelo mesmo motivo: com
  a chamada real, qualquer ambiente sem credenciais do Supabase já produz uma falha genuína e
  recuperável — não precisa mais de um atalho de URL para ser testada manualmente.
- `LeadForm.tsx` agora chama `submitLead(payload)` (a Server Action) em vez do simulador, passando
  `idempotencyKey` do `LeadContext` para `buildLeadPayload`.
- `buildLeadPayload` ganhou um terceiro parâmetro (`idempotencyKey`) — assinatura, não
  comportamento: continua uma função pura e trivial.

## 11. Testes

40 novos/alterados, cobrindo:

- `generateIdempotencyKey.test.ts` (2) — não vazio, duas chamadas geram valores diferentes.
- `leadPayloadSchema.test.ts` (8) — aceita payload válido, aceita sem campo opcional, rejeita
  whatsapp fora do formato normalizado, e-mail inválido, projeto sem serviços, `serviceId`
  desconhecido, `createdAt` inválido, `idempotencyKey` vazio.
- `lib/repositories/leads.test.ts` (5) — mapeamento de colunas, `website_or_instagram` nulo,
  violação de unicidade tratada como sucesso, outro erro do Postgres retorna falha, Supabase não
  configurado não quebra.
- `features/lead/actions/submitLead.test.ts` (4) — payload válido repassado, payload malformado
  rejeitado antes de `createLead`, whatsapp não normalizado rejeitado, falha de `createLead`
  propagada.
- `buildLeadPayload.test.ts` — todas as chamadas atualizadas com o novo parâmetro; teste novo
  confirmando que `idempotencyKey` é exatamente o valor recebido.
- `LeadForm.test.tsx` — os dois testes que dependiam de `?simulateLeadFailure=1` agora mockam
  `submitLead` diretamente (`vi.mock`); teste novo confirmando que `submitLead` é chamado com um
  payload contendo `idempotencyKey`.

**`vitest.config.ts` precisou de um alias** para `server-only`: fora do bundler do Next (que resolve
esse pacote como um no-op via a condição de exports `"react-server"`), ele lança um erro
incondicional em Node puro. O alias aponta para a própria variante vazia que o pacote já publica
(`node_modules/server-only/empty.js`) — reproduzido isoladamente antes da mudança; a proteção real
continua no build do Next.

## 12. Resultado da verificação

- `npm run lint` — 0 erros.
- `npm run typecheck` — 0 erros.
- `npm run test` — **187/187** (23 arquivos).
- `npm run build` — sucesso, **sem nenhuma variável de ambiente do Supabase configurada** (5 rotas
  estáticas geradas), confirmando o requisito "ausência momentânea das credenciais não destrói o
  projeto".
- Verificação manual (Playwright, servidor local sem credenciais): submeter um lead completo produz
  a mensagem de falha já existente ("Não conseguimos enviar agora. Seus dados continuam
  preenchidos."), sem nenhuma resposta HTTP 5xx nem crash do processo; o erro real
  ("Supabase não configurado no servidor: defina NEXT_PUBLIC_SUPABASE_URL e
  SUPABASE_SERVICE_ROLE_KEY.") aparece no log do servidor, nunca escondido; os dados do formulário
  continuam preenchidos depois de "Tentar novamente".

## 13. SQL para colar no Supabase (referência)

Ver arquivo completo em `supabase/migrations/20260914000000_create_upgrade_leads.sql` — o mesmo
texto que aparece na resposta final desta fase.

## 14. Pendências deixadas propositalmente para depois

- Testar o fluxo de SUCESSO de ponta a ponta (o usuário precisa antes criar o projeto no Supabase,
  colar o SQL e preencher `.env.local`).
- Sincronização de sessão (`session_id`) com o Supabase — Fase 13/14, mencionada em
  `docs/TECHNICAL-ARCHITECTURE.md`, não incluída aqui.
- Tabelas `Session`/`Project`/`Event` do modelo conceitual — fora de escopo (CRM/Analytics/Lead
  Score pertencem a fases posteriores).
- Painel administrativo para listar leads (`app/admin/leads`) — a query mais óbvia (`order by
  created_at desc`) já tem índice pronto, mas a tela em si não foi construída.
