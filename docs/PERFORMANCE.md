# PERFORMANCE — Auditoria e Otimização

> Etapa 30 do roadmap. Regra do briefing: **PRESERVAR EXPERIÊNCIA + REDUZIR CUSTO** — o objetivo
> nunca foi remover motion/WebGL/áudio/storytelling, e sim medir de verdade, achar os gargalos
> reais (não micro-otimizar no escuro) e corrigir só o que a medição justificou. Complementa
> `docs/SECURITY.md` (Etapa 29) e não contradiz nenhuma decisão de LGPD (Etapa 28).

## 1. Baseline (antes de qualquer alteração desta fase)

Medido com `next build` + `next start` (produção local) e Lighthouse real (Chrome headless,
`--preset=desktop` e o preset mobile padrão — CPU 4x/rede "Slow 4G" simulados, o padrão do
Lighthouse para representar um aparelho intermediário).

### Core Web Vitals — Desktop

| Métrica | Valor | Categoria |
| --- | --- | --- |
| Performance | **100** | — |
| Accessibility | 96 | (fora do escopo desta fase — ver Seção 16) |
| Best Practices | 96 | (idem) |
| SEO | 100 | — |
| FCP | 0.3 s | ótimo |
| LCP | 0.4 s | ótimo |
| CLS | 0 | ótimo |
| TBT | 30 ms | ótimo |
| TTI | 1.4 s | ótimo |
| Speed Index | 0.8 s | ótimo |

### Core Web Vitals — Mobile (throttled)

| Métrica | Valor | Categoria |
| --- | --- | --- |
| Performance | **50** | precisa melhorar |
| FCP | 3.6 s | ruim |
| LCP | 5.9 s | ruim |
| CLS | 0 | ótimo |
| TBT | 690 ms | ruim |
| TTI | 5.9 s | ruim |
| Speed Index | 5.4 s | ruim |

