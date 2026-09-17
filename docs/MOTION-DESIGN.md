# MOTION DESIGN — Agência Upgrade

> Fase Motion Design do roadmap. Define e estrutura a linguagem de movimento do projeto — sem
> GSAP/ScrollTrigger/Lenis/3D pesados ainda (isso é da próxima fase de implementação). Esta fase
> planeja, define tokens/hierarquia, e valida a direção com protótipos leves e controlados em CSS
> puro + JS mínimo. Ver `docs/IMPLEMENTATION-STAGE-21.md` para o resumo técnico (arquivos, testes).

---

## 1. Princípios

A Upgrade deve ter motion com sensação de **sofisticação, tecnologia, resposta física, clareza,
intenção, premium** — nunca "app genérico", "molenga", "bounce infantil" ou "efeito por efeito".
Referência de linguagem (não de layout/conteúdo): [nodeck.online](https://www.nodeck.online/) —
absorvido daí o **ritmo deliberado** (transições cadenciadas, nunca instantâneas nem lentas
demais), **entradas escalonadas** (stagger em vez de tudo aparecendo de uma vez) e a ideia de que
cada interação relevante tem uma resposta sensorial (visual e, no futuro, sonora) — nunca a
estética retrô/lúdica do site em si, que não tem nada a ver com a identidade da Upgrade.

## 2. Intensidade

**Bem interativo e premium, com alguns momentos ousados** — mais forte que um site institucional
comum, menos caótico que um experimento artístico. Na prática: o Builder (Seção 4) é onde a
intensidade é mais alta (cards fortes, transição de cena por etapa); a Home é mais contida (Seção
7); o admin é o mais discreto de todos (Seção 10).

## 3. Ritmo e velocidade

Misto, por tipo de interação:

- **Microinterações** (hover, seleção, foco): rápidas e precisas — `--ds-duration-instant`/`fast`.
- **Trocas de cena**: suaves e cinematográficas — `--ds-duration-scene`/`slow`.
- **Entradas de conteúdo**: fluidas — `--ds-duration-normal`/`slow` com `--ds-easing-emphasized`.
- **Ações de clique**: resposta imediata — sempre `--ds-duration-instant`, nunca a mesma duração
  de uma transição decorativa (a pessoa precisa sentir o clique antes de soltar o dedo/mouse).

## 4. Builder — direção principal

O Builder é o coração do motion do projeto — não pode parecer formulário comum. Continua **tudo
dentro de `/builder`**, sem rota nova por pergunta (nenhuma mudança de roteamento); a sensação de
"uma cena sai → outra entra" vem de **remontar o wrapper de conteúdo a cada mudança de tela**, não
de navegação real.

Cada etapa (seleção de serviço, cada pergunta, conclusão, resumo, contato, success) é uma "cena"
com identidade própria (`getSceneKey`, Seção 8).

## 5. Cards do Builder

Já eram retangulares/horizontais desde a Fase 19 (`ServiceSelector`, opções de `QuestionRenderer`)
— esta fase define e implementa a **linguagem de interação** sobre esse visual já existente:

1. **Clique responde imediatamente** — `:active { transform: scale(0.96-0.98) }`, com
   `--ds-duration-instant` (mais rápido que qualquer outra transição do card), para parecer
   pressão física, não uma animação decorativa.
2. **Card selecionado fica claramente destacado** — já existia (borda + fundo + check explícito,
   Fase 19); mantido.
3. **Outros cards perdem destaque** — implementado para as opções de múltipla escolha
   (`QuestionRenderer`): assim que pelo menos uma opção está marcada, as não-marcadas caem para
   `opacity: 0.6` (`.optionsHasSelection .option:not(.optionSelected)`). Não implementado no
   seletor de serviço (os 3 cards) porque clicar ali já navega imediatamente para a próxima
   cena — não há um momento de "cards coexistindo" para destacar um sobre os outros.
4. **Sem autoavanço** — clicar numa opção de múltipla escolha só marca; avançar continua exigindo
   o clique em "Continuar" (nenhuma mudança de comportamento, só reforçado como decisão explícita
   desta fase, Seção 6 do briefing).

## 6. Botão "Próximo" (e todo botão de fluxo)

Estados de motion aplicados ao componente `Button` (Design System, afeta primary/secondary/ghost/
danger igualmente — Nível 1 da hierarquia):

- **Hover**: `translateY(-1px)` — sugere "pronto para avançar".
- **Active**: `scale(0.96)`, `--ds-duration-instant` — resposta física imediata ao clique.
- **Disabled**: mantém a opacidade reduzida já existente (Fase 18); nenhum motion novo (um botão
  desabilitado não deve reagir a nada).
- **Loading**: continua o texto do próprio botão mudando (ex.: "Enviando...", Fase 12/19) — sem
  motion adicional aqui para não competir com o "Nível 3" do Success ver Seção 9.

## 7. Transição entre cenas do Builder

Ao clicar em "Próximo"/selecionar uma opção de escolha única/voltar, a cena troca com:

- **Fade + leve subida** (`opacity 0→1`, `translateY 16px→0`), `--ds-duration-scene` (480ms),
  `--ds-easing-emphasized` (uma curva de desaceleração forte — "chega com intenção, não desliza
  frouxo").
- Implementado via `SceneTransition` (`features/design-system/components/../motion/
  SceneTransition.tsx`): troca o `key` do wrapper a cada mudança de `getSceneKey(state)`
  (`features/builder/logic/getSceneKey.ts`), forçando o React a remontar e a animação CSS rodar de
  novo. **Só a entrada da cena nova é animada** — a cena anterior desaparece instantaneamente
  (sem fade de saída). Manter as duas cenas montadas ao mesmo tempo para animar a saída también
  exigiria uma máquina de estado de transição própria (ou uma lib como Framer Motion/GSAP), que é
  exatamente o que esta fase decide NÃO implementar ainda (Seção 25). Mesmo assim, o resultado já
  entrega a sensação de "cena sai → cena entra" pedida (Seção 8 do briefing) de forma leve.
- **Voltar** usa a mesma `SceneTransition` (`getSceneKey` muda igual, para qualquer direção) —
  nunca parece reset brusco ou glitch, porque é a mesma animação de entrada, só que para o
  conteúdo anterior.
- **Textos** (título da pergunta, contexto): entram junto com o resto da cena pela mesma animação
  do wrapper — sem uma entrada própria "por palavra/letra" nesta fase (isso seria stagger real,
  que fica para a implementação com GSAP — evita o risco de "texto voando" citado como algo a
  evitar, Seção 9 do briefing).

## 8. `getSceneKey` — como uma cena é identificada

`features/builder/logic/getSceneKey.ts` espelha exatamente a ordem de checagem que
`BuilderShell.tsx` já usa para decidir o que renderizar — nunca decide nada sozinho, só nomeia a
tela que o estado real já escolheu (Seção 26: "primeiro o estado muda, depois o motion responde").
Perguntas usam `getProgress(...).current` (quantas respostas já estão no rascunho — o mesmo número
do "X de Y" da barra de progresso) como parte da chave, então a cena troca exatamente quando a
pergunta visível troca, sem duplicar nenhuma lógica de fluxo nova.

## 9. Meu Upgrade

Drawer (lateral no desktop, bottom sheet no mobile, Fase 19/20) ganhou uma **entrada animada**
(`upgradeOverlayIn` no fundo escurecido, `upgradePanelInRight`/`upgradePanelInUp` no painel,
conforme a largura) — `--ds-duration-slow`, `--ds-easing-emphasized`. Roda automaticamente ao
montar (o componente já era condicional — `{showMyUpgrade && ...}` — então montar já é o gatilho
certo, sem estado novo). **Fechar continua instantâneo** (mesma limitação da Seção 7 — animar a
saída exigiria manter o drawer montado durante o fechamento). O toggle na navegação e o clique no
fundo escurecido continuam chamando a mesma função (`closeMyUpgrade`), agora também disparando o
som conceitual `panel_close` (Seção 13).

## 10. Service Complete

Nenhuma mudança de motion nesta fase além do que a Fase 19 já definia (selo verde discreto, sem
celebração exagerada) — a checagem confirmou que a tela já satisfaz a direção pedida (Seção 13 do
briefing: "confirmação clara... sem celebração exagerada"). Fica como candidato a receber um
pequeno highlight de entrada (Nível 2) quando a implementação com GSAP acontecer.

## 11. Resumo final

Estrutura de blocos por serviço já existe (Fase 19/20); a sensação de "cena entrando" já vem da
`SceneTransition` no nível do `BuilderShell` (Seção 7 acima — o Resumo é uma das cenas). Uma
entrada com stagger real por bloco (cada serviço aparecendo em sequência, não todos juntos) é uma
melhoria de Nível 2 mapeada para a fase de implementação com GSAP (Seção 12).

## 12. Formulário de contato

Motion contido e funcional, como pedido (Seção 15) — nenhuma mudança de comportamento visual desta
fase além do que os tokens já cobrem (foco com contorno, Fase 18; erro com `Alert`, Fase 19).
Fica mapeado para a próxima fase: uma leve vibração/deslocamento horizontal no campo com erro ao
tentar enviar (Nível 1), e a transição para Success reaproveitando a mesma `SceneTransition` do
Builder (já é o caso hoje, porque `success` é uma das cenas de `getSceneKey`).

## 13. Success

Já tem confirmação visual clara (selo, "Obrigado, {nome}!", Fase 19) e agora também entra pela
`SceneTransition` (Seção 7) — satisfaz "motion de confirmação, claro, objetivo, premium, sem
exagero" sem precisar de nada além do que a troca de cena já entrega.

## 14. Home

Builder continua sendo o foco principal da linguagem de interação (Seção 17 do briefing) — a Home
não recebeu nenhuma implementação nesta fase (nenhum scroll storytelling, como pedido
explicitamente). Direção definida para quando a fase seguinte chegar:

- **Hero**: entrada controlada (badge → título → subtítulo → CTAs, stagger curto,
  `--ds-stagger-sm`/`md`), não simultânea.
- **Cards de "O que fazemos"**: aparecem ao entrar na viewport (Nível 2/4 — só com
  `ScrollTrigger`, não implementado agora).
- **Hover**: já existe elevação sutil nos cards (Fase 19); candidato a um hover mais rico
  (leve profundidade/tilt) na implementação futura (Seção 19).

## 15. Admin

Motion discreto, priorizando clareza e rapidez (Seção 18) — nenhuma mudança nesta fase. O admin
**não** ganha `SceneTransition` nem entradas escalonadas: continua puramente funcional, tabelas e
formulários sem teatro, por decisão explícita (nunca "tornar o admin teatral").

## 16. Cursor / pointer

Nenhuma implementação nesta fase (protótipos leves ficaram concentrados no Builder, que é a
prioridade). Direção aprovada para quando a fase de GSAP chegar: hover mais rico nos cards do
Builder/Home em desktop (ex.: leve resposta ao ponteiro dentro do card), nunca em mobile (Seção 19
do briefing: "no mobile nada pode depender disso") — todo o motion implementado até aqui já
funciona 100% por clique/toque, sem nenhuma dependência de hover para a função em si (só reforço
visual).

## 17. Sound design (arquitetura preparada, não implementada)

`features/design-system/motion/sound.ts` — arquitetura mínima preparada, **sem nenhum arquivo de
áudio real** (Seção 20 do briefing: "não implementar biblioteca de áudio complexa ainda"):

- `SoundEvent`: `"card_select" | "scene_advance" | "scene_back" | "confirm" | "panel_open" |
  "panel_close"` — os pontos já mapeados e já chamados nos componentes (Seção 18 abaixo), prontos
  para quando um clipe de áudio real existir por trás de cada um.
- `playSound(event)` é **inerte hoje** — só verifica `isSoundEnabled()` e retorna; nenhum som
  toca. Quando a biblioteca de áudio real for implementada, só o CORPO desta função muda (tocar o
  clipe curto correspondente) — nenhum ponto de chamada nos componentes precisa mudar.
- **Opt-in, não opt-out**: `isSoundEnabled()` começa `false` e só vira `true` via
  `setSoundEnabled(true)`, persistido em `localStorage` — nunca toca nada sem uma ação explícita
  do usuário, porque ainda não existe nenhum controle de mute construído na interface (Seção 20:
  "opcionais, com possibilidade clara de mute" — sem esse controle, o padrão seguro é ficar mudo).

Onde cada som vai entrar de verdade (curto, discreto, premium):

- `card_select` — seleção de um serviço ou de uma opção de pergunta.
- `scene_advance` / `scene_back` — avançar/voltar de cena no Builder.
- `confirm` — confirmar uma edição, finalizar/enviar o projeto.
- `panel_open` / `panel_close` — abrir/fechar o Meu Upgrade.

## 18. Pontos de chamada já conectados (protótipos leves)

Mesmo com `playSound` inerte, os pontos de chamada já estão no código de verdade (não só
documentados) — isso valida que a arquitetura realmente encaixa nos componentes sem fricção:
`ServiceSelector` (`card_select`), `QuestionRenderer` (`card_select` na opção, `scene_advance` no
"Continuar", `scene_back` no "Voltar", `confirm` em "Confirmar alterações"), `BuilderShell`
(`panel_open`/`panel_close` no Meu Upgrade).

## 19. Motion tokens

Adicionados a `styles/tokens.css` (Fase 18 já tinha `--ds-duration-fast/normal/slow` e
`--ds-easing-base` — mantidos exatamente como estavam, nunca renomeados, porque dezenas de
componentes já os usam):

```css
--ds-duration-instant: 80ms;   /* resposta a clique — nunca uma transição decorativa */
--ds-duration-fast: 120ms;     /* já existia — hover, foco */
--ds-duration-normal: 200ms;   /* já existia — entrada de elemento simples */
--ds-duration-slow: 360ms;     /* já existia — drawers, painéis (Nível 2) */
--ds-duration-scene: 480ms;    /* novo — transição de cena (Nível 3) */

--ds-easing-base: cubic-bezier(0.4, 0, 0.2, 1);       /* já existia — nome original, mantido */
--ds-easing-standard: var(--ds-easing-base);          /* novo — mesmo valor, nome canônico novo */
--ds-easing-emphasized: cubic-bezier(0.16, 1, 0.3, 1); /* novo — entradas fortes, "chega com intenção" */
--ds-easing-exit: cubic-bezier(0.4, 0, 1, 1);          /* novo — reservado para saídas (Nível 2/3 futuro) */
--ds-easing-smooth: cubic-bezier(0.65, 0, 0.35, 1);    /* novo — reservado para cross-fades contínuos */

--ds-stagger-xs: 40ms;  /* novo — reservado para stagger entre 3-5 itens pequenos */
--ds-stagger-sm: 80ms;
--ds-stagger-md: 140ms;
```

`--ds-easing-exit`/`smooth` e os três `--ds-stagger-*` ainda não têm nenhum consumidor real nesta
fase (documentados e definidos, prontos para a implementação com GSAP — nenhum token solto fica
inventado na hora, todos já nascem no lugar certo).

## 20. Hierarquia de movimento

| Nível | O que é                         | Exemplos já implementados                          |
| ----- | -------------------------------- | --------------------------------------------------- |
| 1     | Microinterações                  | hover/active/focus de botões e cards, seleção        |
| 2     | Transições de bloco               | drawer do Meu Upgrade (entrada)                      |
| 3     | Transições de cena                 | `SceneTransition` no Builder (todas as telas)        |
| 4     | Motion narrativo (futuro)          | scroll storytelling da Home — não implementado ainda |

## 21. Acessibilidade — `prefers-reduced-motion`

Regra global já existente desde a Fase 18 (`styles/tokens.css`) zera **qualquer**
`animation-duration`/`transition-duration` para `0.01ms` quando o sistema pede motion reduzido —
cobre 100% do que foi implementado nesta fase (todas as animações são CSS puro: `SceneTransition`,
entrada do drawer, `:active` dos cards/botões), sem precisar de nenhuma condicional nova nos
componentes. Para motion futuro orquestrado em JS (ex.: um `setTimeout` esperando uma animação
"de verdade" terminar), `useReducedMotion()` (`features/design-system/motion/useReducedMotion.ts`,
via `useSyncExternalStore`, SSR-safe) já está pronto para consulta — ainda sem nenhum consumidor
nesta fase, porque nenhum motion atual depende de temporização em JS. Em ambos os casos, a pessoa
com motion reduzido continua usando o site normalmente — nenhuma funcionalidade depende de uma
animação terminar (o estado já muda antes/independente do motion, Seção 26).

## 22. Performance

Toda animação desta fase usa só `transform`/`opacity` (nunca `width`/`height`/`top`/`left` ou
outras propriedades que forçam reflow) — `SceneTransition`, entrada do drawer, `:active` dos
cards/botões. Nenhum `will-change` foi adicionado (as animações são curtas e pontuais, não
justificam o custo de memória de promover uma camada de composição antecipadamente — reservado
para se algum motion futuro de scroll/parallax realmente precisar).

## 23. Preparação para GSAP (próxima fase)

| Interação                                   | Hoje (esta fase)      | Próxima fase                          |
| -------------------------------------------- | ---------------------- | --------------------------------------- |
| Hover/active/foco de botões e cards          | CSS puro (`:hover`/`:active`) | Continua CSS — não precisa de GSAP |
| Entrada de cena do Builder                   | CSS + remount por `key` | GSAP Timeline (permite animar saída também) |
| Entrada do drawer Meu Upgrade                | CSS puro                | GSAP (saída animada, spring físico)     |
| Stagger de texto/blocos (pergunta, resumo)    | Não implementado        | GSAP (`stagger`)                        |
| Scroll storytelling da Home                  | Não implementado        | GSAP + ScrollTrigger                    |
| Parallax sutil, hover rico com cursor         | Não implementado        | GSAP (desktop apenas)                   |
| Sound design real                            | Arquitetura preparada, inerte | Biblioteca de áudio real atrás de `playSound` |

## 24. Limitações desta fase

- Nenhuma animação de **saída** de cena/drawer — só entrada (ver Seções 7/9 para o motivo técnico).
- Nenhum stagger real implementado ainda (tokens prontos, sem consumidor).
- Home não recebeu nenhuma implementação de motion nesta fase (só direção documentada, Seção 14).
- Nenhum som real toca — arquitetura pronta, inerte por design (Seção 17).
- Cursor customizado/parallax/hover rico: não implementados, mapeados para a próxima fase.
