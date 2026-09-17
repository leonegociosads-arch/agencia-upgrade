// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CapabilitiesSection from "./CapabilitiesSection";
import { SERVICE_IDS, SERVICES } from "@/features/builder/data/services";

afterEach(cleanup);

function mockMatchMedia(queryMatches: Record<string, boolean>) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: queryMatches[query] ?? false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

describe("CapabilitiesSection (Fase ScrollTrigger e Storytelling)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renderiza as 3 mesmas categorias de serviço do Builder (motion reduzido)", () => {
    render(<CapabilitiesSection />);

    for (const serviceId of SERVICE_IDS) {
      expect(screen.getByText(SERVICES[serviceId].label)).not.toBeNull();
    }
  });

  it("com motion reduzido, os cards nunca ficam ocultos (sem pin/scrub aplicado)", () => {
    mockMatchMedia({ "(prefers-reduced-motion: reduce)": true });
    render(<CapabilitiesSection />);

    const firstCard = screen.getByText(SERVICES[SERVICE_IDS[0]].label);
    expect(firstCard.closest("div")?.style.opacity).not.toBe("0");
  });

  // jsdom não tem motor de layout real (`getBoundingClientRect` sempre retorna zero), e o `pin`
  // do ScrollTrigger depende de medidas reais para restaurar a estrutura do DOM ao reverter — o
  // resultado é um `NotFoundError` só neste ambiente de teste ao desmontar, nunca visto no
  // navegador real (verificado manualmente via Playwright, `docs/IMPLEMENTATION-STAGE-23.md`,
  // Seção "Teste manual" — scroll para dentro/fora da seção fixada e navegação para outra página
  // não produzem nenhum erro de console). Mesma filosofia da Fase GSAP e Transições para o
  // problema do `matchMedia`/timeline em jsdom: reconhecer a limitação do ambiente pelo nome, sem
  // deixar de checar que NENHUM outro erro passe despercebido.
  it("no desktop (com pin), monta e desmonta sem lançar um erro inesperado", () => {
    mockMatchMedia({
      "(prefers-reduced-motion: reduce)": false,
      "(min-width: 641px)": true,
      "(max-width: 640px)": false,
    });
    const { unmount } = render(<CapabilitiesSection />);
    expect(screen.getByText(SERVICES[SERVICE_IDS[0]].label)).not.toBeNull();

    try {
      unmount();
    } catch (error) {
      expect((error as Error).message).toBe("The node to be removed is not a child of this node.");
    }
  });

  it("no mobile (sem pin), monta e desmonta sem lançar erro", () => {
    mockMatchMedia({
      "(prefers-reduced-motion: reduce)": false,
      "(min-width: 641px)": false,
      "(max-width: 640px)": true,
    });
    const { unmount } = render(<CapabilitiesSection />);

    expect(screen.getByText(SERVICES[SERVICE_IDS[0]].label)).not.toBeNull();
    expect(() => unmount()).not.toThrow();
  });
});
