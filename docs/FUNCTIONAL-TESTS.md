# FUNCTIONAL-TESTS — Estratégia de Testes

> Etapa 31 do roadmap. Documenta a estratégia de testes do projeto como um todo — unitário,
> integração e E2E — não só o que foi adicionado nesta fase. Ver `docs/TEST-RESULTS-STAGE-31.md`
> para os resultados desta execução e `docs/IMPLEMENTATION-STAGE-31.md` para o resumo técnico
> (bugs encontrados/corrigidos, decisões, pendências).

## 1. Pirâmide de testes deste projeto

| Camada | Ferramenta | O que cobre | Quantidade |
| --- | --- | --- | --- |
| Unitário/lógica pura | Vitest | Reducers, schemas Zod, lógica de score, formatação, validação | maioria dos 622 testes |
| Integração de componente | Vitest + Testing Library (jsdom) | Comportamento de componentes React isolados/em grupo pequeno (Builder, admin, Design System) | resto dos 622 |
| E2E (ponta a ponta, navegador real) | **Playwright** (novo nesta fase) | Jornadas completas, persistência real de `localStorage`, motion real (GSAP/ScrollTrigger/Lenis/WebGL), teclado, múltiplos motores/viewports | ~64 testes, 5 projetos de navegador |
| Manual | — | Casos que exigem julgamento visual/qualitativo (ver Seção 6) | lista explícita, não uma lacuna escondida |

Nenhum framework foi duplicado (briefing, Seção 2): Vitest + Testing Library já cobriam unitário/
integração desde a Fase 8; Playwright é o único framework novo, porque nenhum E2E existia — e é a
recomendação padrão do próprio briefing (Seção 3) quando isso acontece.

## 2. Por que Playwright, e por que só agora

Fluxos como a jornada completa do Builder, a persistência real em `localStorage` sobrevivendo a um
`F5` de verdade, `useSyncExternalStore`/CSS de sobreposição (`z-index`/`pointer-events`) e o
comportamento de motion sob `prefers-reduced-motion` só podem ser verificados com um navegador de
verdade — `jsdom` (usado pelos testes de integração) não calcula layout/sobreposição real, não
executa animações CSS, e não tem paridade de engine com Chromium/Firefox/WebKit. Isso não é uma
lacuna teórica: **dois bugs reais e um problema crítico só apareceram ao rodar em navegador de
verdade** (ver `docs/IMPLEMENTATION-STAGE-31.md`, Seção 2).

## 3. Ambiente

**Nunca contra o Supabase real.** Decisão tomada com o usuário nesta fase: os specs de E2E que
envolvem gravar dados de verdade (envio de lead, login/CRM do admin) usam um backend em memória
(`lib/testing/e2eStore.ts`), ativado só quando `E2E_TEST_MODE=true` — variável que só existe no
processo do `webServer` do Playwright (`playwright.config.ts`), nunca em `next dev`/`next start`/
produção. `.env.local` deste projeto tem credenciais reais de um projeto Supabase (não
necessariamente um projeto de teste dedicado) — gravar leads/eventos de teste ali poluiria dados
reais de CRM, o oposto do que o briefing pede ("Testes não devem destruir produção").

**Por que não mockar a rede do navegador em vez disso**: a alternativa mais óbvia
(`page.route()` do Playwright, interceptando requisições) não funciona aqui — toda escrita real
acontece dentro de Server Actions, executadas no SERVIDOR; o navegador nunca faz uma chamada de
rede direta ao Supabase que pudesse ser interceptada no lado do cliente. A alternativa real é
injeção de dependência na fronteira do repositório: cada função de `lib/repositories/*.ts` e as
Server Actions de auth (`signIn`/`signOut`/`adminSession`) checam `isE2ETestMode()` no topo e, se
verdadeiro, chamam o backend em memória em vez do Supabase — nunca alteram o comportamento de
produção (a checagem é um `if` explícito, nunca um mock global).

O que o backend em memória cobre:

- **Leads**: `createLead`, `listLeads` (filtro/busca/ordenação/paginação), `getLeadById`,
  `getLeadStatus`/`updateLeadStatusRow`, `getAdminLeadCounts` — mesma semântica das funções reais.
- **Notas e histórico de status**: `addLeadNote`/`listLeadNotes`,
  `addLeadStatusHistory`/`listLeadStatusHistory`.
- **Autenticação do admin**: uma conta fixa (`admin@e2e.test`), sessão representada por um cookie
  próprio (`e2e-admin-session`) lido por `getAdminSession()`/`proxy.ts` — nunca o Supabase Auth
  real nem um cookie que se pareça com um de produção.
- **Analytics**: `insertAnalyticsEvent` aceita e não grava nada (nenhum spec desta fase precisa
  LER eventos de volta); `getAnalyticsOverview` devolve um funil vazio.
- **3 leads-fixture semeados** (Ana/Bruno/Carla) com dados e respostas REAIS (campos/opções que
  existem de verdade em `features/builder/data/*.ts` — nunca um campo inventado) e IDs em formato
  UUID de verdade (a validação real de `z.uuid()` em `updateLeadStatus`/`addLeadNote` rejeitaria
  um id como `"lead-1"` — bug de fixture real encontrado e corrigido nesta fase).

