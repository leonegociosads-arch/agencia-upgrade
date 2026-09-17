# DEPLOYMENT — Vercel

> Etapa 33 do roadmap. Este documento assume que quem o lê tem acesso ao dashboard da Vercel, ao
> repositório GitHub (`leonegociosads-arch/agencia-upgrade`) e ao dashboard do Supabase — nenhum
> desses três foi acessível durante esta sessão (sem login/CLI/token configurado no ambiente em que
> este trabalho foi feito). Por isso, este documento é ao mesmo tempo referência permanente E um
> runbook com passos que só um humano com essas contas pode executar — cada passo assim está
> marcado explicitamente.

## 1. Estado no início desta etapa (achado crítico)

Antes de qualquer configuração de Vercel/domínio fazer sentido, foi descoberto que **o
repositório GitHub tinha apenas 2 commits reais**: `Initial commit from Create Next App` e
`Implementa Etapas 8-10`. Absolutamente todo o trabalho das Etapas 11 a 32 — Resumo do Projeto,
persistência Supabase, Lead Score, Admin/CRM, Analytics, Design System, toda a camada de motion
(GSAP/ScrollTrigger/Lenis/WebGL), SEO, LGPD, Segurança, Performance e as duas fases de testes —
existia **só na árvore de trabalho local**, nunca commitado nem enviado ao GitHub. Como o projeto
Vercel já existe e está conectado a este repositório (confirmado com o usuário nesta etapa), ele só
tinha, até este ponto, o esqueleto quase vazio dos 2 commits antigos para construir — nada do site
real jamais foi de fato deployável.

**Ação tomada nesta etapa**: reconstrução do histórico em 24 commits, um por etapa (Etapas 11 a 32,
mais um para o protótipo experimental `builder-experience` e um para ajustes de infraestrutura de
repositório), decidida e autorizada explicitamente pelo usuário. Como cada commit é uma fotografia
do estado FINAL de cada arquivo (não existiam fotografias intermediárias reais de cada etapa
passada para recuperar), a atribuição de cada arquivo à etapa mais provável foi feita cruzando o
texto de cada `docs/IMPLEMENTATION-STAGE-NN.md` com os arquivos realmente alterados — uma
reconstrução organizacional para fins de histórico/rollback, não uma reprodução exata de como cada
arquivo evoluiu commit a commit ao longo do projeto real. Arquivos cumulativos que várias etapas
tocaram (`docs/DECISIONS.md`, `package.json`/`package-lock.json`) aparecem inteiros em UM commit
só, não fatiados entre etapas — limitação aceita e sem solução melhor possível a partir de um único
estado final.

**Isso ainda NÃO foi enviado ao GitHub** (`git push`) no momento em que este documento foi escrito —
ver Seção 3 para o porquê e os passos exatos antes disso acontecer.

## 2. Auditoria do que já existe (Vercel/GitHub/Supabase)

| Item | Estado confirmado nesta etapa |
| --- | --- |
| Repositório GitHub | `https://github.com/leonegociosads-arch/agencia-upgrade`, branch única `master` |
| Projeto Vercel | Já existe e está conectado a este repositório (confirmado com o usuário — **não foi criado nenhum projeto novo**, evitando duplicidade) |
| Domínio próprio | Ainda não existe (confirmado com o usuário) — produção continua em um subdomínio `*.vercel.app` por enquanto |
| `.vercel/` local | Não existe nesta máquina (projeto nunca foi linkado via `vercel link` aqui) |
| `vercel.json` | Não existe — não foi criado; a detecção automática do preset Next.js da Vercel é suficiente (briefing, Seção 71: "preferir detecção padrão") |
| Supabase | `.env.local` aponta para um projeto real (`NEXT_PUBLIC_SUPABASE_URL`); **qual projeto é produção não foi confirmado nesta sessão** (ver Seção 6 — ação pendente do usuário) |

