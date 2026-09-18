/**
 * Converte os pixels da logo oficial (`public/logo-mark.png`) em uma nuvem de partículas para o
 * efeito interativo do Hero (`UpgradeLogoParticles.tsx`).
 *
 * Por que a partir do PNG e não de um SVG: a logo foi enviada também como SVG, mas o arquivo era um
 * auto-trace (potrace) do PNG — centenas de fragmentos de path minúsculos e irregulares (ruído da
 * vetorização de uma imagem com sombreado em gradiente), não um contorno limpo da forma. Amostrar
 * pixels do PNG oficial (o mesmo arquivo já usado em toda a marca) dá um resultado mais fiel e mais
 * simples de manter do que tentar limpar/parsear aquele SVG.
 *
 * DESCOBERTA IMPORTANTE (diagnóstico ao investigar "a logo não aparece sem o mouse"): verificado
 * com os pixels reais do arquivo (via `sharp`, fora do código de produção) que `public/logo-mark.png`
 * **não tem transparência de verdade** — o canal alpha é 255 (opaco) em 100% dos pixels, inclusive
 * no que parece "fundo vazio" no PNG. O que separa logo de fundo nesse arquivo é a luminância: o
 * fundo é preto/quase preto (mais de metade do canvas, luminância 0-9), e a logo é claramente mais
 * clara (luminância 80+). Ou seja, o filtro de alpha abaixo (`ALPHA_THRESHOLD`) é hoje um no-op
 * defensivo para este arquivo específico — quem de fato separa logo de fundo é
 * `DARK_LUMINANCE_THRESHOLD`. Confirmado visualmente com um preview ASCII da máscara resultante
 * (61958 de 134720 pixels amostrados viram candidatos, ~46% — traçando um "U" reconhecível). Mantido
 * o filtro de alpha mesmo assim, para o código continuar correto se um PNG com transparência real for
 * usado no futuro.
 *
 * Função pura (recebe `ImageData` já pronta) para ser testável sem precisar decodificar uma imagem
 * de verdade — mesma filosofia de `buildUpgradeMonogramGeometry.ts`.
 */

export interface LogoParticleData {
  /** [x0,y0,z0, x1,y1,z1, ...] — posição BASE (repouso) de cada partícula, em unidades de mundo. */
  positions: Float32Array;
  /** [r0,g0,b0, r1,g1,b1, ...] — cor de cada partícula (0-1). */
  colors: Float32Array;
  /** Um valor aleatório estável por partícula (0-1), usado para variar fase/velocidade no shader. */
  randoms: Float32Array;
  /** Metade da altura do conjunto de partículas em unidades de mundo — usado para enquadrar a câmera. */
  halfHeight: number;
  /** Metade da largura do conjunto de partículas em unidades de mundo. */
  halfWidth: number;
  /** Quantos pixels da imagem passaram no filtro (antes do corte por `targetCount`) — diagnóstico. */
  candidateCount: number;
}

// No arquivo real (`public/logo-mark.png`) isto é um no-op — ver o comentário no topo do arquivo.
// Mantido para não quebrar se um PNG com transparência de verdade for usado no futuro.
const ALPHA_THRESHOLD = 60;
// É este filtro (não o de alpha) que separa a logo do fundo no arquivo real: o fundo ocupa mais de
// metade do canvas e é quase todo luminância 0-9; a logo (incluindo a cunha grafite/navy central,
// mais escura que o resto da marca mas ainda bem mais clara que o fundo) fica acima deste limiar.
const DARK_LUMINANCE_THRESHOLD = 40;
// Verde de marca (mesmo tom de `buildUpgradeMonogramGeometry.ts`) — usado quando o pixel amostrado é
// predominantemente verde; caso contrário, cai no branco/prata (também já usado na peça 3D anterior).
const BRAND_GREEN: [number, number, number] = [0x2d / 255, 0xb9 / 255, 0x58 / 255];
const BRAND_SILVER: [number, number, number] = [0xd7 / 255, 0xde / 255, 0xe3 / 255];

/** Altura alvo (unidades de mundo) da logo renderizada — mesma ordem de grandeza da peça 3D anterior. */
const TARGET_WORLD_HEIGHT = 3.4;

function luminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function isGreenish(r: number, g: number, b: number): boolean {
  return g > r * 1.12 && g > b * 1.12 && g > 50;
}

export function buildLogoParticleData(imageData: ImageData, targetCount: number): LogoParticleData {
  const { data, width, height } = imageData;

  const candidates: { x: number; y: number; r: number; g: number; b: number }[] = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const alpha = data[i + 3];
      if (alpha < ALPHA_THRESHOLD) continue;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (luminance(r, g, b) < DARK_LUMINANCE_THRESHOLD) continue;
      candidates.push({ x, y, r, g, b });
    }
  }

  const count = Math.min(targetCount, candidates.length);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const randoms = new Float32Array(count);

  const scale = candidates.length === 0 ? 1 : TARGET_WORLD_HEIGHT / height;
  const stride = count === 0 ? 1 : candidates.length / count;

  // Seed determinístico simples (sem depender de `Math.random` diretamente em cada iteração) —
  // resultado estável entre chamadas para a mesma imagem, o que ajuda em teste/depuração.
  let seed = 1;
  function nextRandom(): number {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  for (let i = 0; i < count; i += 1) {
    const sourceIndex = Math.min(candidates.length - 1, Math.floor(i * stride));
    const point = candidates[sourceIndex];

    // Pequeno jitter (menos de 1px na imagem original) só para quebrar o padrão de "linhas" que a
    // amostragem por stride tende a deixar visível em áreas muito uniformes.
    const jitterX = (nextRandom() - 0.5) * 0.6;
    const jitterY = (nextRandom() - 0.5) * 0.6;

    const worldX = (point.x + jitterX - width / 2) * scale;
    const worldY = -(point.y + jitterY - height / 2) * scale;
    const worldZ = (nextRandom() - 0.5) * 0.3;

    positions[i * 3] = worldX;
    positions[i * 3 + 1] = worldY;
    positions[i * 3 + 2] = worldZ;

    const green = isGreenish(point.r, point.g, point.b);
    const base = green ? BRAND_GREEN : BRAND_SILVER;
    const brightness = 0.75 + luminance(point.r, point.g, point.b) / 255 / 4; // leve variação de brilho
    colors[i * 3] = Math.min(1, base[0] * brightness);
    colors[i * 3 + 1] = Math.min(1, base[1] * brightness);
    colors[i * 3 + 2] = Math.min(1, base[2] * brightness);

    randoms[i] = nextRandom();
  }

  return {
    positions,
    colors,
    randoms,
    halfHeight: (height / 2) * scale,
    halfWidth: (width / 2) * scale,
    candidateCount: candidates.length,
  };
}
