# AWARD-LEVEL — Direção de Arte e Assinatura Visual

> Etapa 36 do roadmap. Documenta o conceito final, a assinatura visual e onde ela vive no código —
> não uma reformulação, um registro do que o projeto já é depois de 35 etapas, mais os refinamentos
> desta etapa (`docs/AWARD-AUDIT.md`). Referência de nível/filosofia: nodeck.online (briefing,
> "usar como referência de nível de acabamento, ritmo, personalidade... nunca copiar").

## 1. Conceito final

A Upgrade se apresenta como **estúdio digital de performance** — não uma agência genérica, não um
template de SaaS, não um laboratório de efeitos por efeito. A composição inteira (Home + Builder)
resolve uma tensão deliberada: sofisticação visual/técnica (motion, WebGL, sound design) a serviço
de um objetivo comercial claro (Builder → lead), nunca por cima dele. `docs/USER-FLOW.md` e
`docs/UI-FINAL.md` já estabeleceram essa prioridade desde a Fase 5/19; esta etapa refina o
acabamento sem reabrir essa decisão.

## 2. Assinatura visual — onde ela vive

| Elemento | Onde aparece | Por quê é "a Upgrade", não genérico |
| --- | --- | --- |
| Monograma "U" em WebGL | Hero (`UpgradeLogo3D.tsx`) | Geometria procedural própria (nenhum modelo `.glb` de terceiro) — reage sutilmente ao cursor, nunca domina o texto |
| Verde da marca (`--ds-color-accent`) | CTA principal, seleção, check marks, traço decorativo do footer (novo nesta etapa) | Único destaque de cor num tema quase inteiramente preto/grafite — nunca fundo de seção inteira |
| Grafismo diagonal | Hero (`.heroGraphic`), decorativo | Único elemento com uma interação-surpresa (`useAvoidCursor`) — o único easter egg do site, de propósito |
| Tilt 3D sutil | Cartões do Builder e da Home (`useTilt`) | Mesma linguagem em todo cartão importante — nunca inventada de novo por seção |
| Sheen no CTA primário | Botões `primary` (`Button.module.css`) | Só no botão mais importante da hierarquia, nunca em todos |
| Crossfade direcional de cena | Builder (`SceneTransition.tsx`) | Forward/backward entram/saem de lados opostos — a experiência "avança"/"volta", não "o componente trocou" |
| Sons sintetizados | Todo o Builder (`sound.ts`) | Osciladores gerados no navegador, sem nenhum asset gravado — 100% original, opt-in, nunca autoplay |
| Tracking tipográfico (novo nesta etapa) | `display`/`h1` (`Typography.module.css`) | Títulos grandes com tração levemente fechada — acabamento editorial, não "a fonte no tamanho grande" |

## 3. Hero — a cena mais forte do projeto

Composição: badge de posicionamento → título grande (agora com tracking mais fechado) → subtítulo
→ dois CTAs (magnetismo só no principal) → monograma 3D reagindo ao cursor, com fallback CSS
imediato enquanto o WebGL carrega em segundo plano (nunca bloqueia o LCP — `docs/PERFORMANCE.md`).
No scroll, o conteúdo recua e o grafismo escala — a página "abre espaço" para a seção seguinte, uma
transição de verdade, não um corte seco (`useHeroScrollMotion.ts`).

## 4. Momento assinatura ("isso é a Upgrade")

Não um efeito novo criado nesta etapa — um reconhecimento de qual dos elementos já existentes
cumpre esse papel: o **monograma 3D do Hero**, porque é o único ponto do site onde marca (o "U"),
tecnologia (WebGL procedural) e interação (reação ao cursor) coexistem no mesmo objeto, no primeiro
momento em que qualquer visitante vê o site. O grafismo com `useAvoidCursor` é o segundo candidato
(uma surpresa, descoberta uma vez), mas é decorativo — o monograma é estrutural à composição do
Hero, por isso é o "momento assinatura" primário.

## 5. Storytelling da Home

