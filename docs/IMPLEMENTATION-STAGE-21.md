# IMPLEMENTATION STAGE 21 — Motion Design

> Planeja e estrutura o motion design do projeto — tokens, hierarquia, arquitetura de sound design
> e protótipos leves e controlados no Builder. Sem GSAP/ScrollTrigger/Lenis/3D final ainda (fase
> seguinte). Ver `docs/MOTION-DESIGN.md` para o detalhamento completo da linguagem definida.

---

## 1. O que foi definido

Linguagem de motion completa (princípios, intensidade, ritmo, hierarquia de 4 níveis, tokens,
reduced motion, preparação para GSAP) — ver `docs/MOTION-DESIGN.md`. Referência de interação
avaliada: [nodeck.online](https://www.nodeck.online/) (via `WebFetch`, só para entender ritmo/
sensação/sound design — nenhum layout, texto ou asset copiado).

## 2. Motion tokens (`styles/tokens.css`)

Adicionados sem tocar nos 4 tokens que já existiam desde a Fase 18 (`--ds-duration-fast/normal/
slow`, `--ds-easing-base` — nomes e valores mantidos, dezenas de componentes já dependem deles):
`--ds-duration-instant`, `--ds-duration-scene`, `--ds-easing-standard` (alias semântico de
`--ds-easing-base`), `--ds-easing-emphasized`, `--ds-easing-exit`, `--ds-easing-smooth`,
`--ds-stagger-xs/sm/md`.

## 3. Comportamentos implementados (protótipos leves)

- **Transição de cena do Builder** — `SceneTransition` (`features/design-system/motion/
  SceneTransition.tsx`) + `getSceneKey` (`features/builder/logic/getSceneKey.ts`), plugados em
  `BuilderShell.tsx` ao redor do switch de telas já existente. Fade + leve subida na entrada de
  cada cena (seleção de serviço, cada pergunta, conclusão, resumo, contato, success, erro).
- **Resposta tátil dos cards** — `:active { transform: scale(...) }` com `--ds-duration-instant`
  em `ServiceSelector` (`.card`) e `QuestionRenderer` (`.option`).
- **"Outros cards perdem destaque"** — opções de múltipla escolha não marcadas caem para
  `opacity: 0.6` assim que pelo menos uma está marcada (`.optionsHasSelection`).
- **Botões (`Button`, Design System)** — `hover: translateY(-1px)`, `active: scale(0.96)` com
  `--ds-duration-instant`; afeta todas as variantes (primary/secondary/ghost/danger).
- **Entrada do drawer "Meu Upgrade"** — fundo escurecido com fade, painel com slide (da direita no
  desktop, de baixo no mobile), reaproveitando o `max-width: 640px` já existente.
- **Arquitetura de sound design** (`features/design-system/motion/sound.ts`) — `SoundEvent`,
  `playSound` (inerte, sem áudio real), `isSoundEnabled`/`setSoundEnabled` (opt-in, persistido em
  `localStorage`). Pontos de chamada já conectados (mas silenciosos): seleção de card/opção,
  avançar/voltar de cena, confirmar edição, abrir/fechar o Meu Upgrade.
- **`useReducedMotion`** (`features/design-system/motion/useReducedMotion.ts`) — hook via
  `useSyncExternalStore`, SSR-safe, para motion futuro orquestrado em JS; sem consumidor ainda
  nesta fase (nenhum motion atual depende de temporização em JS além do CSS).

## 4. Componentes novos

`features/design-system/motion/SceneTransition.tsx` (+ `.module.css`, + teste),
`features/design-system/motion/useReducedMotion.ts` (+ teste),
`features/design-system/motion/sound.ts` (+ teste), `features/builder/logic/getSceneKey.ts`
(+ teste).

## 5. Componentes alterados

`features/builder/components/BuilderShell.tsx`/`.module.css` (`SceneTransition` + animação do
drawer + sons de abrir/fechar), `features/builder/components/ServiceSelector.tsx`/`.module.css`
(`:active` + som de seleção), `features/builder/components/QuestionRenderer.tsx`/`.module.css`
(`:active`, dessaque de irmãos, sons de seleção/avançar/voltar/confirmar),
`features/design-system/components/Button.module.css` (`hover`/`active`), `styles/tokens.css`
(tokens de motion).

## 6. Limitações

Ver `docs/MOTION-DESIGN.md`, Seção 24 — resumo: sem animação de saída de cena/drawer (só entrada),
sem stagger real implementado, Home sem nenhuma implementação (só direção documentada), som
real não implementado (arquitetura pronta e inerte), sem cursor customizado/parallax.

## 7. Testes

**12 testes novos**: `getSceneKey.test.ts` (4), `SceneTransition.test.tsx` (2),
`useReducedMotion.test.tsx` (3), `sound.test.ts` (3). Nenhum teste de animação frame a frame —
testam identidade de cena (a chave muda quando e só quando a tela visível muda), comportamento
funcional (`SceneTransition` troca o conteúdo sem lançar erro), o hook de reduced motion (valor
inicial e reação a mudança) e a arquitetura de som (padrão desligado, persistência, nunca lança
erro). Todos os testes das fases anteriores continuam passando sem nenhuma alteração de asserção.

## 8. Revisão técnica

- **Lint**: 0 erros.
- **Typecheck**: 0 erros.
- **Testes**: 440/440 passando (12 novos — eram 428 ao final da fase de identidade oficial).
- **Build**: sucesso; tabela de rotas inalterada.

## 9. Teste manual

Fluxo completo do Builder (seletor → pergunta → opção → Meu Upgrade) verificado via Playwright em
1200×800: nenhum erro de console/JavaScript em nenhum passo, drawer abre corretamente com a
animação de entrada, cards respondem ao clique. `prefers-reduced-motion` não pôde ser testado com
um dispositivo físico nesta sessão, mas a regra que o implementa é a mesma regra global já
verificada nas Fases 18-20 (zera `animation-duration`/`transition-duration` incondicionalmente).

## 10. Pendências para a Etapa 22

- Implementação real com GSAP/ScrollTrigger para: animação de saída de cena/drawer, stagger de
  texto/blocos, scroll storytelling da Home, parallax/hover rico com cursor (ver
  `docs/MOTION-DESIGN.md`, Seção 23, para a tabela completa "hoje vs. próxima fase").
  Consideração de Lenis para scroll suave, se a Home ganhar storytelling por scroll.
- Biblioteca de áudio real atrás de `playSound` + um controle de mute na interface (hoje o som é
  opt-in via `localStorage`, mas não existe nenhum toggle visível para a pessoa ativar).
- Home: implementar a direção de motion já documentada (entrada controlada do hero, aparição de
  blocos, hover mais rico) — nesta fase só foi definida, não implementada, como pedido.
