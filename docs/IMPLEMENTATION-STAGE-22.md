# IMPLEMENTATION STAGE 22 — GSAP e Transições

> Implementa de verdade as transições planejadas na Fase Motion Design (Etapa 21) com GSAP core —
> sem ScrollTrigger/Lenis/3D (Etapa 23+). Ver `docs/GSAP-TRANSITIONS.md` para o detalhamento
> técnico completo (arquitetura, cada componente, cada decisão).

---

## 1. Animações implementadas

- **Transição de cena do Builder** — crossfade completo (saída + entrada, não só entrada como na
  Fase Motion Design), com direção (forward/backward) e bloqueio de interação durante a troca.
- **Meu Upgrade** — abrir/fechar animado via GSAP (a Fase Motion Design só tinha entrada via CSS,
  sem saída); foco move para o painel ao abrir e volta ao gatilho ao fechar.
- **Guardas de "duplo clique"** em todos os pontos que avançam/voltam uma cena do Builder.
- **Sound hooks** expandidos para os 5 eventos pedidos nesta fase (`service_complete` era o único
  que faltava desde a Fase Motion Design).

## 2. Componentes alterados

`features/builder/components/BuilderShell.tsx`/`.module.css` (troca a entrada CSS do drawer pelo
`Drawer` novo; passa `sceneKey` para `SceneTransition`), `ServiceSelector.tsx`/`.module.css`
(guarda + `disabled` durante transição), `QuestionRenderer.tsx`/`.module.css` (guarda em
Voltar/opções/Continuar/Confirmar alterações/Escolher outra área), `ProjectReview.tsx` (guarda em
Voltar/Continuar), `ServiceComplete.tsx` (som ao chegar na cena), `features/lead/components/
LeadForm.tsx` (direção "backward" ao voltar ao projeto), `features/builder/logic/getSceneKey.ts`
(caso especial: última resposta de uma configuração nova não gera uma cena "em branco"),
`features/design-system/motion/sound.ts` (evento `service_complete` novo), `vitest.setup.ts`
(polyfill de `window.matchMedia`, default `prefers-reduced-motion: reduce` — ver Seção 5).

## 3. Componentes novos

- `features/design-system/motion/motionConfig.ts` — durations/easings/stagger/distances
  centralizados (espelha os tokens CSS da Fase Motion Design em valores que o GSAP entende).
- `features/design-system/motion/SceneTransition.tsx` — reescrito por completo (crossfade real,
  direção, bloqueio) — mesmo nome/API pública (`sceneKey`/`children`) da Fase Motion Design, mas
  agora também exporta `useSceneNavigation()`.
- `features/design-system/motion/Drawer.tsx` — novo, genérico (Meu Upgrade hoje).

## 4. Timelines e hooks

Ver `docs/GSAP-TRANSITIONS.md`, Seções 4 e 8, para os dois `gsap.timeline()` do projeto (transição
de cena e drawer) com os valores exatos de duração/easing/offset de cada um. `useSceneNavigation()`
é o hook público que qualquer componente do Builder usa para participar do sistema de transição
(`isTransitioning`, `markForward`, `markBackward`) sem nunca importar `gsap` diretamente.

## 5. Um problema de teste encontrado e resolvido: `window.matchMedia` em jsdom

Ao rodar a suíte depois de plugar `SceneTransition`/`Drawer` de verdade no `BuilderShell`, **57
testes** (de arquivos que nunca tinham nada a ver com motion — `MyUpgrade.test.tsx`,
`ProjectReview.test.tsx`, `LeadForm.test.tsx`, os testes de analytics/persistência do
`BuilderShell`) começaram a falhar com `TypeError: window.matchMedia is not a function` — jsdom não
implementa essa API. Corrigido com um polyfill mínimo em `vitest.setup.ts`.

