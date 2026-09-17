# IMPLEMENTATION STAGE 24 — Microinterações

> Implementa a camada de microinterações planejada (Nodeck como referência de linguagem, nunca de
> layout/identidade). Ver `docs/MICROINTERACTIONS.md` para a linguagem completa (matriz interação
> → resposta, cada área do site).

---

## 1. Microinterações implementadas

**Infraestrutura nova** (`features/design-system/motion/`): `pointerCapability.ts`
(`useFinePointer`), `useTilt.ts`, `useMagneticHover.ts`, `useAvoidCursor.ts`, `useEnabledPulse.ts`,
`useScrolled.ts`, `useSoundEnabled.ts` — 7 hooks novos, todos seguindo o mesmo padrão de
`useReducedMotion.ts` (SSR-safe, gated por capacidade real do dispositivo, cleanup garantido).

**Componentes novos**: `SoundToggle` (+ `.module.css`), `CustomCursor` (+ `.module.css`),
`TrashIcon` (ícone compartilhado, extraído de `MyUpgradeItem` para também servir
`ProjectReviewService`).

**Componentes alterados** (lista completa): `Button.module.css` (sheen no `primary`),
`LinkButton.tsx`/`Card.tsx` (`forwardRef`), `SiteHeader.tsx`/`.module.css` (scroll reaction, logo
hover, underline animado, sound toggle, cursor, CTA magnético), `BuilderNavigation.tsx`/`.module.css`
(sound toggle, cursor, logo hover, focus-visible), `ServiceSelector.tsx`/`.module.css` (tilt via
`ServiceCard`), `QuestionRenderer.tsx`/`.module.css` (tilt via `OptionCard`, pulso do "Continuar"
via `ContinueButton`), `ProjectReview.tsx`/`.module.css` (pulso do "Continuar"),
`ProjectReviewService.tsx`/`.module.css` (ícone de remover), `MyUpgradeItem.tsx`/`.module.css`
(ícone de remover, expandir/recolher), `MyUpgrade.tsx` (som), `RemoveServiceDialog.tsx`/`.module.css`
(som, entrada), `SubmissionSuccess.tsx`/`.module.css` (som, pop do check), `LeadForm.tsx` (som),
`SiteFooter.module.css` (underline animado), `Input.module.css` (glow de foco),
`Checkbox.module.css` (pop ao marcar — também usado por `Radio`), `sound.ts` (síntese real + 3
eventos novos), `features/site/components/home/CapabilitiesSection.tsx`/`HeroSection.tsx`/
`FinalCtaSection.tsx` (tilt, magnetismo, interação-surpresa).

## 2. Elementos especiais

- **Cursor customizado** (`CustomCursor`): halo que acompanha o cursor sem esconder a seta nativa
  — decisão deliberada de baixo risco (ver `docs/DECISIONS.md`).
- **Interação-surpresa única** (`useAvoidCursor`, no grafismo decorativo do Hero): afasta-se do
  cursor, toca `hover_special` uma vez por página. Nenhum outro elemento do site tem esse
  comportamento — nunca em CTA, formulário ou ação comercial.
- **Efeito magnético** (`useMagneticHover`): só nos 3 CTAs "Monte seu Upgrade" (Header, Hero, CTA
  final da Home).

## 3. Sound system

`features/design-system/motion/sound.ts` — síntese via Web Audio API (osciladores + envelope),
nunca um arquivo de áudio (ver `docs/MICROINTERACTIONS.md`, Seção 6, para o raciocínio completo de
por que isso resolve a exigência de licenciamento da Seção 41 do briefing). 10 eventos totais (7
já existentes + `ui_press`/`success`/`hover_special` novos). `SoundToggle` + `useSoundEnabled`
(reativo via `useSyncExternalStore`, ouvindo um `CustomEvent` que `setSoundEnabled` despacha) — som
começa desligado, só liga com um clique explícito do usuário.

## 4. Diferenças desktop/mobile

Tudo gated por `useFinePointer()` — `(hover: hover) and (pointer: fine)`, nunca largura de tela.
Verificado com emulação de dispositivo touch real do Playwright (`devices["iPhone 13"]`, não só
redimensionar a janela — ver Seção 9, "Um problema de teste encontrado", abaixo): tilt, magnetismo,
cursor customizado e a interação-surpresa não aparecem; toque continua ativando seleção/press
normalmente (o mesmo `:active`/CSS já usado desde fases anteriores). `SoundToggle` só aparece na
barra superior do `SiteHeader` a partir de 768px — em telas menores, mora dentro do menu mobile
(evita apertar o cabeçalho estreito).

