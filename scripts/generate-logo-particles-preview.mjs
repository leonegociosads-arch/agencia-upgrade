// Gera UMA VEZ a prévia estática da logo em partículas usada no celular antes do efeito WebGL
// (`public/assets/hero/logo-particles-preview.webp`). Fase 3 da auditoria de 09/11/2026: em vez de
// amostrar o PNG e desenhar 3.200 pontos no aparelho do visitante a cada visita, a mesma nuvem é
// desenhada aqui, no computador de quem desenvolve, e vira uma imagem leve servida pela CSS.
//
// Usa EXATAMENTE a mesma amostragem do efeito vivo (`buildLogoParticleData`), a mesma quantidade de
// partículas do toque, o mesmo enquadramento (`CAMERA_MARGIN`), o mesmo tamanho/opacidade de ponto e
// mistura aditiva, mais a "respiração" do shader num instante qualquer (evita faixas de moiré).
//
// Rodar de novo só se a logo (`public/logo-mark.png`) ou essas constantes mudarem:
//   node scripts/generate-logo-particles-preview.mjs
// (Node 22.18+/24: importa os `.ts` direto. `sharp` vem com o Next.js.)
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { buildLogoParticleData } from "../features/design-system/webgl/buildLogoParticleData.ts";
import {
  BASE_POINT_ALPHA,
  BASE_POINT_SIZE,
  CAMERA_MARGIN,
  PARTICLE_COUNT_MOBILE,
  SAMPLE_WIDTH,
} from "../features/design-system/webgl/logoParticlesConfig.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(root, "public", "logo-mark.png");
const OUTPUT = path.join(root, "public", "assets", "hero", "logo-particles-preview.webp");
/** Altura da imagem final: 2x a maior altura em que a prévia aparece (~360px no tablet em pé). */
const OUTPUT_HEIGHT = 720;
/** Escala do ponto: a imagem é desenhada a 2x da altura típica de exibição. */
const PIXEL_SCALE = 2;
/** = `IDLE_AMPLITUDE` de `UpgradeLogoParticles.tsx`. */
const IDLE_SCATTER = 0.012;

const meta = await sharp(SOURCE).metadata();
const sampleHeight = Math.round(SAMPLE_WIDTH * (meta.height / meta.width));
const { data: raw } = await sharp(SOURCE)
  .resize(SAMPLE_WIDTH, sampleHeight, { fit: "fill" })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const imageData = { data: new Uint8ClampedArray(raw), width: SAMPLE_WIDTH, height: sampleHeight };
const { positions, colors, randoms, halfHeight, halfWidth } = buildLogoParticleData(imageData, PARTICLE_COUNT_MOBILE);

// Imagem com a proporção da própria logo + a folga da câmera: exibida com `contain`, a logo ocupa
// exatamente o mesmo espaço que o efeito WebGL ocupa na mesma caixa.
const fitHalfHeight = halfHeight * CAMERA_MARGIN;
const fitHalfWidth = halfWidth * CAMERA_MARGIN;
const H = OUTPUT_HEIGHT;
const W = Math.round(H * (fitHalfWidth / fitHalfHeight));
const buffer = new Float32Array(W * H * 3);

// Ponto com borda suave (como o `smoothstep` do fragment shader), somado (mistura aditiva).
const radius = (BASE_POINT_SIZE * PIXEL_SCALE) / 2;
const count = positions.length / 3;
for (let i = 0; i < count; i += 1) {
  const phase = randoms[i] * Math.PI * 2;
  const wx = positions[i * 3] + Math.sin(phase) * IDLE_SCATTER;
  const wy = positions[i * 3 + 1] + Math.cos(phase * 1.3) * IDLE_SCATTER;
  const cx = ((wx / fitHalfWidth) * 0.5 + 0.5) * W;
  const cy = (0.5 - (wy / fitHalfHeight) * 0.5) * H;
  for (let y = Math.floor(cy - radius - 1); y <= Math.ceil(cy + radius + 1); y += 1) {
    for (let x = Math.floor(cx - radius - 1); x <= Math.ceil(cx + radius + 1); x += 1) {
      if (x < 0 || y < 0 || x >= W || y >= H) continue;
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy) / (radius * 2); // 0..0.5 dentro do ponto
      if (d >= 0.5) continue;
      const t = d / 0.5;
      const circle = 1 - t * t * (3 - 2 * t); // 1 - smoothstep(0, 0.5, d)
      const alpha = circle * BASE_POINT_ALPHA;
      const o = (y * W + x) * 3;
      buffer[o] += colors[i * 3] * alpha;
      buffer[o + 1] += colors[i * 3 + 1] * alpha;
      buffer[o + 2] += colors[i * 3 + 2] * alpha;
    }
  }
}

// Fundo preto: a página aplica `mix-blend-mode: screen`, então o preto some sobre o fundo escuro do
// Hero e só os pontos aparecem (o mesmo efeito da mistura aditiva).
const rgb = Buffer.alloc(W * H * 3);
for (let i = 0; i < buffer.length; i += 1) rgb[i] = Math.min(255, Math.round(buffer[i] * 255));
await sharp(rgb, { raw: { width: W, height: H, channels: 3 } })
  .webp({ quality: 82, effort: 6 })
  .toFile(OUTPUT);
const out = await sharp(OUTPUT).metadata();
console.log(`ok: ${path.relative(root, OUTPUT)} ${out.width}x${out.height}, ${count} partículas`);
