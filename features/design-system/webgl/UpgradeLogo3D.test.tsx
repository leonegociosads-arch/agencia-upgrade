// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

let mockSupported = false;
vi.mock("./webglSupport", () => ({
  hasWebGL: () => mockSupported,
}));

import UpgradeLogo3D from "./UpgradeLogo3D";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  mockSupported = false;
});

describe("UpgradeLogo3D (Fase 3D/WebGL, Seções 3-5/31/42 do briefing)", () => {
  it("não renderiza nenhum canvas quando WebGL não é suportado (fallback CSS do pai continua visível)", () => {
    mockSupported = false;
    const { container } = render(<UpgradeLogo3D />);
    expect(container.querySelector("canvas")).toBeNull();
  });

  it("não lança mesmo quando hasWebGL() diz que sim mas o navegador de teste não consegue criar o contexto de verdade (Seção 42 — falha nunca quebra a página)", () => {
    mockSupported = true;
    // jsdom não implementa um contexto WebGL real — `WebGLRenderer` lança na criação; o
    // try/catch do componente precisa engolir isso e cair de volta pro fallback, nunca propagar.
    expect(() => render(<UpgradeLogo3D />)).not.toThrow();
  });

  it("desmonta sem lançar em qualquer um dos dois cenários", () => {
    mockSupported = true;
    const { unmount: unmountSupported } = render(<UpgradeLogo3D />);
    expect(() => unmountSupported()).not.toThrow();

    mockSupported = false;
    const { unmount: unmountUnsupported } = render(<UpgradeLogo3D />);
    expect(() => unmountUnsupported()).not.toThrow();
  });

  it("com motion completo (reduced motion desligado) e WebGL 'suportado', ainda assim não lança", () => {
    mockSupported = true;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;

    expect(() => render(<UpgradeLogo3D />)).not.toThrow();
  });
});
