// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

let currentPathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname,
}));

import SmoothScrollProvider, { useSmoothScroll } from "./SmoothScrollProvider";

function mockMatchMedia(overrides: Record<string, boolean>) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: overrides[query] ?? false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

const FULL_MOTION = { "(prefers-reduced-motion: reduce)": false };

function Probe() {
  const lenis = useSmoothScroll();
  return <span>{lenis ? "com-lenis" : "sem-lenis"}</span>;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.resetModules();
  currentPathname = "/";
});

describe("SmoothScrollProvider (Fase Smooth Scroll)", () => {
  it("no ambiente de teste padrão (reduced motion), não instancia Lenis e não lança erro", () => {
    currentPathname = "/";
    const { unmount } = render(
      <SmoothScrollProvider>
        <Probe />
      </SmoothScrollProvider>,
    );
    expect(screen.getByText("sem-lenis")).not.toBeNull();
    expect(() => unmount()).not.toThrow();
  });

  it("em rota do Builder, nunca instancia Lenis mesmo com motion completo (Seção 4 do briefing)", () => {
    mockMatchMedia(FULL_MOTION);
    currentPathname = "/builder";
    render(
      <SmoothScrollProvider>
        <Probe />
      </SmoothScrollProvider>,
    );
    expect(screen.getByText("sem-lenis")).not.toBeNull();
  });

  it("em rota do Admin, nunca instancia Lenis mesmo com motion completo (Seção 5 do briefing)", () => {
    mockMatchMedia(FULL_MOTION);
    currentPathname = "/admin";
    render(
      <SmoothScrollProvider>
        <Probe />
      </SmoothScrollProvider>,
    );
    expect(screen.getByText("sem-lenis")).not.toBeNull();
  });

  it("em rota elegível (Home) com motion completo, expõe uma instância real e desmonta sem lançar", () => {
    mockMatchMedia(FULL_MOTION);
    currentPathname = "/";
    const { unmount } = render(
      <SmoothScrollProvider>
        <Probe />
      </SmoothScrollProvider>,
    );
    expect(screen.getByText("com-lenis")).not.toBeNull();
    expect(() => unmount()).not.toThrow();
  });

  it("troca de rota elegível para não-elegível destrói a instância sem lançar (Seção 49 — cleanup em route change)", () => {
    mockMatchMedia(FULL_MOTION);
    currentPathname = "/";
    const { rerender } = render(
      <SmoothScrollProvider>
        <Probe />
      </SmoothScrollProvider>,
    );
    expect(screen.getByText("com-lenis")).not.toBeNull();

    currentPathname = "/builder";
    rerender(
      <SmoothScrollProvider>
        <Probe />
      </SmoothScrollProvider>,
    );
    expect(screen.getByText("sem-lenis")).not.toBeNull();
  });
});

describe("SmoothScrollProvider — fallback (Seção 54: Lenis falhando nunca quebra o scroll nativo)", () => {
  it("se o construtor do Lenis lançar, a instância fica null em vez de propagar o erro", async () => {
    vi.doMock("lenis", () => ({
      default: vi.fn(() => {
        throw new Error("falha simulada de inicialização");
      }),
    }));
    const { default: IsolatedProvider, useSmoothScroll: useIsolatedSmoothScroll } = await import(
      "./SmoothScrollProvider"
    );
    function IsolatedProbe() {
      const lenis = useIsolatedSmoothScroll();
      return <span>{lenis ? "com-lenis" : "sem-lenis"}</span>;
    }

    mockMatchMedia(FULL_MOTION);
    currentPathname = "/";
    expect(() =>
      render(
        <IsolatedProvider>
          <IsolatedProbe />
        </IsolatedProvider>,
      ),
    ).not.toThrow();
    expect(screen.getByText("sem-lenis")).not.toBeNull();
  });
});
