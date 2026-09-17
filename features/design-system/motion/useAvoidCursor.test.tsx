// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useAvoidCursor } from "./useAvoidCursor";

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

function AvoidProbe() {
  const ref = useAvoidCursor<HTMLDivElement>(180, 24);
  return <div ref={ref} aria-hidden="true" />;
}

describe("useAvoidCursor (a única interação-surpresa do site — Microinterações, Seções 34/35)", () => {
  it("não lança erro no ambiente de teste padrão (reduced motion) e desmonta bem", () => {
    const { unmount } = render(<AvoidProbe />);
    expect(() => unmount()).not.toThrow();
  });

  it("com ponteiro fino e motion completo, reage a pointermove sem lançar erro", () => {
    mockMatchMedia({ "(prefers-reduced-motion: reduce)": false, "(hover: hover) and (pointer: fine)": true });
    const { unmount } = render(<AvoidProbe />);
    window.dispatchEvent(new PointerEvent("pointermove", { clientX: 10, clientY: 10 }));
    expect(() => unmount()).not.toThrow();
  });
});
