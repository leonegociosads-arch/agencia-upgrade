// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import HeroSection from "./HeroSection";

afterEach(cleanup);

/**
 * `HeroSection` orquestra GSAP/ScrollTrigger (`useHeroScrollMotion`) — como o resto do projeto
 * desde a Fase GSAP e Transições, estes testes verificam comportamento (conteúdo presente,
 * motion reduzido preserva tudo, desmontar não lança erro), nunca frames de animação.
 */
function mockMatchMedia(queryMatches: Record<string, boolean>) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: queryMatches[query] ?? false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

describe("HeroSection (Fase ScrollTrigger e Storytelling)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renderiza título, subtítulo e os dois CTAs (motion reduzido, padrão do ambiente de teste)", () => {
    render(<HeroSection />);

    expect(screen.getByText("Um upgrade real na presença digital da sua empresa.")).not.toBeNull();
    expect(screen.getByRole("link", { name: "Monte seu Upgrade" })).not.toBeNull();
    expect(screen.getByRole("link", { name: "Ver projetos" })).not.toBeNull();
  });

  it("com motion reduzido, o conteúdo nunca fica oculto (Home continua completa sem animação)", () => {
    mockMatchMedia({ "(prefers-reduced-motion: reduce)": true });
    render(<HeroSection />);

    const title = screen.getByText("Um upgrade real na presença digital da sua empresa.");
    expect(title.style.opacity).not.toBe("0");
  });

  it("com motion completo (desktop), monta e desmonta sem lançar erro", () => {
    mockMatchMedia({
      "(prefers-reduced-motion: reduce)": false,
      "(min-width: 641px)": true,
      "(max-width: 640px)": false,
    });
    const { unmount } = render(<HeroSection />);

    expect(screen.getByText("Um upgrade real na presença digital da sua empresa.")).not.toBeNull();
    expect(() => unmount()).not.toThrow();
  });
});
