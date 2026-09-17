// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { getSafePixelRatio } from "./pixelRatio";

const originalDpr = window.devicePixelRatio;

afterEach(() => {
  Object.defineProperty(window, "devicePixelRatio", { value: originalDpr, configurable: true });
});

describe("getSafePixelRatio (Fase 3D/WebGL, Seção 26 do briefing)", () => {
  it("nunca ultrapassa 2 em ponteiro fino, mesmo com devicePixelRatio bem maior", () => {
    Object.defineProperty(window, "devicePixelRatio", { value: 4, configurable: true });
    expect(getSafePixelRatio(false)).toBe(2);
  });

  it("nunca ultrapassa 1.5 em ponteiro grosso (Seção 27 — mobile mais leve)", () => {
    Object.defineProperty(window, "devicePixelRatio", { value: 4, configurable: true });
    expect(getSafePixelRatio(true)).toBe(1.5);
  });

  it("respeita um devicePixelRatio já baixo, sem forçar um teto artificial pra cima", () => {
    Object.defineProperty(window, "devicePixelRatio", { value: 1, configurable: true });
    expect(getSafePixelRatio(false)).toBe(1);
  });
});
