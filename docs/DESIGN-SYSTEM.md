# DESIGN SYSTEM — Agência Upgrade

> Fase 18 do roadmap. Documenta a fundação visual criada nesta fase: tokens (`styles/tokens.css`)
> e componentes-base (`features/design-system/components/`). **Não aplicada a nenhuma tela já
> existente** (Home, Builder, admin) — isso é o trabalho da Etapa 19. Existe uma rota de
> demonstração em `/design-system` (bloqueada em produção), e `docs/IMPLEMENTATION-STAGE-18.md`
> resume a implementação técnica.

---

## 1. Princípios

A identidade visual definida nesta fase (baseada na referência de marca fornecida — logo, paleta,
tipografia) precisa transmitir tecnologia, sofisticação, modernidade, autoridade, criatividade e
uma sensação premium — mais **estúdio digital** do que agência de marketing genérica. Isso se
traduz em decisões concretas:

- **Tema escuro como padrão/flagship** — o fundo preto puro (`#000000`) é o ponto de partida, não
  um "modo escuro opcional"; é o que mais reforça a leitura de tecnologia/premium pedida pelo
  briefing. Um conjunto completo de tokens para tema claro também existe (a referência de marca
  mostrava os dois), ativável via `[data-theme="light"]`, mas nenhum mecanismo de alternância foi
  construído nesta fase — só os valores, prontos.
- **O verde da marca é usado com moderação** — reservado a destaque/interação (CTAs, seleção,
  links), nunca espalhado como decoração. Este é também o motivo de `--ds-color-success` NUNCA
  reutilizar o mesmo tom do `--ds-color-accent`: o briefing pediu explicitamente para não deixar
  uma cor de status virar a identidade principal — ver Seção 2.
- **Nenhum clichê de agência de marketing** — sem foguetes, gráficos subindo, gradientes genéricos,
  excesso de neon ou aparência de template pronto. Os componentes desta fase são deliberadamente
  sóbrios: bordas finas, cantos poucos e consistentes, sombras discretas, tipografia como
  protagonista.
- **Contraste calculado, não estimado.** Toda combinação texto/fundo usada por um componente-base
  foi verificada contra a fórmula de contraste relativo do WCAG (não só "parece legível") — ver
  Seção "Contraste" abaixo.

## 2. Cores

Tokens semânticos, nunca hex direto em componente (`docs/DESIGN-SYSTEM.md`, todo componente em
`features/design-system/components/*.module.css` só referencia `var(--ds-color-*)`).

| Token | Tema escuro | Tema claro | Uso |
|---|---|---|---|
| `--ds-color-bg` | `#000000` | `#FBFBFB` | Fundo principal da página |
| `--ds-color-bg-secondary` | `#0B0F14` | `#F1F3F5` | Fundo de seções alternadas |
| `--ds-color-surface` | `#12171D` | `#FFFFFF` | Cards, inputs, painéis |
| `--ds-color-surface-elevated` | `#1B222B` | `#FFFFFF` (+ sombra) | Cards/painéis "flutuantes" |
| `--ds-color-border` | `#262E37` | `#E2E5E9` | Divisores sutis |
| `--ds-color-border-strong` | `#3A4552` | `#C7CDD3` | Bordas de inputs/botões outline |
| `--ds-color-text-primary` | `#FBFBFB` | `#12171D` | Texto principal |
| `--ds-color-text-secondary` | `#A6B0BB` | `#4B5560` | Texto de apoio |
| `--ds-color-text-disabled` | `#5B6570` | `#9AA3AC` | Texto/ícone desabilitado |
| `--ds-color-accent` | `#2DB958` | `#2DB958` | Verde da marca — CTAs, destaque, seleção |
| `--ds-color-accent-text` | `#2DB958` | `#158239` | Verde como texto/ícone corrido (ver "Contraste") |
| `--ds-color-on-accent` | `#0A0E12` | `#0A0E12` | Texto/ícone sobre uma superfície `accent` |
| `--ds-color-interactive` | = `accent` | = `accent` | Token semântico separado (ver Seção "Por que dois tokens iguais") |
| `--ds-color-success` | `#22A35A` | `#17853F` | Feedback positivo |
| `--ds-color-warning` | `#E8A33D` | `#8A5A00` | Feedback de atenção |
| `--ds-color-error` | `#E5484D` | `#C7343A` | Feedback de erro |
| `--ds-color-info` | `#4C9FE8` | `#175EA8` | Feedback informativo |
| `--ds-color-focus-ring` | `accent` | `accent-text` | Contorno de foco |

