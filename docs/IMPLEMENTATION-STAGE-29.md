# IMPLEMENTATION STAGE 29 — Segurança

> Ver `docs/SECURITY.md` (modelo de ameaças completo, racional por camada) e
> `docs/SECURITY-CHECKLIST.md` (checklist rápida) para os documentos principais desta fase. Este
> documento é o resumo técnico: o que a auditoria encontrou, o que foi corrigido, decisões, testes,
> riscos restantes e pendências.

## 1. Ponto de partida

A auditoria inicial (mapeamento de rotas públicas/privadas, Server Actions, Route Handlers,
clientes Supabase, uso de service role, formulários, variáveis de ambiente e migrations) encontrou
uma arquitetura já bastante sólida das fases anteriores: `requireAdminSession()` em 3 camadas
(proxy otimista + checagem real + RLS/GRANT no banco), validação Zod dupla no lead, Lead Score
sempre recalculado no servidor, idempotência via constraint UNIQUE, nenhum Route Handler/webhook/
upload no projeto. O trabalho real desta fase não foi "refazer arquitetura" (explicitamente vetado
pelo briefing) — foi fechar as lacunas reais que a auditoria encontrou, todas em superfícies
públicas sem nenhuma fricção contra abuso automatizado, e em cabeçalhos HTTP que nunca haviam sido
configurados.

## 2. Vulnerabilidades/lacunas encontradas

1. **Nenhum rate limit em superfície pública nenhuma** — `submitLead`, `signInAdmin` e
   `recordEvent` aceitavam chamadas ilimitadas. Nenhuma das três Server Actions tinha qualquer
   fricção contra um script simples enviando centenas de requisições.
2. **Nenhum honeypot no formulário de lead** — nenhuma defesa contra bots simples que preenchem
   formulários automaticamente.
3. **`leadPayloadSchema.answers` sem limite de tamanho** — um `z.record()` sem `.max()`/limite de
   chaves aceitava um payload artificialmente grande (muitas perguntas, valores longos, arrays
   longos) mesmo sabendo que a UI real do Builder só produz respostas de múltipla escolha, curtas.
4. **Termo de busca administrativa sem limite de tamanho** — uma query string longa em `?q=`
   virava uma cláusula `.or()` igualmente longa antes de chegar ao Postgres.
5. **Nenhum cabeçalho de segurança configurado** — `next.config.ts` estava vazio; nenhuma CSP,
   X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy ou
   Strict-Transport-Security em produção.
6. **`X-Powered-By: Next.js` exposto** — `poweredByHeader` nunca desativado.
7. **`npm audit`**: 5 vulnerabilidades (3 moderadas, 1 alta, 1 crítica), todas em devDependencies (cadeia do Vitest) — avaliadas
   como não urgentes (Seção 6).

Nenhuma vulnerabilidade de RLS, autorização, mass assignment, XSS, SQL injection, CORS, CSRF ou
exposição de secret foi encontrada — essas camadas já estavam corretas desde fases anteriores e
foram só auditadas/confirmadas, não modificadas (ver `docs/SECURITY.md`, Seções 4/5/9/10 para o
detalhamento de cada auditoria).

## 3. Correções aplicadas

- **`lib/security/rateLimit.ts`** (novo) — limitador em memória, janela fixa, por chave. Aplicado
  em `submitLead` (5/10min por IP), `signInAdmin` (5/5min por IP+e-mail) e `recordEvent` (60/5min
  por sessão).
- **`lib/security/getClientIp.ts`** (novo) — lê `x-forwarded-for`/`x-real-ip` via `headers()`.
- **`features/lead/components/LeadForm.tsx`** — honeypot invisível (`company_website`), lido só
  dentro do handler de submit real (não dentro de `onValid`, por causa da regra ESLint
  `react-hooks/refs` — ver Seção 5).
- **`features/lead/logic/leadPayloadSchema.ts`** — limites de tamanho em `services` (máx. 10) e
  `answers` (máx. 50 chaves/serviço, 100 caracteres por chave, 200 por valor, 20 itens por array).