```
CENA 1 — Hero: impacto (título grande, 3D, CTA magnético)
   ↓
CENA 2 — O que fazemos: calma → informação (pin + entrada sequencial dos 3 serviços)
   ↓
CENA 3 — Projetos: descanso (revelação simples e honesta, sem fingir cases que não existem)
   ↓
CENA 4 — CTA final: impacto novamente (convergência para "Monte seu Upgrade", brilho procedural)
```

Ritmo impacto → calma → informação → descanso → impacto (briefing, Seção 8) já existia
estruturalmente; o ajuste desta etapa (Cena 3 com `scaleFrom` diferente da Cena 4) evita que as duas
últimas cenas pareçam a mesma transição reaproveitada.

## 6. Builder como diferencial

O Builder é deliberadamente mais contido que a Home (menos WebGL, sem cursor customizado — já
documentado desde a Fase Microinterações, Seção 12: "Admin/Builder não precisam da mesma
intensidade visual da Home") — o diferencial dele é a qualidade da INTERAÇÃO, não o espetáculo
visual: seleção com tilt + som + destaque explícito (nunca só cor), troca de cena direcional,
"Continuar" com pulso único ao ficar habilitado, drawer "Meu Upgrade" com linguagem de "projeto
sendo montado" (nunca carrinho — `docs/UI-FINAL.md`, Seção 5). Refinamento desta etapa: sombra sutil
nos cartões de categoria e nas opções de pergunta, para a mesma linguagem de profundidade da Home
chegar ao Builder sem competir com a simplicidade que ele precisa manter.

## 7. Motion e transições

Sistema centralizado (`motionConfig.ts`/`scrollMotionConfig.ts`) com 4 durações, 4 eases e 3
staggers — reaproveitados em todo o projeto, nunca um valor solto. Variedade real de TÉCNICA entre
seções (parallax simples no Hero, clip-path + pin em Capabilities, reveal simples com leve variação
de escala nas duas seções finais) evita o padrão "opacity 0 + y 30 + opacity 1 em tudo" que o
briefing pede para evitar (Seção 15) — ver `docs/AWARD-AUDIT.md` para o antes/depois exato.

## 8. Sound design

Ver `docs/MICROINTERACTIONS.md`, Seção 6, e `docs/AWARD-AUDIT.md` (confirmado, não alterado nesta
etapa): 10 eventos, cada um uma nota curta sintetizada, hierarquia entre eventos "maiores"
(duas frequências) e "menores" (uma frequência), opt-in via `SoundToggle`, nunca autoplay.

## 9. WebGL / 3D

Dois efeitos, os dois já avaliados como agregando valor real (não gimmick) nesta auditoria:
`UpgradeLogo3D` (Hero, geometria procedural) e `ProceduralAura` (CTA final, brilho reagindo ao
cursor). Os dois só montam perto da viewport/depois de o navegador ter uma folga no main thread
(`requestIdleCallback`/`useInViewport`) e têm fallback CSS idêntico caso WebGL não esteja disponível
— nenhum dos dois compromete FPS/leitura/CTA/mobile (briefing, Seção 34), confirmado em
`docs/PERFORMANCE.md` (Etapa 30) e não reavaliado com números novos nesta etapa (sem mudança que
justificasse remedir).

## 10. Mobile

Mesma direção de arte, motion próprio (não desktop reduzido) — pin removido no mobile em
Capabilities, distâncias de motion reduzidas (`getSceneDistance()`), tilt/magnetismo/cursor
customizado desativados por capacidade real do ponteiro (`useFinePointer`), nunca por largura de
tela. Nenhuma mudança nesta etapa além das já aplicadas globalmente (sombra dos cartões, tracking
tipográfico, traço do footer) — todas funcionam igual em qualquer viewport, sem CSS condicional
extra necessário.

## 11. Performance

Nenhum orçamento de performance foi gasto nesta etapa: todas as mudanças são CSS (sombra, tracking,
um `::before` de 64px) ou uma prop opcional em um hook já existente (`scaleFrom`) — sem novo asset,
biblioteca ou requisição de rede. `docs/PERFORMANCE.md` (Etapa 30) continua sendo a medição de
referência; não há motivo técnico para esperar uma regressão a partir destas mudanças.

## 12. Originalidade em relação à referência

O Nodeck foi usado como referência de FILOSOFIA (acabamento, ritmo, personalidade, sound design,
atenção a detalhe) em fases anteriores (Microinterações, GSAP, 3D) — nunca de aparência literal:
paleta, tipografia, composição do Hero, linguagem de cartões e a arquitetura do Builder são próprias
da Upgrade, resolvidas de formas diferentes da referência em cada fase (confirmado nos próprios
documentos dessas fases, ex. `docs/MICROINTERACTIONS.md`, Seção 1: "usando o Nodeck como referência
de LINGUAGEM... nunca de layout, identidade ou comportamento literal"). Nenhuma mudança desta etapa
aproximou o projeto de uma cópia — os quatro refinamentos (Seção 2 de `docs/AWARD-AUDIT.md`) são
ajustes de acabamento interno (tipografia, sombra, motion, footer), não elementos importados de
lugar nenhum.

## 13. Plano de captura de vídeo (não executado — briefing permite isso)

Roteiro para uma futura gravação de apresentação do projeto:

1. Hero parado (2-3s) → scroll lento revelando o parallax e a transição para "O que fazemos".
2. Pin de "O que fazemos" com os 3 cards entrando em sequência.
3. Transição Home → Builder (clique em "Monte seu Upgrade").
4. Seleção de categoria (tilt + som + Card ganhando profundidade — refinamento desta etapa).
5. Uma pergunta de múltipla escolha até o pulso do "Continuar" habilitar.
6. Troca de cena (Seção 23 do briefing) — a peça mais importante de mostrar em vídeo, já que é onde
   a diferença entre "parece um app" e "parece uma experiência" mais aparece.
7. Abertura do drawer "Meu Upgrade".
8. Tela de sucesso ("Recebemos seu projeto.").

## 14. Showcase / case study (material técnico para futura apresentação)

- **Conceito**: estúdio digital de performance — Builder como motor comercial central, apresentação
  institucional como contexto, nunca o oposto.
- **Stack**: Next.js 16 (App Router), React 19, Supabase (Postgres + Auth + RLS), GSAP + ScrollTrigger,
  Lenis, Three.js (WebGL procedural, sem assets externos), Web Audio API (sound design sintetizado),
  Vitest + Testing Library + Playwright.
- **Builder**: motor de perguntas orientado a dados (`features/builder/data/*`), estado com
  rascunho/confirmação separados (edição nunca corrompe o estado anterior — `docs/USER-FLOW.md`,
  Seção 9), persistência local com recuperação de sessão.
- **Motion**: sistema de tokens central (`motionConfig.ts`), ScrollTrigger com `matchMedia` por
  breakpoint (nunca a mesma timeline em desktop/mobile), crossfade direcional de cena.
- **WebGL**: geometria procedural (sem `.glb`/textura externa), montagem adiada
  (`requestIdleCallback`/`useInViewport`), fallback CSS sempre presente.
- **Sound**: síntese em tempo real via Web Audio API, opt-in, hierarquia de eventos por
  importância.
- **Desafios reais enfrentados** (documentados em `docs/DECISIONS.md` ao longo do projeto): bug de
  HSTS específico do WebKit encontrado só ao adicionar testes cross-browser (Etapa 31); overlay do
  drawer bloqueando clique por trás dele (Etapa 31); CTA que prometia uma ação que não cumpria
  (Etapa 32) — corrigido preservando o comportamento correto, revertendo uma primeira tentativa que
  quebrou o fluxo de múltiplos serviços; repositório com histórico de commits reconstruído a partir
  do estado final (Etapa 33).
- **Soluções**: nos três primeiros casos, a causa raiz só apareceu com teste em navegador real
  (E2E), não em teste unitário isolado — reforça a decisão de ter investido em Playwright na Etapa
  31 mesmo sem CI configurado ainda.
