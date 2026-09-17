// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import FinalCtaSection from "./FinalCtaSection";

afterEach(cleanup);

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({
    matches,
    media: "(prefers-reduced-motion: reduce)",
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
}

describe("FinalCtaSection (Fase ScrollTrigger e Storytelling)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renderiza o convite final e o CTA para /builder (motion reduzido, padrão do ambiente de teste)", () => {
    render(<FinalCtaSection />);

    expect(screen.getByText("Pronto para dar o próximo passo?")).not.toBeNull();
    expect(screen.getByRole("link", { name: "Monte seu Upgrade" }).getAttribute("href")).toBe("/builder");
  });

  it("com motion completo, monta e desmonta sem lançar erro", () => {
    mockMatchMedia(false);
    const { unmount } = render(<FinalCtaSection />);

    expect(screen.getByText("Pronto para dar o próximo passo?")).not.toBeNull();
    expect(() => unmount()).not.toThrow();
  });
});