Uma segunda rodada revelou um problema mais sutil: mesmo com o polyfill, **22 testes** continuavam
falhando porque o crossfade de `SceneTransition` mantém a cena de SAÍDA visível (`aria-hidden`, mas
ainda no DOM) enquanto a timeline GSAP não termina — e uma timeline real nunca termina em jsdom
(que não tem um loop de `requestAnimationFrame` de verdade), então testes que esperavam a tela
antiga sumir IMEDIATAMENTE depois de um clique (`fireEvent.click` é síncrono) encontravam as duas
cenas coexistindo. A solução correta não foi mudar nenhum teste — foi fazer o polyfill de
`matchMedia` retornar `matches: true` (motion reduzido) por padrão: com `reduced-motion`,
`SceneTransition`/`Drawer` resolvem a troca via `gsap.set()` (aplica o estado final direto, sem
timeline nenhuma), então tudo volta a ser síncrono. Isso bate exatamente com a filosofia de teste
pedida (briefing, Seção 47: "não testar frame a frame, testar comportamento") — os ~450 testes de
integração continuam exercitando o fluxo REAL do Builder, sem precisar simular tempo.

## 6. Limitações

- Nenhuma animação de saída de CENA foi implementada como "verdadeiramente reversível" —
  avançar/voltar usam a mesma lógica com sinal trocado (direção), não duas timelines espelhadas
  desenhadas à mão; o resultado visual já comunica direção com clareza (testado manualmente).
- `CustomEase` não foi adicionado — os 4 easings do Design System são aproximados pelos eases
  nativos do GSAP mais próximos (ver `docs/GSAP-TRANSITIONS.md`, Seção 6).
- Home: nenhuma animação nova implementada nesta fase (a Fase Motion Design já apontava isso como
  pendência; continua fora do escopo desta fase, que priorizou o Builder como pedido).
- Admin: nenhum GSAP adicionado, como pedido (Seção 32 do briefing).
- Sound design continua inerte (nenhum arquivo de áudio real) — só a arquitetura/pontos de chamada.

## 7. Testes

**23 testes novos**: `motionConfig.test.ts` (2), `SceneTransition.test.tsx` (5, reescrito para o
crossfade — eram 2 na Fase Motion Design), `Drawer.test.tsx` (4), `BuilderShell.
gsapTransitions.test.tsx` (9, cobrindo os itens 1-6, 9, 10 e 11 da Seção 48 do briefing — os itens
7/8/12 já tinham cobertura própria em arquivos existentes, não duplicados). Nenhum teste de
animação frame a frame — todos verificam comportamento funcional (estados, guardas, foco,
ausência de erro ao desmontar). Total do projeto: 459/459 passando (eram 446 ao final da Fase
Motion Design — mais que os 23 novos porque alguns testes da própria Fase Motion Design foram
reescritos, não apenas adicionados, ao mesmo total final).

## 8. Revisão técnica

- **Lint**: 0 erros (2 avisos justificados e suprimidos individualmente com comentário — ver
  `docs/DECISIONS.md`).
- **Typecheck**: 0 erros.
- **Testes**: 459/459 passando.
- **Build**: sucesso; tabela de rotas inalterada.

## 9. Teste manual

Fluxo completo verificado via Playwright em Chromium (1280×900) com motion REAL (sem reduced
motion) — avançar pergunta, voltar, abrir/fechar Meu Upgrade — capturas de tela confirmam: cada
transição de cena assenta corretamente na posição final (sem artefato da cena anterior grudado),
"Voltar" retorna visualmente à pergunta certa, o drawer abre com o painel/backdrop visíveis e
fecha completamente (incluindo o foco voltando ao botão "Meu Upgrade"). Nenhum erro de console em
nenhum passo. Não testado em dispositivo mobile físico nesta sessão — só emulação de viewport.

## 10. Pendências para a Etapa 23

- ScrollTrigger, pinning, storytelling por scroll, Lenis — explicitamente fora de escopo desta
  fase, como pedido.
- Motion da Home (hero ao carregar, cards ao hover, reveals) — definido na Fase Motion Design,
  ainda não implementado.
- Biblioteca de áudio real atrás de `playSound` + controle de mute visível na interface.
- Teste em dispositivo mobile físico (só emulação de viewport nesta sessão).
- `CustomEase` do GSAP, se algum dia as aproximações de easing nativas deixarem de ser suficientes
  visualmente.