**Limitação conhecida e aceita**: o backend em memória é um único módulo compartilhado por TODA
requisição concorrente ao mesmo `next dev` — sem isolamento por teste/worker. Sob paralelismo alto,
isso pode causar interferência entre testes que mutam o MESMO registro (ver
`docs/TEST-RESULTS-STAGE-31.md`, Seção "Flakiness conhecida"). Mitigado com `workers: 2` e
`test.describe.configure({ mode: "serial" })` no arquivo de admin. Um backend de teste com
isolamento de verdade (ex.: um banco de teste real, por worker) é a evolução natural se a suíte
crescer — registrado como pendência (Etapa 32).

## 4. `webServer`: `next dev`, não `next build && next start`

Escolha deliberada: o que está sob teste aqui é COMPORTAMENTO funcional (fluxos, estado,
permissões), não performance de produção (isso já tem sua auditoria dedicada,
`docs/PERFORMANCE.md`, Etapa 30). `next dev` inicia mais rápido a cada iteração de
desenvolvimento dos próprios specs. Custo aceito: a primeira visita a uma rota "fria" sofre
compilação JIT do Turbopack, ocasionalmente levando dezenas de segundos — por isso o timeout global
é 45s (não os 30s padrão do Playwright) e `expect.timeout` é 15s (não os 5s padrão).

## 5. Estratégia de navegadores/viewports

A suíte funcional completa roda em **Chromium** (mais rápido, cobre a lógica). Um subconjunto de
fumaça (`e2e/core.smoke.spec.ts`, sufixo `.smoke.spec.ts`) roda também em **Firefox**, **WebKit**
e dois viewports **mobile** (Pixel 7 via Chrome mobile, iPhone 14 via Safari mobile) — o suficiente
para pegar uma quebra específica de motor/viewport sem multiplicar o tempo total de execução por 5
(briefing, Seções 87-89: "quando possível", não "a suíte inteira em todo navegador"). Essa escolha
já provou seu valor nesta fase: um bug real e sério (HSTS quebrando toda a aplicação no WebKit em
desenvolvimento) só apareceu rodando em WebKit — nunca em Chromium (ver
`docs/IMPLEMENTATION-STAGE-31.md`, Seção 2).

## 6. Suítes E2E criadas

| Arquivo | Cobre |
| --- | --- |
| `e2e/core.smoke.spec.ts` | Fumaça cross-browser: Home, jornada completa do Builder, consentimento, login do admin |
| `e2e/builder-services.spec.ts` | Os 3 serviços individualmente, múltiplos serviços, prevenção de duplicação, finalizar sem serviço |
| `e2e/builder-draft-confirmed.spec.ts` | Teste crítico (Seções 9/10): draft nunca vaza para o confirmed antes de salvar; salvar substitui corretamente |
| `e2e/builder-navigation.spec.ts` | Voltar preserva respostas, troca de resposta invalida dependente, Continuar bloqueado sem resposta, duplo clique não pula cena |
| `e2e/my-upgrade.spec.ts` | Estado vazio, adicionar/editar/remover (último/intermediário/entre vários), cancelar remoção |
| `e2e/session-persistence.spec.ts` | Refresh em cada etapa, teste crítico (Seção 19: confirmed + draft sobrevivem separados), storage corrompido, versão incompatível, reset |
| `e2e/lead-form.spec.ts` | Validação por campo, formatos de WhatsApp/e-mail, campo opcional, preservação ao voltar, duplo submit, falha simulada + retry + idempotência |
| `e2e/admin.spec.ts` | Login, permissões (sem sessão/logout), lista/paginação/filtros/busca, detalhe, status, notas, XSS-como-texto, links de contato |
| `e2e/consent.spec.ts` | Banner para novo visitante, aceitar/recusar/configurar, reabrir preferências, versão de política |
| `e2e/security.spec.ts` | Honeypot, rate limit de login (em pequena escala), ausência de open redirect |
| `e2e/accessibility-motion.spec.ts` | Teclado (Tab/Enter/Espaço), Esc fecha drawer/diálogo, WebGL desativado, reduced motion, scroll lock, 404 |

## 7. O que continua manual (e por quê)

Ver `docs/TEST-RESULTS-STAGE-31.md`, Seção "Testes manuais", para a lista com justificativa —
resumo: qualidade visual/subjetiva de motion (GSAP/ScrollTrigger/Lenis sob scroll real de mouse/
trackpad/touch), Lighthouse/DevTools Performance (já cobertos por `docs/PERFORMANCE.md`, Etapa 30,
não repetidos aqui), e teste em dispositivo físico de verdade (Playwright emula viewport/UA, não
hardware real).

## 8. Scripts

```
npm run test              # Vitest (unitário/integração) — já existia
npm run test:e2e          # Playwright, todos os projetos configurados
npm run test:e2e:ui       # Playwright em modo UI (interativo, útil para depurar)
npm run test:e2e:report   # Abre o último relatório HTML gerado
```

`npx playwright test --project=chromium` roda só a suíte funcional completa (mais rápido, sem os
projetos de fumaça cross-browser).

## 9. Pronto para CI (não configurado ainda)

Nenhum pipeline de CI foi criado nesta fase (briefing, Seção 119: "não precisa configurar pipeline
complexo se ainda não existe") — mas a suíte já está pronta para uma futura integração:
`playwright.config.ts` já usa `forbidOnly`/`retries` condicionais a `process.env.CI`, e os scripts
`npm run test`/`npm run test:e2e` são os dois comandos que uma pipeline chamaria.
