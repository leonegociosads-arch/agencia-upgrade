import { describe, expect, it } from "vitest";
import { buildLogoParticleData } from "./buildLogoParticleData";

function makeImageData(width: number, height: number, pixels: { x: number; y: number; r: number; g: number; b: number; a: number }[]): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  for (const { x, y, r, g, b, a } of pixels) {
    const i = (y * width + x) * 4;
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = a;
  }
  return { data, width, height, colorSpace: "srgb" } as ImageData;
}

describe("buildLogoParticleData", () => {
  it("ignora pixels quase transparentes (não viram partícula)", () => {
    const imageData = makeImageData(2, 2, [
      { x: 0, y: 0, r: 255, g: 255, b: 255, a: 10 }, // abaixo do limiar de alpha
      { x: 1, y: 0, r: 255, g: 255, b: 255, a: 255 },
    ]);
    const result = buildLogoParticleData(imageData, 10);
    expect(result.positions.length / 3).toBe(1);
  });

  it("ignora pixels muito escuros mesmo com alpha cheio (não viram partícula invisível)", () => {
    const imageData = makeImageData(2, 2, [
      { x: 0, y: 0, r: 5, g: 5, b: 5, a: 255 }, // luminância abaixo do limiar
      { x: 1, y: 0, r: 255, g: 255, b: 255, a: 255 },
    ]);
    const result = buildLogoParticleData(imageData, 10);
    expect(result.positions.length / 3).toBe(1);
  });

  it("respeita o teto de partículas pedido (targetCount) mesmo com mais pixels válidos disponíveis", () => {
    const pixels = [];
    for (let x = 0; x < 10; x += 1) {
      pixels.push({ x, y: 0, r: 255, g: 255, b: 255, a: 255 });
    }
    const imageData = makeImageData(10, 1, pixels);
    const result = buildLogoParticleData(imageData, 4);
    expect(result.positions.length / 3).toBe(4);
    expect(result.colors.length / 3).toBe(4);
    expect(result.randoms.length).toBe(4);
  });

  it("candidateCount reflete todos os pixels válidos, mesmo quando targetCount corta o resultado", () => {
    const pixels = [];
    for (let x = 0; x < 10; x += 1) {
      pixels.push({ x, y: 0, r: 255, g: 255, b: 255, a: 255 });
    }
    const imageData = makeImageData(10, 1, pixels);
    const result = buildLogoParticleData(imageData, 4);
    expect(result.candidateCount).toBe(10);
    expect(result.positions.length / 3).toBe(4);
  });

  it("classifica pixel esverdeado como cor de marca verde, e pixel branco como prata", () => {
    const imageData = makeImageData(2, 1, [
      { x: 0, y: 0, r: 40, g: 200, b: 90, a: 255 }, // verde
      { x: 1, y: 0, r: 230, g: 230, b: 235, a: 255 }, // branco/prata
    ]);
    const result = buildLogoParticleData(imageData, 10);
    // partícula 0 (verde): componente g deve ser claramente dominante sobre r e b.
    expect(result.colors[1]).toBeGreaterThan(result.colors[0]);
    expect(result.colors[1]).toBeGreaterThan(result.colors[2]);
    // partícula 1 (prata/branco): os três canais ficam próximos entre si.
    const [r, g, b] = [result.colors[3], result.colors[4], result.colors[5]];
    expect(Math.abs(r - g)).toBeLessThan(0.15);
    expect(Math.abs(g - b)).toBeLessThan(0.15);
  });

  it("nunca produz NaN nas posições, mesmo sem nenhum pixel válido", () => {
    const imageData = makeImageData(2, 2, []);
    const result = buildLogoParticleData(imageData, 10);
    expect(result.positions.length).toBe(0);
    expect(Number.isNaN(result.halfHeight)).toBe(false);
    expect(Number.isNaN(result.halfWidth)).toBe(false);
  });

  it("centraliza as posições em torno da origem (aproximadamente), refletindo o centro da imagem", () => {
    const pixels = [];
    for (let y = 0; y < 4; y += 1) {
      for (let x = 0; x < 4; x += 1) {
        pixels.push({ x, y, r: 255, g: 255, b: 255, a: 255 });
      }
    }
    const imageData = makeImageData(4, 4, pixels);
    const result = buildLogoParticleData(imageData, 16);
    let sumX = 0;
    let sumY = 0;
    for (let i = 0; i < result.positions.length / 3; i += 1) {
      sumX += result.positions[i * 3];
      sumY += result.positions[i * 3 + 1];
    }
    const avgX = sumX / (result.positions.length / 3);
    const avgY = sumY / (result.positions.length / 3);
    // Tolerância proporcional ao tamanho do conjunto (não zero exato): amostragem por índice de
    // pixel discreto tem um viés inerente de meio pixel em relação ao centro geométrico da imagem.
    expect(Math.abs(avgX)).toBeLessThan(result.halfWidth * 0.3);
    expect(Math.abs(avgY)).toBeLessThan(result.halfHeight * 0.3);
  });
});