- **`lib/repositories/leads.ts`** — `sanitizeSearchTerm` corta em 100 caracteres antes de remover
  `,`/`()`.
- **`next.config.ts`** — `headers()` com CSP + X-Frame-Options + X-Content-Type-Options +
  Referrer-Policy + Permissions-Policy + Strict-Transport-Security; `poweredByHeader: false`.

## 4. Decisões

Ver `docs/DECISIONS.md`, entradas `[SEGURANÇA]`, para o racional completo de cada uma:
rate limit em memória (sem infraestrutura nova), honeypot com mensagem genérica (nunca revela
detecção), CSP sem nonce (compatível com renderização estática), limites de tamanho no lead/busca,
e a decisão de não fazer upgrade forçado do Vitest por causa do `npm audit`.

## 5. Problemas encontrados durante a implementação

- **ESLint `react-hooks/refs`**: a primeira versão lia `honeypotRef.current?.value` dentro de
  `onValid`, uma função comum passada como argumento para `handleSubmit(onValid)` do React Hook
  Form. O linter rejeitou (`"Passing a ref to a function may read its value during render"`)
  porque não consegue provar que `onValid` só roda depois do render — só é seguro ler um `ref`
  dentro de um handler de evento reconhecido diretamente (ex.: `onSubmit={(e) => ...}`). Corrigido
  movendo a leitura do `ref` para dentro de um `onSubmit` inline, que chama
  `handleSubmit((contact) => onValid(contact, honeypotValue))(event)` — o `ref` é lido no handler
  real, `onValid` passa a receber o valor como parâmetro comum.
- **Testes de Server Action com `getClientIp`**: `headers()` do Next.js lança
  `"headers was called outside a request scope"` fora de uma requisição real — todo teste de
  `submitLead`/`signInAdmin` precisou mockar `@/lib/security/getClientIp` (mesmo padrão já usado
  no projeto para mockar `createSupabaseServerSessionClient`, etc.), e resetar o rate limiter
  (`resetRateLimitForTests()`) em `beforeEach`/`afterEach`, já que o `Map` é module-level e
  sobrevive entre `it()`s do mesmo arquivo.
- **Tipos genéricos demais em `leadPayloadSchema.test.ts`**: `validPayload()` inferia `answers`
  como `{ site_tipo: string }` (um tipo literal fechado), o que quebrava ao reatribuir chaves
  diferentes nos novos testes de limite. Corrigido com um tipo explícito
  (`Record<string, string | string[]>`) só para o helper de teste.

## 6. `npm audit`

```
5 vulnerabilities (3 moderate, 1 high, 1 critical): @vitest/mocker, esbuild, vite, vite-node,
vitest — todas em devDependencies, nenhuma no bundle de produção. A entrada crítica exige o
servidor de UI do Vitest rodando (nunca usado neste projeto). Fix disponível exige upgrade de
major do Vitest (2 → 5).
```

> Correção (Etapa 30): a contagem original aqui era "3 avisos" — a leitura do `npm audit` nesta
> fase usou `| head -100` e cortou a saída antes das entradas `vite-node`/`vitest`. Recontado por
> completo na auditoria de dependências da Etapa 30 (`docs/PERFORMANCE.md`); nenhuma vulnerabilidade
> NOVA — é a mesma cadeia do Vitest, só com a contagem certa agora.

Decisão: não fazer upgrade forçado nesta fase (ver `docs/DECISIONS.md`) — registrado como pendência
de manutenção dedicada (Etapa 31), não como vulnerabilidade de produção.

## 7. Testes

27 testes novos/reescritos nesta fase:

- `lib/security/rateLimit.test.ts` (5 testes) — janela, reset, chaves independentes, expiração.
- `features/lead/actions/submitLead.test.ts` (+3 testes) — honeypot rejeita, honeypot vazio não
  afeta, 6ª tentativa em 10min é bloqueada.
- `features/admin/actions/signIn.test.ts` (+2 testes) — 6ª tentativa bloqueada antes do Supabase,
  limite é por chave (outro e-mail não é afetado).