## 3. Antes do push — o que o usuário precisa verificar primeiro

O usuário pediu para verificar a configuração de auto-deploy da Vercel antes do push (não estava
certo se está ligado). Passos exatos, no dashboard da Vercel:

1. Abrir o projeto → **Settings → Git**.
2. Conferir **Production Branch** — deve ser `master` (a única branch que este repositório tem).
   Se estiver configurado como `main` por padrão da Vercel e nunca ajustado, um push em `master`
   pode não disparar o deploy de produção esperado.
3. Conferir se **"Automatically expose System Environment Variables"**/deploy automático em push
   está ativo para essa branch. Por padrão da Vercel, qualquer push na Production Branch dispara um
   deploy de produção automaticamente — se isso estiver ativo, **o push descrito nesta etapa vai
   publicar o site pela primeira vez de verdade**, no domínio `*.vercel.app` do projeto.
4. Voltar e confirmar comigo (ou simplesmente pedir o próximo passo) depois de checar — o push só
   deve ser feito com esse comportamento entendido, nunca como surpresa.

Depois de confirmado, o push é simplesmente:

```
git push origin master
```

## 4. Ambientes (Local / Preview / Production)

| | Local | Preview | Production |
| --- | --- | --- | --- |
| Como é criado | `npm run dev` | Vercel gera um deploy por push em qualquer branch/PR que não seja a de produção | Push/merge na branch de produção (`master`) |
| URL | `http://localhost:3000` | URL única por deploy (`*.vercel.app`) | Domínio de produção da Vercel (hoje, o `*.vercel.app` do projeto — sem domínio próprio ainda) |
| `NODE_ENV` | `development` | `production` (a Vercel builda Preview e Production da mesma forma — **isso não é um modo "de teste"**) | `production` |
| Supabase | O projeto configurado em `.env.local` (não confirmado como dedicado a testes — ver Seção 6) | Mesma preocupação — ver Seção 8 (estratégia de preview) | O projeto que for confirmado como produção |
| `E2E_TEST_MODE` | Nunca setado (só existe dentro de `playwright.config.ts`, processo isolado) | **Nunca deve ser setado** | **Nunca deve ser setado** — ver aviso na Seção 7 |

Note que `/design-system` e `/builder/experiencia` (ferramentas internas) já retornam 404 de verdade
tanto em Preview quanto em Production, porque os dois ambientes rodam com `NODE_ENV=production` —
não é preciso nenhuma configuração adicional para isso (já implementado desde a Fase 18/23, revisto
e confirmado nesta etapa).

## 5. Environment Variables

### 5.1 Tabela (nome → finalidade → ambiente → classificação)

| Variável | Finalidade | Ambientes | Classificação |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase, usada pelo cliente no navegador e pelo servidor | Preview, Production (Development se testar localmente contra Supabase real) | **PUBLIC** (prefixo `NEXT_PUBLIC_` obrigatório — não é secreta por padrão no Supabase, a segurança real vem do RLS) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima do Supabase (respeita RLS) | idem | **PUBLIC** |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave que ignora RLS — usada só em `lib/supabase/server.ts` (`import "server-only"`, nunca alcançável do navegador) | Preview, Production | **SECRET** — nunca prefixar com `NEXT_PUBLIC_`, nunca colar em código, nunca logar |
| `NEXT_PUBLIC_SITE_URL` | Domínio absoluto usado em `metadataBase`/sitemap/robots/Open Graph/dados estruturados | Preview (opcional), Production | **PUBLIC** — ver Seção 9 sobre o valor a usar enquanto não há domínio próprio |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | Ativa o provider de GA4 (opcional — sem ela, só o provider interno do Supabase funciona) | Production (não recomendado em Preview — ver Seção 10) | **PUBLIC**, opcional |
| `NEXT_PUBLIC_META_PIXEL_ID` | Ativa o provider de Meta Pixel (opcional) | Production (não recomendado em Preview) | **PUBLIC**, opcional |