Cada cor de status (`success`/`warning`/`error`/`info`) tem uma família própria, deliberadamente
distante do verde de destaque — o briefing pediu para "não usar cores de status como identidade
principal"; misturar os dois faria a marca parecer só mais um painel/dashboard genérico.

### Por que `--ds-color-interactive` existe com o mesmo valor de `--ds-color-accent`

Hoje os dois valem o mesmo verde. São tokens SEPARADOS de propósito: `accent` representa a cor de
**marca** (usada também fora de contexto interativo — ex.: um badge de destaque), `interactive`
representa a cor de **ação** (links, foco, elementos clicáveis). Se um refinamento futuro decidir
diferenciá-los (ex.: um azul-petróleo só para links), só este arquivo muda — nenhum componente
precisa ser tocado.

### Contraste

Todo par texto/fundo usado por um componente foi calculado (razão de contraste WCAG), não só
observado visualmente:

- Texto sobre `--ds-color-accent` (botão primário, badge de destaque): **nunca branco** — mede
  só ~2.5:1 nos dois temas (reprovado). Um texto quase preto (`--ds-color-on-accent`, `#0A0E12`)
  mede ~7.5:1 nos dois temas — é por isso que todo botão/badge "sobre verde" usa essa cor, não
  branco.
- Verde da marca como TEXTO corrido: no tema escuro, o verde puro sobre preto já mede ~8:1 (usado
  direto). No tema claro, o mesmo verde sobre `#FBFBFB` mede só ~2.5:1 (reprovado) — por isso
  `--ds-color-accent-text` usa um tom mais escuro (`#158239`, ~4.7:1) só quando o verde aparece
  como texto/ícone no tema claro.
- `success`/`warning`/`error`/`info`: cada tom foi ajustado por tema para medir pelo menos 4.5:1
  contra o fundo principal daquele tema quando usado como texto (ex.: `warning` no tema claro é
  `#8A5A00`, não um amarelo vívido, porque um amarelo vívido não atinge contraste suficiente como
  texto sobre fundo claro).

## 3. Tipografia

Duas famílias, cada uma com uma função clara (vindo da referência de marca):

- **Montserrat** (`--ds-font-display`) — títulos e destaques (`Heading`, `display`/`h1`/`h2`/`h3`).
  Uma fonte geométrica e confiante, sem parecer "futurista ilegível".
- **Inter** (`--ds-font-body`) — texto corrido, labels, inputs, botões. Alta legibilidade em telas
  pequenas (Builder, formulários) — o motivo de não usar Montserrat para tudo.

Carregadas via `next/font/google` em `app/layout.tsx`, ao lado das fontes Geist já existentes
(nunca as substituindo — nenhuma tela atual foi migrada, ver Seção 16).

| Variante | Tamanho | Peso | Line-height | Fonte |
|---|---|---|---|---|
| Display | 3.5rem | Bold | 1.1 | Montserrat |
| H1 | 2.5rem | Bold | 1.1 | Montserrat |
| H2 | 2rem | Semibold | 1.25 | Montserrat |
| H3 | 1.5rem | Semibold | 1.25 | Montserrat |
| Body Large | 1.125rem | Regular | 1.6 | Inter |
| Body | 1rem | Regular | 1.6 | Inter |
| Body Small | 0.875rem | Regular | 1.5 | Inter |
| Label | 0.8125rem | Semibold | 1.5 | Inter |
| Caption | 0.75rem | Regular | 1.5 | Inter |

Implementado em `Heading`/`Text` (`features/design-system/components/`), que nunca aceitam
tamanho/peso livre — só uma das variantes acima.

