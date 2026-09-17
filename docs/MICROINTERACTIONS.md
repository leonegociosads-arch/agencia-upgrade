# MICROINTERAÇÕES — Agência Upgrade

> Fase Microinterações do roadmap (Etapa 24). Adiciona uma camada consistente de resposta a
> hover/clique/foco/seleção/abrir/fechar/sucesso/erro em todo o site, usando o Nodeck
> (nodeck.online) como referência de LINGUAGEM (resposta física, humor, sound design, sensação
> tátil) — nunca de layout, identidade ou comportamento literal. Ver
> `docs/IMPLEMENTATION-STAGE-24.md` para o resumo técnico (arquivos, testes, performance).

---

## 1. Linguagem (a matriz interação → resposta)

Mesma resposta para o mesmo tipo de interação em qualquer lugar do site (briefing, Seção 59: "não
inventar uma linguagem nova por seção"):

| Interação | Resposta |
| --- | --- |
| Hover num card | tilt 3D sutil (`useTilt`) + leve elevação |
| Hover num botão primário | sheen (faixa de luz) + leve `translateY` |
| Clique (qualquer botão/card) | compressão rápida (`scale` 0.96–0.98) + `ui_press`/`card_select` |
| Seleção | borda + fundo + selo de check — nunca só cor |
| Ficar habilitado (Próximo/Continuar) | pulso curto único (`useEnabledPulse`) |
| Abrir painel | fade + scale do conteúdo, foco move (Fase GSAP e Transições, `Drawer`) |
| Fechar painel | inverso, controlado |
| Sucesso | check com pequena escala + `success` |
| Erro | mudança de cor + mensagem — nunca shake forte |
| Remover (destrutivo) | ícone revela no hover + contraste sobe — nunca brincalhão |

## 2. Botões

`Button.module.css`/`Button.tsx` (Design System, inalterado na API): `:hover` já tinha
`translateY(-1px)` e `:active` já tinha `scale(0.96)` (Fase Motion Design/GSAP); esta fase soma um
**sheen** — uma faixa de luz diagonal que atravessa o botão `primary` no hover (`::after`,
`transform`/`opacity`, nunca mais que isso) — só no `primary`, o botão mais importante da
hierarquia (Seção 61: "não exagerar"). `secondary`/`ghost`/`danger` continuam só com a mudança de
cor que já tinham. Todos os 4 continuam com os mesmos estados: `default`/`hover`/`active`/
`focus-visible`/`disabled`/`loading`.

`ui_press` (som) é chamado nos pontos de clique genéricos que ainda não tinham um som próprio
mapeado (`RemoveServiceDialog`, `MyUpgrade`, `ProjectReviewService`, `LeadForm`) — nunca duplicado
com um evento mais específico que já existia (`card_select`, `scene_advance`, `confirm`...).

## 3. Cards do Builder (prioridade #1 do briefing)

`ServiceSelector` (Cena 1) e as opções de `QuestionRenderer` (Cena 2+) ganharam **tilt 3D
extremamente sutil** (`useTilt`, máximo 3°/2.5° — Seção 11: "evitar aparência de template 3D
genérico") — só em desktop com ponteiro fino (`useFinePointer`) e sem `prefers-reduced-motion`.
Mesma linguagem aplicada aos cards de "O que fazemos" na Home (`CapabilitiesSection`) — Seção 59:
reaproveitar, não inventar de novo.

**Por que uma extração para `ServiceCard`/`OptionCard`/`CapabilityCard`**: um Hook do React não
pode ser chamado dentro do `.map()` do componente pai — cada card precisa da própria instância de
`useTilt()`. Isso levou `Card` (Design System) a ganhar `forwardRef` (mesmo padrão já usado em
`Button`/`LinkButton`/`SectionContainer` desde fases anteriores).

A lógica de seleção da Etapa 22 continua: press → selected → highlight persistente (borda + fundo
+ check), sem mudança de comportamento — só o tilt por cima. "Próximo"/"Continuar" ganham um pulso
curto único (`useEnabledPulse`) ao passar de desabilitado para habilitado (Seção 15); "Voltar"
continua deliberadamente mais discreto (só cor, nunca elevação — Seção 16).

## 4. CTA principal e efeito magnético

"Monte seu Upgrade" (Header, Hero, CTA final da Home) ganhou um **magnetismo muito leve**
(`useMagneticHover`, deslocamento máximo de 8px, `power3.out`) — só nesses 3 pontos, nunca em
nenhum outro botão (briefing Seção 8: "poucos elementos importantes"). `LinkButton` ganhou
`forwardRef` para isso ser possível (mesmo padrão de `Card`/`SectionContainer`).

## 5. Cursor customizado

Implementado como um **halo que acompanha o cursor nativo — nunca o substitui** (`CustomCursor`,
briefing Seção 9: "não substituir usabilidade normal"). Cresce e ganha um preenchimento verde
suave sobre qualquer elemento interativo (detectado via UM listener delegado de `pointerover`/
`pointerout` no `document`, nunca um listener por elemento — Seção 56/57). Só em desktop com
ponteiro fino, nunca com `prefers-reduced-motion`, nunca no admin (montado só em `SiteHeader`/
`BuilderNavigation`).

Decisão deliberada de risco baixo: por NÃO esconder a seta nativa, qualquer falha silenciosa deste
componente nunca compromete a navegação — o pior cenário é simplesmente o halo não aparecer.

## 6. Sound design

`features/design-system/motion/sound.ts` — os hooks já existiam desde a Fase Motion Design/GSAP
(`playSound`, inerte). Esta fase liga o corpo a **osciladores sintetizados em tempo real via Web
Audio API** — nunca um arquivo de áudio gravado (briefing Seção 41: "usar somente assets próprios,
licenciados... documentar fonte/licença"). Uma onda senoidal/triangular curta com envelope de
volume não tem "origem" para licenciar — é matemática gerada no navegador, 100% original.
Documentado aqui como a fonte: nenhum asset externo, nenhuma licença necessária.

10 eventos (`SoundEvent`): `card_select`, `scene_advance`, `scene_back`, `confirm`,
`service_complete`, `panel_open`, `panel_close` (desde fases anteriores) + `ui_press`, `success`,
`hover_special` (novos nesta fase). Cada evento é uma nota curta (40–180ms), volume baixo
(ganho ≤ 0.07), nunca mais de uma nota por evento (Seção 37).

**Opt-in, nunca autoplay** (Seções 38/39/40): som começa desligado; `SoundToggle` (ícone de
alto-falante, `aria-pressed`, `localStorage` persistente) é a "interação clara do usuário" que
liga o som — nunca antes disso. `AudioContext` é criado/retomado só dentro desse clique (nunca no
mount de nenhum componente), respeitando a política de autoplay do navegador.

Reforço, nunca única confirmação (Seção 55) — toda ação com som já tem uma mudança visual
equivalente por conta própria (nenhuma informação depende só de áudio).

## 7. Object interactions / interação-surpresa

**Uma única** interação "surpresa" no site (briefing Seções 34/35: "1 ou 2... nunca em CTA
principal, formulário, submit"): o grafismo diagonal decorativo do Hero (`aria-hidden`, sem
função) se afasta levemente do cursor quando ele chega perto (`useAvoidCursor`, inspirado na IDEIA
do botão que foge do Nodeck — nunca copiando o elemento/mecânica). Toca `hover_special` só na
PRIMEIRA vez que acontece na página (um easter egg é descoberto uma vez, não repetido a cada
passada de mouse). Nenhum outro elemento do site tem esse comportamento.

## 8. Meu Upgrade

- **Remover**: o rótulo de texto sempre esteve visível; agora um ícone de lixeira revela (largura/
  opacidade animadas) no hover/foco, e o contraste sobe para vermelho — comunica intenção sem
  nenhum comportamento brincalhão (Seção 18). Mesmo tratamento em `ProjectReviewService`
  (`TrashIcon` extraído para um componente compartilhado, para as duas telas nunca terem dois
  símbolos diferentes para "remover").
- **Expandir**: "+ N mais" agora é um botão de verdade que revela o resumo completo (e "Mostrar
  menos" recolhe de volta) — a interação de "expandir" que a Seção 17 pedia.
- **Abrir/fechar**: já implementado na Fase GSAP e Transições (`Drawer`) — sem mudança nesta fase.
- **Confirmar remoção**: `RemoveServiceDialog` ganhou uma entrada rápida e discreta (fade +
  deslocamento mínimo, nunca um "pop" de escala — Seção 18 de novo: nada brincalhão para uma ação
  destrutiva).

## 9. Inputs / Checkbox / Radio / Select

`Input.module.css` (compartilhado por `Input`/`Select`/`Textarea` via `inputStyles.control`):
ganhou um `box-shadow` suave (glow) ao focar, além da borda/outline que já existiam — cor do glow
muda para o tom de erro quando o campo é `invalid` E está focado. Hover ganhou uma leve mudança de
borda (exceto em campos inválidos, para nunca mascarar o estado de erro).

`Checkbox`/`Radio` continuam controles `<input>` nativos (decisão da Fase 18, mantida — um visual
customizado abriria mão de todo o comportamento de acessibilidade nativo). Ganharam um "pop" de
escala curto (180ms) ao marcar — o reforço tátil possível sem substituir o controle.

`Select` continua um `<select>` nativo estilizado — o popup de abrir/fechar é controlado pelo
sistema operacional/navegador, não é possível (nem desejável) animá-lo com CSS/JS de forma
consistente entre navegadores; documentado aqui como limitação aceita, não esquecida.

## 10. Links

`SiteHeader` (`.navLink`) e `SiteFooter` (`.link`) ganharam a MESMA técnica de sublinhado animado
(`background-size`, não `width` — nunca gera layout thrashing): entra da esquerda para a direita no
hover/foco, some instantaneamente ao sair (Seção 28: "entrada e saída consistentes" — a saída
"consistente" aqui é ser sempre imediata, sem uma segunda animação reversa que atrasaria o próximo
hover). Reaproveitada nos dois lugares — Seção 59, de novo.

## 11. Header / logo / menu mobile

- Header ganha um pouco mais de contraste/blur ao rolar (`useScrolled`, `passive` listener via
  `useSyncExternalStore`) — reforça hierarquia sem virar "um show separado" (Seção 30).
- Logo (`SiteHeader`/`BuilderNavigation`): hover discreto, só opacidade — nunca distorce a marca
  (Seção 32).
- Menu mobile: entrada com fade + leve deslocamento (`@keyframes`), itens ganham feedback de toque
  (`:active { opacity }`, nunca `transform`, para não deslocar os vizinhos numa lista vertical).

## 12. Admin

Nenhuma mudança nesta fase — o Admin já reaproveita os componentes-base do Design System
(`Button`, etc.), então já herda os estados de hover/press/focus/loading sem precisar de nada
específico. Nenhum cursor customizado, tilt, magnetismo ou som foi adicionado lá, como pedido
(briefing Seção 49).

## 13. Mobile / touch

Nenhuma interação desta fase depende de hover para FUNCIONAR (só para reforço visual em desktop) —
`useFinePointer()` (`(hover: hover) and (pointer: fine)`) gateia tilt, magnetismo, cursor e a
interação-surpresa, nunca `window.innerWidth` (Seção 52: diferenciar por capacidade real do
ponteiro, não por tamanho de tela). Verificado com emulação de dispositivo touch real
(`devices["iPhone 13"]` do Playwright, não só redimensionar a janela — resultado registrado em
`docs/IMPLEMENTATION-STAGE-24.md`): nenhum halo de cursor, nenhum tilt, toque ainda ativa
press/seleção normalmente.

## 14. Reduced motion

Cada hook novo (`useTilt`, `useMagneticHover`, `useAvoidCursor`, `CustomCursor`) checa
`useReducedMotion()` e simplesmente não anexa nenhum listener quando ativo — nunca uma versão
"mais lenta" da mesma animação, e sim a ausência dela (Seção 53: "sem tilt... sem magnetic"). O
`@keyframes` de CSS puro (sheen, pulso, pop do checkbox, entrada do menu mobile/diálogo) já é
zerado pela regra global de `styles/tokens.css` desde a Fase 18 — nenhum tratamento extra precisou
ser escrito para esses casos.

## 15. Performance

- Nenhum listener global de mouse para "dezenas de elementos" — `useTilt`/`useMagneticHover` são
  UM `pointermove`/`pointerleave` POR elemento que os usa (Seção 56); `CustomCursor` é a única
  exceção deliberada e documentada (um listener de `pointermove` no `window`, para UM elemento
  decorativo só, mais um `pointerover`/`pointerout` delegado no `document` para detectar hover
  sobre QUALQUER interativo sem precisar de um listener por botão/link).
- Todo o motion novo usa só `transform`/`opacity`/`box-shadow`/`filter` leve — nunca `top`/`left`/
  `width`/`height`.
- `gsap.quickTo()` (não `gsap.to()` repetido) para tudo que responde a `pointermove` de alta
  frequência — a forma mais barata do GSAP de atualizar uma propriedade continuamente.
- Nenhum estado do React é atualizado a cada `pointermove` em nenhum hook novo — todos escrevem
  direto no DOM via GSAP (Seção 57: "não usar React state a cada mousemove se puder evitar").
- Cleanup garantido em todos os hooks (listeners removidos, `gsap.set(..., {clearProps})` ao
  desmontar ou ao sair do elemento).
