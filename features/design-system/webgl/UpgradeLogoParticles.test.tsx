// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

let mockSupported = false;
vi.mock("./webglSupport", () => ({
  hasWebGL: () => mockSupported,
}));

import UpgradeLogoParticles from "./UpgradeLogoParticles";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  mockSupported = false;
});

describe("UpgradeLogoParticles", () => {
  it("não renderiza nenhum canvas quando WebGL não é suportado (fallback CSS do pai continua visível)", () => {
    mockSupported = false;
    const { container } = render(<UpgradeLogoParticles />);
    expect(container.querySelector("canvas")).toBeNull();
  });

  it("não lança mesmo quando hasWebGL() diz que sim mas o navegador de teste não consegue criar o contexto de verdade", () => {
    mockSupported = true;
    // jsdom não implementa WebGL nem decodifica imagens de verdade — o carregamento da logo nunca
    // chama `onload`, então a cena nunca chega a ser criada; o importante é que nada lance.
    expect(() => render(<UpgradeLogoParticles />)).not.toThrow();
  });

  it("desmonta sem lançar em qualquer um dos dois cenários, mesmo antes da imagem terminar de carregar", () => {
    mockSupported = true;
    const { unmount: unmountSupported } = render(<UpgradeLogoParticles />);
    expect(() => unmountSupported()).not.toThrow();

    mockSupported = false;
    const { unmount: unmountUnsupported } = render(<UpgradeLogoParticles />);
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

    expect(() => render(<UpgradeLogoParticles />)).not.toThrow();
  });
});
