# UI FINAL — Agência Upgrade

> Fase 19 do roadmap. Documenta a aplicação real do Design System (Fase 18) a todas as telas do
> projeto — Home, Builder completo, formulário de contato, sucesso/erro e admin. Ainda sem GSAP/
> ScrollTrigger/Lenis/motion avançado (fases seguintes); só CSS (hover/focus/transições pequenas).
> Ver `docs/IMPLEMENTATION-STAGE-19.md` para o resumo técnico (arquivos alterados, testes, decisões
> formais em `docs/DECISIONS.md`).

---

## 1. Direção visual

Tema **escuro único** (não dois temas completos) — já era a decisão da Fase 18
(`docs/DESIGN-SYSTEM.md`, "Tema escuro como padrão/flagship"); esta fase confirma e aplica essa
direção de verdade a `app/globals.css` (antes só os tokens existiam, sem nenhuma tela usá-los). O
verde da marca aparece só como destaque pontual — CTAs, seleção, ícones-marca — nunca como fundo de
seções inteiras. Grafismos (Seção 10) usam diagonais/blocos geométricos discretos, nunca
"decoração por toda parte".

### Como as referências de marca foram usadas

A referência (logo + aplicação clara + aplicação escura) definiu paleta, tipografia, contraste e
linguagem visual (bordas finas, cantos poucos e consistentes, cards sóbrios) — nunca layout,
composição ou hero: nenhuma tela desta fase copia a estrutura dos mockups de referência, cada uma
tem composição própria (Home, Builder e admin resolvem o mesmo sistema visual de formas diferentes,
adequadas a cada objetivo).

## 2. Logo — resolvida (era pendência)

O arquivo oficial (`logo upgrade.png`, fundo preto sólido, sem transparência) foi localizado em
`Downloads/upgrade/` e usado como fonte real — nada foi redesenhado. O símbolo "U" foi recortado
(sem o wordmark, que já é escrito como texto real em Montserrat ao lado, não uma imagem) e salvo em
`public/logo-mark.png`; `SiteHeader.tsx`, `BuilderNavigation.tsx` e `app/admin/(protected)/
layout.tsx` renderizam esse arquivo via `next/image` (com `priority`, por aparecer no cabeçalho de
toda página). O fundo preto do arquivo funciona porque os três cabeçalhos também são pretos/quase
pretos — não há nenhuma variante com transparência ainda, então **não deve ser usado sobre uma
superfície clara** (ex.: um card `elevated` ou o tema claro, se algum dia for ativado) sem antes
gerar uma versão com fundo transparente a partir do arquivo original.

## 3. Home

`app/page.tsx` — header (navegação completa, Seção 27), hero (título grande em Montserrat, badge
"Estúdio digital de performance", CTA principal "Monte seu Upgrade" + CTA secundário "Ver
projetos", um grafismo diagonal discreto ao fundo), bloco "O que fazemos" (as 3 categorias,
reaproveitando os dados de `features/builder/data/services.ts` — nunca um texto marketing
duplicado e potencialmente divergente do que o Builder realmente pergunta), um teaser honesto de
"Projetos" (sem inventar cases/depoimentos — só um aviso claro de que os primeiros cases estão a
caminho, com link para `/projetos`), e uma chamada final antes do footer. Nunca virou catálogo
longo — 4 seções, cada uma com um objetivo.

## 4. Builder

- **Seletor de serviço** (`ServiceSelector.tsx`) — 3 cards premium (`elevated`-like, hover
  levanta/realça a borda), com um ícone-marca, badge "Configurado" (`Badge tone="success"`, Fase
  18) quando aplicável, e um "Começar →"/"Editar →" reforçando a ação.