Diagnóstico de causa raiz (não só o número): `mainthread-work-breakdown` = 6.1s, `bootup-time`
(parse/compile/execução de JS) = 2.6s sob o throttle de CPU 4x do preset mobile. O
`lcp-breakdown-insight` do próprio Lighthouse identificou o **H1 do Hero** ("Um upgrade real na
presença digital da sua empresa.") como o elemento de LCP real — não o WebGL, o que já confirmava
que a Seção 46 do briefing ("LCP não deve ser WebGL pesado") já era respeitada por construção. O
problema era outro: **"element render delay" de ~2,2s** — o texto já existe no HTML (SSR), mas
ficava com pintura atrasada.

### Outras medições da baseline

- **Imagem do logo** (`logo-mark.png`, usada no header/nav do Builder/admin via `next/image` com
  `width={556} height={731}` — o tamanho do ARQUIVO, não o exibido de ~20-26px): o otimizador do
  Next não amplia além da fonte, então tanto o candidato 1x quanto o 2x do `srcSet` resultavam no
  PNG original inteiro, **31.186 bytes**, em TODA página (medido via `curl` contra a build real).
- **Bundle JS**: 26-29 arquivos em `.next/static/chunks`, ~2,0 MB no disco (sem compressão). O
  chunk de `three` (identificado por conter `WebGLRenderer` no código) tem 496 KB sozinho, mas
  **não aparece nos `<script>` do HTML inicial da Home** — confirmado inspecionando o HTML
  servido: já está isolado atrás de `next/dynamic({ ssr: false })` desde a Fase 3D/WebGL.
- **Compressão/cache**: `Content-Encoding: gzip` e `Cache-Control: public, max-age=31536000,
  immutable` já presentes por padrão do Next.js em `/_next/static/**` (confirmado via `curl -D -`)
  — nenhuma configuração própria necessária (Seções 95/96/100 já satisfeitas pelo framework).
- **Fontes**: `next/font/google` (Montserrat 500/600/700 + Inter, variável), self-hospedadas,
  `subsets: ["latin"]`, `display: swap` (padrão do `next/font`). 12 arquivos `.woff2` (388 KB
  somados) — divididos por `unicode-range`, então o navegador baixa só os intervalos de caractere
  realmente usados na página, nunca os 388 KB de uma vez.
- **Áudio**: zero arquivos de áudio no projeto — todo som é sintetizado em tempo real via Web Audio
  API (`features/design-system/motion/sound.ts`, osciladores + envelope), opt-in (desligado até o
  usuário ativar), carregado sob demanda (`AudioContext` só é criado no primeiro som tocado). As
  Seções 28-30 do briefing (tamanho de arquivo, preload, formato) são estruturalmente inaplicáveis
  aqui — não existe asset para otimizar.
- **Imagens de conteúdo**: só UMA imagem real no projeto inteiro (`logo-mark.png`) — o resto do
  visual (grafismos, glows, grids) é CSS puro ou WebGL procedural, nunca uma imagem carregada.
- **`npm audit`**: 5 vulnerabilidades (3 moderadas, 1 alta, 1 crítica), todas em `devDependencies`
  (cadeia do Vitest — ver `docs/SECURITY.md`, correção de contagem desta mesma fase). Nenhuma nova
  em relação à Etapa 29.
- **`public/`**: continha 5 SVGs padrão do `create-next-app` (`next.svg`, `globe.svg`,
  `window.svg`, `vercel.svg`, `file.svg`) nunca referenciados por nenhum código — confirmado por
  busca.

## 2. Priorização dos gargalos (Seção 2 do briefing: "não otimizar no escuro")

Ordenados pelo impacto medido, não por intuição:

1. **LCP mobile (5,9s) causado por atraso de pintura do H1**, não pelo tamanho de nenhum asset —
   o maior gargalo real.
2. **Imagem do logo 15-25x maior que o necessário** — baixo esforço, alto ganho percentual,
   afeta toda página.
3. **WebGL inicializando de forma síncrona no momento mais concorrido do carregamento** — mesma
   causa raiz do item 1 (contenção de main thread), mitigável sem custo visual.
4. **Assets mortos em `public/`** — impacto real desprezível (nunca são baixados), mas
   higiene válida encontrada durante a auditoria.

Tudo o resto auditado nesta fase (Seções 3-16 abaixo) já estava correto desde fases anteriores —
listado como CONFIRMADO, não como pendência.

## 3. Bundle JS — auditoria

Ferramenta usada: inspeção manual dos chunks gerados (`.next/static/chunks`, tamanhos + grep pelo
conteúdo para identificar bibliotecas) e dos `<script>` referenciados no HTML de cada rota — não
`@next/bundle-analyzer`. Ele foi instalado experimentalmente e decidido contra (ver
`docs/DECISIONS.md`, "[PERFORMANCE] `@next/bundle-analyzer` avaliado e não adicionado"):
desproporcional para uma medição pontual, e sua instalação chegou a reescrever boa parte do
`package-lock.json` como efeito colateral.

Achados:

- **`three` isolado num chunk de 496 KB, carregado só via `next/dynamic({ssr:false})`** — nunca no
  bundle inicial de nenhuma rota. Confirmado pelo HTML da Home não referenciar esse chunk.
- **GSAP + ScrollTrigger somam ~136 KB** (dois chunks, 44 KB + 64-72 KB conforme a rota) — parte do
  carregamento inicial das rotas que usam motion (Home), o que é esperado e correto: a Home
  DEPENDE de GSAP desde o primeiro frame para a entrada de cena/scroll.
- **Nenhum Client Component "acidental" na raiz de uma página** — toda página em `app/` é Server
  Component (confirmado lendo a primeira linha de cada `page.tsx`/`layout.tsx`: nenhuma tem
  `"use client"`); a interatividade (GSAP, Lenis, cursor, analytics) vive isolada em componentes
  folha, nunca promovendo a página inteira a client (Seções 5/6/70 do briefing já satisfeitas por
  construção desde a Fase 6).
- **Nenhuma dependência não utilizada** — reconfirmado nesta fase (mesma checagem da Etapa 29,
  repetida porque o pacote é auditado sempre que a árvore de dependências muda).
- **Sem código duplicado óbvio** — os chunks compartilhados (React/Next runtime) aparecem uma única
  vez; motion/GSAP/Lenis não têm segunda cópia em nenhum outro chunk.

Nenhuma mudança de bundling foi necessária — a arquitetura de code-splitting já estava correta.

## 4. Imagens

Auditoria completa (`find public -iname "*.png" -o -iname "*.svg" ...`): só duas categorias de
arquivo existem — `logo-mark.png` (única imagem de conteúdo real) e ícones SVG do scaffold do
`create-next-app`, nunca usados.

**Correção aplicada**: os 3 usos de `<Image src="/logo-mark.png">` (`SiteHeader.tsx`,
`BuilderNavigation.tsx`, `app/admin/(protected)/layout.tsx`) tinham `width={556} height={731}` — o
tamanho do ARQUIVO-fonte, não do que é exibido (`height: 26px`/`22px`/`20px` respectivamente, via
CSS). O otimizador do `next/image` monta um `srcSet` baseado no `width` informado (não no CSS
final), então pedia até 1200px de largura para um logo nunca maior que ~26px na tela — e como não
amplia além da fonte, o resultado prático era sempre servir o PNG original inteiro.

Corrigido para as dimensões intrínsecas reais (2x o tamanho exibido, para nitidez em telas
retina): `40×52`, `33×44`, `30×40`. Resultado medido (`curl` contra build de produção):

| | Antes | Depois | Redução |
| --- | --- | --- | --- |
| Candidato 1x | 31.186 bytes | 1.169 bytes | ~96% |
| Candidato 2x (o que a maioria das telas retina baixa) | 31.186 bytes | 2.223 bytes | ~93% |

O arquivo-fonte (`public/logo-mark.png`, 556×731, 176 KB) continua intocado — `app/icon.tsx`,
`app/apple-icon.tsx` e `app/opengraph-image.tsx` o leem diretamente (`readFile`, não via
`next/image`) para gerar favicon/OG em alta resolução, onde o tamanho grande é necessário.

**Formato**: `next/image` já negocia AVIF/WebP automaticamise por padrão conforme o `Accept` do
navegador (Seção 35 do briefing) — nenhuma configuração adicional necessária.

**Prioridade/lazy**: os 3 usos do logo são `priority` (cabeçalho, sempre acima da dobra, correto —
Seção 33) — nenhuma outra imagem de conteúdo existe no projeto para avaliar lazy loading (Seção
34), porque não há nenhuma imagem abaixo da dobra.

**Cleanup**: os 5 SVGs não utilizados do `create-next-app` foram removidos de `public/`.

## 5. Fontes

`next/font/google` (Montserrat + Inter), já em uso desde a Fase 18/19 — auditado, não alterado:

- Self-hospedadas (nenhuma requisição a `fonts.googleapis.com` em tempo de execução).
- `subsets: ["latin"]` — nenhum subset extra desnecessário.
- Montserrat limitada a 3 pesos (`500/600/700`, os únicos usados pelo Design System); Inter usa o
  arquivo variável padrão (cobre todos os pesos com um único arquivo, mais eficiente que declarar
  pesos fixos para uma fonte que já é variável).
- `display: swap` (padrão do `next/font`) — sem texto invisível por tempo longo (Seção 43).
- 12 arquivos `.woff2` (388 KB somados) — divididos por `unicode-range`; o navegador baixa só os
  intervalos que o texto da página realmente usa, nunca o pacote inteiro de uma vez.

Nenhuma mudança necessária — já era a configuração correta.

## 6. GSAP / ScrollTrigger

Auditado: ~10 hooks/componentes usam GSAP (`useHeroScrollMotion`, `useRevealScrollMotion`,
`useCapabilitiesScrollMotion`, `SceneTransition`, `Drawer`, `DeckTransition`, `SmoothScrollProvider`
+ testes). Cada seção da Home tem NO MÁXIMO uma timeline/ScrollTrigger própria — nunca dezenas
(Seção 18 do briefing). `gsap.context()` é usado consistentemente para cleanup automático
(`ctx.revert()` no unmount) — nenhum listener/timeline órfão encontrado.

**Correção aplicada**: a entrada do Hero ao montar (badge → título → subtítulo → CTAs) usava
`gsap.set(opacity:0)` + `.timeline()` dentro de um `useEffect` — pura decoração, não ligada a
scroll. Como o H1 é o elemento de LCP real da Home, esconder esse conteúdo via JS até a hidratação
completar era exatamente a causa do "element render delay" de 2,2s medido na baseline. Migrada
para `@keyframes` em CSS puro (Seção 75 do briefing: "microinterações simples devem preferir CSS
quando mais barato que GSAP"), reaproveitando os MESMOS tokens de duração/easing/stagger que
`motionConfig.ts` já espelhava (`--ds-duration-slow`, `--ds-easing-emphasized`, `--ds-stagger-sm/
md`) — coreografia visual idêntica (mesmos tempos, mesma curva), sem nenhum JavaScript no caminho
crítico de renderização. A parte scroll-linked do Hero (o conteúdo "abrindo espaço" conforme rola,
`gsap.matchMedia()` + `scrub`) continua em GSAP, porque É genuinamente ligada a scroll — não um
candidato a CSS puro.

O restante das timelines de entrada (`useRevealScrollMotion`, usada por Projetos/CTA final) foi
mantido como está: são gated por `ScrollTrigger` real (`toggleActions: "play none none none"`, só
disparam quando a seção entra na tela) — não competem pelo LCP inicial da forma que o Hero
competia, porque essas seções ficam abaixo da dobra.

**ScrollTrigger refresh**: só chamado em `window.addEventListener("load", ...)` e nos `return` de
cleanup dos efeitos — nenhum refresh em loop encontrado (Seção 19).

**Pinning**: usado só em `CapabilitiesSection` (confirmado no código-fonte); revisado na fase de
Scroll Storytelling original, sem mudanças nesta fase.

## 7. Lenis (smooth scroll)

`SmoothScrollProvider.tsx` já implementa exatamente o padrão recomendado (Seção 22/23 do
briefing), auditado sem necessidade de mudança:

- **RAF único**: `lenis.raf()` é chamado a partir do `gsap.ticker`, nunca um `requestAnimationFrame`
  próprio do Lenis rodando em paralelo.
- **`gsap.ticker.lagSmoothing(0)`** enquanto o Lenis está ativo, evitando o "salto" de
  compensação de atraso do GSAP brigar com a interpolação própria do Lenis.
- **Desabilitado por completo** (nem instancia) sob `prefers-reduced-motion` e fora das rotas
  elegíveis (Builder/Admin usam scroll nativo, nunca dependem do Lenis para funcionar).
- **Fallback**: se `new Lenis()` lançar por qualquer motivo, o scroll nativo do navegador continua
  funcionando (`catch` deixa a instância `null`).

Nenhum custo relevante detectado nem alteração necessária.

## 8. WebGL / Three.js

Auditoria completa de `UpgradeLogo3D.tsx` e `ProceduralAura.tsx` — a maioria das exigências do
briefing (Seções 8-16, 108-113) já estava implementada desde a Fase 3D/WebGL:

| Exigência (briefing) | Status encontrado |
| --- | --- |
| Carregar só onde usado | ✅ `next/dynamic({ssr:false})`, código isolado em `features/design-system/webgl/` |
| Lazy init próximo da viewport | ✅ `ProceduralAura` só monta via `useInViewport` (CTA final, abaixo da dobra) |
| Pausar fora da viewport | ✅ `UpgradeLogo3D` usa `IntersectionObserver` interno (`isInView`); `ProceduralAura` desmonta por completo (unmount real, libera memória) |
| Pausar com `document.hidden` | ✅ os dois componentes checam `document.hidden` dentro do próprio `tick`, nunca via hook React "congelado" |
| Limitar `devicePixelRatio` | ✅ `getSafePixelRatio()` — teto 2 (desktop) / 1.5 (mobile/ponteiro grosso), nunca o DPR bruto do dispositivo |
| Mobile mais leve | ✅ teto de DPR menor; nenhuma partícula/efeito extra ligado só no desktop via `isFinePointer` |
| Dispose no cleanup | ✅ `renderer.dispose()`, `geometry.dispose()`, `material.dispose()` em ambos, sempre no `return` do `useEffect` |
| Fallback obrigatório | ✅ gradiente CSS (`.heroGraphicFallback`/`.finalGraphicFallback`) sempre visível por baixo; canvas só cobre quando WebGL monta com sucesso |
| Reduced motion | ✅ um frame estático (sem `requestAnimationFrame`) em vez de desligar o efeito inteiro |
| Fingerprinting/coleta | ✅ não aplicável — sem uploads, sem GLB/GLTF externos, geometria 100% procedural |

**Correção aplicada** (a única lacuna real encontrada): `UpgradeLogo3D` já era `next/dynamic`, mas
seu `useEffect` criava o `THREE.WebGLRenderer` e construía a geometria de forma SÍNCRONA assim que
o componente montava — competindo pelo main thread no momento mais sensível do carregamento
(mesma janela de tempo que a hidratação/GSAP/Lenis). Adiado com `requestIdleCallback` (fallback
`setTimeout(200ms)` para navegadores sem suporte, ex. Safari) — o gradiente CSS já preenche o
espaço o tempo todo, então não há nenhuma mudança visual, só uma mudança de QUANDO o trabalho pesado
acontece.

**Texturas/GLB/GLTF**: não aplicável — nenhum modelo externo é carregado; a geometria do monograma
é gerada por código (`buildUpgradeMonogramGeometry.ts`). Seções 14/15 do briefing (compressão de
textura) não têm o que auditar aqui.

**Shaders**: `ProceduralAura` usa um único par vertex/fragment shader, sem múltiplas passagens,
sem loops pesados de ruído — revisado, dentro do orçamento razoável para um efeito de fundo sutil.

## 9. Áudio

Zero arquivos de áudio — síntese via Web Audio API, opt-in, sem preload algum (ver Seção 1). As
Seções 28-30 do briefing são estruturalmente satisfeitas por não existir asset para otimizar.

## 10. React — renders e state

Auditado (Builder, cursor, analytics, motion state, Meu Upgrade):

- `questionsByService`/`SERVICES` são constantes de módulo, nunca recriadas a cada render (Seção
  56 do briefing já satisfeita).
- Interações de ponteiro pesadas (`useTilt`, `useMagneticHover`, `CustomCursor`,
  `UpgradeLogo3D`/`ProceduralAura`) leem a posição do mouse numa variável simples e aplicam no
  próprio `requestAnimationFrame`/render loop — nenhuma delas dispara `setState` a cada
  `mousemove` (Seção 24/25 do briefing já satisfeita desde a Fase Microinterações/3D-WebGL).
  Listeners de `pointermove` usam `{ passive: true }` (Seção 27).
- `useMemo`/`useCallback` usados com moderação (4 arquivos no total) — nenhum sinal de
  memoização defensiva espalhada sem necessidade (Seção 53).
- Nenhum estado global usado para algo puramente local (Seção 54) — `LeadContext`/`BuilderContext`
  cobrem exatamente o estado que precisa sobreviver entre telas; motion/cursor usam estado local ou
  variáveis de módulo conforme o escopo real.

Nenhuma mudança necessária nesta fase.

## 11. Supabase / banco de dados

Auditoria de queries e índices (reconfirmando o que a Etapa 29 já havia revisado, agora com foco
em performance, não segurança):

- **Nenhum `SELECT *`** — `listLeads`/`getLeadById` usam `ADMIN_LEAD_COLUMNS`, uma lista explícita
  de colunas; `getAdminLeadCounts` usa `select("id", { count: "exact", head: true })` (só a
  contagem, nunca as linhas).
- **Sem N+1**: a Home do admin faz exatamente 3 consultas (`listLeads`, `getAdminLeadCounts`,
  `getAnalyticsOverview`), disparadas em paralelo via `Promise.all` — nunca uma consulta por item
  de uma lista.
- **Paginação**: `listLeads` já limita a 20 por página (teto de 100), via `.range()` — nunca
  carrega a tabela inteira.
- **Índices existentes** (revisados, todos já criados em fases anteriores):
  `upgrade_leads (created_at desc)`, `upgrade_leads (status)`, `upgrade_leads (lead_score desc)`,
  `upgrade_lead_status_history (lead_id, created_at desc)`, `upgrade_lead_notes (lead_id,
  created_at desc)`, `analytics_events (session_id, created_at)`, `analytics_events (event_name,
  created_at)`, `analytics_events (created_at desc)`.
- **Índice avaliado e intencionalmente NÃO criado**: `lead_score_tier` (cardinalidade baixíssima —
  só 4 valores possíveis) e o filtro `project->services` (JSONB, containment). No volume de dados
  esperado para o CRM de uma agência (dezenas a poucos milhares de leads, não milhões), um índice
  aqui não tem evidência de necessidade real — briefing, Seção 62: "não criar índice em tudo,
  adicionar apenas onde consulta justificar". Revisitar se/quando o volume real justificar
  (`docs/IMPLEMENTATION-STAGE-30.md`, pendências).
- **Analytics**: `recordEvent` (Server Action) nunca é `await`ado de forma bloqueante pela UI —
  disparado e esquecido (`trackEvent`/`trackFunnelMilestone` são funções síncronas que chamam a
  Server Action sem aguardar), então uma falha ou lentidão de rede no analytics nunca atrasa a
  navegação do usuário (Seções 64/65 do briefing já satisfeitas desde a Fase 17).

Nenhuma mudança de schema/índice foi necessária.

## 12. Hydration

- Nenhuma página raiz é Client Component (ver Seção 3) — hidratação fica restrita às ilhas que
  realmente precisam (header, formulários, motion, WebGL).
- Nenhum hydration mismatch conhecido — os hooks que dependem de `window`/media queries
  (`useInViewport`, `useReducedMotion`, `useFinePointer`) sempre inicializam com um valor seguro
  igual em servidor e cliente (`false`/sem suporte), nunca calculado a partir de uma API só do
  browser já no primeiro render (lição registrada em `docs/DECISIONS.md` desde a Fase 3D/WebGL).

## 13. CSS / GPU

- Animações de fundo (`AnimatedBackground.module.css`, Builder) já usam só `transform`
  (`translate3d`) — nunca `background-position`, mais barato para o navegador compositar.
  `will-change: transform` aplicado a 3 elementos com animação contínua e infinita (não dezenas —
  Seção 77 do briefing já satisfeita).
- `backdrop-filter: blur(10px)` usado uma única vez (`SiteHeader`, cabeçalho fixo) — elemento
  único, não animado quadro a quadro, custo aceitável (Seção 78/79).
- Nenhum `box-shadow` grande e animado encontrado (Seção 81).
- Nenhuma divisão de texto em dezenas de `<span>` para animação letra a letra em lugar nenhum do
  projeto (Seção 83) — as animações de texto existentes atuam no bloco inteiro (título/parágrafo),
  nunca caractere por caractere.

Nenhuma mudança necessária.

## 14. Prefetch / cache

- Nenhum `<Link prefetch={false}>` nem configuração customizada — todo link usa o prefetch padrão
  do Next.js (rotas estáticas são pré-buscadas quando o link entra na viewport). Como `/builder` é
  uma rota estática (`○` na tabela de build) e é o CTA principal do site, o comportamento padrão já
  cobre a Seção 93 do briefing sem precisar de configuração extra.
- `Save-Data`/`navigator.connection`: avaliado e não implementado — é uma API experimental, com
  suporte inconsistente entre navegadores (a própria Seção 89 do briefing pede para "não depender
  de APIs experimentais frágeis"). Sem uma necessidade concreta medida que justifique o custo de
  manutenção de um caminho de código condicional a mais, fica como pendência de baixa prioridade.

## 15. Performance budget (proposto, baseado nas medições desta fase — não um número inventado)

| Item | Orçamento | Situação atual |
| --- | --- | --- |
| JS inicial da Home (não comprimido) | ≤ 1,3 MB | ~1,12 MB ✅ |
| Imagem crítica (logo, `priority`) | ≤ 5 KB por candidato de `srcSet` | ~2,2 KB (2x) ✅ |
| Fontes totais servidas por página | ≤ 150 KB (subconjuntos realmente usados) | dentro do orçamento (subsets latin, `unicode-range`) ✅ |
| Scripts de terceiro carregados sem consentimento | 0 | 0 (GA4/Meta Pixel gated por consentimento, Etapa 28) ✅ |
| LCP desktop | ≤ 1,0 s | 0,4 s ✅ |
| LCP mobile (throttled) | ≤ 3,0 s (meta, não atingida ainda) | 5,5 s ⚠️ pendente |
| TBT mobile (throttled) | ≤ 300 ms (meta) | 550 ms ⚠️ pendente |

## 16. Fora do escopo desta fase (observado, não corrigido)

O Lighthouse também reportou Accessibility 96 e Best Practices 96 (não 100) em ambos os presets —
um problema de contraste de cor (`color-contrast`) e um item nos "DevTools Issues". Nenhum dos dois
é uma questão de PERFORMANCE — documentado aqui só por transparência (o relatório os mostra), mas
tratá-los pertence a uma fase de acessibilidade/qualidade, não a esta.

---

Ver `docs/IMPLEMENTATION-STAGE-30.md` para o resumo técnico completo (antes/depois, arquivos
alterados, testes, pendências para a Etapa 31).
