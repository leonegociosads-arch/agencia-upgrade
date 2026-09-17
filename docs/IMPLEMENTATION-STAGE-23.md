# IMPLEMENTATION STAGE 23 — ScrollTrigger e Storytelling

> Implementa o storytelling controlado por scroll planejado/adiado desde a Fase Motion Design
> (Etapa 21, Seção 14: "Home não recebeu nenhuma implementação nesta fase") e explicitamente fora
> de escopo da Fase GSAP e Transições (Etapa 22, pendência #1: "ScrollTrigger... fora de escopo
> desta fase"). Ver `docs/SCROLL-STORYTELLING.md` para o detalhamento de narrativa/seções/pins/
> scrubs.

---

## 1. ScrollTriggers criados

4 hooks, um por seção da Home (`features/site/motion/`), somando **6 ScrollTriggers/timelines**
diferentes: Hero (1 scrub, dois breakpoints via `matchMedia`), Capacidades (1 scrub de entrada +
1 pin desktop OU 1 revelação mobile, via `matchMedia`), Projetos (1 revelação) e CTA final (1
revelação). Nenhum ScrollTrigger fora desses 4 hooks — Builder e Admin não receberam nenhum
(confirmado via `grep -rl "ScrollTrigger"` fora de `features/site/`).

## 2. Timelines

Ver `docs/SCROLL-STORYTELLING.md`, Seções 4/5/6, para os valores exatos (posições de start/end,
scrub, pin). Nenhum número solto — tudo vem de `motionConfig.ts` (Fase GSAP e Transições) ou do
novo `scrollMotionConfig.ts` (breakpoints/scrub específicos de scroll).

## 3. Seções alteradas

A Home inteira (`app/page.tsx`) foi refatorada: as 4 seções que antes eram JSX inline viraram
Client Components próprios em `features/site/components/home/` (`HeroSection`,
`CapabilitiesSection`, `ProjectsTeaserSection`, `FinalCtaSection`), cada uma com CSS module próprio
(migrado de `app/page.module.css`, que agora só tem `.main`). `app/page.tsx` continua Server
Component — só compõe os 4 imports; nenhuma copy mudou.

`SectionContainer` (`features/design-system/components/SectionContainer.tsx`) ganhou
`forwardRef` — necessário para o motion de scroll conseguir medir/observar a seção real (`trigger`
do ScrollTrigger). Nenhum outro componente de Design System foi alterado.

## 4. Diferenças desktop/mobile

Ver `docs/SCROLL-STORYTELLING.md`, Seção 7, para a tabela completa. Resumo: Hero tem menos
deslocamento e sem escala do grafismo no mobile; Capacidades troca pin+scrub por uma revelação
simples no mobile (Seção 30 do briefing: "não simplesmente executar a mesma timeline desktop em
360px"). Testado manualmente em 8 viewports (1920×1080, 1440×900, 1366×768, 1024×768, 768×1024,
430×932, 390×844, 360×800) via Playwright — nenhum erro de console, nenhuma quebra de layout,
scroll gradual/rápido/reverso e navegação para outra rota e volta, em todas as 8.

## 5. Problemas encontrados

Três bugs reais foram encontrados e corrigidos durante esta fase — nenhum era "só um problema de
teste" (diferente da Fase GSAP e Transições, cujo problema de `matchMedia` era específico do
jsdom): os três primeiros afetavam o comportamento real no navegador.

**a) `gsap.context(fn, scope)` recebendo o `ref` do React em vez do elemento (`sectionRef` em vez
de `sectionRef.current`).** Isso fazia o GSAP emitir `console.warn("Invalid scope")` em produção
(reproduzido via Playwright, não só em teste) porque um objeto `{ current: HTMLElement }` não é um
alvo válido de `toArray()`. Corrigido nos 3 hooks — o `scope` passado agora é sempre o elemento já
resolvido (`const section = sectionRef.current`), nunca o `ref` em si.

**b) `gsap.matchMedia()` aninhado dentro do mesmo `gsap.context()` que cria as animações
não-responsivas causava um `NotFoundError` real ao desmontar** (reproduzido também fora de teste,
embora só tenha se manifestado de forma consistente com o `pin` do desktop): o ScrollTrigger criado
dentro do `matchMedia` fica rastreado tanto pelo contexto externo quanto pela instância de
`matchMedia`, e as duas tentam desfazê-lo/revertê-lo de forma independente ao desmontar — a
segunda encontra nós que a primeira já moveu/removeu. Corrigido criando um `gsap.matchMedia()`
**próprio e nunca aninhado** em `useHeroScrollMotion.ts`/`useCapabilitiesScrollMotion.ts` — cada
mecanismo de limpeza (`ctx.revert()`/`mm.revert()`) agora só desfaz o que criou.

**c) `useRevealScrollMotion.ts` usava `.from()` para dois itens na MESMA timeline com
posicionamento relativo (`"<+…"`).** Resultado real (reproduzido em produção, com e sem Strict
Mode): o CTA final ("Monte seu Upgrade") ficava permanentemente em `opacity: 0`, nunca revelado,
mesmo com o `ScrollTrigger` disparando corretamente (`onEnter` confirmado via log) — `.from()`
precisa capturar o valor "de chegada" a partir do estado computado no momento em que a timeline é
montada, e com dois itens na mesma timeline esse cálculo se mostrou não confiável. Corrigido
trocando para `.fromTo()` com valores explícitos nos dois lados (`{ opacity: 0, y: distance }` →
`{ opacity: 1, y: 0 }`) — elimina a ambiguidade por completo. Confirmado corrigido via Playwright:
o CTA final chega a `opacity: 1` de forma consistente em todos os 8 viewports testados.

