# IMPLEMENTATION-STAGE-33 — Deploy na Vercel

> Ver `docs/DEPLOYMENT.md` (guia/runbook completo) e `docs/PRODUCTION-CHECKLIST.md` (checklist
> operacional curto) para os documentos complementares.

## 1. Contexto e restrição real desta etapa

Esta sessão não tinha login na Vercel, token/CLI da Vercel, acesso ao registrador de DNS nem ao
dashboard do Supabase — só o repositório local e os valores já presentes em `.env.local`. Antes de
fazer qualquer suposição sobre o que fazer com isso, o usuário confirmou três pontos que moldaram
toda a etapa: (1) já existe um projeto Vercel conectado a este repositório — nenhum novo foi criado;
(2) o trabalho deveria ser dividido em "eu preparo tudo no código/repo e documento um runbook
exato" (em vez de tentar guiar comando a comando uma sessão interativa de login); (3) ainda não
existe domínio próprio — as seções de DNS ficam documentadas como pendência, não executadas.

## 2. Achado crítico: histórico do Git

Antes de auditar qualquer configuração de ambiente, `git log`/`git status` revelaram que o
repositório tinha só 2 commits reais e **141 caminhos alterados/não rastreados** — a essência de
todo o trabalho das Etapas 11 a 32. Como o projeto Vercel constrói a partir do GitHub, isso
significava que nada do site real jamais tinha sido deployável de fato, apesar de todas as 32
etapas anteriores já estarem tecnicamente prontas no disco.

Confirmado com o usuário, reconstruído em **24 commits**:

- Um por etapa numerada (11 a 32), cada um citando `docs/IMPLEMENTATION-STAGE-NN.md` correspondente.
- Um para o protótipo experimental `features/builder-experience/` (nunca ligado a uma etapa
  numerada específica nos documentos existentes).
- Um para ajustes de infraestrutura de repositório (`.gitignore`, `.env.example`,
  `eslint.config.mjs`) que evoluíram ao longo de várias etapas sem pertencer claramente a uma só.

**Método**: um script auxiliar (não commitado, ficou só no scratchpad da sessão) leu cada
`docs/IMPLEMENTATION-STAGE-NN.md`, extraiu os caminhos de arquivo citados entre crases, e atribuiu
cada arquivo realmente alterado à primeira etapa que o menciona — complementado por propagação
para arquivos "companheiros" (mesmo nome-base, ex. `X.tsx`/`X.module.css`/`X.test.tsx` seguem a
etapa de `X.tsx`) e por um pequeno conjunto de decisões manuais para os poucos arquivos que nenhuma
das duas regras alcançou (majoritariamente primitivas do Design System introduzidas na Etapa 18 e
componentes do Admin/CRM introduzidos na Etapa 16, mas só citados por nome, não por caminho
completo, no texto original). As 432 alterações foram todas atribuídas — nenhuma ficou de fora.

**Limitação honesta**: cada commit é uma fotografia do estado FINAL do arquivo, não uma reprodução
real de como ele existia no momento daquela etapa (essas versões intermediárias nunca foram
salvas). Arquivos cumulativos que muitas etapas tocaram ao longo do tempo (`docs/DECISIONS.md`,
`package.json`/`package-lock.json`) acabaram inteiros em um único commit, sem ficar fatiados entre
etapas — não havia como fazer melhor a partir de um único snapshot final. `git diff HEAD` depois de
todos os commits confirmou zero diferença em relação ao estado antes de começar — nenhum conteúdo
foi perdido ou alterado neste processo, só reorganizado em commits.

**Push pendente**: o usuário pediu para verificar a configuração de auto-deploy da Vercel antes de
enviar (`git push origin master`) — ver `docs/DEPLOYMENT.md`, Seção 3, para os passos exatos de
verificação e o comando pronto para quando for confirmado.

## 3. Auditoria de ambiente/env vars