Nenhuma variável nova foi introduzida nesta etapa — esta é a lista completa e final de tudo que o
código já lê (`grep -rn "process.env\."`, auditado nesta etapa).

### 5.2 O que NUNCA deve ser configurado na Vercel

- `E2E_TEST_MODE` — existe só dentro de `playwright.config.ts` (processo local do Playwright).
  Se essa variável for setada por engano em Preview ou Production, **todas as gravações de lead,
  login de admin e eventos de analytics passam a usar um backend falso em memória** — os dados
  parecem funcionar na tela, mas nada é salvo de verdade no Supabase. Sem efeito colateral em outro
  lugar do código além desse (é um `if` explícito, nunca um mock global) — mas o resultado seria
  silencioso e grave o suficiente para merecer este aviso em destaque.

### 5.3 `.env.example`

Já mantido atualizado desde a Fase SEO/Analytics — conferido nesta etapa e continua completo (todas
as 6 variáveis da tabela acima, com comentário explicando cada uma; nenhum valor real, só nomes).
Nenhuma alteração necessária.

## 6. Supabase de produção — confirmação pendente do usuário

**Não presumido nesta etapa** (briefing, Seção 12: "não assumir"). O projeto Supabase referenciado
em `.env.local` local pode ou não ser o projeto de produção pretendido. Antes de configurar as
variáveis `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`/`SUPABASE_SERVICE_ROLE_KEY` no
ambiente **Production** da Vercel, confirme:

- Esse é o projeto Supabase que a Upgrade quer usar para leads reais de clientes?
- Ele já tem as 5 migrations de `supabase/migrations/` aplicadas (Seção 7 abaixo)?
- Ele tem pelo menos um admin em `admin_users` (Seção 8)?

Se a resposta a qualquer uma for "não" ou "não sei", pare antes de apontar Production para ele.

## 7. Banco de dados — migrations

Cinco migrations versionadas em `supabase/migrations/`, na ordem:

1. `20260914000000_create_upgrade_leads.sql` — tabela `upgrade_leads`, RLS básica.
2. `20260916000000_add_lead_score_to_upgrade_leads.sql` — colunas de Lead Score.
3. `20260917000000_admin_crm.sql` — `status`/`archived_at` em `upgrade_leads`, tabelas
   `admin_users`, `upgrade_lead_status_history`, `upgrade_lead_notes`, função `is_admin()`.
4. `20260918000000_analytics_events.sql` — tabela `analytics_events`.
5. `20260918000001_analytics_events_grant_insert.sql` — grant de insert complementar.

Este projeto não usa a CLI do Supabase (`supabase/config.toml` não existe) — as migrations foram
sempre aplicadas manualmente via **SQL Editor** do dashboard do Supabase, na ordem acima. Antes do
primeiro deploy real de produção:

1. Confirmar (dashboard → Table Editor ou uma query simples) quais dessas 5 já foram aplicadas no
   projeto Supabase que será produção.
2. Aplicar as que faltarem, **uma de cada vez, na ordem acima**, lendo o conteúdo de cada arquivo
   antes de rodar (nenhuma delas tem `DROP`/`DELETE` — todas usam `create table if not exists`/
   `add column if not exists`, seguras para rodar mais de uma vez sem duplicar nada).
3. Se o banco já tiver leads reais de um teste anterior: tirar um backup (dashboard → Database →
   Backups, ou `pg_dump` se tiver acesso direto) antes de aplicar qualquer migration nova — nenhuma
   das 5 é destrutiva, mas a prática vale para qualquer migration futura.

Índices/policies/RLS já fazem parte das próprias migrations (nada a configurar manualmente além
delas). `docs/ADMIN-CRM.md` e `docs/SECURITY.md` documentam o desenho completo de RLS — não
repetido aqui.

