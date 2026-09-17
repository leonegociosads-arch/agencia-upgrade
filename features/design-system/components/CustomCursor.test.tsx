// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CustomCursor from "./CustomCursor";

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

describe("CustomCursor (Microinterações, Seção 9 — 'apenas desktop, nunca substitui o cursor nativo')", () => {
  it("não renderiza nada por padrão (ambiente de teste roda com prefers-reduced-motion: reduce)", () => {
    const { container } = render(<CustomCursor />);
    expect(container.firstChild).toBeNull();
  });

  it("não renderiza em touch (sem ponteiro fino), mesmo com motion completo", () => {
    mockMatchMedia({ "(prefers-reduced-motion: reduce)": false, "(hover: hover) and (pointer: fine)": false });
    const { container } = render(<CustomCursor />);
    expect(container.firstChild).toBeNull();
  });

  it("renderiza o halo com ponteiro fino e motion completo, e desmonta sem lançar erro", () => {
    mockMatchMedia({ "(prefers-reduced-motion: reduce)": false, "(hover: hover) and (pointer: fine)": true });
    const { container, unmount } = render(<CustomCursor />);
    expect(container.firstChild).not.toBeNull();
    expect(() => unmount()).not.toThrow();
  });
});
