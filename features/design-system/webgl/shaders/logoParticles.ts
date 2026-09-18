/**
 * Shader do efeito de logo em partículas (`UpgradeLogoParticles.tsx`). Isolado num arquivo próprio
 * — mesma convenção de `shaders/proceduralAura.ts` — para o componente React não misturar GLSL com
 * a orquestração da cena.
 *
 * MUDANÇA DE ABORDAGEM (pedido do usuário: "o campo de atração deve seguir o mouse sem lag; as
 * partículas podem continuar mais lentas, com peso"): o deslocamento causado pela atração do mouse
 * NÃO é mais calculado aqui — é calculado em JS (`UpgradeLogoParticles.tsx`, dentro de
 * `renderFrame`), com sua própria suavização por partícula, e chega pronto no atributo `position`.
 * Esse desacoplamento é o que permite a posição do mouse (`uMouse`) ser exata/sem atraso enquanto
 * cada partícula ainda converge devagar para o alvo — as duas velocidades não competem mais pelo
 * mesmo número. Este shader só usa `uMouse`/`uRadius` para saber o quão perto do cursor a posição
 * JÁ ATRAÍDA está, e usar isso no brilho/tamanho de cada partícula (nunca para mover nada).
 *
 * BUG corrigido (primeira versão deste arquivo): o cálculo do raio de influência e o desenho do
 * "pontinho" de cada partícula usavam `smoothstep(edgeMaior, edgeMenor, x)` — argumentos invertidos.
 * A especificação do GLSL define esse resultado como INDEFINIDO quando o primeiro edge não é menor
 * que o segundo; drivers diferentes podem produzir um corte quase binário em vez de um degradê
 * suave. Era a causa mais provável de dois sintomas aparentemente contraditórios relatados: "a
 * reação ao mouse está fraca" e "aparece um círculo visível" — os dois batem com uma borda dura
 * (em vez de gradual) na fronteira do raio de influência. Corrigido usando sempre
 * `1.0 - smoothstep(edgeMenor, edgeMaior, x)`, a forma com ordem de argumentos garantida pela spec.
 *
 * SEGUNDO BUG corrigido (achado ao investigar "a logo não aparece sem o mouse"): o fragment shader
 * multiplicava a cor pelo alpha manualmente (`vColor * alpha`) e AINDA MANDAVA esse mesmo `alpha` no
 * canal alpha da saída. `UpgradeLogoParticles.tsx` usa `THREE.AdditiveBlending`, cujo blend factor de
 * origem já é `SRC_ALPHA` — ou seja, a GPU MULTIPLICA a cor pelo alpha de novo, na mistura. O
 * resultado prático era alpha ao quadrado: uma partícula com alpha 0.62 (o valor de repouso) ficava
 * com brilho equivalente a ~0.38, e o degradê suave da borda de cada "pontinho" (o círculo do
 * `gl_PointCoord`) ficava ainda mais escurecido perto da borda. Isso não apagava a logo por completo,
 * mas reduzia bastante o contraste dela contra o fundo — e como o alpha de repouso (0.62) é
 * proporcionalmente MAIS afetado pelo quadrado do que o alpha perto do cursor (que sobe perto de
 * 1.0, e 1.0² = 1.0), o efeito prático era "partículas perto do mouse parecem aparecer do nada".
 * Corrigido enviando a cor SEM premultiplicar (`vec4(vColor, alpha)`), deixando a GPU aplicar o
 * alpha uma única vez, como o blend factor `SRC_ALPHA` já espera.
 *
 * Modo de debug temporário (`uDebugMode`): ativado via `?particlesDebug=1` na URL
 * (`UpgradeLogoParticles.tsx`) — desliga respiração idle e magnetismo do mouse, força cor branca
 * opaca e usa blending normal (não aditivo), para confirmar visualmente que a MÁSCARA/amostragem da
 * logo está correta, isolada de qualquer escolha de cor/blending/tamanho. Remover depois que a
 * legibilidade em repouso estiver confirmada.
 */

export const logoParticlesVertexShader = /* glsl */ `
  attribute vec3 aColor;
  attribute float aRandom;

  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uMouseInfluence;
  uniform float uIdleAmp;
  uniform float uRadius;
  uniform float uPixelRatio;
  uniform float uDebugMode;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 pos = position;

    if (uDebugMode > 0.5) {
      // Modo de debug: posição-base pura, sem respiração nem magnetismo — só para confirmar que a
      // amostragem da logo está correta, isolada de qualquer motion.
      vColor = vec3(1.0);
      vAlpha = 1.0;
      vec4 mvPositionDebug = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = 3.0 * uPixelRatio;
      gl_Position = projectionMatrix * mvPositionDebug;
      return;
    }

    vColor = aColor;
    float phase = aRandom * 6.2831853;

    // Estado 1 — respiração orgânica em repouso (zero quando reduced motion, via uIdleAmp = 0). É a
    // ÚNICA animação de posição que ainda acontece aqui — a atração pelo mouse já chega pronta em
    // position (calculada e suavizada em JS, ver nota no topo do arquivo).
    pos.x += sin(uTime * 0.6 + phase) * uIdleAmp;
    pos.y += cos(uTime * 0.5 + phase * 1.3) * uIdleAmp;

    // Só para o brilho/tamanho: o quão perto do cursor a posição JÁ ATRAÍDA (pos, vindo de JS)
    // está agora — não move nada. falloff usa a ordem de argumentos correta do smoothstep (ver
    // nota no topo do arquivo).
    float dist = length(uMouse - pos.xy);
    float falloff = 1.0 - smoothstep(0.0, uRadius, dist);

    vAlpha = 0.62 + 0.38 * falloff * uMouseInfluence;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = (1.9 + falloff * uMouseInfluence * 1.4) * uPixelRatio;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const logoParticlesFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    float circle = 1.0 - smoothstep(0.0, 0.5, dist);
    float alpha = circle * vAlpha;
    // NÃO premultiplicar aqui — AdditiveBlending/NormalBlending já aplicam o alpha via blend factor
    // SRC_ALPHA na GPU. Premultiplicar de novo (vColor * alpha) resultava em alpha ao quadrado (ver
    // nota no topo do arquivo).
    gl_FragColor = vec4(vColor, alpha);
  }
`;
