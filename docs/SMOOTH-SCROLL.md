# SMOOTH SCROLL — Lenis + GSAP + ScrollTrigger

> Fase Smooth Scroll. Objetivo: scroll fluido/premium na Home e páginas institucionais, sem
> alterar UI, sem tocar no Builder, sem WebGL/3D. Ver `docs/IMPLEMENTATION-STAGE-25.md` para o
> resumo técnico da implementação e `docs/SCROLL-STORYTELLING.md`/`docs/MICROINTERACTIONS.md`
> para as fases de motion anteriores que este trabalho integra sem alterar.

## 1. Auditoria inicial

Antes de instalar qualquer coisa, confirmado que:

- Lenis **não existia** no projeto (`npm ls lenis` vazio).
- ScrollTrigger já existia (Fase ScrollTrigger e Storytelling — `useHeroScrollMotion.ts`,
  `useCapabilitiesScrollMotion.ts`, `useRevealScrollMotion.ts`), sempre no `scroller` padrão
  (`window`), nunca um container customizado — importante porque significa que a integração de
  Lenis não precisa de `ScrollTrigger.scrollerProxy()` (ver Seção 3).
- Nenhum smooth scroll anterior existia (nenhuma lib, nenhum `scroll-behavior: smooth` em CSS).
- Nenhum listener de scroll manual espalhado, além de `useScrolled.ts` (reação do header ao
  scroll, Fase Microinterações) — que continua funcionando sem nenhuma mudança, já que Lenis (no
  modo padrão, sem `wrapper` customizado) continua movendo o `window.scrollY` real.
- Nenhum mecanismo de "scroll lock" existia para overlays (Meu Upgrade, menu mobile) — lacuna real
  coberta nesta fase (Seção 6 abaixo).

## 2. Instalação

Única dependência nova: `lenis` (pacote oficial, `^1.3.26`). Usado o pacote **raiz** (`import Lenis
from "lenis"`), não o subcaminho `lenis/react` (`ReactLenis`/`useLenis`) — o provider é escrito à
mão (`SmoothScrollProvider.tsx`) seguindo o mesmo padrão de hooks/providers pequenos já usado no
projeto (`useReducedMotion.ts`, `Drawer.tsx`, `scrollTrigger.ts`), em vez de introduzir uma API de
componente (`<ReactLenis root>`) que não tem paralelo em nenhum outro lugar do código.

## 3. Configuração do Lenis

`features/design-system/motion/smoothScrollConfig.ts`:

```ts
export const LENIS_OPTIONS: LenisOptions = {
  lerp: 0.1,          // padrão da própria lib — testado como o ponto sem "borracha"
  wheelMultiplier: 1,
  touchMultiplier: 1,
  syncTouch: false,   // touch continua 100% nativo (ver Seção 5)
  smoothWheel: true,
  anchors: false,     // hash da URL fica por conta do Next.js (ver Seção 7)
};
```

Nenhum parâmetro exagerado (briefing, Seção 10) — a sensação-alvo é "quase scroll nativo, só sem a
aspereza da roda do mouse", nunca a inércia longa de um site "todo em vidro". `wrapper`/`content`
do Lenis ficam no padrão (`window`/`document.documentElement`) — Lenis move o scroll **real** do
documento (não um scroll virtual via `transform`), por isso `ScrollTrigger` (que já lê
`window.scrollY` por padrão) não precisa de nenhum `scrollerProxy` para continuar funcionando.

## 4. Integração com GSAP e ScrollTrigger (RAF único)

`features/design-system/motion/SmoothScrollProvider.tsx` — um único fluxo de
`requestAnimationFrame`, o do próprio `gsap.ticker` (nunca o RAF interno do Lenis, que fica
desligado por padrão — a lib só ativa o próprio loop se `autoRaf: true`, que nunca é passado aqui):

