# GSAP E TRANSIÇÕES — Agência Upgrade

> Fase GSAP e Transições do roadmap. Implementa de verdade as transições planejadas na Fase Motion
> Design (Etapa 21) — GSAP core apenas (sem ScrollTrigger/Lenis/3D, isso é de fases futuras). Ver
> `docs/IMPLEMENTATION-STAGE-22.md` para o resumo técnico (arquivos, testes, problemas
> encontrados).

---

## 1. Auditoria inicial

Nenhum uso de GSAP existia no projeto antes desta fase (`grep -rl "gsap"` não encontrou nada em
código-fonte) — instalado do zero: `gsap@3.15.0`, só o pacote core (nenhum plugin — `ScrollTrigger`
fica para a Etapa 23, como pedido). Nenhuma dependência duplicada.

## 2. Arquitetura

Centralizada em `features/design-system/motion/` (a mesma pasta da Fase Motion Design):

- **`motionConfig.ts`** — `DURATION`/`EASE`/`STAGGER`/`DISTANCE`, espelhando 1:1 os tokens CSS de
  `styles/tokens.css` (segundos em vez de ms, nomes de ease do GSAP em vez de `cubic-bezier()` —
  ver Seção 6 abaixo para o porquê). Toda animação GSAP do projeto importa daqui — nenhum número
  solto em nenhum `gsap.to()`.
- **`SceneTransition.tsx`** — a transição de cena do Builder (Seção 3 abaixo).
- **`Drawer.tsx`** — abrir/fechar animado, genérico (Meu Upgrade hoje; reutilizável para um futuro
  drawer/modal).
- **`useReducedMotion.ts`** — já existia da Fase Motion Design; usado por `SceneTransition` e
  `Drawer` para decidir o caminho síncrono (Seção 8).
- **`sound.ts`** — já existia da Fase Motion Design; pontos de chamada expandidos nesta fase
  (Seção 9).

Nenhum `gsap.to(...)` solto em componentes de tela — os únicos dois lugares que chamam GSAP
diretamente são `SceneTransition.tsx` e `Drawer.tsx`; todo o resto (`ServiceSelector`,
`QuestionRenderer`, `ProjectReview`...) só consome o hook `useSceneNavigation()` (marca direção,
lê `isTransitioning`) — nunca importa `gsap` diretamente.

## 3. Estado primeiro, animação depois

Nenhum dos dois componentes de motion decide o que renderizar. `SceneTransition` recebe
`sceneKey`/`children` já calculados por `BuilderShell`+`getSceneKey` (Fase Motion Design) — o
estado (`BuilderContext`/reducer) já mudou antes de qualquer frame animar. `Drawer` recebe `open`
já decidido pelo estado local de `BuilderShell` (`showMyUpgrade`). Em nenhum lugar uma timeline
GSAP altera `serviceDraft`, `confirmedServices` ou qualquer outro dado comercial — confirmado
arquivo a arquivo: `gsap` nunca é importado em `features/builder/state/`, `features/builder/logic/`
ou nos reducers.

## 4. Transição de cena (`SceneTransition`)

Substituiu a versão só-CSS da Fase Motion Design (que só animava a entrada) por um **crossfade
completo com direção**:

- A cena ATUAL é sempre renderizada ao vivo (`children` direto — nunca uma cópia congelada), então
  um campo de formulário continua reagindo a cada tecla mesmo com uma transição de outra pergunta
  ainda no ar.
- A cena de SAÍDA é um retrato (`outgoing`) capturado no instante da troca, sobreposto via
  `position: absolute` enquanto desaparece (`.currentLayer` fica em fluxo normal, então a altura
  do container sempre reflete a cena NOVA, nunca fica presa à altura da anterior).
- Saída mais rápida que entrada (`DURATION.fast` = 120ms vs. `DURATION.scene` = 480ms, briefing
  Seção 20), com uma leve sobreposição (a entrada começa a 40% do caminho da saída) — um
  verdadeiro crossfade, não um "sai tudo, aí entra tudo".
