# SECURITY — Modelo de ameaças e postura de segurança

> Etapa 29 do roadmap. Este documento descreve a segurança REAL do projeto, verificada lendo o
> código, as migrations do Supabase e a configuração de build — nunca uma checklist genérica de
> "boas práticas" copiada sem checar se se aplica aqui. Complementa (não substitui):
> `docs/TECHNICAL-ARCHITECTURE.md` (arquitetura geral), `docs/ADMIN-CRM.md` Seção 15 (segurança do
> painel), `docs/PRIVACY-LGPD.md` (privacidade — este documento não contradiz nenhuma decisão de
> lá, ver Seção 91 do briefing desta fase).
>
> Filosofia adotada, nas palavras do próprio briefing: **segurança prática + defesa em camadas +
> mínimo privilégio + validação server-side** — não "adicionar ferramentas gigantes só por
> segurança", não bloquear usuários legítimos, não criar complexidade desproporcional ao tamanho
> real deste projeto (um site institucional + captura de lead + mini-CRM interno, não um sistema
> financeiro ou de saúde).

## 1. Superfície de ataque real (mapeamento)

Rotas/entradas que aceitam alguma forma de entrada não confiável, mapeadas lendo `app/`,
`features/*/actions/`, `middleware`/`proxy.ts` e `supabase/migrations/`:

| Superfície | Tipo | Autenticação exigida |
| --- | --- | --- |
| `/` , `/projetos`, `/builder`, `/builder/experiencia`, `/privacidade` | Páginas públicas (Server Components estáticos) | Nenhuma |
| `submitLead` (Server Action) | Mutação pública | Nenhuma — validada e limitada (Seção 5/6) |
| `recordEvent` (Server Action) | Mutação pública (analytics) | Nenhuma — validada e limitada |
| `signInAdmin` (Server Action) | Autenticação | Credenciais Supabase Auth |
| `/admin`, `/admin/leads/[id]` | Páginas privadas | Sessão + `admin_users` |
| `updateLeadStatus`, `addLeadNote`, `signOutAdmin` (Server Actions) | Mutação privada | Sessão + `admin_users` |
| `proxy.ts` | Camada de borda (Next 16, ex-`middleware.ts`) | — (checagem otimista, ver Seção 3) |

**Não existem** (confirmado por busca no código, não por suposição): Route Handlers (`app/api/`),
webhooks, uploads/Storage do Supabase, login custom fora do Supabase Auth, nenhuma integração de
pagamento. Se qualquer um desses for adicionado no futuro, este documento precisa ser revisado
antes do lançamento (webhooks exigem validação de assinatura — Seção 42/43 do briefing; uploads
exigem validação de tipo/tamanho/nome — Seções 74-78).

## 2. Threat model por superfície

| Superfície | O que pode ser abusado | Impacto | Defesa existente | Defesa adicionada nesta fase |
| --- | --- | --- | --- | --- |
| `submitLead` | Spam/flood de leads falsos; payload gigante; score forjado | Poluição do CRM; custo de banco; decisões comerciais erradas | Validação Zod dupla (cliente+servidor); `idempotency_key` único; score sempre recalculado no servidor | Rate limit por IP (5/10min); honeypot; limites de tamanho em `answers`/serviços |
| `recordEvent` | Flood de eventos falsos; injeção de PII em `properties` | Métricas erradas; PII vazando para uma tabela sem RLS de leitura pública (mas ainda assim indesejado) | Allowlist de evento + schema por evento (rejeita campo extra inteiro) | Rate limit por sessão (60/5min) |
| `signInAdmin` | Força bruta de senha | Acesso total ao CRM (dados de todos os leads) | Supabase Auth gerenciado (hash, gerenciamento de sessão); nunca revela se o e-mail existe | Rate limit por IP+e-mail (5/5min) antes de chamar o Supabase |
| `/admin/**` | Acessar dados de lead sem ser admin | Vazamento de dados pessoais de todos os leads | `proxy.ts` (checagem otimista) + `requireAdminSession()` (checagem real, chamada em toda página/Server Action) + RLS no banco (3 camadas independentes) | Nenhuma nova — já era a arquitetura mais forte do projeto (auditada, não modificada) |
| `updateLeadStatus`/`addLeadNote` | Admin autenticado tentando alterar campo fora do previsto | Corrupção de dados comerciais | `requireAdminSession()` + Zod + GRANT de coluna no Postgres (`grant update (status)`) | Nenhuma nova — já em 3 camadas |
| Busca administrativa (`?q=`) | Query string absurdamente longa | Consulta cara/lenta no Postgres | `sanitizeSearchTerm` removia `,`/`()` | Corte para 100 caracteres antes de montar o filtro |
| Dependências (`npm`) | Vulnerabilidade conhecida numa lib | Depende da lib | — | Auditoria nesta fase (Seção 9) |
| Cabeçalhos HTTP | Clickjacking, MIME sniffing, XSS via script de terceiro não previsto | Depende do ataque | Nenhum cabeçalho de segurança existia antes desta fase | CSP + X-Frame-Options + X-Content-Type-Options + Referrer-Policy + Permissions-Policy + HSTS |

