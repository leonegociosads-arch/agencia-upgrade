# IMPLEMENTATION STAGE 26 — 3D, WebGL, GLSL

> Ver `docs/ADVANCED-VISUALS.md` para a justificativa completa de cada ponto escolhido. Este
> documento é o resumo técnico: dependências, componentes, shaders, assets, performance,
> limitações e pendências.

## 1. Dependências novas

- `three` (`^0.169.0`) — única biblioteca 3D/WebGL do projeto. Sem `@react-three/fiber`/`drei`
  (ver `docs/DECISIONS.md`).
- `@types/three` (dev).

## 2. Componentes/arquivos novos

`features/design-system/webgl/`:

- `webglSupport.ts` — `hasWebGL()` (cacheado) + `resetWebGLSupportCache()` (testes).
- `useInViewport.ts` — hook de lazy-mount/pause via `IntersectionObserver`, aceita `externalRef`.
- `pixelRatio.ts` — `getSafePixelRatio(isCoarsePointer)`.
- `buildUpgradeMonogramGeometry.ts` — geometria procedural do monograma (função pura, testável sem
  WebGL real).
- `UpgradeLogo3D.tsx` / `.module.css` — Efeito 1 (Hero).
- `ProceduralAura.tsx` / `.module.css` — Efeito 3 (CTA final).
- `shaders/proceduralAura.ts` — GLSL (vertex + fragment), uniforms e cores de marca.
- Testes: `webglSupport.test.ts`, `pixelRatio.test.ts`, `buildUpgradeMonogramGeometry.test.ts`,
  `useInViewport.test.tsx`, `UpgradeLogo3D.test.tsx`, `ProceduralAura.test.tsx` — 26 testes novos.

## 3. Arquivos alterados

- `features/site/components/home/HeroSection.tsx`/`.module.css` — `.heroGraphic` vira só o
  envelope de posição; `.heroGraphicFallback` (novo) carrega o gradiente/`clip-path` original;
  `UpgradeLogo3D` (via `next/dynamic({ssr:false})`) monta por cima. **Removido**: `useAvoidCursor`
  neste elemento (a interação-surpresa da Fase Microinterações) — a peça 3D agora tem sua própria
  reação ao cursor, e as duas não fazem sentido simultaneamente no mesmo objeto (ver
  `docs/DECISIONS.md`).
- `features/site/components/home/FinalCtaSection.tsx`/`.module.css` — mesmo padrão:
  `.finalGraphic` vira envelope, `.finalGraphicFallback` guarda o visual original,
  `ProceduralAura` monta condicionado a `useInViewport("200px", sectionRef)`.
- `package.json`/`package-lock.json` — `three`/`@types/three`.

## 4. Shaders

Um shader customizado nesta fase: `proceduralAura.ts` (vertex simples de passthrough + fragment
com `hash`/`valueNoise`/`fbm` de 4 oitavas, vinheta radial, mistura entre as duas cores de marca).
Uniforms: `uTime`, `uResolution`, `uMouse`, `uColorA`, `uColorB` — nomeados exatamente como o
briefing pede (Seção 40). Nenhum outro shader customizado nesta fase (o logo usa só
`MeshStandardMaterial`, sem GLSL próprio).

## 5. Assets

Nenhum. Nenhum modelo `.glb`/`.gltf`, nenhuma textura — geometria e shader 100% procedurais (ver
justificativa em `docs/ADVANCED-VISUALS.md`, Seção 2).

## 6. Fallback e SSR

Ambos os componentes são importados via `next/dynamic(() => import(...), { ssr: false })` a partir
de um Client Component já existente (`HeroSection.tsx`/`FinalCtaSection.tsx`) — nunca executam no
servidor. `hasWebGL()` decide se sequer tenta criar um `WebGLRenderer`; a própria criação está
dentro de um `try/catch` (proteção adicional contra falha de driver/GPU mesmo quando `hasWebGL()`
disse que sim) — qualquer falha (na criação OU um `webglcontextlost` depois) faz o componente
retornar `null`, deixando só a camada CSS de fallback (que nunca é removida do DOM).

## 7. Bug de hydration encontrado e corrigido