```ts
const instance = new Lenis(LENIS_OPTIONS);
instance.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => instance.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

- `lenis.raf` é chamado a partir do `gsap.ticker` — não existe um segundo loop de animação
  competindo com o do GSAP (Seção 8 do briefing).
- `lenis.on("scroll", ScrollTrigger.update)` garante que cada frame da interpolação do Lenis
  (não só a posição final) atualiza os triggers — essencial para pins/scrub não ficarem "um frame
  atrás" da suavização (Seções 7/23/24).
- `gsap.ticker.lagSmoothing(0)` evita que o próprio GSAP tente "compensar" um frame lento saltando
  vários pixels de uma vez — o que brigaria visualmente com a suavização do Lenis. Restaurado ao
  padrão da lib (`lagSmoothing(1000, 33)`) no cleanup, para rotas sem Lenis não herdarem esse ajuste
  global sem necessidade.

Nenhuma mudança nos hooks de scroll motion já existentes (`useHeroScrollMotion`,
`useCapabilitiesScrollMotion`, `useRevealScrollMotion`) — eles continuam criando seus próprios
`ScrollTrigger`/`gsap.matchMedia()` exatamente como antes; a única diferença é que a posição de
scroll que alimenta esses triggers agora chega suavizada pelo Lenis nas rotas elegíveis.

## 5. Escopo por rota (Builder e Admin nunca dependem do Lenis)

`isSmoothScrollRoute(pathname)` (`smoothScrollConfig.ts`) exclui por prefixo: `/builder`, `/admin`,
`/design-system`. Fora dessas rotas (Home, `/projetos`, `/privacidade`), Lenis é instanciado
normalmente.

Isso é decidido **dentro** do `SmoothScrollProvider`, montado uma única vez em `app/layout.tsx`
(Seção 51/52 — um só provider, uma só instância viva por vez) — não existe um provider por rota
nem uma árvore de layouts paralela só para isso; `usePathname()` decide, a cada navegação, se a
instância deve existir ou não, e o efeito cria/destrói de acordo.

**Builder**: continua 100% scroll nativo. Suas telas são por cena/clique, não por scroll longo —
não haveria o que suavizar. O painel "Meu Upgrade" (scroll interno do próprio painel,
`overflow-y: auto`) nunca teve e continua sem depender de nada aqui.

**Admin**: mesma lógica — interface funcional, scroll nativo simples, sem necessidade de suavização.

## 6. Scroll lock (overlays)

Não existia nenhum mecanismo antes desta fase — um scroll por trás do menu mobile aberto, ou do
drawer "Meu Upgrade", vazava para a página. `features/design-system/motion/useScrollLock.ts`:

```ts
useScrollLock(active: boolean): void
```

Autocontido: `overflow: hidden` + compensação de `padding-right` (largura da scrollbar, para o
conteúdo não "pular" horizontalmente) é o mecanismo real, funciona em **qualquer** rota. Quando há
uma instância de Lenis disponível (via `useSmoothScroll()`), o hook também chama `lenis.stop()`/
`lenis.start()` como reforço — mas isso é um extra, nunca uma dependência: no Builder (sem Lenis),
o lock funciona exatamente igual, só com `overflow: hidden`.

Ligado em dois lugares:

- `SiteHeader.tsx` — `useScrollLock(menuOpen)` (menu mobile).
- `BuilderShell.tsx` — `useScrollLock(showMyUpgrade && canShowMyUpgradePanel)` (drawer "Meu
  Upgrade" — a mesma condição que já controla o `Drawer`).

Um contador em módulo (`lockCount`) permite dois locks simultâneos sem que fechar um restaure o
scroll cedo demais enquanto o outro ainda está aberto (caso hoje inexistente na prática, mas trivial
de suportar corretamente).

## 7. Anchors / hash da URL

**Decisão**: não implementado em JavaScript próprio. O Next.js 16 mudou o próprio comportamento de
scroll em navegação (ver `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`,
"Scroll Behavior Override") e já resolve `#id` — tanto no carregamento da página quanto em
navegação via `<Link href="/pagina#id">` — usando `scrollIntoView()` nativo (ver
`.../03-api-reference/02-components/link.md`). Duplicar esse tratamento dentro do
`SmoothScrollProvider` (como uma primeira versão desta fase chegou a fazer, com um `setTimeout` +
`lenis.scrollTo`) arriscava os dois mecanismos brigarem pelo mesmo scroll — exatamente o tipo de
"salto"/dessincronização que a Seção 57 do briefing pede para nunca acontecer. Removido em favor do
mecanismo nativo.

Compensação do header sticky (Seção 19): `scroll-padding-top: 88px` em `app/globals.css`, na
`<html>` — é a propriedade CSS que o próprio Next.js documenta para esse exato cenário. Valor
aproximado (a altura real do header é praticamente igual nos dois breakpoints, já que só o padding
horizontal muda em 768px); revisar visualmente quando o primeiro link de âncora de verdade for
adicionado ao site (hoje nenhum existe).