- `features/analytics/actions/recordEvent.test.ts` (+2 testes) — 61º evento descartado, limite por
  sessão (não global).
- `features/lead/logic/leadPayloadSchema.test.ts` (+5 testes) — excesso de serviços/respostas,
  valor/array longos demais rejeitados, caso normal aceito.
- `lib/repositories/leads.test.ts` (+2 testes) — termo de busca truncado, busca normal não afetada.
- `features/lead/components/LeadForm.test.tsx` (+2 testes) — honeypot inacessível
  (`tabIndex="-1"`, dentro de `aria-hidden`), vazio por padrão.
- `next.config.test.ts` (6 testes, novo arquivo) — headers presentes, CSP sem diretiva aberta,
  X-Frame-Options/X-Content-Type-Options corretos, Permissions-Policy bloqueando APIs não usadas,
  `poweredByHeader: false`.

Cobertura dos "testes obrigatórios" do briefing (Seção 104) já existente de fases anteriores
(auditada, não reescrita): não-admin não acessa `/admin`/Server Actions privadas
(`requireAdminSession` mockado retornando `null`/redirect em `updateLeadStatus.test.ts`/
`addLeadNote.test.ts`), `service_id` inválido rejeitado (`leadPayloadSchema.test.ts`), score do
cliente ignorado (`submitLead.test.ts`, teste já existente da Fase 15), `idempotency_key` evita
duplicação (`leads.test.ts`, violação `23505` tratada como sucesso). "Secrets não aparecem no
client" é garantido estruturalmente por `import "server-only"` em `lib/supabase/server.ts` (o
`next build` falha se um Client Component importar esse módulo) — não por um teste de runtime.

**Verificação manual de produção**: `next build` + `next start` + `curl -D -` confirmando os 6
cabeçalhos de segurança presentes numa resposta real; lista de origens da CSP construída por
auditoria de código (todo script/conexão de terceiro do projeto), não por tentativa e erro.

## 8. Revisão técnica final

- **Lint**: 0 erros, 0 avisos.
- **Typecheck**: 0 erros.
- **Testes**: **620/620 passando** (eram 593 ao final da Etapa 28; 27 novos/reescritos nesta
  fase). Uma notícia de "Errors: 1" não relacionada (artefato de teardown do GSAP ScrollTrigger em
  `HeroSection.test.tsx`, pré-existente, arquivo não tocado nesta fase — mesma causa já documentada
  na Etapa 28).
- **Build**: sucesso; tabela de rotas inalterada (15 rotas, mesma distribução estático/dinâmico).
- **`npm audit`**: 5 vulnerabilidades (contagem corrigida na Etapa 30 — a auditoria original leu uma saída truncada), todas dev-only, avaliadas e não corrigidas por upgrade forçado (Seção
  6).

## 9. Riscos restantes (aceitos conscientemente para este estágio)

- Rate limit em memória não é exato sob múltiplas instâncias serverless (Seção 6 de
  `docs/SECURITY.md`) — fricção real, não uma garantia matemática.
- Nenhum MFA configurado para admins — recomendação forte, não bloqueante.
- Nenhum backup/restore do Supabase confirmado/documentado (fora deste repositório).
- Vulnerabilidades dev-only do `npm audit` não corrigidas (Seção 6).

## 10. Pendências para a Etapa 30

- MFA (TOTP) para contas `admin_users`, configurado no painel do Supabase Auth.
- Confirmar e documentar o plano de backup do Supabase (frequência, retenção, região) e testar uma
  restauração real ao menos uma vez.
- Upgrade do Vitest (major, 2 → 5) numa janela de manutenção dedicada, com toda a suíte revalidada.
- Se algum abuso real for observado: considerar um contador de rate limit persistente
  (Supabase/Upstash) antes de qualquer coisa mais pesada (CAPTCHA).
- Função administrativa de exclusão/anonimização e exportação de lead (pendência já registrada na
  Etapa 28/LGPD, não duplicada aqui — quando implementada, precisa seguir Seções 92/93 deste
  briefing: autenticação forte, confirmação, validação).