## 4. Escala de espaçamento

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96` (px) — `--ds-space-1` a `--ds-space-24`. Exatamente a
escala sugerida pelo briefing; nenhum componente usa um valor de espaçamento fora dela.

## 5. Grid e containers

- **Largura máxima**: 1240px (`--ds-container-max-width`).
- **Margens/gutters**: `--ds-space-4` (16px) no mobile, `--ds-space-8` (32px) a partir de 768px,
  `--ds-space-12` (48px) a partir de 1024px — implementado em `SectionContainer`.
- **Breakpoints**: `sm: 480px` · `md: 768px` · `lg: 1024px` · `xl: 1280px`. Documentados aqui
  porque `@media` não lê custom properties — cada CSS Module usa o valor literal correspondente a
  um destes nomes, nunca um número "inventado" fora da lista.
- Nenhum layout de página foi criado — só o container reutilizável.

## 6. Bordas, raios e sombras

```
--ds-radius-sm   6px   (badges, controles pequenos)
--ds-radius-md   10px  (botões, inputs)
--ds-radius-lg   16px  (cards)
--ds-radius-full 999px (pílulas, avatares)
```

Sombras (`--ds-shadow-sm/md/lg`) calibradas por tema — o tema escuro precisa de mais opacidade de
preto para a sombra aparecer sobre um fundo já escuro; o tema claro usa sombras bem mais suaves.
Usadas só em `Card elevated` nesta fase.

## 7. Botões

`Button` (`features/design-system/components/Button.tsx`) — variantes `primary`/`secondary`/
`ghost`/`danger`, tamanhos `sm`/`md`/`lg`, estados `default`/`hover`/`active`/`focus-visible`/
`disabled`/`loading`. `loading` desabilita o botão, mostra um `Spinner` e mantém o texto original
no DOM (visualmente oculto, não removido) para o nome acessível do botão continuar o mesmo. Nunca
uma variante nova por página — as 4 cobrem os casos previstos.

## 8. Formulários

Sistema para `text`/`email`/`tel` (via `Input`, usando a prop nativa `type`), `textarea`
(`Textarea`), `select` (`Select`), `checkbox`/`radio` (`Checkbox`/`Radio` — inputs nativos com
`accent-color: var(--ds-color-accent)`, deliberadamente não caixinhas desenhadas à mão: o controle
nativo já vem com todo o comportamento de teclado/leitor de tela correto).

`FormField` é o padrão único de rótulo + mensagem: recebe `label`/`htmlFor`/`error`/`hint`/
`required` e o controle como filho; liga a mensagem de erro/dica ao controle via
`aria-describedby` (e `aria-invalid` quando há erro) automaticamente — quem usa só precisa garantir
que o `id` do controle bate com o `htmlFor`. Mesmo padrão de acessibilidade que
`features/lead/components/LeadField.tsx` (Fase 12) já usava — esta fase formaliza o padrão como um
componente reutilizável, não o inventa do zero.

Estados: `default`, `focus` (contorno + borda verde), `filled` (`:not(:placeholder-shown)`, sem
precisar de estado controlado em React), `error` (via a prop `invalid`, borda/contorno vermelhos),
`disabled`.

## 9. Cards

`Card` — um único componente composável (`elevated`, `padding`, `selected`), não um card por
contexto (o briefing pediu para não criar "Service Card, Question Option Card..." como
componentes separados quase idênticos). A Etapa 19 decide como compor `Card` + `Heading`/`Text`
para cada caso real (serviço, opção de pergunta, resumo do projeto, item do admin).

## 10. Estados de seleção

`Card selected` nunca depende só de cor: borda `accent`, fundo `accent-soft` E um ícone de check no
canto — três sinais independentes, para quem não distingue bem cores (ou usa um monitor/impressão
em escala de cinza) ainda perceber a seleção pelos outros dois. Pensado para os cards de escolha do
Builder (Etapa 19 aplica isso lá — nada no Builder foi tocado nesta fase).

## 11. Feedback

- **success/warning/error/info** — `Alert` (banner com ícone + texto — nunca só a cor da borda);
  `error` usa `role="alert"` (interrompe o leitor de tela), os outros três usam `role="status"`.
- **loading** — `Spinner` (usado sozinho, ou dentro de `Button loading`).
- **empty state** — `EmptyState` (título + descrição opcional + ação opcional). Não substitui
  `features/admin/components/EmptyState.tsx` (Fase 16) — aquele continua como está; este é o
  primitivo genérico para qualquer tela NOVA da Etapa 19 em diante.

## 12. Meu Upgrade (conceitual)

Nenhum componente do "Meu Upgrade" foi criado nesta fase (o briefing pediu só a base conceitual).
Mapeamento de intenção para quando a Etapa 19 implementar: item de serviço → `Card` + `Heading h3`
+ `Text`; badge "Configurado" → `Badge tone="success"`; editar/remover → `Button variant="ghost"
size="sm"`; contador → `Badge tone="neutral"`; painel/drawer → `Card elevated` dentro de um
container próprio (layout ainda não desenhado).

## 13. Admin

O admin usa os MESMOS tokens/tipografia/botões/inputs do resto do site (nenhum sistema visual
paralelo) — só compõe de forma mais sóbria/funcional, sem o mesmo nível experimental que a Home
pode ter. Nada do admin existente (Fase 16) foi migrado nesta etapa.

## 14. Motion tokens (conceituais)

```
--ds-duration-fast   120ms  (hover, pequenas mudanças de estado)
--ds-duration-normal 200ms  (transições padrão)
--ds-duration-slow   360ms  (transições maiores)
--ds-easing-base      cubic-bezier(0.4, 0, 0.2, 1)
```

Únicos usos reais nesta fase: transições de `hover`/`focus` dos componentes-base (cor de fundo,
borda). Nenhuma animação de entrada/scroll — isso pertence à fase de Motion/GSAP. O `Spinner` usa
uma duração própria fixa (900ms), não um destes tokens — um loop contínuo tem uma necessidade
diferente de uma transição discreta.

## 15. Acessibilidade

- **Contraste**: ver Seção 2, "Contraste" — calculado, não estimado.
- **Foco visível**: todo componente interativo (`Button`, `Input`, `Textarea`, `Select`,
  `Checkbox`, `Radio`) tem `:focus-visible` com contorno de 2px na cor de foco do tema.
- **Tamanhos clicáveis**: botões têm no mínimo 36px de altura (`sm`); inputs/selects, 44px.
- **Estados não dependentes só de cor**: `Card selected` (Seção 10), `Alert`/`Badge` (sempre
  ícone/texto, nunca só a cor de fundo), erro de formulário (texto explícito, não só borda
  vermelha).
- **Tipografia legível**: nenhuma fonte "decorativa" difícil de ler foi escolhida — Montserrat para
  títulos continua com boa legibilidade mesmo em tamanhos menores.
- **`prefers-reduced-motion`**: uma regra global em `styles/tokens.css` já neutraliza qualquer
  transição/animação para quem pediu menos movimento no sistema operacional — pronta antes mesmo
  de existir motion real no site.

## 16. Responsividade

Todo token funciona nos três breakpoints (Seção 5); nenhum componente depende só de `:hover` para
uma função ESSENCIAL (`Select` abre com clique/toque normal do navegador; `Card selected` mostra a
marca de check sem precisar de hover). `SectionContainer` ajusta padding lateral em 3 faixas.
Nenhuma tela real foi testada em produção ainda (não existe nenhuma tela nova) — a rota
`/design-system` (Seção 17) é visualmente responsiva, verificado manualmente.

## 17. Showcase interno

`/design-system` (`app/design-system/page.tsx`) — mostra cores, tipografia, espaçamento, botões,
badges, inputs (com um exemplo de erro e um desabilitado), cards (padrão/elevado/selecionado) e
feedback (`Alert`, `Spinner`, `EmptyState`). Bloqueada em produção (`notFound()` quando
`NODE_ENV === "production"`) — é uma ferramenta de desenvolvimento, nunca uma página real do site;
sem link nenhum na navegação pública.

## 18. Limitações

- Tema claro totalmente tokenizado, mas sem nenhum mecanismo de alternância (toggle) — só os
  valores, prontos para quando/se uma tela precisar.
- Nenhum componente foi aplicado a uma tela real (Home, Builder, admin) — essa é a Etapa 19.
- `Checkbox`/`Radio` usam o controle nativo estilizado via `accent-color`, não uma caixa desenhada
  do zero — suficiente para a fundação, um visual mais elaborado pode vir depois sem mudar a API.
- Sem nenhuma animação real (entrada, scroll, hover complexo) — só os tokens de duração/easing,
  prontos para a fase de Motion/GSAP.
- Testes de responsividade limitados à rota de showcase (não existe nenhuma tela real usando estes
  componentes ainda para testar).
