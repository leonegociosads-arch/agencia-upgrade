# SCROLL STORYTELLING — Agência Upgrade

> Fase ScrollTrigger e Storytelling do roadmap (Etapa 23). Implementa storytelling controlado por
> scroll na Home — GSAP + `ScrollTrigger`, scroll nativo (sem Lenis, que fica para a Etapa 25). O
> Builder **não** ganha nenhum ScrollTrigger narrativo (briefing, Seção 13/46) — continua com
> navegação por cenas/cliques da Fase GSAP e Transições (Etapa 22). Ver
> `docs/IMPLEMENTATION-STAGE-23.md` para o resumo técnico (arquivos, bugs encontrados, testes).

---

## 1. Auditoria inicial

Nenhum uso de `ScrollTrigger` existia no projeto antes desta fase (`gsap@3.15.0` já estava
instalado desde a Fase GSAP e Transições, mas só o core — `grep -rl "ScrollTrigger"` não encontrou
nada em código-fonte). A Home (`app/page.tsx`) era 4 seções estáticas (Hero, Capacidades,
Projetos/teaser, CTA final) sem nenhum motion de scroll — exatamente as 4 que o próprio briefing
lista como prioritárias (Seção 45: "melhor 4 interações excelentes do que 20 medianas"), então
nenhuma seção nova foi inventada, e nenhuma copy mudou.

## 2. Narrativa da Home

HERO → CAPACIDADES ("O que fazemos") → PROJETOS/PROVA → CONVITE PARA O BUILDER. A Home ainda não
tem uma seção "Posicionamento" nem "Como a Upgrade pensa" (não existiam antes desta fase e o
briefing pede para preservar a copy existente, Seção 10) — o exemplo de narrativa de 6 seções do
briefing é conceitual; com as 4 seções reais, a conexão vem do motion entre elas, não de conteúdo
novo:

- O Hero "abre espaço" ao ser rolado (perde opacidade, desloca para cima, o grafismo aumenta de
  escala) — Seção 4.
- Capacidades entra com uma transição de "abertura" (clip-path + escala, nunca um fade simples —
  Seção 5) e apresenta os 3 serviços em sequência fixada no desktop (Seção 6/12).
- Projetos/Prova é uma revelação simples — ainda não há cases reais para uma apresentação mais rica
  (Seção 15: "não usar scroll horizontal só porque parece sofisticado").
