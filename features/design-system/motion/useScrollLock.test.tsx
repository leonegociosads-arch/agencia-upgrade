// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const stopMock = vi.fn();
const startMock = vi.fn();
let mockLenis: { stop: () => void; start: () => void } | null = null;

vi.mock("./SmoothScrollProvider", () => ({
  useSmoothScroll: () => mockLenis,
}));

import { useScrollLock } from "./useScrollLock";

function Probe({ active }: { active: boolean }) {
  useScrollLock(active);
  return null;
}

afterEach(() => {
  cleanup();
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
  mockLenis = null;
  stopMock.mockClear();
  startMock.mockClear();
});

describe("useScrollLock (Fase Smooth Scroll, Seções 27-30 — Meu Upgrade/menu mobile/drawer)", () => {
  it("não altera o overflow do body quando `active` é false", () => {
    render(<Probe active={false} />);
    expect(document.body.style.overflow).toBe("");
  });

  it("bloqueia o overflow do body quando `active` é true e restaura ao ficar false", () => {
    const { rerender } = render(<Probe active />);
    expect(document.body.style.overflow).toBe("hidden");

    rerender(<Probe active={false} />);
    expect(document.body.style.overflow).toBe("");
  });

  it("restaura o overflow ao desmontar com o lock ainda ativo (fechar sem re-render antes)", () => {
    const { unmount } = render(<Probe active />);
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("chama lenis.stop()/lenis.start() quando uma instância está disponível (rotas com smooth scroll)", () => {
    mockLenis = { stop: stopMock, start: startMock };
    const { rerender } = render(<Probe active />);
    expect(stopMock).toHaveBeenCalledTimes(1);

    rerender(<Probe active={false} />);
    expect(startMock).toHaveBeenCalledTimes(1);
  });

  it("funciona normalmente sem nenhuma instância de Lenis (Builder, Seção 4 do briefing)", () => {
    mockLenis = null;
    expect(() => render(<Probe active />)).not.toThrow();
    expect(document.body.style.overflow).toBe("hidden");
  });
});