**d) (Limitação de ambiente, não um bug de produto) `pin: true` do ScrollTrigger e o `unmount` do
jsdom.** jsdom não tem motor de layout real (`getBoundingClientRect` sempre retorna zero), e o
`pin` depende de medidas reais para restaurar a estrutura do DOM ao reverter — um teste que
desmonta `CapabilitiesSection` no cenário desktop (com pin) gera um `NotFoundError` só neste
ambiente. Verificado que o navegador real não tem esse problema (Playwright: scroll para dentro/
fora da seção fixada e navegação para outra página e volta, sem nenhum erro, nas 8 viewports).
Mesma filosofia da Fase GSAP e Transições para o problema do `matchMedia`/timeline em jsdom:
reconhecida e documentada no teste (`CapabilitiesSection.test.tsx`) em vez de mascarada.

## 6. Otimizações

- `gsap.utils.toArray(seletor, elementoEscopo)` usado em vez de `gsap.context().selector` para
  resolver elementos dentro de cada seção — mais direto, e evita depender do `context.selector`
  (que só funciona corretamente quando o `scope` passado a `gsap.context` é um elemento real; ver
  bug (a) acima).
- `SCRUB.smooth`/`SCRUB.responsive` (nunca `scrub: true`) — todo movimento ligado ao scroll tem uma
  leve suavização, evitando a sensação "presa à roda do mouse" (briefing, Seção 9).
- Duração do pin de Capacidades deliberadamente curta (`+=90%` de um viewport) — sensação de
  progresso constante, nunca um scroll vazio (Seção 7 do briefing).

## 7. Testes

**16 testes novos**: `HeroSection.test.tsx` (3), `CapabilitiesSection.test.tsx` (4),
`ProjectsTeaserSection.test.tsx` (2), `FinalCtaSection.test.tsx` (2), `app/page.test.tsx` (1, a
Home inteira montando/desmontando sem erro), mais 1 teste novo em
`SectionContainer.test.tsx` (encaminhamento de `ref`) — nenhum teste de frame de animação: todos
verificam conteúdo presente, `reduced motion` preservando tudo visível, e montar/desmontar sem
lançar um erro inesperado (briefing, Seção 55). O caso do `pin` desktop em jsdom (limitação (d)
acima) é a única exceção documentada — o teste tolera especificamente esse `NotFoundError`
conhecido e continua falhando para qualquer outro erro. Total do projeto: **472/472 passando**
(eram 459 ao final da Fase GSAP e Transições).

## 8. Revisão técnica

- **Lint**: 0 erros, 0 avisos.
- **Typecheck**: 0 erros.
- **Testes**: 472/472 passando.
- **Build**: sucesso; tabela de rotas inalterada.

## 9. Teste manual

Via Playwright (Chromium), build de produção (`next build` + `next start`) — não só `next dev`,
para eliminar qualquer efeito do Strict Mode do React como variável:

- **8 viewports** (1920×1080, 1440×900, 1366×768, 1024×768, 768×1024, 430×932, 390×844, 360×800):
  scroll gradual (devagar, em passos pequenos), scroll rápido (salto direto para o fim/início),
  scroll reverso (de baixo para cima) e navegação para `/builder` e de volta — **nenhum erro de
  console/página em nenhuma combinação**.
- Confirmado visualmente (capturas de tela): o pin de Capacidades no desktop revela os 3 cards em
  sequência sem artefato; no mobile, os cards aparecem em bloco, uma coluna, sem pin; o CTA final e
  o Hero mostram o mesmo grafismo diagonal espelhado; com `reducedMotion: "reduce"` (emulado pelo
  Playwright), Hero/Capacidades/CTA aparecem inteiros e com `opacity: 1` imediatamente, sem
  precisar rolar.
- Não testado em dispositivo mobile físico nesta sessão — só emulação de viewport/touch do
  Playwright (mesma limitação já registrada na Fase GSAP e Transições).

## 10. Pendências para a Etapa 24

- Lenis (smooth scroll) — explicitamente fora de escopo desta fase (Seção 36/37 do briefing:
  "ainda NÃO implementar Lenis... toda implementação desta fase deve funcionar sem smooth scroll
  customizado" — confirmado, o scroll nativo já foi a base de todo o desenvolvimento e teste desta
  fase).
- Nenhuma seção nova de conteúdo ("Posicionamento", "Como a Upgrade pensa") — a narrativa desta
  fase trabalha só com as 4 seções que já existiam (briefing, Seção 10: preservar a copy atual).
- Projetos/Prova continua um teaser simples — sem cases reais ainda para justificar uma
  apresentação mais elaborada (scroll horizontal, cards sobrepostos — Seção 14/15 do briefing).
- Indicador de progresso de scroll (Seção 23 do briefing) — não implementado (opcional, "se fizer
  sentido"; não fez sentido para a extensão atual da Home).
- Teste em dispositivo mobile físico (só emulação nesta sessão).
- `CustomEase` do GSAP — mesma pendência da Fase GSAP e Transições, ainda sem necessidade real.