- **Tela de pergunta** (`QuestionRenderer.tsx`) — hierarquia clara: rótulo de contexto discreto →
  pergunta principal grande → opções → indicador de progresso (linha fina + contador "X de Y",
  nunca uma barra corporativa grande). Opções `multi_choice` mostram seleção via check explícito +
  borda + fundo tingido (nunca só cor) — `single_choice` não precisa de estado de seleção
  persistente (a escolha já avança a tela).
- **Conclusão de serviço** (`ServiceComplete.tsx`) — confirmação com um selo verde discreto, resumo
  curto, duas ações (`Continuar`, `Adicionar outro serviço`) — sem comemoração visual exagerada,
  como pedido. *(Texto do botão principal corrigido na Etapa 32 — ver `docs/UX-FRICTION-MAP.md`:
  antes ele se chamava "Ver Meu Upgrade / Finalizar" mas não fazia nem uma coisa nem outra, só
  devolvia à tela de categorias, igual ao botão secundário.)*
- **Edição** (`QuestionRenderer.tsx`) — um `Badge tone="warning"` "Editando {Serviço}" na barra
  superior (nunca um alerta agressivo); o resto da tela continua igual à de configuração.

## 5. Meu Upgrade

Virou um **drawer de verdade** (Seção 12) — não um painel inline como antes: no desktop, desliza da
direita (`max-width: 420px`, altura total); no mobile, vira um bottom sheet (`border-radius`
arredondado só no topo, `max-height: 85vh`). Mesma marcação nos dois casos — só o CSS muda por
media query. Um fundo escurecido (`upgradeOverlay`) fecha o drawer ao ser clicado, além do "×" no
cabeçalho e do próprio botão "Meu Upgrade" na navegação (alternando). Mostra: lista de serviços
(resumo curto, Editar/Remover), "+ Adicionar outro serviço", "Finalizar projeto". A linguagem
visual (cards simples, sem preço, sem contador de "itens no carrinho" em destaque) foi pensada para
parecer **projeto sendo montado**, não checkout de e-commerce.

## 6. Resumo (Project Review)

`ProjectReview.tsx` — um `Badge tone="accent"` "Seu Upgrade" acima do título "Confira seu projeto"
(satisfaz o pedido do briefing de mostrar essa frase sem trocar o texto do título já testado em 14
asserções diferentes — ver `docs/DECISIONS.md`), um bloco por serviço (`ProjectReviewService.tsx`,
já era "blocos separados" desde a Fase 11, agora com a linguagem visual do Design System), resumo
detalhado pergunta/resposta, Editar com mais destaque que Remover (decisão já da Fase 11, mantida),
CTA principal "Continuar".

## 7. Formulário de contato

`LeadForm.tsx`/`LeadField.tsx` — refeito para reaproveitar `FormField`/`Input` do Design System em
vez de duplicar o padrão de label/erro que já existia (Fase 12); todos os 5 campos (Nome, Empresa,
WhatsApp, E-mail, Site/Instagram opcional) com os mesmos estados (`default`/`focus`/`filled`
via `:not(:placeholder-shown)`/`error`/`disabled` — `loading` é o próprio texto do botão virando
"Enviando...", como já era). Continua parecendo a continuação natural do Builder, não um formulário
corporativo à parte.

## 8. Success e Erro

`SubmissionSuccess.tsx` — selo de sucesso, "Obrigado, {nome}!", lista curta dos serviços, uma nota
de "Próximo passo" (substituiu um aviso desatualizado sobre "integração comercial futura" — a
persistência real já existe desde a Fase 13), CTA "Iniciar novo projeto". **Sem CTA de WhatsApp**:
o briefing pediu "quando aplicável", e não existe nenhum número da própria Upgrade configurado em
lugar nenhum do projeto para linkar — inventar um violaria a regra de não preencher automaticamente
conteúdo ausente.

`SubmissionError.tsx` — usa o `Alert tone="error"` do Design System (ícone + texto, nunca só
vermelho), "Tentar novamente"/"Voltar". Mensagens continuam as mesmas já estabelecidas desde a Fase
13 (nunca técnicas — "Não conseguimos enviar agora", nunca uma stack trace).

