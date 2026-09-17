# IMPLEMENTATION STAGE 25 — Smooth Scroll / Lenis

> Ver `docs/SMOOTH-SCROLL.md` para a explicação completa de cada decisão. Este documento é o
> resumo técnico da implementação, problemas encontrados e pendências.

## 1. Arquivos novos

- `features/design-system/motion/smoothScrollConfig.ts` — `LENIS_OPTIONS` (config moderada) e
  `isSmoothScrollRoute(pathname)` (exclui `/builder`, `/admin`, `/design-system`).
- `features/design-system/motion/SmoothScrollProvider.tsx` — provider único (`app/layout.tsx`),
  cria/destrói Lenis por rota elegível, integra com `gsap.ticker`/`ScrollTrigger`, expõe
  `useSmoothScroll()`.
- `features/design-system/motion/useScrollLock.ts` — trava/libera o scroll da página por trás de
  um overlay; autocontido (funciona com ou sem Lenis).
- `features/design-system/motion/scrollToSection.ts` — helper de scroll programático preparado
  (nenhum consumidor ainda — ver Pendências).
- `SmoothScrollProvider.test.tsx`, `useScrollLock.test.tsx` — 11 testes novos.

## 2. Arquivos alterados

- `app/layout.tsx` — envolve `{children}` em `<SmoothScrollProvider>`.
- `app/globals.css` — `scroll-padding-top: 88px` em `html` (compensação do header sticky para
  hash nativo do Next.js).
- `features/site/components/SiteHeader.tsx` — `useScrollLock(menuOpen)` no menu mobile.
- `features/builder/components/BuilderShell.tsx` — `useScrollLock(showMyUpgrade &&
  canShowMyUpgradePanel)` no drawer "Meu Upgrade"; `canShowMyUpgradePanel` movido para antes do
  `return` antecipado de hidratação (regra dos Hooks — precisa ser calculado antes de qualquer
  `useScrollLock`/`useState` condicional).
- `vitest.setup.ts` — polyfill de `ResizeObserver` (Lenis usa via `autoResize`; mesmo raciocínio
  do polyfill de `matchMedia` já existente desde a Fase GSAP e Transições).
- `package.json`/`package-lock.json` — nova dependência `lenis` (`^1.3.26`).

## 3. Configuração do Lenis

Ver `docs/SMOOTH-SCROLL.md`, Seção 3. Resumo: `lerp: 0.1`, `wheelMultiplier: 1`,
`touchMultiplier: 1`, `syncTouch: false`, `smoothWheel: true`, `anchors: false` — configuração
moderada, scroll real do `window` (não virtual/`transform`), sem necessidade de
`ScrollTrigger.scrollerProxy()`.

## 4. Integração GSAP/ScrollTrigger

Um só RAF: `gsap.ticker.add((time) => lenis.raf(time * 1000))` (nunca o loop próprio do Lenis).
`lenis.on("scroll", ScrollTrigger.update)` sincroniza cada frame da suavização com os triggers já
existentes (`useHeroScrollMotion`, `useCapabilitiesScrollMotion`, `useRevealScrollMotion`) —
nenhum desses hooks precisou de qualquer alteração. `gsap.ticker.lagSmoothing(0)` enquanto Lenis
está ativo, restaurado ao padrão da lib no cleanup.

## 5. Comportamento desktop

Mouse wheel e trackpad suavizados via `smoothWheel: true`. Verificado manualmente (Playwright,
`page.mouse.wheel()`) que após um único evento de wheel o `scrollY` cresce **gradualmente** ao
longo de vários frames (`227 → 496 → 721 → 878 → 984 → 1041`, assentando em `1195`) — confirma
suavização real, não um salto instantâneo disfarçado.

## 6. Comportamento mobile

`syncTouch: false` deixa o touch inteiramente nativo — nenhuma simulação de inércia própria do
Lenis. Verificado com emulação real de dispositivo (`devices["iPhone 13"]`, Playwright) que um
toque + scroll na Home responde imediatamente (`scrollY` mudou de `0` para `~114` num único gesto,
sem atraso perceptível no teste).

## 7. Scroll lock

`useScrollLock(active)` — `overflow: hidden` + compensação de `padding-right` (largura da
scrollbar) no `body`, com `lenis.stop()`/`lenis.start()` como reforço quando há instância.
Verificado manualmente nos dois pontos de uso:

- Menu mobile da Home: abrir → `body.style.overflow === "hidden"`; fechar → volta a `""`.
- Drawer "Meu Upgrade" do Builder: mesmo comportamento, sem nenhuma instância de Lenis disponível
  (rota excluída) — confirma que o lock não depende do Lenis para funcionar (Seção 4 do briefing).

## 8. Anchors / hash da URL

