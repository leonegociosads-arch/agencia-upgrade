// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

let mockSupported = false;
vi.mock("./webglSupport", () => ({
  hasWebGL: () => mockSupported,
}));

import ProceduralAura from "./ProceduralAura";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  mockSupported = false;
});

describe("ProceduralAura (Fase 3D/WebGL, Seções 12/16/31/42 do briefing)", () => {
  it("não renderiza nenhum canvas quando WebGL não é suportado (fallback CSS do pai continua visível)", () => {
    mockSupported = false;
    const { container } = render(<ProceduralAura />);
    expect(container.querySelector("canvas")).toBeNull();
  });

  it("não lança mesmo quando hasWebGL() diz que sim mas o contexto real falha (Seção 42)", () => {
    mockSupported = true;
    expect(() => render(<ProceduralAura />)).not.toThrow();
  });

  it("desmonta sem lançar em qualquer um dos dois cenários", () => {
    mockSupported = true;
    const { unmount: unmountSupported } = render(<ProceduralAura />);
    expect(() => unmountSupported()).not.toThrow();

    mockSupported = false;
    const { unmount: unmountUnsupported } = render(<ProceduralAura />);
    expect(() => unmountUnsupported()).not.toThrow();
  });

  it("com motion completo e WebGL 'suportado', ainda assim não lança", () => {
    mockSupported = true;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;

    expect(() => render(<ProceduralAura />)).not.toThrow();
  });
});