`features/design-system/motion/scrollToSection.ts` continua disponível como infraestrutura
preparada (Seção 31: "helper centralizado") para um scroll programático que **não** passe por
`<Link>` — ex.: um futuro botão "voltar ao topo". Mede a altura real do header via
`getBoundingClientRect()` (nunca um número fixo) e usa `lenis.scrollTo()` quando há uma instância
disponível, caindo para `window.scrollTo()` nativo quando não há.

## 8. Desktop vs. mobile vs. touch

- **Desktop** (mouse/trackpad): `smoothWheel: true` suaviza a roda do mouse. Verificado
  manualmente (Playwright, wheel real) que o `scrollY` cresce **gradualmente** ao longo de vários
  frames após um único evento de wheel — não pula direto para o alvo (ver
  `docs/IMPLEMENTATION-STAGE-25.md`, Seção "Verificação manual").
- **Trackpad**: mesma suavização do mouse wheel — trackpad já tem sua própria inércia nativa do SO;
  como Lenis intercepta o evento de `wheel` (não o gesto do SO diretamente), a soma das duas não
  produziu uma sensação de "excesso" nos testes manuais com a configuração moderada da Seção 3.
- **Touch**: `syncTouch: false` (Seção 3) — decisão deliberada, não omissão. Lenis deixa o scroll
  por toque **inteiramente nativo**, sem nenhuma simulação de inércia própria da lib. Verificado
  (emulação `devices["iPhone 13"]` do Playwright) que um toque/scroll na Home produz a mesma
  resposta imediata de sempre.

## 9. Reduced motion

`SmoothScrollProvider` usa `useReducedMotion()` (mesmo hook de todas as fases anteriores) para
decidir `enabled` — com `prefers-reduced-motion: reduce`, o Lenis **nunca é instanciado** (não
"suaviza menos"): mesmo padrão de "desligar por completo" já usado em `useFinePointer`/`useTilt`/
`CustomCursor` (Fase Microinterações). Confirmado por Playwright (`emulateMedia({ reducedMotion:
"reduce" })`) que a classe `lenis` nunca aparece em `<html>` nesse caso — scroll 100% nativo do
navegador.

(O próprio Lenis 1.x tem um `respectReducedMotion` interno, ligado por padrão, que reduziria o
`lerp` a 1 em vez de desligar — não é o mecanismo usado aqui, mantido como rede de segurança
teórica caso a instância seja criada por engano; a decisão do projeto é desligar por completo,
antes mesmo de o Lenis existir.)

## 10. Performance

- Um só RAF (`gsap.ticker`), nunca o loop próprio do Lenis + o do GSAP ao mesmo tempo.
- `ScrollTrigger.refresh()` chamado no `window.load` (fontes/imagens terminando de carregar,
  Seção 25) — resize já é tratado automaticamente pelo próprio `ScrollTrigger`.
- Nenhum listener de scroll novo: `useScrolled.ts` continua com seu único `window.addEventListener
  ("scroll")`; Lenis intercepta `wheel`/`touch` internamente, sem competir com esse listener.
- Cleanup completo ao desmontar/trocar de rota: remove do `gsap.ticker`, restaura
  `lagSmoothing`, `lenis.destroy()`, `ScrollTrigger.refresh()` — nenhum handler órfão fica
  para trás entre navegações client-side.
- Nested scroll (drawers, `overflow-y: auto` do painel "Meu Upgrade", menus) continuam rolando
  internamente sem interferência — Lenis, no modo padrão (sem `wrapper` customizado apontando para
  um container específico), só ouve `wheel`/`touch` disparados fora desses elementos internos (o
  próprio evento nativo de scroll de um `overflow: auto` não passa pelo listener de nível
  `window`/`document` do Lenis da mesma forma que o scroll da página).

## 11. Dev mode / singleton

Provider único em `app/layout.tsx`, nunca remontado entre navegações (layout raiz do App Router).
Uma nova instância de Lenis só é criada quando `isSmoothScrollRoute(pathname) && !reducedMotion`
muda de valor — nunca duas instâncias vivas ao mesmo tempo. Em React Strict Mode (dev), o
efeito roda uma vez a mais (monta → desmonta → monta de novo) — como o `cleanup` sempre destrói a
instância anterior antes de criar a próxima, o resultado final é sempre uma única instância ativa,
nunca um vazamento.

## 12. Fallback

Se `new Lenis(...)` lançar por qualquer motivo, um `try/catch` no efeito deixa a instância `null` —
o `SmoothScrollContext` expõe `null`, e o scroll nativo do navegador nunca dependeu deste provider
para existir, só para ficar mais suave (testado explicitamente em
`SmoothScrollProvider.test.tsx`).