Uma primeira versão de `useInViewport` calculava o estado inicial via
`useState(() => typeof IntersectionObserver === "undefined")` — parecia resolver um aviso de lint
(`react-hooks/set-state-in-effect`) sem custo, mas quebrava o SSR: no servidor (Node, sem
`IntersectionObserver`) essa expressão é `true`; no primeiro render do cliente (browser, COM
`IntersectionObserver`) é `false` — um mismatch de hydration de verdade, reproduzido com Playwright
(`Hydration failed because the server rendered HTML didn't match the client`) logo na primeira
verificação manual desta fase. Corrigido voltando o estado inicial para sempre `false` (idêntico
em servidor e cliente) e resolvendo a ausência de `IntersectionObserver` (praticamente inexistente
em navegadores modernos) como "nunca ativa o efeito" em vez de "ativa direto" — um fallback mais
conservador, mas seguro. Ver `docs/DECISIONS.md`.

## 8. Performance

- **Bundle**: `three` isolado em chunk próprio (~493KB não comprimido, medido em
  `.next/static/chunks/` após `next build`) — nunca faz parte do JS inicial da rota `/`; só é
  buscado depois que `HeroSection` monta no cliente (Efeito 1) ou quando o CTA final está a 200px
  da viewport (Efeito 3).
- **Rotas**: tabela de rotas do `next build` inalterada (mesmas 10 rotas de antes desta fase) —
  nenhuma virou dinâmica por causa do WebGL.
- **Runtime**: `devicePixelRatio` limitado (2 desktop / 1.5 touch); loop de render pausado fora da
  viewport e com a aba em segundo plano (verificado via listeners de `IntersectionObserver`/
  `visibilitychange`, nunca um hook React referenciado direto dentro do loop — teria ficado
  "congelado" no valor de quando o efeito foi montado).
- **Sem Lighthouse formal nesta sessão** (sem acesso a essa ferramenta no ambiente) — comparação
  feita via inspeção do bundle (chunk isolado) e via Playwright (sem erros de console, sem travar
  scroll/clique em nenhum fluxo testado, incluindo com o Lenis da Fase Smooth Scroll ativo na
  Home).

## 9. Verificação manual

Playwright cobrindo: Hero desktop (canvas presente, ~480×480, atrás do header), CTA final
(segundo canvas aparece ao rolar até o fim), reduced motion (canvas ainda presente — versão
estática, não removida), mobile real (`devices["iPhone 13"]`, canvas presente, sem travar toque),
WebGL forçadamente indisponível (`getContext` mockado para retornar `null` via
`page.addInitScript` — zero canvas, só o fallback CSS), navegação Home → Builder → voltar (sem
erros de console, cleanup correto). Screenshots conferidos visualmente para checar que o monograma
lê como um "U" abstrato em prata/verde e que a aura do CTA fica discreta atrás do texto.

## 10. Limitações

- A geometria do monograma é uma **interpretação livre**, não uma reprodução pixel-perfect do PNG
  da marca — duas lâminas curvas abstratas nas cores certas, não uma extrusão do contorno exato do
  logotipo (que exigiria vetorizar o PNG, fora do escopo desta sessão).
- Nenhum teste em GPU/dispositivo físico de verdade — só emulação Chromium via Playwright, como em
  todas as fases anteriores.
- Sem Lighthouse formal (ver Seção 8).
- Shader de transição de cases não implementado (conteúdo real ainda não existe — ver
  `docs/ADVANCED-VISUALS.md`, Seção 3).

## 11. Revisão técnica

- **Lint**: 0 erros, 0 avisos.
- **Typecheck**: 0 erros.
- **Testes**: **559/559 passando** (eram 533 ao final da Fase Smooth Scroll; 26 novos nesta fase).
- **Build**: sucesso; tabela de rotas inalterada.

## 12. Pendências para a Etapa 27

- Shader de transição entre imagens de projeto (`ImageDissolveTransition` ou equivalente) — só faz
  sentido quando os primeiros cases reais da Upgrade existirem no repositório; a arquitetura de
  `features/design-system/webgl/shaders/` já está pronta para receber esse componente no mesmo
  padrão de `ProceduralAura`.
- Lighthouse formal (LCP/CLS/TBT/INP) comparando antes/depois desta fase, se a ferramenta estiver
  disponível numa sessão futura.
- Teste em GPU/dispositivo físico (mobile de verdade, não só emulação).
- Refinamento opcional da geometria do monograma, se algum dia um asset vetorial/`.glb` real da
  marca for disponibilizado.