## 9. Admin

Login, dashboard (`DashboardSummary` + `AnalyticsOverview`), filtros, lista, detalhe, status,
notas, histórico — todos migrados para os tokens do Design System (cores, tipografia, espaçamento),
com `Input`/`Select`/`Textarea`/`Button`/`Alert`/`Badge`/`EmptyState` reaproveitados onde fazia
sentido trocar um elemento nativo por um do Design System sem reescrever a lógica. Deliberadamente
**mais sóbrio que a Home** (Seção 20 do briefing) — sem cards com hover elaborado, sem grafismo
decorativo, só clareza e leitura rápida. A tabela de leads continua idêntica em desktop e vira
cards no mobile (decisão já da Fase 16, agora só com os tokens novos).

## 10. Mobile

Revisado individualmente (Seção 25) — não é só "encolher o desktop":

- **Header** ganhou um menu hambúrguer de verdade (Seção 27) — antes da Fase 19, os links de
  navegação simplesmente desapareciam abaixo de 768px sem nenhuma forma de alcançá-los; descoberto
  durante a revisão visual manual desta própria fase (ver `docs/DECISIONS.md`).
- **Meu Upgrade** vira bottom sheet (Seção 5).
- **Builder** (seletor, pergunta, resumo, formulário, success) testados em 360px/414px — sem
  overflow horizontal, áreas de toque com pelo menos 36-44px de altura (tokens de botão/input da
  Fase 18).
- **Admin**: lista já virava cards no mobile desde a Fase 16; mantido.

## 11. Tablet

Breakpoints intermediários (768px/1024px, `styles/tokens.css`) aplicados nos containers/grids —
capacidades da Home e cards do Builder recalculam para 1-2 colunas em vez de pular direto de 3 para
1 como no desktop-estreito.

## 12. Grafismos

Usados com moderação (Seção 22): um recorte diagonal na Home (`.heroGraphic`, opacidade baixa,
`aria-hidden`, nunca compete com o texto), marcas geométricas quadradas com gradiente nos cards de
serviço e no logo placeholder. Nenhuma textura, nenhum padrão de fundo repetido, nenhum efeito de
glow/neon.

## 13. Ícones

Sem uma biblioteca de ícones externa nesta fase — os poucos símbolos usados (✓, ×, setas `→`/`←`,
o chevron do `Select`) são texto/CSS puro, consistentes entre si (mesma família tipográfica, mesmo
peso visual). Uma biblioteca de ícones real (ex.: um set SVG consistente) fica como candidata para
quando a Home/Builder precisarem de mais símbolos do que os atuais.

## 14. Decisões

Ver `docs/DECISIONS.md`, Fase 19, para o registro formal (tema único, placeholder de logo, menu
mobile, consolidação `LeadField`→`FormField`, `LinkButton` novo, `data-testid` no drawer do Meu
Upgrade, copy do Success atualizada).

## 15. Limitações

- Logo oficial aplicada (Seção 2) — falta uma variante com fundo transparente para uso fora de
  cabeçalhos pretos/quase pretos (ex.: sobre um card claro, se algum dia usado).
- Sem CTA de WhatsApp no Success (Seção 8) — nenhum número configurado no projeto.
- `/projetos`/`/privacidade` continuam com conteúdo placeholder (só o visual foi aplicado) — texto
  definitivo pertence a uma fase de conteúdo futura.
- Nenhuma animação real (entrada, scroll, hover elaborado) — só transições CSS pequenas já
  previstas (Seção 31 do briefing); GSAP/ScrollTrigger/Lenis ficam para a próxima fase.
- Ícones lineares aplicados para os 3 serviços (`ServiceIcon`); o restante da interface (setas,
  check, chevron) continua texto/CSS puro — uma biblioteca de ícones completa segue como
  candidata futura se mais símbolos forem necessários.
