# PRODUCTION CHECKLIST — Deploy da Agência Upgrade

> Checklist operacional curto (briefing Etapa 33, Seção 118). Ver `docs/DEPLOYMENT.md` para o
> detalhamento de cada item. Marcar conforme for executado — nada aqui foi marcado automaticamente,
> já que os itens de conta/DNS exigem acesso que esta sessão não teve.

## Antes do push

- [x] `git status` limpo, histórico reconstruído em commits por etapa (Etapa 33)
- [x] `.gitignore` cobre `.env*`, `node_modules`, artefatos de build/teste, `.vercel`
- [x] Nenhum `.env*` real jamais commitado (`git log --all -- ".env*"` vazio)
- [x] `package-lock.json` versionado (npm, único lockfile)
- [x] `engines.node` fixado em `package.json` (`>=20.9.0`, mínimo do Next 16)
- [ ] Verificar Production Branch = `master` no dashboard da Vercel (Settings → Git)
- [ ] Confirmar comportamento de auto-deploy em push (ligado/desligado) antes do primeiro push real

## Build local (rodar antes de qualquer push)

- [x] `npm run lint` — 0 erros, 0 avisos
- [x] `npm run typecheck` — 0 erros
- [x] `npm run test` — 622/622
- [x] `npx playwright test --project=chromium` — 58/60 (2 flakes ambientais já documentados)
- [x] `npm run build` — sucesso

## Environments/env vars

- [ ] Confirmar qual projeto Supabase é produção (não presumir — `docs/DEPLOYMENT.md`, Seção 6)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurada em Production na Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurada em Production na Vercel
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada em Production na Vercel (nunca com prefixo `NEXT_PUBLIC_`)
- [ ] `NEXT_PUBLIC_SITE_URL` configurada (URL real da Vercel por enquanto, até existir domínio próprio)
- [ ] Confirmado que `E2E_TEST_MODE` **NÃO** está em nenhum ambiente da Vercel
- [ ] `.env.example` conferido — já completo e sem valores reais

## Supabase / banco

- [ ] Confirmar quais das 5 migrations (`supabase/migrations/`) já foram aplicadas no projeto de produção
- [ ] Aplicar as que faltarem, na ordem, via SQL Editor
- [ ] Backup feito antes de aplicar migration em banco com dados reais (se aplicável)
- [ ] RLS validada no próprio Supabase (Table Editor → policies), não presumida
- [ ] Primeiro admin criado (`docs/DEPLOYMENT.md`, Seção 8) e login testado

## Domínio (pendente — sem domínio próprio ainda)

- [ ] Domínio comprado
- [ ] Domínio adicionado em Vercel → Settings → Domains
- [ ] Registros DNS criados exatamente como a Vercel indicar (sem remover MX/SPF/DKIM/DMARC existentes)
- [ ] SSL válido confirmado no domínio novo
- [ ] `www`/apex redirecionando um para o outro (permanente)
- [ ] `NEXT_PUBLIC_SITE_URL` atualizada + redeploy

## SEO

- [x] `robots.txt` bloqueia só `/admin`
- [x] `sitemap.xml` só com as 3 URLs públicas reais
- [x] `/admin`, `/admin/login`, `/builder` com `noindex`
- [x] `/design-system`, `/builder/experiencia` retornam 404 em produção (gated por `NODE_ENV`)
- [ ] Confirmar `X-Robots-Tag: noindex` automático em Preview (verificar no primeiro Preview real)

## Segurança

- [x] CSP/headers de segurança já cobrem Supabase, GA4, Meta Pixel, fontes (self-hosted), WebGL (sem asset externo)
- [x] HSTS/`upgrade-insecure-requests` só fora de desenvolvimento (bug de WebKit corrigido na Etapa 31)
- [ ] Confirmar headers de fato presentes na resposta real de produção (`curl -I`)
- [ ] Rate limit confirmado em produção sem realizar abuso pesado (limitação de múltiplas instâncias já documentada e aceita)

## Smoke test de produção (depois do deploy)

- [ ] Home
- [ ] Builder completo (e apagar o lead de teste depois)
- [ ] Retry de idempotência
- [ ] Admin (login/lista/detalhe/status/nota/logout)
- [ ] Consentimento/LGPD
- [ ] Mobile real

## Rollback

- [x] Processo documentado (`docs/DEPLOYMENT.md`, Seção 11 — "Promote to Production" de um deployment anterior)

## Pendências

- [ ] Executar smoke test de produção (depende do primeiro deploy real)
- [ ] Lighthouse/Web Vitals no domínio real
- [ ] Ver `docs/IMPLEMENTATION-STAGE-33.md`, Seção "Pendências da Etapa 34" para a lista completa
