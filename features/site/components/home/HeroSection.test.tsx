// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
// O efeito WebGL real (three) não roda no jsdom: um marcador simples mostra QUANDO ele é montado.
vi.mock("next/dynamic", () => ({
  default: () =>
    function LiveParticlesMarker() {
      return <div data-testid="live-particles" />;
    },
}));

import { act } from "@testing-library/react";
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

  it("toque (celular/tablet): prévia estática leve primeiro; o efeito WebGL só monta no primeiro gesto", () => {
    mockMatchMedia({ "(hover: hover) and (pointer: fine)": false });
    const { container } = render(<HeroSection />);

    expect(container.querySelector("[class*=heroStaticPreview]")).not.toBeNull();
    expect(screen.queryByTestId("live-particles")).toBeNull();

    act(() => {
      window.dispatchEvent(new Event("touchstart"));
    });
    expect(screen.getByTestId("live-particles")).not.toBeNull();
  });

  it("computador (ponteiro fino): continua montando o efeito sozinho, sem esperar gesto", async () => {
    mockMatchMedia({ "(hover: hover) and (pointer: fine)": true });
    render(<HeroSection />);
    expect(await screen.findByTestId("live-particles", undefined, { timeout: 2500 })).not.toBeNull();
  });
});