- O CTA final converge com o mesmo grafismo diagonal do Hero, espelhado (Seção 18: "grafismos da
  marca podem atravessar seções... conectar cenas") — um fecho visual que liga a primeira e a
  última cena da rolagem sem nenhum asset novo.

## 3. Seções com ScrollTrigger

Todas as 4 seções da Home (`features/site/components/home/`) — cada uma com seu próprio hook em
`features/site/motion/`:

| Seção | Componente | Hook |
| ----- | ---------- | ---- |
| Hero | `HeroSection.tsx` | `useHeroScrollMotion.ts` |
| Capacidades | `CapabilitiesSection.tsx` | `useCapabilitiesScrollMotion.ts` |
| Projetos/teaser | `ProjectsTeaserSection.tsx` | `useRevealScrollMotion.ts` (genérico) |
| CTA final | `FinalCtaSection.tsx` | `useRevealScrollMotion.ts` (genérico) |

A Home (`app/page.tsx`) continua um Server Component — só cada seção virou Client Component (a
composição de 4 imports simples). O HTML inicial sempre chega completo (Seção 39 do briefing:
"não esconder conteúdo textual essencial de crawlers") — nenhum `gsap.set`/`.from()` roda durante
SSR, só depois de montar no navegador (`useEffect`).

## 4. Pins utilizados

Só **um** — Capacidades, no desktop (`useCapabilitiesScrollMotion.ts`): o título/lead fica fixo
enquanto os 3 cards entram em sequência (briefing, Seção 6: "apresentação sequencial de serviços"
é literalmente um dos exemplos que o briefing lista como caso adequado para pin). Duração do pin
curta (`end: "+=90%"` de um viewport, Seção 7: "pins não podem parecer intermináveis") — o
suficiente para os 3 cards revelarem com stagger sem sensação de scroll vazio.

Nenhum outro pin em nenhuma outra seção — Hero, Projetos e CTA final não têm nenhum caso de "uma
mensagem permanece enquanto o conteúdo muda" que justifique um (Seção 6: "não pin todas as
seções").

## 5. Scrubs utilizados

Nunca `scrub: true` (resposta rígida ao pixel) — sempre um número, que introduz suavização (Seção
9: "scrub suave"), centralizado em `features/design-system/motion/scrollMotionConfig.ts`
(`SCRUB.smooth = 0.6`, `SCRUB.responsive = 0.35`):

- **Hero** (`useHeroScrollMotion.ts`): scrub no deslocamento/opacidade do conteúdo e na escala do
  grafismo, acompanhando o scroll do início ao fim do Hero.
- **Capacidades — transição de entrada** (`.frame`, clip-path + escala): scrub, uma janela curta
  logo antes da seção alcançar o topo.
- **Capacidades — cards fixados** (dentro do pin): scrub mais responsivo (`SCRUB.responsive`), já
  que aqui o usuário está deliberadamente "folheando" os 3 serviços.

Projetos/teaser e CTA final **não** usam scrub — são revelações únicas (`toggleActions: "play none
none none"`), não movimentos de acompanhamento (Seção 8: "não usar scrub em tudo").

## 6. Principais transições

- **Hero → Capacidades** (Seção 5 do briefing: "evitar simples fade"): o Hero perde opacidade e
  desloca para cima enquanto Capacidades entra com um `clip-path` que "abre" a moldura da seção
  (`inset(8% 6% round 28px)` → `inset(0% 0% round 0px)`) combinado com escala 0.96→1 — as duas
  animações são scrubbed na mesma janela de scroll, então parecem uma única transformação, não dois
  efeitos independentes.
- **Capacidades → Projetos/CTA**: sem tratamento especial de "handoff" — cada uma revela por conta
  própria ao entrar na tela (mais contido de propósito, Seção 45: só as transições que realmente
  valem a pena recebem tratamento rico).
- **Hero ↔ CTA final**: o mesmo grafismo diagonal (gradiente + `clip-path` poligonal) aparece nos
  dois extremos da página, espelhado — um "fecho" que não depende de scroll algum, só de repetição
  visual deliberada.

## 7. Desktop vs. mobile

`gsap.matchMedia()` (Seção 28 do briefing) em `useHeroScrollMotion.ts` e
`useCapabilitiesScrollMotion.ts`, breakpoint único do projeto (`DESKTOP_SCROLL_QUERY`/
`MOBILE_SCROLL_QUERY` em `scrollMotionConfig.ts`, mesmos 640px de `getSceneDistance()` da Fase
GSAP e Transições — nunca um segundo número solto):

| | Desktop | Mobile |
| - | ------- | ------ |
| Hero — deslocamento do conteúdo ao rolar | `DISTANCE.scene` (32px) | `DISTANCE.reveal` (16px) |
| Hero — escala do grafismo | 1 → 1.15 | sem escala (só opacidade/deslocamento) |
| Capacidades — cards | pin + scrub, sequência controlada | sem pin, revelação em bloco única |

Nenhuma interação criada nesta fase depende de hover/mouse (Seção 19 do briefing) — a única
diferença real por breakpoint é o pin do desktop virar uma revelação simples no mobile (Seção 30:
"não simplesmente executar a mesma timeline desktop em 360px"). Tablet (768×1024, testado
manualmente) segue o caminho desktop (min-width: 641px) — comporta-se bem com o pin porque a
altura ainda comporta a sequência sem sensação de scroll vazio (Seção 31 do briefing: testado, não
tratado como "desktop pequeno" por acidente, e sim por realmente funcionar igual).

## 8. Reduced motion

`useReducedMotion()` (Fase Motion Design) é checado no topo de **todo** hook de scroll — se
`true`, o `useEffect` retorna sem criar nenhum `ScrollTrigger`/timeline. Como nenhum componente
aplica opacidade/deslocamento via CSS/inline-style fora do que o GSAP aplicaria em tempo de
execução, o resultado é: com motion reduzido, a Home renderiza **inteira, na ordem natural,
sem nenhuma animação** (briefing, Seção 32: "a Home deve continuar completa sem animação") —
verificado via Playwright com `reducedMotion: "reduce"` (título do Hero, os 3 cards de Capacidades
e o CTA final todos com `opacity: 1` imediatamente, sem precisar rolar).

## 9. Performance

- Toda animação usa só `transform`/`opacity`/`clip-path` (nunca `top`/`left`/`width`/`height` —
  Seção 33 do briefing).
- `gsap.context()` para a parte não-responsiva de cada hook e um `gsap.matchMedia()` **próprio e
  independente** (nunca aninhado dentro do mesmo `gsap.context()`) para a parte
  desktop/mobile — ver `docs/IMPLEMENTATION-STAGE-23.md`, Seção "Problemas encontrados", para o bug
  real que motivou essa separação.
- `ScrollTrigger.refresh()` chamado no cleanup de cada hook (Seção 26 do briefing) — garante que um
  próximo mount (ex.: voltar para a Home depois de visitar outra rota) recalcula posições do zero,
  nunca reaproveitando medidas de uma seção que não existe mais no DOM.
- Nenhuma medida é lida uma única vez e guardada em estado — `getSceneDistance()`-style (a mesma
  função da Fase GSAP e Transições) é chamada a cada criação de timeline, então uma mudança de
  largura de janela entre duas visitas à Home sempre usa o valor correto (Seção 27: resize).
- `markers: true`/`console.log` de depuração usados durante o desenvolvimento desta fase foram
  todos removidos antes da entrega final (Seção 48 do briefing).

## 10. Arquitetura

```
features/design-system/motion/
  scrollTrigger.ts        — registro único do plugin (getScrollTrigger())
  scrollMotionConfig.ts    — breakpoints de matchMedia + fator de scrub, específicos de scroll
  motionConfig.ts          — (Fase GSAP e Transições) DURATION/EASE/STAGGER/DISTANCE, reaproveitados aqui

features/site/motion/
  useHeroScrollMotion.ts          — Hero
  useCapabilitiesScrollMotion.ts  — Capacidades (pin desktop / revelação mobile)
  useRevealScrollMotion.ts        — hook genérico de revelação simples (Projetos, CTA final)

features/site/components/home/
  HeroSection.tsx (+ .module.css)
  CapabilitiesSection.tsx (+ .module.css)
  ProjectsTeaserSection.tsx (+ .module.css)
  FinalCtaSection.tsx (+ .module.css)
```

Nenhum `ScrollTrigger.create`/`gsap.to` solto em `app/page.tsx` ou em qualquer componente de
Design System (Seção 24 do briefing) — cada seção só chama seu próprio hook, que é o único lugar
que importa `gsap`/`ScrollTrigger` diretamente.

`SectionContainer` (`features/design-system/components/SectionContainer.tsx`) passou a encaminhar
`ref` (`forwardRef`, mesmo padrão já usado em `Button`/`Input`/etc.) — o motion de scroll precisa
do elemento real da seção (`trigger` do ScrollTrigger, escopo do `gsap.context`), o que um
componente de função comum não permite.