Levantamento completo de todo `process.env.*` lido pelo código (`grep -rn "process\.env\."`) —
6 variáveis de aplicação (fora `NODE_ENV`/`CI`, gerenciadas pela plataforma):
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GA4_MEASUREMENT_ID`, `NEXT_PUBLIC_META_PIXEL_ID` — classificadas
em `docs/DEPLOYMENT.md`, Seção 5. `.env.example` já estava completo e correto (nenhuma alteração
necessária). Confirmado que `SUPABASE_SERVICE_ROLE_KEY` só é lida em `lib/supabase/server.ts`, que
usa `import "server-only"` — o build falharia se algum Client Component tentasse importar esse
módulo, então o vazamento para o navegador não é só uma convenção, é impedido estruturalmente.

**Achado que virou aviso em destaque na documentação**: `E2E_TEST_MODE` nunca deve ser configurada
em Preview/Production — se fosse, toda gravação de lead/login de admin/evento de analytics passaria
a usar o backend fake em memória do Playwright (`lib/testing/e2eStore.ts`) silenciosamente. Nada no
código previne isso automaticamente (é, de propósito, só uma variável de ambiente lida por
`isE2ETestMode()`) — a proteção real é nunca configurá-la fora do `webServer` do Playwright,
documentado com destaque em `docs/DEPLOYMENT.md`, Seção 5.2.

## 4. Auditoria de código — o que já estava correto (nenhuma mudança necessária)

Verificado item a item contra os pontos 27-58 do briefing, sem achar necessidade de correção em
nenhum destes (evidência de cada um em `docs/DEPLOYMENT.md`):

- `lib/seo/siteConfig.ts` já usa `NEXT_PUBLIC_SITE_URL` com fallback visível para
  `localhost:3000` — nunca um domínio `.vercel.app` hardcoded como canonical.
- `app/robots.ts`/`app/sitemap.ts` já excluem `/admin` e não listam `/builder`/`/design-system`/
  `/builder/experiencia` — as duas últimas já retornam 404 real em produção via
  `if (process.env.NODE_ENV === "production") notFound();` (Vercel builda Preview E Production com
  `NODE_ENV=production`, então essa proteção já vale nos dois ambientes sem configuração extra).
- `app/admin/(protected)/layout.tsx`, `app/admin/login/page.tsx`, `app/builder/page.tsx` já têm
  meta `robots: noindex`.
- `next.config.ts` (CSP/headers, Etapa 29) já cobre Supabase (`connect-src`), GA4/Meta Pixel
  (`connect-src`/`script-src`/`img-src`), fontes (`next/font/google` self-hospeda os arquivos —
  `font-src 'self'` já é suficiente, nenhuma requisição real para `fonts.gstatic.com` acontece em
  runtime) e WebGL (geometria 100% procedural, nenhuma textura/`.glb` externa carregada — nada a
  adicionar no CSP).
- HSTS/`upgrade-insecure-requests` já condicionais a `NODE_ENV !== "development"` (bug de WebKit
  corrigido na Etapa 31) — funcionam corretamente em Preview/Production.
- `proxy.ts` já usa a convenção correta do Next.js 16 (`export async function proxy(...)`, arquivo
  `proxy.ts` na raiz — o antigo `middleware.ts` foi renomeado nesta versão do framework, confirmado
  em `node_modules/next/dist/docs/.../file-conventions/proxy.md`, seguindo a instrução do próprio
  `AGENTS.md` deste projeto de nunca assumir convenções de versões anteriores do Next).
- `lib/security/rateLimit.ts` já documenta (desde a Etapa 29) a limitação de contador em memória
  por instância em ambiente serverless — comportamento esperado, não uma regressão desta etapa.
- Único lockfile (`package-lock.json`, npm) — sem risco de a Vercel detectar o gerenciador errado.

## 5. Mudanças realizadas

- **`package.json`**: adicionado `"engines": { "node": ">=20.9.0" }` — não existia nenhum pino de
  versão de Node; o valor usado é o mínimo que o próprio `next@16.3.5` declara precisar
  (`node_modules/next/package.json`).
- **`docs/ADMIN-CRM.md`**: corrigida uma referência cruzada quebrada ("ver
  `docs/IMPLEMENTATION-STAGE-16.md`, Seção 'Como criar o primeiro admin'" — essa seção nunca existiu
  de fato nesse documento) para apontar para `docs/DEPLOYMENT.md`, Seção 8, onde o processo
  realmente foi documentado nesta etapa.
- **24 commits** reconstruindo o histórico (Seção 2).

Nenhuma pergunta, regra de negócio, endpoint, migration ou identidade visual foi alterada.

## 6. Documentação criada

- `docs/DEPLOYMENT.md` — guia completo + runbook (ambientes, env vars, Supabase/migrations,
  primeiro admin, domínio/DNS futuro, rollback, rotação de secrets, smoke test).
- `docs/PRODUCTION-CHECKLIST.md` — checklist curto, com o que já está pronto marcado e o que
  depende de acesso/ação do usuário deixado em aberto.
- Este documento.

## 7. Regressão final

```
lint:      0 erros, 0 avisos
typecheck: 0 erros
tests:     622/622 (Vitest)
E2E:       58/60 Chromium (2 flakes ambientais já documentados desde a Etapa 31, mesma baseline exata)
build:     sucesso, 15 rotas inalteradas, "ƒ Proxy (Middleware)" reconhecido corretamente
```

## 8. O que NÃO foi executado nesta etapa (fora do alcance sem acesso)

- Push para o GitHub (`git push origin master`) — pendente da verificação do usuário sobre
  auto-deploy (Seção 2).
- Qualquer configuração dentro do dashboard da Vercel (env vars, domínio, Node version, proteção de
  Preview).
- Confirmação de qual projeto Supabase é produção, aplicação de migrations nele, criação do
  primeiro admin real.
- Compra/conexão de domínio, registros DNS, verificação de SSL em domínio próprio.
- Smoke test de produção, Lighthouse/Web Vitals no domínio real, inspeção de logs da Vercel —
  nenhum deploy real existe ainda para testar.

## 9. Pendências para a Etapa 34

- Executar o push depois de confirmado o comportamento de auto-deploy (Seção 2).
- Completar toda a seção "pendente"/"[ ]" de `docs/PRODUCTION-CHECKLIST.md` no dashboard real.
- Rodar o smoke test de produção (`docs/DEPLOYMENT.md`, Seção 17) assim que existir uma URL real.
- Confirmar manualmente o `X-Robots-Tag: noindex` em um Preview real (não pôde ser verificado sem
  um deployment de Preview existente).
- Quando o domínio próprio existir: seguir `docs/DEPLOYMENT.md`, Seção 9, e atualizar
  `NEXT_PUBLIC_SITE_URL` + redeploy.
- Reavaliar a decisão de Preview compartilhar o banco de produção (`docs/DEPLOYMENT.md`, Seção 16)
  se o volume de testes via Preview crescer.
- Pendências já carregadas de etapas anteriores (MFA, backup formal do Supabase, upgrade do Vitest,
  exclusão/exportação de lead, roteiro de teste com usuários reais) continuam de pé, sem relação
  direta com esta etapa.
