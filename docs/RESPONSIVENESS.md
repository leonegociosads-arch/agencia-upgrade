# RESPONSIVIDADE — Agência Upgrade

> Fase 20 do roadmap. Não altera identidade visual, UI final ou funcionalidades (Fase 19) — só
> responsividade, adaptação de layout e usabilidade entre tamanhos de tela. Ver
> `docs/IMPLEMENTATION-STAGE-20.md` para o resumo técnico (arquivos alterados, problemas
> encontrados, testes).

---

## 1. Breakpoints

Nenhum breakpoint novo foi criado — os quatro já definidos em `styles/tokens.css` (Fase 18) seguem
sendo a única referência:

| Nome | Valor  | Uso típico                                             |
| ---- | ------ | ------------------------------------------------------- |
| sm   | 480px  | empilhar ações lado a lado que não cabem mais           |
| md   | 768px  | navegação completa vs. compacta; grid de 2 colunas      |
| lg   | 1024px | grid de 3 colunas; espaçamento de container maior       |
| xl   | 1280px | teto da escala fluida de tipografia (`clamp()`)         |

Dois componentes (lista de leads do admin, drawer do Meu Upgrade) já usavam `640px` desde a Fase
19 para separar "celular" de "tablet para cima" — mantido de propósito (briefing, Seção 1: "não
mudar sem necessidade"): é um corte deliberado mais estreito que `md` para decisões que só fazem
sentido em telas realmente pequenas (tabela virar cards, painel lateral virar bottom sheet), não
uma inconsistência. O único ponto fora da tabela que existia solto (grid de capacidades da Home em
`900px`) foi realinhado para `1024px`/`640px` nesta fase.

## 2. Estratégia geral

"Mobile não é desktop reduzido" (Seção 2 do briefing) foi resolvido caso a caso, nunca com um
`transform: scale()` genérico:

- **Tipografia**: `--ds-font-size-display`/`h1`/`h2` (`styles/tokens.css`) viraram `clamp()` —
  fluidos entre um mínimo confortável em mobile e o mesmo valor máximo de antes (atingido a partir
  de ~1432px). Evita multiplicar `@media` só para `font-size` em cada `Heading` (Seção 15).
- **Espaçamento**: `padding-block` do hero/seções da Home reduz (não zera) abaixo de 640px (Seção
  16) — grande o suficiente para respirar, sem herdar os 96px do desktop.
- **Grids**: 3 → 2 → 1 colunas conforme espaço (Seção 19), nunca pulando direto de 3 para 1 e
  desperdiçando tablet.
- **Painéis**: o drawer do Meu Upgrade já virava bottom sheet desde a Fase 19 — esta fase só
  reforçou os detalhes de borda de tela (`dvh`, `safe-area-inset-bottom`).
- **Navegação**: `SiteHeader` (Home/institucionais) já tinha um menu hambúrguer completo desde a
  Fase 19; `BuilderNavigation` (Builder) ganhou `flex-wrap` para nunca quebrar o texto de um botão
  no meio da palavra quando não cabe ao lado do logo.

## 3. Home

- Hero: título fluido (Seção 1), grafismo decorativo (`heroGraphic`) já era contido por
  `max-width/max-height: 60vw`, sem mudança necessária.
- "O que fazemos": grid 3 colunas (desktop ≥1024px) → 2 colunas (768-1024px) → 1 coluna (<640px).
  Antes pulava de 3 para 1 já em 900px, desperdiçando tablets como iPad (768-1024px).
- Espaçamento entre seções reduzido em mobile (Seção 2 acima).
- Header (`SiteHeader`): nenhuma mudança nesta fase — já testado e funcionando desde a Fase 19.

## 4. Builder

Prioridade máxima do briefing (Seção 6) — revisado tela a tela com o fluxo real (não só a tela
inicial):

- **`BuilderNavigation`**: "Começar de novo" + "Meu Upgrade (N)" ao lado do logo quebravam o texto
  no meio da palavra em ≤375px aproximadamente (`flex` sem `wrap`, dois textos competindo por um
  espaço menor que a soma dos dois). Corrigido com `flex-wrap` no `.bar` — quando não cabe, o bloco
  de ações inteiro desce para uma segunda linha (nunca quebra uma palavra sozinha).
- **Opções de pergunta** (`QuestionRenderer`): já tinham área de toque adequada (padding generoso
  ao redor do check + texto) — nenhuma mudança necessária.
- **Progresso**: linha fina + contador "X de Y" já era leve o suficiente em mobile (Fase 19) —
  mantido.
- **Revisão de respostas** (tela "Confirmar alterações"): `.reviewItem` ganhou `min-width: 0` no
  bloco de pergunta/resposta e `overflow-wrap: break-word` na resposta — sem isso, uma resposta
  textual mais longa poderia empurrar o item além da largura do painel (Seção 29 do briefing,
  "testar conteúdo realista longo").
- **Botões `sm`** (Design System): usados em "Editar"/"Remover" do resumo e do diálogo de remoção
  — media query própria do componente `Button` sobe a altura de 36px para 44px abaixo de 640px,
  sem criar uma variante nova (Seção 8: "botões grandes"; Seção 36: "não duplicar componentes").

## 5. Meu Upgrade

Desktop continua painel lateral (`max-width: 420px`); mobile continua bottom sheet (`max-height:
85vh` como já era desde a Fase 19) — os ajustes desta fase foram de borda:

- `max-height: 85dvh` adicionado ao lado de `85vh` (Seção 21 — unidade moderna, evita que a barra
  do navegador mobile corte o topo do conteúdo).
- `padding-bottom: calc(var(--ds-space-6) + env(safe-area-inset-bottom))` no bottom sheet (Seção
  23) — em iPhones com home indicator, o conteúdo (inclusive o CTA "Finalizar projeto") não fica
  colado na borda de gesto.
- Botão de fechar ("×") ganhou área de toque mínima de 44×44px (antes ~32px) via `min-width`/
  `min-height`/margem negativa absorvida pelo padding do painel — sem mudar sua posição visual.

## 6. Resumo (Project Review)

`.value` (bloco por serviço) ganhou `overflow-wrap: break-word` pela mesma razão do item 4 acima
— nenhum outro ajuste foi necessário: "Voltar"/"Continuar" já cabem lado a lado até 360px (textos
curtos, testado).

## 7. Formulário de contato

Prioridade alta do briefing (Seção 11) — dois problemas reais foram encontrados e corrigidos aqui
(não existiam antes desta fase de testes, porque nenhum teste automatizado ou visual anterior
preenchia os campos com conteúdo realista longo):

1. **`<fieldset>` sem `min-width: 0`** estourava a largura do formulário em ≤390px (ver
   `docs/DECISIONS.md`, Fase 20, para o diagnóstico completo) — corrigido.
2. **Botões "Voltar ao projeto"/"Enviar meu projeto" lado a lado** não cabiam mais a partir de
   ≤480px (a soma das duas larguras passava da área disponível) — abaixo de 480px eles empilham
   (`flex-direction: column-reverse`, envio em cima, largura total), em vez de espremer.

Estados (focus/filled/error/disabled) continuam os mesmos da Fase 19 — só o layout mudou.

## 8. Success

Nenhum ajuste de responsividade foi necessário — já cabia bem em mobile desde a Fase 19 (selo,
título, nota de próximo passo, um único CTA). O título se beneficiou indiretamente do `clamp()` de
`h2` (item 1).

## 9. Admin

- Tabela de leads → cards em `max-width: 640px` (decisão já da Fase 16, mantida).
- Grids de estatísticas (`DashboardSummary`, `AnalyticsOverview`) → 2 colunas em `max-width:
  640px` (já existia, confirmado ainda correto).
- Filtros (`LeadsFilters`) já usavam `flex-wrap` — nenhuma mudança.
- **Limitação conhecida**: lista/detalhe/filtros do admin não puderam ser verificados
  visualmente com dados reais nesta fase — exige uma sessão autenticada, sem credenciais
  disponíveis no ambiente (mesma limitação já registrada nas Fases 16/17/19). A revisão desta fase
  ficou restrita à leitura estrutural do CSS (grids com fallback já corretos) e ao login
  (`/admin/login`), que foi testado e está correto em todas as larguras.

## 10. Viewport units e safe area

- `min-height: 100vh` (4 ocorrências: `BuilderShell`, layout do admin, `LoginForm`,
  `/design-system`) ganhou `min-height: 100dvh` como segunda declaração (navegadores sem suporte
  ignoram a linha e mantêm `vh`; os com suporte usam `dvh` e evitam conteúdo cortado pela barra do
  navegador mobile — Seção 21 do briefing).
- `env(safe-area-inset-bottom)` aplicado ao bottom sheet do Meu Upgrade (único elemento fixo
  realmente colado à borda inferior da tela — Seção 23).

## 11. Decisões

Ver `docs/DECISIONS.md`, Fase 20, para o registro formal: tipografia fluida via token (`clamp()`),
o bug do `<fieldset>` (causa raiz e correção), e a confirmação de que os breakpoints existentes
foram consolidados, não recriados.

## 12. Limitações

- Admin (lista/filtros/detalhe) não verificado visualmente com uma sessão autenticada real (item
  9 acima) — mesma limitação de fases anteriores.
- Testado em Chromium e WebKit (Playwright); Firefox não foi verificado neste ambiente.
- Nenhuma mudança de identidade visual, UI final ou funcionalidade — escopo desta fase foi
  estritamente layout/responsividade, como pedido.
