# IMPLEMENTATION STAGE 30 — Performance

> Ver `docs/PERFORMANCE.md` (auditoria completa, baseline, todas as categorias revisadas) para o
> documento principal desta fase. Este documento é o resumo técnico: o que mudou, antes/depois,
> arquivos alterados, testes, limitações e pendências.

## 1. Ponto de partida

Medição real antes de qualquer alteração (Lighthouse, Chrome headless, `next build` + `next
start`): Desktop já em **Performance 100** (LCP 0,4s, TBT 30ms). Mobile (CPU 4x/rede throttled, o
preset padrão) em **Performance 50** (LCP 5,9s, TBT 690ms). A causa raiz identificada pelo próprio
Lighthouse (`lcp-breakdown-insight`) não foi tamanho de bundle nem WebGL pesado — foi o H1 do Hero
(o elemento de LCP real) ficando com a pintura atrasada em ~2,2s porque uma animação de entrada em
GSAP o escondia (`opacity: 0`) até a hidratação completar, competindo por main thread com o
bootstrap do próprio GSAP/ScrollTrigger/Lenis/Three.js.

O restante da auditoria (bundle, fontes, GSAP, Lenis, WebGL, áudio, React, Supabase, hydration,
CSS, prefetch) encontrou uma arquitetura já muito bem otimizada desde fases anteriores — a maior
parte deste documento é CONFIRMAÇÃO, não correção. Ver `docs/PERFORMANCE.md` para o detalhamento
categoria por categoria.

## 2. Gargalos encontrados (por ordem de impacto medido)

1. LCP mobile atrasado por uma animação de entrada JS-driven escondendo o próprio elemento de LCP.
2. Imagem do logo servida 15-25x maior que o necessário em 3 lugares (header, nav do Builder,
   admin) — `next/image` com `width`/`height` = tamanho do arquivo-fonte, não do exibido.
3. WebGL do Hero inicializando de forma síncrona no momento mais concorrido do carregamento, mesmo
   já sendo `next/dynamic`.
4. 5 assets SVG mortos em `public/` (nunca referenciados).

## 3. Otimizações aplicadas

- **`features/site/components/home/HeroSection.module.css`** — `@keyframes heroReveal` (fade +
  translateY) substitui a entrada por GSAP; reaproveita os tokens `--ds-duration-slow`,
  `--ds-easing-emphasized`, `--ds-stagger-sm/md` (mesma coreografia, sem JS no caminho crítico).
- **`features/site/motion/useHeroScrollMotion.ts`** — removida a parte de entrada ao montar
  (`gsap.set`/`.timeline()`); mantida só a parte scroll-linked (`gsap.matchMedia()` + `scrub`).
- **`styles/tokens.css`** — regra global de `prefers-reduced-motion` ganhou `animation-delay: 0ms
  !important` (sem isso, a versão CSS do reveal do Hero ficaria até 300ms invisível sob reduced
  motion, quando antes o efeito GSAP nem rodava nesse caso).
- **`features/site/components/home/HeroSection.tsx`** — `UpgradeLogo3D` só monta depois de
  `requestIdleCallback` (fallback `setTimeout(200ms)`); o gradiente CSS de fallback continua
  preenchendo o espaço o tempo todo, sem mudança visual.
- **`features/site/components/SiteHeader.tsx`, `features/builder/components/BuilderNavigation.tsx`,
  `app/admin/(protected)/layout.tsx`** — `<Image src="/logo-mark.png">` com dimensões intrínsecas
  corrigidas (`40×52`, `33×44`, `30×40` — 2x o tamanho realmente exibido em CSS) em vez de
  `556×731` (o tamanho do arquivo-fonte).
- **`public/`** — removidos `next.svg`, `globe.svg`, `window.svg`, `vercel.svg`, `file.svg`
  (scaffold do `create-next-app`, nunca usados).

## 4. Resultados antes/depois

### Imagem do logo (medido via `curl` contra build de produção real)

| | Antes | Depois |
| --- | --- | --- |
| Candidato 1x do `srcSet` | 31.186 bytes | 1.169 bytes |
| Candidato 2x (o que a maioria das telas retina baixa) | 31.186 bytes | 2.223 bytes |

### Core Web Vitals — Mobile (Lighthouse, mesmo preset throttled da baseline)

| Métrica | Antes | Depois | Variação |
| --- | --- | --- | --- |
| Performance | 50 | 61 | +11 pontos |
| FCP | 3,6 s | 1,9 s | -47% |
| LCP | 5,9 s | 5,5 s | -7% |
| TBT | 690 ms | 550 ms | -20% |
| CLS | 0 | 0 | inalterado |
| Speed Index | 5,4 s | 5,1 s | -6% |

### Core Web Vitals — Desktop

Inalterado — **Performance 100** antes e depois (confirma que nenhuma mudança introduziu
regressão no cenário sem throttle).

## 5. Por que o LCP mobile não caiu mais (honestidade sobre o resultado)

A melhoria é real e mensurável (FCP quase pela metade, TBT -20%), mas o LCP mobile continua em
~5,5s, bem acima da meta de 3s proposta no orçamento de performance
(`docs/PERFORMANCE.md`, Seção 15). Investigado após a correção: o `lcp-breakdown-insight` continuou
reportando um "element render delay" de ~2,4-2,5s mesmo depois de remover a animação JS que hospedava
o problema original — o que indica que a causa não era só aquela timeline específica, e sim o custo
agregado de main thread da página inteira sob throttle de CPU 4x (`mainthread-work-breakdown`
permanece por volta de 5s: hidratação do React + `ScrollTrigger`/`matchMedia` de várias seções +
Lenis + o bootstrap do Three.js, mesmo adiado, ainda precisam rodar em algum momento).