## 3. Autenticação

Supabase Auth gerenciado (`signInWithPassword`) — nenhum sistema de senha próprio (briefing, Seção
36: "preferir autenticação gerenciada"). `lib/supabase/serverSessionClient.ts` usa a chave `anon` +
cookie de sessão (nunca a service role); `proxy.ts` renova o token a cada requisição e faz uma
checagem OTIMISTA ("existe sessão?") só para `/admin/**`, redirecionando para `/admin/login` se não
houver — mas essa checagem NUNCA é a fronteira de segurança real (ela não consulta `admin_users`).

A fronteira real é `lib/auth/adminSession.ts` → `requireAdminSession()`, chamada explicitamente no
topo de `app/admin/(protected)/layout.tsx` e de toda Server Action privada — nunca só confiada à
`proxy.ts` ou a esconder um link na UI (briefing, Seção 3/89 do Next.js: "render-time gating não é
uma fronteira de segurança").

- **Sessão**: cookies geridos pelo `@supabase/ssr`, renovados a cada requisição.
- **Logout**: `signOutAdmin` chama `supabase.auth.signOut()` (invalida a sessão no provedor, não só
  no cliente) e redireciona para `/admin/login`.
- **Sessão inválida**: `getAdminSession()` retorna `null` sempre que `auth.getUser()` não devolve
  um usuário — `requireAdminSession()` redireciona, nunca deixa a página renderizar parcialmente.
- **Rate limit de login**: 5 tentativas / 5 minutos por IP+e-mail (`lib/security/rateLimit.ts`),
  aplicado ANTES de chamar `signInWithPassword` — fricção contra força bruta, sem substituir a
  autenticação gerenciada.
- **MFA**: não configurado. Recomendação forte (não bloqueante — briefing, Seção 71): ativar MFA
  (TOTP) para as contas em `admin_users` diretamente no painel do Supabase Auth quando o primeiro
  admin real for criado. É uma configuração do provedor, não uma mudança de código.
- **Política de senha**: a do Supabase Auth (gerenciada) — nenhuma regra própria inventada.

## 4. Autorização

"Autenticado" nunca é tratado como "autorizado" em lugar nenhum do projeto. Ver
`docs/ADMIN-CRM.md`, Seções 3/14/15, para o detalhamento original — resumo:

- `admin_users` é a fonte de verdade de quem é admin; `is_admin()` (função `security definer` no
  Postgres) é reaproveitada por toda policy de RLS, evitando repetir a subquery.
- Nenhuma rota client-side esconde um link para "parecer" protegida — toda página/Server Action
  sob `/admin` chama `requireAdminSession()` (redireciona/nega de verdade).
- Um usuário só pode consultar SE ELE MESMO é admin (`admin_users` RLS) — nunca listar quem mais
  tem acesso.
- Ninguém pode alterar o próprio `role` ou se auto-promover a admin pelo app: não existe nenhuma
  rota de escrita em `admin_users` acessível a `authenticated` (sem GRANT de insert/update/delete);
  o primeiro admin (e qualquer outro) é criado só via SQL Editor do Supabase (service role/postgres
  — ignora RLS), nunca pelo próprio app. Documentado aqui como o processo real: **não existe
  cadastro público de admin, de propósito.**

## 5. Validação server-side

Toda entrada pública é revalidada no servidor com Zod, mesmo já validada no navegador (Next.js
trata toda Server Action como um endpoint POST alcançável por qualquer um, não só pela UI —
`node_modules/next/dist/docs/.../server-actions.md`, "Security"):

- **Lead** (`leadPayloadSchema.ts`): nome/empresa (2-120), WhatsApp normalizado (regex exata),
  e-mail (`z.email()`), site/Instagram (1-200, opcional), `serviceId` via allowlist
  (`z.enum(["site", "trafego", "design"])`, nunca uma string livre), `services` limitado a 10
  itens, `answers` limitado a 50 chaves por serviço, cada chave a 100 caracteres, cada valor (ou
  item de array) a 200 caracteres, cada array a 20 itens.
- **Nota administrativa** (`noteContentSchema.ts`): 1-2000 caracteres, mesma constraint replicada
  como `check` no Postgres (defesa em camadas — Seção 63/64 do briefing).
- **ID de lead/projeto**: sempre `z.uuid()` antes de qualquer consulta.
- **Status do lead**: allowlist (`isValidLeadStatus`), nunca uma string livre gravada direto.
- **Evento de analytics** (`recordEvent.ts`): nome do evento via allowlist
  (`isKnownEventName`) + schema Zod específico por evento (`EVENT_PROPERTIES_SCHEMAS`) — um campo
  extra (ex.: `email`) rejeita o evento inteiro, nunca grava parcialmente.

**Mass assignment**: nenhum `{ ...body }` é passado direto para o Supabase em lugar nenhum do
projeto — todo repositório (`lib/repositories/*.ts`) monta o objeto de insert/update campo a campo,
explicitamente (`createLead`, `updateLeadStatusRow`, `addLeadNote`).

**SQL injection**: não é uma superfície real aqui — todo acesso a dado é via PostgREST
(`@supabase/supabase-js`, parametrizado por construção), nunca SQL montado por concatenação de
string. A única entrada livre que vira parte de uma expressão de consulta é o termo de busca
administrativa, tratado como texto (`.ilike`), nunca como SQL — `sanitizeSearchTerm` remove `,`/`()`
(caracteres de sintaxe do `.or()` do PostgREST, não um escaper de SQL) e corta em 100 caracteres.

**XSS**: nenhum `dangerouslySetInnerHTML` de conteúdo vindo de usuário em lugar nenhum do projeto —
auditado nesta fase. Os dois usos existentes são JSON-LD de dados estruturados (`toJsonLd`, escapa
`<` para nunca fechar a tag `<script>` cedo, e o conteúdo é sempre constante do próprio código,
nunca entrada de usuário) e a lista de "features" da nota interna (`NotesList.tsx`), que usa
`{note.content}` via JSX puro (nunca HTML interpretado). Nenhuma URL fornecida por usuário
(`websiteOrInstagram`) é transformada em `href` em lugar nenhum — é sempre renderizada como texto
puro (`LeadDetail.tsx`), então um scheme `javascript:` nunca tem como executar.

## 6. Rate limiting

`lib/security/rateLimit.ts` — janela fixa, em memória, por processo. Sem dependência nova
(Redis/Upstash): proporcional ao tráfego real deste projeto hoje.

| Ação | Limite | Chave |
| --- | --- | --- |
| `submitLead` | 5 / 10 min | IP |
| `signInAdmin` | 5 / 5 min | IP + e-mail |
| `recordEvent` | 60 / 5 min | `session_id` (já pseudônimo) |

**Limitação conhecida e aceita**: num deploy serverless com múltiplas instâncias (Vercel), cada
instância tem seu próprio contador — o limite efetivo pode ser um múltiplo do configurado sob
tráfego distribuído entre instâncias frias. Isso não anula a proteção (ainda cria fricção real
contra um script simples), só significa que não é uma garantia matematicamente exata. Um contador
central (Supabase ou Upstash) é a evolução natural SE um abuso real acontecer — mesmo critério já
usado para "CAPTCHA só se abuso justificar" (briefing, Seção 37): nenhum dos dois foi adicionado
preventivamente.

**Honeypot** (`LeadForm.tsx`, campo `company_website`): invisível (fora da tela via posicionamento,
nunca `display:none`), `tabIndex={-1}`, `aria-hidden`, nunca alcançável por uma pessoa navegando por
Tab ou por leitor de tela. Preenchido = bot; `submitLead` rejeita com a MESMA mensagem genérica de
qualquer outra falha, sem gravar nada e sem consultar o rate limit.

**Timing/CAPTCHA**: nenhum dos dois implementado — o briefing pede timing só como "sinal adicional,
nunca sozinho" (Seção 39) e CAPTCHA só "se abuso justificar" (Seção 37). Sem histórico de abuso
real, adicionar qualquer um dos dois agora seria fricção sem benefício comprovado.

## 7. Secrets e variáveis de ambiente

| Variável | Classificação | Onde é usada |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | PUBLIC | Cliente e servidor — não é secreta por padrão no Supabase (a segurança depende do RLS, não de esconder a URL) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | PUBLIC | Cliente e servidor — idem; RLS decide o que essa chave pode fazer |
| `SUPABASE_SERVICE_ROLE_KEY` | SECRET | Só `lib/supabase/server.ts` (`import "server-only"` — o build falha se um Client Component tentar importar esse módulo) |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | PUBLIC | Cliente — Measurement ID do GA4 não é secreto por natureza |
| `NEXT_PUBLIC_META_PIXEL_ID` | PUBLIC | Cliente — idem, Pixel ID não é secreto por natureza |
| `NEXT_PUBLIC_SITE_URL` | PUBLIC | Build-time — domínio de produção, não é secreto |

**Nenhum segredo hardcoded no código-fonte** — confirmado por busca (`SUPABASE_SERVICE_ROLE_KEY`
só aparece em `.env.example`, no repositório que a lê, e no teste que mocka esse repositório).
`SUPABASE_SERVICE_ROLE_KEY` nunca leva o prefixo `NEXT_PUBLIC_` — é a única variável deste projeto
que, se exposta, dá acesso total ao banco (ignora RLS).

**Histórico do Git**: nenhum segredo real foi commitado neste repositório até o momento desta
auditoria (o `.env.example` sempre existiu só com nomes de variável, nunca valores). Se isso mudar
no futuro — um `.env` real for commitado por engano — a resposta correta nunca é só removê-lo do
arquivo: a chave precisa ser rotacionada no Supabase/provedor (ver Seção 12, "Resposta a
incidentes"), porque ela continua no histórico do Git mesmo depois de removida do arquivo atual.

**`.env`**: `.gitignore` já cobre `.env*` (verificado nesta fase); `.env.example` mantém só nomes,
nunca valores, com comentários explicando o que cada variável faz e por que é PUBLIC ou SECRET.

## 8. Headers e CSP

Configurados em `next.config.ts` (`headers()`), aplicados a toda rota (`/(.*)`):

- **Content-Security-Policy** — SEM nonce, de propósito (ver `docs/DECISIONS.md`, "[SEGURANÇA] CSP
  sem nonce"): a maioria das rotas deste projeto é estática, e nonce exigiria renderização dinâmica
  em toda página. `script-src`/`style-src` incluem `'unsafe-inline'` — a mesma concessão que a
  documentação oficial do Next.js recomenda para quem não adota nonce (variante "Without Nonces").
  Domínios de terceiro permitidos: `googletagmanager.com`/`google-analytics.com`/`analytics.google.com`
  (GA4), `facebook.net`/`facebook.com` (Meta Pixel), `*.supabase.co` (`connect-src`, o próprio
  banco). `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`,
  `upgrade-insecure-requests`.
- **X-Frame-Options: DENY** — redundante com `frame-ancestors 'none'` em navegadores modernos,
  mantido pela compatibilidade mais ampla que ferramentas de auditoria ainda checam.
- **X-Content-Type-Options: nosniff**.
- **Referrer-Policy: strict-origin-when-cross-origin**.
- **Permissions-Policy**: bloqueia `camera`, `microphone`, `geolocation`, `payment`, `usb` e
  `interest-cohort` (FLoC) — nenhuma dessas APIs é usada pelo site.
- **Strict-Transport-Security**: `max-age=63072000; includeSubDomains; preload` — produção só HTTPS
  (Seção 49 do briefing); sem efeito em `http://localhost` (navegadores ignoram HSTS fora de HTTPS).
- **`poweredByHeader: false`** — remove `X-Powered-By: Next.js` (não expor detalhes internos
  desnecessários).

**Verificação**: cabeçalhos confirmados presentes numa build de produção real (`next build` +
`next start`, inspecionado via `curl -D -`). A lista de origens permitidas na CSP foi construída
por auditoria de código (todo `<script src>`/toda chamada de rede de terceiro do projeto — GA4,
Meta Pixel, Supabase, fontes `next/font/google` self-hospedadas em build time, sem nenhum outro
recurso externo, worker, iframe ou blob), não por tentativa e erro — não há nenhum
`dangerouslySetInnerHTML` com conteúdo de usuário que o `'unsafe-inline'` de `script-src` pudesse
expor (Seção 5).

**CORS**: não é uma superfície real aqui — não existe nenhum Route Handler (`app/api/`) no
projeto; toda mutação passa por Server Action, que já tem sua própria checagem de CSRF embutida no
framework (Origin vs. Host, ver Seção 10). Se um Route Handler for adicionado no futuro que precise
ser chamado de outra origem, ele precisa de uma política de CORS explícita e restrita — nunca
`Access-Control-Allow-Origin: *`.

## 9. Dependências

`npm audit`: **5 vulnerabilidades (3 moderadas, 1 alta, 1 crítica)**, todas em `devDependencies` —
a cadeia do Vitest (`@vitest/mocker`, `esbuild`, `vite`, `vite-node`, `vitest`). Nenhuma chega ao
bundle de produção (não são `dependencies`, não são importadas por nenhum código que roda em
produção). A entrada crítica (`vitest`, GHSA-5xrq-8626-4rwp) exige o servidor de UI do Vitest
(`vitest --ui`) rodando e exposto — este projeto nunca usa essa flag (`package.json` só tem
`vitest run`/`vitest`), então a condição de exploração nunca existe aqui. O fix disponível exige um
bump de major do Vitest (2 → 5), que poderia quebrar os 620 testes existentes — decisão registrada
em `docs/DECISIONS.md`: não fazer upgrade forçado (`npm audit fix --force`) sem avaliar o impacto
(briefing da Etapa 29, Seção 80); tratado como pendência de manutenção dedicada (Etapa 31), não
como vulnerabilidade de produção. (Correção: a Etapa 29 reportou só 3 vulnerabilidades por ler uma
saída truncada do comando — a contagem completa foi reconfirmada na auditoria de dependências da
Etapa 30, Seção "Performance".)

Nenhuma dependência não utilizada foi encontrada (auditoria por busca de import de cada pacote em
`package.json`). Nenhum pacote pequeno/desconhecido foi adicionado nesta fase para uma função
simples — o rate limit e o honeypot são implementados com ~60 linhas próprias, sem dependência
nova, exatamente pelo princípio de proporcionalidade do briefing (Seção 83).

`package-lock.json` versionado (padrão desde o início do projeto).

## 10. CSRF e Server Actions

Next.js aplica uma checagem de CSRF própria em toda Server Action: compara o `Origin` da
requisição com o `Host`/`X-Forwarded-Host`, rejeitando automaticamente quando não batem
(`node_modules/next/dist/docs/.../server-actions.md`, "Security"). Nenhuma configuração adicional
é necessária para este projeto (deploy direto no Vercel, sem proxy/CDN com domínio diferente do
`Host`) — `serverActions.allowedOrigins` só seria necessário se isso mudasse.

## 11. Logging

- `submitLead`/`recordEvent`: nunca logam o payload/propriedades completos, só mensagens genéricas
  ou, no caso de erro de validação, o resultado "achatado" do Zod (`error.flatten()`, que indica
  QUAL campo falhou, não o valor em si — exceto o próprio valor inválido nas mensagens do Zod, que
  já eram curtas de propósito).
- `createLead`/`addLeadNote` (Etapa 29, revisão desta fase): erros do Postgres reduzidos a
  `code`/`message` — nunca o objeto de erro inteiro, que ocasionalmente ecoa um fragmento do valor
  que violou uma constraint em `details`/`hint`.
- Nenhuma ferramenta de log de erro externa (Sentry, Bugsnag, etc.) está integrada ao projeto —
  não há "payload completo de lead enviado a uma ferramenta de terceiro" porque essa ferramenta
  não existe aqui.
- Nenhuma senha/token/service role é logada em lugar nenhum (busca confirmada — `console.*` só
  aparece nos repositórios/Server Actions já revisados acima, e nas Server Actions de admin, que
  nunca tocam credenciais).
- WhatsApp pré-preenchido (`buildWhatsAppLink.ts`): mensagem inicial curta ("Olá, {nome}! Aqui é da
  Agência Upgrade..."), nunca um resumo do projeto embutido na URL — o número de telefone já é
  parte da própria URL `wa.me` (necessário para o link funcionar), mas nenhum outro dado pessoal
  (e-mail, respostas do Builder) aparece ali.
- Termo de busca administrativa (`?q=`) na URL: aceito como proporcional (ferramenta interna,
  autenticada, `noindex`) — nunca enviado a nenhuma ferramenta de analytics (o evento `page_view`
  usa só `pathname`, nunca a query string completa).

## 12. Resposta a incidentes

Se uma chave/segredo vazar (ex.: `SUPABASE_SERVICE_ROLE_KEY` commitada por engano, ou exposta em um
log):

1. **Revogar** a chave imediatamente no painel do Supabase (Project Settings → API) — gera uma
   nova automaticamente.
2. **Atualizar** a variável de ambiente correspondente no Vercel (Project Settings →
   Environment Variables) com o novo valor.
3. **Redeploy** — a chave antiga já não funciona mais assim que revogada; o site fica fora do ar
   para operações que dependem dela até o redeploy completar (aceitar essa janela é melhor do que
   deixar a chave antiga ativa).
4. **Revisar logs** do período entre o vazamento e a revogação, procurando uso anômalo (Supabase
   tem logs de API por projeto).
5. **Nunca considerar suficiente só remover o segredo do arquivo/commit** — ele continua no
   histórico do Git; a rotação da chave em si é a única mitigação real.

## 13. Backups e restauração

Não verificado nesta fase (configuração de infraestrutura, fora deste repositório) — já registrado
como pendência em `docs/PRIVACY-LGPD.md`, Seção 18. Recomendação: confirmar o plano do projeto
Supabase (planos pagos incluem backup diário automático com retenção variável; o plano gratuito não
garante o mesmo nível) e, uma vez confirmado, documentar aqui a política real (frequência,
retenção, região). Testar uma restauração real (Seção 102 do briefing) é uma pendência separada —
não deve ser assumido que backup "funciona" sem nunca ter sido restaurado ao menos uma vez.

## 14. Monitoramento

Não existe (nem é necessário nesta fase) nenhum "SOC" ou ferramenta de monitoramento dedicada
(briefing, Seção 98: "não construir SOC complexo"). O que já existe hoje serve como sinal mínimo:
Supabase tem logs de API/erros de banco por projeto; Vercel tem logs de função/build. Se um abuso
real for percebido no futuro (ex.: rate limit sendo atingido com frequência, tentativas de login
repetidas), o próximo passo natural é: (1) olhar os logs existentes antes de adicionar qualquer
ferramenta nova; (2) considerar um contador de rate limit persistente (Seção 6) só se o em-memória
se mostrar insuficiente; (3) considerar CAPTCHA só se o honeypot+rate limit não bastarem.

## 15. WebGL, áudio e recursos estáticos

Three.js/WebGL (`features/design-system/webgl/`): geometria 100% procedural
(`buildUpgradeMonogramGeometry.ts`), nenhum modelo/textura carregado de fonte externa, nenhum
shader recebe conteúdo do usuário — confirmado por auditoria (`docs/ADVANCED-VISUALS.md`). Sem uso
de `Worker`/`createObjectURL`/`blob:` em lugar nenhum do projeto (busca confirmada), então a CSP
não precisa de `worker-src`/`blob:` em nenhuma diretiva.

Áudio (Microinterações): assets locais do próprio projeto, nenhuma fonte externa.

Links externos (`target="_blank"`): o único existente (`LeadDetail.tsx`, link do WhatsApp) já usa
`rel="noreferrer"`.

## 16. O que fica para depois (não bloqueante para esta fase)

Ver `docs/IMPLEMENTATION-STAGE-29.md`, Seção "Pendências para a Etapa 30", para a lista completa.
