# ADVANCED VISUALS — 3D, WebGL, GLSL

> Fase 3D/WebGL. Princípio central do briefing: "prova de capacidade + assinatura visual + momento
> wow — nunca a estrutura principal do site". Ver `docs/IMPLEMENTATION-STAGE-26.md` para o resumo
> técnico da implementação, problemas encontrados e pendências.

## 1. Auditoria e pontos escolhidos

A Home tem 4 seções (`HeroSection`, `CapabilitiesSection`, `ProjectsTeaserSection`,
`FinalCtaSection`) mais o header/footer institucionais. Das três prioridades sugeridas pelo
briefing (Seção 2 — logo 3D, shader nos cases, momento especial), a auditoria encontrou:

- **Logo 3D**: viável e de alto impacto — o Hero já tinha um grafismo decorativo dedicado
  (`.heroGraphic`) preparado para receber exatamente este tipo de peça (já recebia escala/opacidade
  ligadas ao scroll desde a Fase ScrollTrigger e Storytelling).
- **Shader nos cases/projetos**: **auditado e adiado** — `app/projetos/page.tsx` e
  `ProjectsTeaserSection.tsx` são explicitamente placeholders hoje ("Os primeiros cases da Upgrade
  estão a caminho"; ver os comentários desses arquivos desde a Fase 8). Não existe nenhuma imagem
  de projeto real no repositório. Implementar um shader de transição entre imagens fictícias
  violaria a disciplina já seguida em TODAS as fases anteriores deste projeto — nunca inventar
  conteúdo/case/depoimento. A infraestrutura de shader construída nesta fase (`ProceduralAura`,
  arquitetura de uniforms/GLSL separado) já deixa o caminho pronto para quando cases reais
  existirem (ver Pendências, `docs/IMPLEMENTATION-STAGE-26.md`).
- **Momento especial (CTA final)**: viável sem depender de conteúdo — um fundo procedural nas
  cores da marca, sem precisar de nenhuma imagem real.

**Escolha final: 2 aplicações** (dentro do limite de "2 a 3" do briefing, Seção "Princípio
central": "melhor 2 efeitos excelentes do que 15 pesados" — aqui, melhor 2 honestos do que um
terceiro construído sobre conteúdo inventado):

1. **`UpgradeLogo3D`** — monograma "U" da marca em 3D, no Hero.
2. **`ProceduralAura`** — fundo shader procedural sutil, no CTA final.

## 2. EFEITO 1 — Logo 3D (`UpgradeLogo3D`)

**Por que faz sentido**: o Hero é o primeiro elemento que qualquer visitante vê — o lugar mais
lógico para uma "prova de capacidade técnica" (briefing, "Princípio central") sem competir com o
Builder ou o conteúdo comercial. `.heroGraphic` já era um grafismo puramente decorativo
(`aria-hidden`, `pointer-events: none`) posicionado no canto superior direito — o slot ideal já
existia, sem precisar de nenhuma mudança de layout.

**Tecnologia**: Three.js puro (`import * as THREE from "three"`), sem `@react-three/fiber`/`drei`
— ver `docs/DECISIONS.md` para o raciocínio completo. Geometria procedural
(`buildUpgradeMonogramGeometry.ts`): duas formas "lâmina" (`THREE.Shape` com curvas Bézier,
extrudadas via `ExtrudeGeometry` com bevel), interpretando livremente as duas metades curvas do
monograma real (`upgrade-brand-identity`, memória de marca) — prateada à esquerda
(`MeshStandardMaterial`, metalness 0.62), verde à direita (cor `#2db958`, o token
`--ds-color-accent`), mais uma cunha grafite/petróleo escura na base (a "sombra" da identidade de
marca). **Nenhum modelo `.glb`/`.gltf`**: nenhuma ferramenta de modelagem 3D estava disponível
nesta sessão para gerar um asset real — geometria procedural gerada em tempo real é a alternativa
honesta (mesmo raciocínio já usado para sintetizar som via Web Audio na Fase Microinterações), sem
nenhum arquivo para pesar o bundle ou precisar de licença.

**Impacto visual**: rotação lenta contínua (`0.18 rad/s` em `Y`) + flutuação vertical muito sutil
(seno, amplitude de `0.08` unidades) + reação leve ao cursor no desktop (inclinação amortecida,
nunca mais que ~0.2 rad) — deliberadamente lento e contido (briefing, Seção 4: "não girar rápido,
não parecer videogame, não parecer NFT genérico"). Iluminação: uma luz-chave branca, uma luz de
preenchimento grafite fria e um ponto de luz verde discreto — só as cores da marca (preto, grafite,
branco, verde), nunca RGB arco-íris (Seção 7).

**Impacto de performance**: `three` fica isolado num chunk próprio, carregado via
`next/dynamic({ ssr: false })` — nunca no bundle inicial da Home (chunk medido em ~493KB não
comprimido; nunca bloqueia o primeiro carregamento, já que só é buscado depois do React montar o
Hero). `devicePixelRatio` limitado a 2 (desktop) / 1.5 (touch). Loop de render pausado quando a
seção sai da viewport (scroll) e quando a aba fica em segundo plano (`document.hidden`).

**Desktop vs. mobile**: reação ao cursor só com `useFinePointer()` (ponteiro fino de verdade,
nunca `innerWidth`); no touch, a peça continua rodando/flutuando (ambiente, sem exigir interação)
mas sem seguir o dedo. `getSafePixelRatio` usa o teto mais baixo em ponteiro grosso.

## 3. EFEITO 2 — Shader nos cases (avaliado, adiado)

Ver Seção 1. Nenhuma linha de shader de transição de imagem foi escrita para operar sobre conteúdo
fictício. Quando os primeiros cases reais existirem (`docs/TECHNICAL-ARCHITECTURE.md`, pendência de
conteúdo já registrada desde a Fase 8), a arquitetura de `features/design-system/webgl/shaders/`
(uniforms nomeados, vertex/fragment separados do componente) já está pronta para receber um
`ImageDissolveTransition` seguindo o mesmo padrão de `ProceduralAura`.

## 4. EFEITO 3 — Momento especial no CTA final (`ProceduralAura`)

**Por que faz sentido**: o CTA final é o "fecho" da narrativa de scroll da Home (Fase ScrollTrigger
e Storytelling) — um segundo momento de assinatura visual reforça a mensagem sem repetir a mesma
peça do Hero, e não depende de nenhum conteúdo/case real (só cor e movimento).

**Tecnologia**: Three.js com uma câmera ortográfica e um único plano fullscreen
(`THREE.PlaneGeometry(2,2)`) usando `THREE.ShaderMaterial` — vertex/fragment GLSL isolados em
`features/design-system/webgl/shaders/proceduralAura.ts` (Seção 41 do briefing: "separar
vertex/fragment/config/componente"). Ruído de valor (`hash`/`noise`) + `fbm` (4 oitavas) — técnica
genérica e amplamente documentada de ruído procedural, escrita à mão para este projeto (nunca
copiada de um shader de referência específico, Nodeck incluído). Uniforms nomeados
(`uTime`/`uResolution`/`uMouse`/`uColorA`/`uColorB`), como pedido pela Seção 40.

**Impacto visual**: um brilho suave e lento, nas cores da marca (grafite `#22313b` ↔ verde
`#2db958`), com vinheta radial (sem cortar a borda do plano de forma dura) e opacidade máxima de
`0.5` — deliberadamente discreto atrás do título/CTA (Seção 16: "não competir com texto"). Reage de
leve à posição do cursor no desktop (`uMouse`), nunca distorção/glitch/aberração cromática pesada
(Seção 10).

**Impacto de performance**: só monta quando a seção está a 200px da viewport
(`useInViewport`) — o CTA fica abaixo da dobra, então o shader nunca carrega no caminho crítico da
Home. Mesma limitação de pixel ratio e pausa em aba oculta do Efeito 1.

**Desktop vs. mobile**: reação ao cursor só com ponteiro fino; no mobile, a animação continua
(ambiente, sem interação), com o mesmo teto de pixel ratio mais baixo.

## 5. Assets

Nenhum asset binário novo (nenhuma textura, nenhum modelo `.glb`/`.gltf`) — toda a geometria e o
shader são gerados em código. `features/design-system/webgl/` reúne toda a lógica desta fase
(paralelo a `features/design-system/motion/`, mesma convenção de organização por feature já usada
no projeto desde a Fase Motion Design):

```
features/design-system/webgl/
  webglSupport.ts               — detecção de suporte (cacheada)
  useInViewport.ts               — lazy-mount/pause via IntersectionObserver
  pixelRatio.ts                  — teto de devicePixelRatio
  buildUpgradeMonogramGeometry.ts — geometria procedural do monograma (testável sem WebGL real)
  UpgradeLogo3D.tsx / .module.css
  ProceduralAura.tsx / .module.css
  shaders/proceduralAura.ts      — GLSL (vertex + fragment) isolado
```

## 6. Fallback

Ambos os efeitos seguem o mesmo padrão de duas camadas, nunca substituindo o que já existia:

1. **Camada base** (sempre presente): o MESMO gradiente CSS + `clip-path` que já existia antes
   desta fase (`.heroGraphicFallback`/`.finalGraphicFallback`) — se WebGL não estiver disponível,
   se o `next/dynamic` ainda não carregou, ou se a criação do `WebGLRenderer` falhar por qualquer
   motivo, é exatamente isto que o visitante vê (o visual já em produção, inalterado).
2. **Camada WebGL** (progressiva): um `<canvas>` com fundo transparente, absolutamente posicionado
   por cima, só renderizado quando `hasWebGL()` é `true` E a criação do `WebGLRenderer` não lança.

`hasWebGL()` testa a criação de um contexto `webgl2`/`webgl` num `<canvas>` descartável, com
`try/catch` (Seção 30). Adicionalmente — e esta foi uma lacuna real encontrada durante o teste
manual desta fase —, a própria construção do `WebGLRenderer` (que pode falhar mesmo quando
`hasWebGL()` disse que sim, ex.: contexto perdido entre a checagem e o uso) também está dentro de
um `try/catch`; qualquer falha aí, ou um evento `webglcontextlost` depois de já estar funcionando,
faz o componente retornar `null` e a camada base volta a ser tudo o que existe (Seção 42:
"falha em efeito WebGL não pode quebrar a página" — verificado com um teste automatizado que força
exatamente essa falha).

## 7. Mobile

Nenhum dos dois efeitos é desabilitado por completo no mobile (ambos são ambiente/decorativos, não
dependem de interação para fazer sentido) — o que muda:

- Reação ao cursor (tilt do logo, `uMouse` da aura) só com `useFinePointer()` — nunca em touch.
- `devicePixelRatio` limitado a 1.5 em vez de 2 (`getSafePixelRatio`).
- Verificado com emulação de dispositivo real (Playwright, `devices["iPhone 13"]`) — os dois
  continuam renderizando sem erro, sem travar o toque nos CTAs/links por baixo.

## 8. Reduced motion

Com `prefers-reduced-motion: reduce`, os dois componentes ainda MONTAM e renderizam a peça 3D real
— mas em um único frame estático, sem `requestAnimationFrame`, sem rotação/flutuação/reação ao
cursor (Seção 33: "oferecer versão estática", não necessariamente remover a peça 3D por completo).
Essa é uma decisão deliberadamente diferente da Fase Microinterações (onde hooks como `useTilt`
desligam por completo) — lá, desligar significa "o elemento volta ao estado normal, que já existia
sem custo"; aqui, "o estado normal" de um objeto só-WebGL não existe de graça, então um único frame
parado entrega mais valor (ainda é a prova de capacidade 3D) pelo mesmo custo de motion zero.

## 9. Performance

- Code-splitting real: `three` isolado em chunk próprio, carregado via `next/dynamic({ssr:false})`
  — nunca no JS inicial da Home.
- Lazy-mount por `IntersectionObserver` (`useInViewport`) para o efeito abaixo da dobra
  (`ProceduralAura`).
- Pausa de loop (não só do componente, do `requestAnimationFrame` em si) quando a seção sai da
  viewport ou a aba fica em segundo plano.
- `devicePixelRatio` limitado — nunca renderiza cego no máximo do dispositivo.
- Nenhum novo listener de scroll global — reação ao cursor usa o mesmo padrão de `pointermove` em
  `window` já aceito desde a Fase Microinterações (`useAvoidCursor`/`useMagneticHover`).
- Ver `docs/IMPLEMENTATION-STAGE-26.md`, Seção de performance, para os números medidos.