Decisão: não perseguir mais correções agressivas nesta fase sem medição/profiling mais profundo
(Chrome DevTools Performance panel, teste em aparelho real) — o briefing é explícito (Seção 2: "não
otimizar no escuro"; Seção 103: "Lighthouse não é meta isolada... não destruir UX só para 100") e a
prioridade #1 (PRESERVAR EXPERIÊNCIA) pesa contra reescrever/remover motion sem uma medição que
justifique claramente o ganho. As duas correções aplicadas são estruturalmente corretas e valiosas
por si (o H1 agora pinta via CSS, não bloqueado por JS; o WebGL não compete mais pelo momento mais
sensível do carregamento) mesmo que o número final de LCP simulado não reflita isso tão
dramaticamente quanto o esperado — possivelmente por diferença de metodologia entre a métrica
principal (`largest-contentful-paint`, estimada por simulação "lantern") e o detalhamento
(`lcp-breakdown-insight`, baseado no trace observado de uma única execução), que podem divergir em
páginas ricas em JavaScript/animação como esta. Ver Seção 7 (pendências) para os próximos passos
recomendados.

## 6. Testes

Nenhum teste novo foi necessário para as otimizações desta fase (mudanças de CSS/timing/dimensão
de imagem, não de lógica) — a suíte existente já cobre o comportamento relevante:

- `features/site/components/home/HeroSection.test.tsx` — reexecutado, passa sem alteração
  (verifica conteúdo presente, reduced motion nunca esconde o título, monta/desmonta sem erro).
- `app/page.test.tsx` — reexecutado, confirma que a Home renderiza header/4 seções/footer sem
  lançar erro com o `UpgradeLogo3D` agora adiado por `requestIdleCallback`.
- Nenhum teste hardcodeava as dimensões antigas do logo (`width={556}`) — confirmado por busca
  antes da alteração.

Briefing, Seção 119 ("não testar FPS em unit test; adicionar testes só para lazy loading/fallback/
cleanup/reduced motion/componentes dinâmicos") — exatamente a cobertura que já existe: a suíte
verifica comportamento (visível, monta, desmonta, reduced motion), nunca frames de animação.

## 7. Revisão técnica final

- **Lint**: 0 erros, 0 avisos.
- **Typecheck**: 0 erros.
- **Testes**: **620/620 passando** (sem mudança em relação à Etapa 29 — nenhuma lógica nova,
  nenhum teste quebrado). Mesma notícia não relacionada de "Errors: 1" (artefato de teardown do
  GSAP ScrollTrigger em `HeroSection.test.tsx`, documentada desde a Etapa 28/29).
- **Build**: sucesso; tabela de rotas inalterada (15 rotas, mesma distribuição estático/dinâmico).
- **`npm audit`**: 5 vulnerabilidades (contagem corrigida nesta fase — ver `docs/DECISIONS.md`),
  todas dev-only, nenhuma nova.
- **Lighthouse**: desktop e mobile executados de verdade (Chrome real via `CHROME_PATH`), antes e
  depois de cada mudança — números em `docs/PERFORMANCE.md` e Seção 4 acima.

## 8. Limitações desta auditoria

- Lighthouse rodado localmente (`next start`, não o deploy real do Vercel) — números de rede podem
  diferir em produção (CDN/edge do Vercel provavelmente melhora TTFB e usa Brotli em vez de gzip).
- Throttling de CPU é SIMULADO pelo Lighthouse (multiplicador 4x sobre a CPU da máquina que rodou o
  teste), não um aparelho físico real — o briefing pede teste em "dispositivo mais fraco quando
  possível" (Seção 84/107); não foi possível nesta sessão (sem acesso a um aparelho físico).
- Nenhum profiling de trace do Chrome DevTools (linha a linha de main thread) foi feito — a análise
  desta fase usou os agregados que o próprio Lighthouse já calcula (`mainthread-work-breakdown`,
  `bootup-time`), suficientes para confirmar a direção do problema (custo de JS, não de rede/
  imagem), mas não para isolar exatamente qual chamada individual pesa mais.
- `@next/bundle-analyzer` não foi usado (decisão registrada em `docs/DECISIONS.md`) — a análise de
  bundle desta fase foi manual (tamanho de chunk + grep de conteúdo), suficiente para confirmar
  que o code-splitting já estava correto, mas menos detalhada que um relatório visual de bundle.

## 9. Pendências para a Etapa 31

- **LCP mobile ainda acima da meta (5,5s vs. 3s do orçamento)** — investigar com profiling real
  (Chrome DevTools Performance panel, trace completo) para isolar exatamente qual trabalho de main
  thread pesa mais sob CPU throttled; considerar diferir também os `ScrollTrigger`/`matchMedia` das
  seções abaixo da dobra (Capabilities/Projetos/CTA final) para depois do primeiro paint, em vez de
  todos montarem no mesmo burst inicial de hidratação.
- **Teste em aparelho físico real** (Seção 84/107 do briefing) — não realizado nesta sessão, sem
  acesso a um dispositivo de referência.
- **`Save-Data`/`navigator.connection`** — avaliado e não implementado por ser uma API
  experimental (`docs/PERFORMANCE.md`, Seção 14); reavaliar se o suporte de navegadores mudar.
- **Índices de banco para `lead_score_tier`/`project->services` (JSONB)** — avaliados e não
  criados por falta de evidência de necessidade no volume de dados esperado; revisitar se o volume
  real de leads crescer significativamente.
- **Upgrade do Vitest (major, 2 → 5)** — pendência já registrada na Etapa 29, não endereçada aqui
  (fora do escopo de performance de produção).
- **MFA para admins / backup-restore do Supabase** — pendências de segurança já registradas na
  Etapa 29, não duplicadas aqui.
