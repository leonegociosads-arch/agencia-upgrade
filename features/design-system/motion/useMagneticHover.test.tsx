// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useMagneticHover } from "./useMagneticHover";

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

function MagneticProbe() {
  const ref = useMagneticHover<HTMLButtonElement>(8);
  return (
    <button ref={ref} type="button">
      Monte seu Upgrade
    </button>
  );
}

describe("useMagneticHover (Microinterações, Seção 8 — 'muito leve, apenas desktop, com limite de deslocamento')", () => {
  it("não lança erro no ambiente de teste padrão (reduced motion) e desmonta bem", () => {
    const { unmount } = render(<MagneticProbe />);
    expect(() => unmount()).not.toThrow();
  });

  it("com ponteiro fino e motion completo, monta/desmonta sem lançar erro", () => {
    mockMatchMedia({ "(prefers-reduced-motion: reduce)": false, "(hover: hover) and (pointer: fine)": true });
    const { unmount } = render(<MagneticProbe />);
    expect(() => unmount()).not.toThrow();
  });
});