- **Direção**: `markForward()`/`markBackward()` (expostos via `useSceneNavigation()`) definem se a
  cena nova entra da direita (avançar) ou da esquerda (voltar) — chamados pelos próprios botões
  ANTES de disparar a ação real (Seção 4 do briefing). Sem marcação explícita, o padrão é sempre
  "forward" (nunca uma direção aleatória — Seção 15 do briefing).
- **Bloqueio**: `isTransitioning` (do mesmo hook) fica `true` do início da saída até o fim da
  entrada — todo botão de fluxo (`Continuar`, opções, `Voltar`, `Confirmar alterações`) primeiro
  checa esse valor antes de agir, e também fica `disabled` visualmente. Ver Seção 5.
- **Caso especial**: a última resposta de uma configuração nova deixa a pergunta momentaneamente
  "vazia" (o efeito de auto-save ainda não rodou) — sem tratamento, isso geraria uma transição para
  uma cena em branco. `getSceneKey` (Fase Motion Design, ajustado nesta fase) detecta esse
  instante e reaproveita a chave da cena de conclusão, então não existe transição nenhuma para o
  meio disso.

## 5. Bloqueio durante a transição

`isTransitioning` (contexto de `SceneTransition`) é checado em TODOS os pontos que avançam ou
voltam uma cena: `ServiceSelector` (cards), `QuestionRenderer` (opções de escolha única, botão
"Continuar" de múltipla escolha, "Voltar", "Confirmar alterações", "Escolher outra área"/"Cancelar
edição"), `ProjectReview` ("Voltar"/"Continuar"). Cada um guarda com `if (isTransitioning) return;`
no `onClick` (funciona mesmo em ambientes onde o atributo `disabled` nativo não bloqueia o clique
— jsdom, por exemplo) E fica `disabled` visualmente. `isTransitioning` é estado LOCAL do motion —
nunca chega ao `BuilderContext`/reducer (Seção 4).

## 6. Por que não `CustomEase`

`--ds-easing-emphasized`/`exit`/`smooth` são `cubic-bezier()` (Fase Motion Design). O GSAP suporta
curvas bezier customizadas via o plugin `CustomEase`, mas ele exige registro
(`gsap.registerPlugin(CustomEase)`) e uma licença Club GreenSock para uso comercial fora do core —
peso e complexidade desnecessários para esta fase (briefing, Seção 2: "instalar somente o
necessário"). Em vez disso, `motionConfig.ts` mapeia cada token para o ease nativo do GSAP mais
próximo (`power2.inOut`, `expo.out`, `power2.in`, `sine.inOut`) — visualmente muito parecido, zero
dependência extra.

## 7. Cards e press feedback

Já existia desde a Fase Motion Design em CSS puro (`:active { transform: scale(...) }`,
`--ds-duration-instant`) em `ServiceSelector`/`QuestionRenderer` — mantido sem mudança (não haveria
ganho em reimplementar em GSAP algo que o CSS já faz bem, mais barato). O que esta fase adicionou
foi o `disabled`/guard de `isTransitioning` (Seção 5) por cima desse motion já existente — "outros
cards perdem destaque" (opções de múltipla escolha não marcadas, `.optionsHasSelection`) também já
vinha da Fase Motion Design, sem mudança.

## 8. Meu Upgrade (`Drawer`)

Abrir/fechar agora é uma animação GSAP de verdade (a Fase Motion Design tinha só uma entrada via
`@keyframes` CSS, sem saída animada):

- **Posição** (painel lateral no desktop, bottom sheet no mobile) continua 100% CSS/`@media`
  (`BuilderShell.module.css`) — o `Drawer` não sabe em qual breakpoint está.
- **Motion** é `opacity`+`scale` (0.97→1), igual nos dois layouts — evita o `Drawer` precisar saber
  a direção de entrada certa para cada um.
- **Fechar inverte de forma controlada**: o conteúdo continua montado durante a animação de saída
  (`DURATION.fast`, `EASE.exit`) e só desmonta de verdade quando ela termina — nunca um
  desaparecimento seco.
- **Foco** (Seção 25 do briefing — "abrir: backdrop, painel, conteúdo, foco"): ao abrir, o foco
  move para o painel (`tabIndex={-1}` + `.focus()`); ao fechar, volta para o elemento que estava
  focado antes de abrir (tipicamente o botão "Meu Upgrade" da navegação).
- Reaproveitável — qualquer futuro drawer/modal do projeto usa o mesmo componente.

## 9. Sound hooks (arquitetura preparada, ainda inerte)

`features/design-system/motion/sound.ts` (criado na Fase Motion Design) — `playSound(event)`
continua sem tocar nenhum áudio real (nenhum arquivo de som existe no projeto), mas os pontos de
chamada agora cobrem os 5 eventos pedidos pelo briefing desta fase (Seção 44): `card_select`
(seleção de serviço/opção), `scene_advance`/`scene_back` (avançar/voltar de cena — o briefing usa
"scene_next", mapeado para `scene_advance`, já existente desde a Fase Motion Design),
`service_complete` (dispara ao CHEGAR na tela de conclusão de um serviço — o momento real da
conclusão, não ao sair dela), `panel_open`/`panel_close` (abrir/fechar o Meu Upgrade).

## 10. Reduced motion

A regra CSS global (Fase 18) continua zerando qualquer `animation`/`transition` declarativa. Para
o motion orquestrado em JS desta fase (`SceneTransition`, `Drawer`), `useReducedMotion()` é
checado ANTES de criar qualquer timeline — com motion reduzido, a troca de cena/abertura do drawer
resolve via `gsap.set(...)` (aplica o estado final direto, sem interpolar nenhum frame) em vez de
`gsap.timeline()`. O fluxo funcional é idêntico nos dois casos — a única diferença é se existe ou
não interpolação visual no meio do caminho. Esse mesmo caminho síncrono é o que roda por padrão em
todo o ambiente de testes automatizados (`vitest.setup.ts` força `prefers-reduced-motion: reduce`)
— ver `docs/IMPLEMENTATION-STAGE-22.md`, Seção 5, para o raciocínio completo.

## 11. Mobile

`getSceneDistance()` (`motionConfig.ts`) reduz o deslocamento da transição de cena em ~40% abaixo
de 640px — telas pequenas não precisam do mesmo curso de "viagem" que o desktop para a troca
parecer clara (briefing, Seção 34: "menos deslocamento"). Duração/easing continuam os mesmos nos
dois casos (simplicidade — nenhum ganho perceptível em ter uma segunda tabela de durações só para
mobile). Nenhuma interação implementada nesta fase depende de hover/mouse (Seção 19 do briefing:
"no mobile nada pode depender disso") — toda seleção/avanço já era por clique/toque desde a Fase
19.

## 12. Performance e cleanup

- Toda animação usa só `transform`/`opacity` (nunca `width`/`height`/`top`/`left`) —
  `SceneTransition`, `Drawer`, e o motion CSS de cards/botões da Fase Motion Design.
- `gsap.context()` em ambos os componentes — `ctx.revert()` no cleanup do efeito garante que
  nenhuma timeline continua rodando depois que o componente desmonta (ou depois do Strict Mode do
  React re-executar o efeito em desenvolvimento — ver Seção 13 abaixo).
- Nenhum `will-change` foi adicionado (mesma decisão da Fase Motion Design — animações curtas e
  pontuais não justificam o custo de memória de uma camada de composição promovida antecipadamente).

## 13. React Strict Mode

Testado manualmente com `next dev` (que roda Strict Mode por padrão em Client Components). Efeito
esperado e aceito: em desenvolvimento, o duplo-disparo do Strict Mode pode fazer uma transição
reiniciar uma vez visivelmente (`ctx.revert()` mata a primeira execução antes da segunda recriar a
timeline do zero) — um "blip" só em desenvolvimento, nunca em produção (Strict Mode não
duplo-invoca efeitos fora de desenvolvimento). O estado final, em ambos os casos, sempre fica
correto — nunca uma cena presa a meio caminho ou um drawer preso aberto/fechado incorretamente.

## 14. Resize

Nenhuma posição é armazenada em pixels absolutos capturados uma vez (`getSceneDistance()` é
recalculada a cada transição, lendo `window.innerWidth` no momento em que a transição começa, não
guardada em estado) — uma mudança de largura de janela entre duas transições sempre usa a
distância correta para o tamanho atual.
