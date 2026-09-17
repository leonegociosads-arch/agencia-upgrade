# IMPLEMENTATION STAGE 20 — Responsividade Desktop / Mobile

> Fase 20 do roadmap. Ajusta responsividade, adaptação de layout e usabilidade entre tamanhos de
> tela sobre a UI final da Fase 19 — sem mudar identidade visual, UI, funcionalidades ou lógica de
> negócio. Ver `docs/RESPONSIVENESS.md` para o detalhamento por tela.

---

## 1. Ajustes feitos

- `styles/tokens.css`: `--ds-font-size-display`/`h1`/`h2` viraram `clamp()` fluido.
- `app/page.module.css` (Home): grid de capacidades 3→2→1 colunas (era 3→1); espaçamento de
  hero/seções reduzido abaixo de 640px.
- `features/builder/components/BuilderNavigation.module.css`: `flex-wrap` na barra para evitar
  quebra de texto no meio da palavra em telas estreitas.
- `features/lead/components/LeadForm.module.css`: `min-width: 0` no `<fieldset>` (bug real, ver
  Seção 3); "Voltar"/"Enviar" empilham abaixo de 480px.
- `features/builder/components/QuestionRenderer.module.css` e `ProjectReviewService.module.css`:
  `min-width: 0`/`overflow-wrap: break-word` para respostas longas.
- `features/builder/components/MyUpgrade.module.css`: botão de fechar com área de toque de 44px.
- `features/builder/components/BuilderShell.module.css`: `dvh` + `safe-area-inset-bottom` no
  bottom sheet; `dvh` no shell.
- `features/design-system/components/Button.module.css`: tamanho `sm` sobe para 44px de altura
  abaixo de 640px.
- 4 arquivos com `min-height: 100vh` ganharam `min-height: 100dvh` (`BuilderShell`, layout do
  admin, `LoginForm`, `/design-system`).

Nenhum componente novo foi criado — todos os ajustes são CSS sobre componentes já existentes
(briefing, Seção 36).

## 2. Componentes alterados

`app/page.module.css`, `features/builder/components/BuilderNavigation.module.css`,
`features/builder/components/QuestionRenderer.module.css`,
`features/builder/components/ProjectReviewService.module.css`,
`features/builder/components/MyUpgrade.module.css`,
`features/builder/components/BuilderShell.module.css`,
`features/lead/components/LeadForm.module.css`,
`features/design-system/components/Button.module.css`, `styles/tokens.css`,
`app/admin/(protected)/layout.module.css`, `features/admin/components/LoginForm.module.css`,
`app/design-system/page.module.css`.

Nenhum arquivo `.tsx` foi alterado nesta fase — todos os ajustes couberam em CSS.

## 3. Problemas encontrados

1. **Hero da Home com título gigante em mobile** — `--ds-font-size-display` (56px fixo) quebrava
   em até 6 linhas em 360-390px, obrigando rolagem excessiva antes de qualquer outro conteúdo
   (briefing, Seção 5: "evitar Hero gigante em mobile"). Encontrado na primeira captura de tela em
   360px.
2. **`BuilderNavigation` quebrando texto no meio da palavra** — "Começar de novo" e "Meu Upgrade
   (N)" ao lado do logo, em ≤390px, quebravam para duas linhas cada ("Começar de\nnovo", "Meu\n
   Upgrade") em vez de reorganizar o layout. Encontrado visualmente nas telas de pergunta e
   conclusão de serviço.
3. **Overflow horizontal real no formulário de contato** (o mais sério encontrado nesta fase) —
   em ≤390px, ao preencher qualquer campo, a página inteira empurrava ~28px para a direita
   (`document.body.scrollLeft` chegava a 27px), cortando o início de todos os labels ("Nome" virava
   "ome", "E-mail" virava "-mail") e o fim dos botões de ação. Causa raiz: `<fieldset>` tem
   `min-width: min-content` no UA stylesheet do navegador (não coberto pelo reset global do
   projeto), então ele ignorava a largura do formulário pai e forçava a página a rolar
   horizontalmente sempre que um campo recebia foco. **Não aparecia em nenhum teste automatizado
   existente** (jsdom não faz layout real) nem era óbvio numa captura de tela isolada — só foi
   encontrado testando o fluxo completo com Playwright, preenchendo os campos com nomes/e-mails
   realisticamente longos (briefing, Seção 29) e inspecionando `scrollLeft`/`getBoundingClientRect`
   programaticamente.