**Não implementado em JS próprio** — decisão tomada após checar
`node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` (instrução do
`AGENTS.md`/`CLAUDE.md`: revisar a documentação real do Next.js antes de escrever código, já que
esta versão tem comportamento diferente do treinamento). O Next.js 16 já resolve `#id` nativamente
(`scrollIntoView()`, tanto no carregamento quanto em navegação por `<Link>`) e documenta
`scroll-padding-top` como a forma correta de compensar um header sticky nesse cenário — replicar
isso em JavaScript própio arriscaria os dois mecanismos brigarem pelo mesmo scroll. Uma primeira
versão desta fase chegou a implementar esse tratamento dentro do `SmoothScrollProvider`
(`setTimeout` + `lenis.scrollTo` no mount, reagindo a `window.location.hash`) e foi revertida por
esse motivo antes de chegar a testes — ver `docs/DECISIONS.md`.

## 9. Reduced motion

`enabled = isSmoothScrollRoute(pathname) && !useReducedMotion()` — com `prefers-reduced-motion:
reduce`, Lenis nunca chega a ser instanciado (não "reduz a suavização"). Confirmado por teste
automatizado e por Playwright (`emulateMedia`) que a classe `lenis` nunca aparece em `<html>`
nesse caso.

## 10. Performance

- Um só RAF (`gsap.ticker`), sem o loop interno do Lenis (`autoRaf` nunca é passado).
- `ScrollTrigger.refresh()` no `window.load`; resize já é automático no próprio ScrollTrigger.
- Cleanup completo (ticker, `lagSmoothing`, `lenis.destroy()`, refresh) a cada troca de rota —
  confirmado sem erros em um fluxo real Home → Builder → Home (Playwright, `page.goBack()`).
- Nenhum listener de scroll novo além do já existente (`useScrolled.ts`).

## 11. Problemas encontrados

- **Hash da URL duplicando o Next.js 16** (ver Seção 8) — descoberto ANTES de escrever testes,
  checando a documentação real do framework primeiro (exigência do `AGENTS.md` desta versão
  customizada do Next.js). Removido do `SmoothScrollProvider` a tempo.
- **`react-hooks/set-state-in-effect` no `SmoothScrollProvider`** — uma primeira versão chamava
  `setLenis(null)` como primeira linha do efeito sempre que a rota estava desabilitada. O lint
  (corretamente) apontou que isso é estado **derivado**, não algo que precisa de um efeito: corrigido
  expondo `enabled ? activeInstance : null` calculado direto no corpo do componente, sem nenhum
  `setState` nesse caminho. O `setState` que sobrou (capturar a instância real recém-criada) é
  genuinamente necessário — mesmo padrão já documentado em `Drawer.tsx` (capturar
  `document.activeElement`) — e recebeu o mesmo tipo de comentário de exceção justificada.
- **Hook chamado depois de um `return` condicional** — `useScrollLock` em `BuilderShell.tsx`
  precisou que `canShowMyUpgradePanel` fosse calculado (e o hook chamado) ANTES do `return`
  antecipado do estado de hidratação — movido para o topo do componente, junto dos outros hooks.
- **`ResizeObserver` ausente no jsdom** — mesmo problema que motivou o polyfill de `matchMedia` na
  Fase GSAP e Transições; Lenis usa `ResizeObserver` internamente. Resolvido com um polyfill
  mínimo (observe/unobserve/disconnect no-ops) em `vitest.setup.ts`, só exercitado nos testes que
  forçam o caminho de motion completo.

## 12. Verificação manual

Playwright real (não só jsdom) cobrindo: Home desktop (classe `lenis` presente, scroll suavizado,
`ScrollTrigger` ainda sincronizado — opacidade do título do Hero cai ao rolar), Builder desktop
(sem `lenis`), scroll lock (Meu Upgrade e menu mobile, abrir/fechar), mobile real (`iPhone 13`,
touch nativo responsivo, sem `lenis` desabilitado por isso — a exclusão é só por rota/reduced
motion, nunca por tipo de ponteiro), reduced motion (sem `lenis`), navegação completa Home →
Builder → voltar (Lenis liga/desliga corretamente, zero erros de console/página).

## 13. Lint / typecheck / testes / build

- **Lint**: 0 erros, 0 avisos.
- **Typecheck**: 0 erros.
- **Testes**: **533/533 passando** (eram 522 ao final da Fase Microinterações; 11 novos:
  `SmoothScrollProvider.test.tsx` e `useScrollLock.test.tsx`).
- **Build**: sucesso; tabela de rotas inalterada.

## 14. Pendências para a Etapa 26

- Nenhum link de âncora real existe ainda no site — `scrollToSection.ts` e `scroll-padding-top`
  são infraestrutura preparada, não uma feature em uso; validar visualmente o valor de
  `scroll-padding-top` quando o primeiro âncora real for adicionado.
- Nenhuma velocidade de scroll é exposta para outras animações reagirem (Seção 47/48 do briefing:
  "pode disponibilizar... mas não implementar efeitos exagerados nesta etapa") — `lenis.velocity`/
  `lenis.direction` existem na instância e já estão acessíveis via `useSmoothScroll()` para uma
  fase futura, mas nada os consome hoje.
- Teste em dispositivo físico e em Safari real (só emulação Chromium/Playwright nesta sessão, como
  em todas as fases anteriores).
- `Select` (mencionado como limitação desde a Fase Microinterações) continua sem animação de
  abrir/fechar — não relacionado a esta fase, só reafirmando que não regrediu.