## 8. Primeiro admin (processo seguro, sem e-mail hardcoded)

Não existe (nem deveria existir) nenhum e-mail de admin no código. Processo, via dashboard do
Supabase (nunca pelo próprio app — não há tela de cadastro de admin de propósito):

1. **Authentication → Users → Add user** — criar o usuário com o e-mail/senha reais que a pessoa da
   Upgrade vai usar para logar em `/admin/login`.
2. Copiar o `UUID` desse usuário (coluna `id`, visível na mesma tela).
3. **SQL Editor** (roda como `postgres`/`service_role`, ignora RLS — é assim que a migration
   deixou o `admin_users` propositalmente sem permissão de insert para o app):
   ```sql
   insert into public.admin_users (user_id) values ('<uuid-copiado-no-passo-2>');
   ```
4. Testar login em `/admin/login` com esse e-mail/senha.

Qualquer admin adicional segue o mesmo processo. *(Nota: `docs/ADMIN-CRM.md` referenciava uma seção
"Como criar o primeiro admin" em `docs/IMPLEMENTATION-STAGE-16.md` que não existe de fato nesse
documento — referência corrigida para apontar para esta seção.)*

## 9. Domínio, DNS, SSL, canonical

**Não executado nesta etapa** — não existe domínio próprio ainda (confirmado com o usuário). Nada
de DNS foi alterado (briefing, Seção 120: nunca alterar sem certeza/acesso).

Enquanto isso:

- `NEXT_PUBLIC_SITE_URL` **deveria** ser configurado com a URL real do projeto na Vercel (ex.:
  `https://agencia-upgrade.vercel.app`, ajustar para o valor real do projeto) em vez de ficar vazio
  — sem essa variável, `metadataBase`/sitemap/robots/Open Graph caem no fallback de desenvolvimento
  (`http://localhost:3000`), que ficaria visivelmente errado para qualquer rastreador/compartilhamento
  social que acessar o site já publicado. Isso é uma medida **interina**: quando o domínio próprio
  existir, esta variável precisa ser atualizada para ele (Seção 27 do briefing: "não deixar URL
  .vercel.app como canonical de produção" — o `*.vercel.app` serve só até o domínio real existir).
- SSL no `*.vercel.app` já é automático (a Vercel emite certificado para qualquer subdomínio seu).

**Quando o domínio for comprado**, os passos serão (documentados agora para não esquecer, não
executados):

1. Decidir a versão canônica (`agenciaupgrade.com.br` vs. `www.agenciaupgrade.com.br`) — decisão do
   usuário, não técnica.
2. **Vercel → Settings → Domains** → adicionar o domínio.
3. A Vercel mostra os registros DNS exatos a criar (geralmente um `A`/`ALIAS` para o apex e um
   `CNAME` para `www`, apontando para `cname.vercel-dns.com`) — copiar exatamente o que a própria
   Vercel mostrar na hora, nunca adivinhar os valores aqui com antecedência.
4. Criar esses registros no provedor de DNS atual do domínio — **sem remover nenhum registro
   existente** (MX/SPF/DKIM/DMARC de e-mail, se houver, continuam intocados — briefing Seção 24/103,
   ponto crítico).
5. A Vercel redireciona automaticamente a versão não-canônica (`www`↔apex) para a canônica assim
   que ambas estiverem configuradas — conferir no dashboard (Settings → Domains) que o redirect está
   marcado como permanente (308/301), não temporário.
6. Atualizar `NEXT_PUBLIC_SITE_URL` para o domínio novo e redeployar (mudança de env var exige
   redeploy — Seção 13 abaixo).
7. Confirmar certificado SSL válido no domínio novo (a Vercel emite automaticamente via Let's
   Encrypt assim que o DNS propaga — pode levar minutos a poucas horas).

## 10. Analytics em produção vs. desenvolvimento

`NEXT_PUBLIC_GA4_MEASUREMENT_ID`/`NEXT_PUBLIC_META_PIXEL_ID` não estão configuradas em nenhum
ambiente hoje (nenhuma delas existe em `.env.local`) — os dois providers ficam inativos, e só o
provider interno (Supabase, `analytics_events`) funciona, como já documentado desde a Fase 17.
Quando a Upgrade tiver essas contas reais:

- Configurar os IDs reais **só em Production** — evita poluir métricas reais com tráfego de Preview
  (briefing, Seção 47). Se algum dia for útil medir Preview separadamente, usar uma "Data Stream"/
  propriedade GA4 diferente para isso, nunca a mesma de produção.
- `docs/PRIVACY-LGPD.md`/`ConsentBanner` já gate corretamente os dois providers pelo consentimento
  real do visitante — nenhuma mudança de código necessária aqui, só configurar as variáveis quando
  os IDs existirem.

## 11. Rollback

A Vercel mantém histórico completo de deployments (**Deployments** no dashboard do projeto). Para
reverter para uma versão anterior:

1. Abrir a lista de deployments de Production.
2. Encontrar o deployment anterior estável.
3. Menu "..." → **Promote to Production** (ou "Redeploy") — isso torna esse build antigo o
   deployment ativo de produção imediatamente, sem precisar reverter nada no Git.
4. Corrigir o problema no código depois, com calma, e deployar a correção normalmente (briefing,
   Seção 85: "correções devem voltar para Git" — o rollback pela Vercel é só para parar o sangramento
   na hora, nunca um substituto para consertar via commit).

## 12. Mudança de env var exige redeploy

Alterar uma env var no dashboard da Vercel **não** afeta deployments já publicados — só passa a
valer no PRÓXIMO deploy. Depois de mudar qualquer variável (ex.: `NEXT_PUBLIC_SITE_URL` quando o
domínio chegar), é preciso um redeploy manual (botão "Redeploy" no deployment atual, ou um novo
push) para que o valor novo entre em vigor.

## 13. Rotação de secrets

- **`SUPABASE_SERVICE_ROLE_KEY`**: Supabase dashboard → Project Settings → API → "Reset" na service
  role key. Depois de gerar a nova, atualizar imediatamente na Vercel (todos os ambientes que a
  usam) e redeployar — a chave antiga para de funcionar assim que a nova é gerada, então esses dois
  passos devem acontecer em sequência rápida para não gerar um período de indisponibilidade.
- Nenhum outro secret existe hoje neste projeto (sem webhooks configurados, sem chaves de terceiros
  além de Supabase — GA4/Meta Pixel usam apenas IDs públicos, nunca uma chave secreta).

## 14. CI / Deploy Gate

Não existe pipeline de CI (GitHub Actions) neste projeto ainda — a própria Vercel já funciona como
gate mínimo: um `next build` que falha impede o deploy de produção automaticamente. Isso cobre erro
de build/TypeScript, mas **não** roda lint/testes/E2E antes de publicar — hoje isso depende de rodar
esses comandos manualmente antes do push (Seção 15 abaixo), exatamente como foi feito nesta etapa.
Se o volume de mudanças justificar no futuro, um workflow de GitHub Actions rodando
`npm run lint && npm run typecheck && npm run test && npm run build` (e opcionalmente
`npm run test:e2e`) antes de permitir merge é a evolução natural — não criado agora (briefing, Seção
82: "Vercel build + checks podem ser suficientes temporariamente").

## 15. Checklist de verificação local antes de qualquer push futuro

```
npm run lint
npm run typecheck
npm run test
npx playwright test --project=chromium   # suíte funcional completa
npm run build
```

Nenhum push para `master` deveria acontecer com qualquer um desses quebrado (briefing, Seção 83).

## 16. Preview deployments e proteção

- Cada branch/PR novo gera automaticamente uma Preview URL própria — nada a configurar (recurso
  nativo da Vercel).
- Por padrão, deployments de Preview da Vercel recebem o cabeçalho `X-Robots-Tag: noindex`
  automaticamente nas URLs geradas pela própria Vercel (`*-*.vercel.app`) — **não confirmado
  manualmente nesta etapa** (exigiria inspecionar um deployment de Preview real, o que não existe
  ainda neste projeto); verificar isso no primeiro Preview real gerado, inspecionando os headers de
  resposta (`curl -I` na URL de preview) antes de assumir que está correto.
- Como não há dados sensíveis expostos por rota alguma sem autenticação (admin exige sessão real em
  qualquer ambiente, `E2E_TEST_MODE` nunca deve ser setado — Seção 5.2), a **Proteção por senha de
  Preview** da Vercel (Deployment Protection) é uma camada extra opcional, não obrigatória para este
  projeto — decisão do usuário se quiser ativá-la.
- **Estratégia de banco para Preview** (briefing, Seção 76-78): com o volume atual do projeto (V1,
  ainda sem usuários reais), a recomendação é a opção B do briefing — Preview usa o MESMO projeto
  Supabase de Production, sem nenhuma restrição de operação especial. Criar um Supabase de staging
  seria infraestrutura duplicada sem necessidade real ainda (Seção 78 do briefing concorda
  explicitamente com essa leitura para "V1 ainda pequeno"). Risco aceito: um lead de teste enviado
  através de uma Preview URL cria uma linha real em `upgrade_leads` de produção — mitigado só por
  cuidado manual (não enviar o formulário de verdade em uma Preview, ou apagar a linha depois se
  acontecer sem querer). Reavaliar esta decisão se o volume de Previews/testes crescer.

## 17. Smoke test de produção (roteiro para depois do primeiro deploy real)

Não executável nesta sessão (sem URL de produção publicada ainda). Roteiro para quando o deploy
acontecer:

1. **Home**: carrega, sem erro no console; fontes/imagens aparecem; CTA "Monte seu Upgrade" visível
   e funcional; scroll/motion não trava.
2. **Builder**: fluxo completo de um serviço até "Recebemos seu projeto." — depois, **apagar
   manualmente** o lead de teste criado (Supabase → Table Editor → `upgrade_leads`), já que essa
   submissão real vai parar no mesmo banco de produção (Seção 16).
3. **Retry de idempotência**: reenviar o mesmo formulário (mesma aba, antes de sair da tela de
   sucesso não é possível pela UI — testar via reload + reenvio) e confirmar que não duplica.
4. **Admin**: login (com o admin criado na Seção 8), lista, abrir um lead, mudar status, criar nota,
   logout.
5. **SEO**: `/robots.txt`, `/sitemap.xml`, ver o `<head>` da Home (canonical, Open Graph) com a URL
   real do deploy, não `localhost`.
6. **Segurança**: `curl -I` na Home confirmando os headers de `next.config.ts` (CSP,
   `Strict-Transport-Security`, etc.) presentes na resposta real.
7. **LGPD**: banner de consentimento aparece para uma sessão nova; recusar mantém o site funcional.
8. **Mobile**: repetir os passos 1-2 em um celular real, não só emulação (briefing, Seção 60).

## 18. Limitações desta etapa

- Nenhuma ação que exige login em Vercel/GitHub (além do já autenticado `git`)/Supabase/registrador
  de DNS foi executada — tudo isso está descrito como runbook para o usuário nas seções acima.
- O push (Seção 3) está pendente de confirmação do usuário sobre o comportamento de auto-deploy.
- Smoke test de produção (Seção 17) não pôde ser executado — não existe URL de produção publicada
  no momento em que este documento foi escrito.
- Lighthouse/Web Vitals no domínio real (briefing, Seção 59) não pôde ser executado pelo mesmo
  motivo — `docs/PERFORMANCE.md` (Etapa 30) já documenta a medição feita em `localhost`.
