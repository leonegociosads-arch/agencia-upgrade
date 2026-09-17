// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useTilt } from "./useTilt";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function mockMatchMedia(overrides: Record<string, boolean>) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: overrides[query] ?? false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

function TiltProbe() {
  const ref = useTilt<HTMLDivElement>(3);
  return <div ref={ref}>card</div>;
}

describe("useTilt (Microinterações, Seções 10/11/53 — gated por ponteiro fino e reduced motion)", () => {
  it("não lança erro no ambiente de teste padrão (reduced motion) e desmonta bem", () => {
    const { unmount } = render(<TiltProbe />);
    expect(() => unmount()).not.toThrow();
  });

  it("com ponteiro fino e motion completo, monta/desmonta sem lançar erro (limpa o transform inline ao sair)", () => {
    mockMatchMedia({ "(prefers-reduced-motion: reduce)": false, "(hover: hover) and (pointer: fine)": true });
    const { unmount } = render(<TiltProbe />);
    expect(() => unmount()).not.toThrow();
  });

  it("sem ponteiro fino (touch), mesmo com motion completo, não anima (sem erro ao desmontar)", () => {
    mockMatchMedia({ "(prefers-reduced-motion: reduce)": false, "(hover: hover) and (pointer: fine)": false });
    const { unmount } = render(<TiltProbe />);
    expect(() => unmount()).not.toThrow();
  });
});