4. **Botões "Voltar ao projeto"/"Enviar meu projeto" ultrapassando a tela** — consequência
   separada do mesmo formulário: mesmo depois de corrigir o `<fieldset>`, a soma das larguras
   naturais dos dois textos (mais longos que "Voltar"/"Continuar" do Resumo) excedia a área
   disponível abaixo de ~420px, empurrando "Enviar meu projeto" ~44px para fora da tela.
5. **Grid de capacidades da Home pulava de 3 para 1 coluna em tablets** — o corte estava em 900px
   sem um passo intermediário de 2 colunas, desperdiçando telas como 768-1024px (briefing, Seção
   19: "não manter 3 colunas minúsculas em tablet" — aqui o problema inverso, 1 coluna
   desperdiçando espaço de tablet).

## 4. Correções

Ver Seção 1 acima (mapeamento direto problema → arquivo) e `docs/RESPONSIVENESS.md` para o
raciocínio completo de cada uma.

## 5. Limitações

- Admin (lista/filtros/detalhe/notas) com dados reais não foi verificado visualmente nesta fase —
  exige sessão autenticada, sem credenciais disponíveis no ambiente (mesma limitação das Fases
  16/17/19). A estrutura CSS (grid→cards, tabela→cards) foi revisada e já estava correta desde
  fases anteriores.
- Testado em Chromium e WebKit (Playwright, headless); Firefox não verificado.
- `env(safe-area-inset-bottom)`/`dvh` não puderam ser verificados num iPhone físico — só via a
  emulação do Chromium/WebKit (que reporta `env()` como 0 sem um dispositivo real com notch/home
  indicator); a propriedade foi aplicada de forma correta e é uma adição sem custo (navegadores
  sem suporte simplesmente tratam como 0).

## 6. Teste visual realizado

Playwright (Chromium) nos 8 viewports obrigatórios da Seção 33 do briefing (1920×1080, 1440×900,
1366×768, 1024×768, 768×1024, 430×932, 390×844, 360×800) para a Home, com checagem automática de
overflow horizontal (`document.documentElement.scrollWidth` vs. `window.innerWidth`, mais uma
varredura de elementos que ultrapassam a viewport) em todos eles — nenhum overflow restante após
as correções.

Fluxo completo do Builder (Seção 34 do briefing: Home → Builder → Site → perguntas → Meu Upgrade →
Resumo → Contato → Success) testado de ponta a ponta em 1440×900 (desktop), 768×1024 (tablet),
390×844 e 360×800 (mobile), incluindo preenchimento do formulário com nome/empresa/e-mail
propositalmente longos (Seção 29). Login do admin testado nos mesmos 4 tamanhos. Um subconjunto
(Home em 390×844 e o fluxo do formulário) também foi verificado em WebKit para reduzir a
dependência de um único motor de renderização (Seção 31) — sem overflow em nenhum dos dois.

## 7. Lint / typecheck / tests / build

- **Lint**: 0 erros.
- **Typecheck**: 0 erros.
- **Testes**: 425/425 passando — nenhum teste precisou ser alterado (todas as mudanças desta fase
  foram CSS; nenhuma asserção de texto, role ou estrutura de DOM foi afetada).
- **Build**: sucesso; tabela de rotas idêntica à da Fase 19.

## 8. Pendências para a Fase 21

- Verificação visual do admin (lista/filtros/detalhe) com uma sessão autenticada real.
- GSAP, ScrollTrigger, Lenis, animações de entrada/scroll — fora de escopo desta fase (briefing:
  "não implementar ainda"), permanecem para uma fase de motion futura.
- Logo oficial (arquivo real) — pendência já registrada desde a Fase 19, ainda não recebida.
- Teste em Firefox — não disponível neste ambiente; recomendado antes de um lançamento real.
