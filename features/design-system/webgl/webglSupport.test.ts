// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { hasWebGL, resetWebGLSupportCache } from "./webglSupport";

afterEach(() => {
  resetWebGLSupportCache();
  vi.restoreAllMocks();
});

describe("hasWebGL (Fase 3D/WebGL, Seção 30 do briefing — detecção de suporte)", () => {
  it("retorna false quando o navegador não consegue criar nenhum contexto WebGL (jsdom real)", () => {
    // jsdom não implementa contexto WebGL de verdade — `getContext` retorna `null`, exatamente o
    // cenário real de um navegador sem suporte.
    expect(hasWebGL()).toBe(false);
  });

  it("retorna true quando `getContext` consegue um contexto (webgl2 ou webgl)", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
      (type: string) => (type === "webgl2" ? ({} as unknown as WebGL2RenderingContext) : null),
    );
    expect(hasWebGL()).toBe(true);
  });

  it("retorna false sem lançar se `getContext` lançar (driver instável)", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => {
      throw new Error("driver falhou");
    });
    expect(() => hasWebGL()).not.toThrow();
    expect(hasWebGL()).toBe(false);
  });

  it("cacheia o resultado — chamadas seguintes não recriam o canvas de teste", () => {
    const spy = vi.spyOn(document, "createElement");
    hasWebGL();
    hasWebGL();
    hasWebGL();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