## 5. Performance

Ver `docs/MICROINTERACTIONS.md`, Seção 15, para o detalhamento completo. Resumo: `gsap.quickTo()`
para tudo ligado a `pointermove`; zero listener de mouse por card além de um `pointermove`/
`pointerleave` próprio; zero `setState` do React a cada movimento do mouse (tudo escrito
diretamente no DOM pelo GSAP); só `transform`/`opacity`/`box-shadow` animados.

## 6. Limitações

- `Select` continua sem animação de abrir/fechar — o popup é controlado pelo sistema operacional/
  navegador, fora do alcance de CSS/JS de forma consistente entre navegadores (decisão aceita, não
  esquecida — documentada em `docs/MICROINTERACTIONS.md`, Seção 9).
- Nenhuma mudança no Admin (como pedido — Seção 49 do briefing).
- O halo do `CustomCursor` não substitui o cursor nativo (decisão deliberada — ver
  `docs/DECISIONS.md`); quem espera um cursor "estilo Nodeck" que troca de ícone/forma por completo
  não vai ver isso aqui.
- `useTilt`/`useMagneticHover` exigiram extrair sub-componentes (`ServiceCard`, `OptionCard`,
  `CapabilityCard`) para poder chamar o Hook uma vez por item de uma lista — não é uma limitação
  funcional, só uma nota de arquitetura para quem for replicar o padrão em uma pergunta futura do
  Builder.

## 7. Testes

**~40 testes novos**: `sound.test.ts` (reescrito, 4 testes cobrindo os 10 eventos),
`useSoundEnabled.test.tsx` (2), `SoundToggle.test.tsx` (3), `useEnabledPulse.test.tsx` (3),
`CustomCursor.test.tsx` (3, cobrindo os 3 cenários de gating), `useTilt.test.tsx` (3),
`useMagneticHover.test.tsx` (2), `useAvoidCursor.test.tsx` (2), `MyUpgradeItem.test.tsx` (4, novo
— expandir/recolher/remover). Mesma filosofia de todas as fases anteriores: comportamento, nunca
frame de animação — o ambiente de teste roda com `prefers-reduced-motion: reduce` por padrão
(`vitest.setup.ts`, decisão da Fase GSAP e Transições), então os hooks de ponteiro simplesmente não
anexam nenhum listener na maioria dos testes; os que precisam verificar o caminho "motion completo"
sobrescrevem `window.matchMedia` localmente (mesmo padrão de `SceneTransition.test.tsx`). Total do
projeto: **522/522 passando** (eram 499 ao final da Fase ScrollTrigger e Storytelling).

## 8. Revisão técnica

- **Lint**: 0 erros, 0 avisos.
- **Typecheck**: 0 erros.
- **Testes**: 522/522 passando.
- **Build**: sucesso; tabela de rotas inalterada.

## 9. Um problema de teste encontrado (não um bug de produto)

Uma primeira verificação manual via Playwright redimensionou a janela para 390×844 e concluiu que
o `CustomCursor` aparecia "no mobile" — falso positivo: redimensionar a janela de um Chromium
desktop não muda `(hover: hover) and (pointer: fine)` (isso continua `true` — é um mouse de
verdade num navegador de desktop, só com uma janela pequena). Repetido com
`devices["iPhone 13"]` do Playwright (emulação real de touch, que também simula `pointer: coarse`/
`hover: none`) confirmou o comportamento correto: `useFinePointer()` retorna `false`, o cursor
customizado não aparece. Fica registrado porque é exatamente o tipo de engano fácil de cometer ao
testar "mobile" manualmente — tamanho de tela não é capacidade de ponteiro.

## 10. Pendências para a Etapa 25

- Nenhuma pendência de bloqueio identificada nesta fase.
- Biblioteca de áudio real (se algum dia os tons sintetizados deixarem de ser suficientes) —
  mantém-se como pendência de longa data desde a Fase Motion Design.
- Teste em dispositivo físico (só emulação nesta sessão, como em todas as fases anteriores).
- Qualquer extensão da linguagem de tilt/microinteração para as demais perguntas do Builder além
  das já cobertas — a estrutura (`useTilt`, `ServiceCard`/`OptionCard` como padrão de extração)
  já está pronta para isso quando for pedido.
