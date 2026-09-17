/**
 * Shader do "momento especial" do CTA final (Fase 3D/WebGL, Seções 12/16 do briefing: "fundo
 * procedural... deve ser sutil, não competir com texto"). GLSL isolado deste arquivo (Seção 41:
 * "separar vertex/fragment/config/componente — não colocar shaders enormes em JSX").
 *
 * Ruído de valor (`hash`/`noise`) + `fbm` (fractional Brownian motion, 4 oitavas) — técnica
 * genérica e amplamente documentada de geração de ruído procedural em GLSL, escrita à mão para
 * este projeto (nunca copiada de um shader de referência específico, incluindo o Nodeck — mesmo
 * princípio já seguido para o sound design da Fase Microinterações: linguagem/técnica genérica,
 * nunca um asset ou implementação alheia).
 */

export const vertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const fragmentShader = /* glsl */ `
precision mediump float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform vec3 uColorA;
uniform vec3 uColorB;

varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * valueNoise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 aspectUv = (vUv - 0.5) * vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);

  float t = uTime * 0.05;
  vec2 drift = vec2(t * 0.6, t * 0.35);
  float n1 = fbm(aspectUv * 1.6 + drift + uMouse * 0.06);
  float n2 = fbm(aspectUv * 2.4 - drift * 1.3);

  float glow = smoothstep(0.35, 0.85, n1) * smoothstep(0.2, 0.8, n2);

  // Vinheta radial — nunca corta a borda do plano de forma dura, fica quase invisível longe do
  // centro (Seção 16 do briefing: "não competir com texto").
  float vignette = smoothstep(0.95, 0.15, length(aspectUv));

  vec3 color = mix(uColorA, uColorB, clamp(n2, 0.0, 1.0));
  float alpha = glow * vignette * 0.5;

  gl_FragColor = vec4(color, alpha);
}
`;

/** Cores da marca (Seção 7: "preto, grafite, branco, verde Upgrade — evitar arco-íris"). Grafite
 * (`--ds-color-surface-elevated`) e verde (`--ds-color-accent`), os mesmos tokens do resto do
 * site. */
export const AURA_COLOR_A: [number, number, number] = [0x22 / 255, 0x31 / 255, 0x3b / 255];
export const AURA_COLOR_B: [number, number, number] = [0x2d / 255, 0xb9 / 255, 0x58 / 255];
