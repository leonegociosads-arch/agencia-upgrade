// @vitest-environment jsdom
import { useRef } from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useInViewport } from "./useInViewport";

type ObserverCallback = (entries: Pick<IntersectionObserverEntry, "isIntersecting">[]) => void;
let observedCallback: ObserverCallback | null = null;
let observeSpy = vi.fn();
let disconnectSpy = vi.fn();

class FakeIntersectionObserver {
  constructor(callback: ObserverCallback) {
    observedCallback = callback;
  }
  observe = observeSpy;
  disconnect = disconnectSpy;
  unobserve = vi.fn();
}

const originalIO = global.IntersectionObserver;

beforeEach(() => {
  observedCallback = null;
  observeSpy = vi.fn();
  disconnectSpy = vi.fn();
  // @ts-expect-error -- fake mínimo só com o que o hook usa
  global.IntersectionObserver = FakeIntersectionObserver;
});

afterEach(() => {
  cleanup();
  global.IntersectionObserver = originalIO;
});

function Probe({ rootMargin }: { rootMargin?: string }) {
  const [ref, inViewport] = useInViewport<HTMLDivElement>(rootMargin);
  return <div ref={ref}>{inViewport ? "dentro" : "fora"}</div>;
}

describe("useInViewport (Fase 3D/WebGL, Seções 20/22/23 do briefing)", () => {
  it("começa como 'fora' (nunca monta o efeito pesado antes de saber que está perto da tela)", () => {
    render(<Probe />);
    expect(screen.getByText("fora")).not.toBeNull();
    expect(observeSpy).toHaveBeenCalledTimes(1);
  });

  it("fica 'dentro' quando o IntersectionObserver reporta interseção", () => {
    render(<Probe />);
    act(() => observedCallback?.([{ isIntersecting: true }]));
    expect(screen.getByText("dentro")).not.toBeNull();
  });

  it("volta a 'fora' se o elemento sair da viewport de novo (permite pausar, Seção 23)", () => {
    render(<Probe />);
    act(() => observedCallback?.([{ isIntersecting: true }]));
    expect(screen.getByText("dentro")).not.toBeNull();
    act(() => observedCallback?.([{ isIntersecting: false }]));
    expect(screen.getByText("fora")).not.toBeNull();
  });

  it("desconecta o observer ao desmontar", () => {
    const { unmount } = render(<Probe />);
    unmount();
    expect(disconnectSpy).toHaveBeenCalledTimes(1);
  });

  it("funciona com uma ref externa, sem exigir uma segunda ref concorrente no mesmo nó", () => {
    function ExternalProbe() {
      const sectionRef = useRef<HTMLElement | null>(null);
      const [, inViewport] = useInViewport<HTMLElement>("100px", sectionRef);
      return (
        <section ref={sectionRef} data-testid="section">
          {inViewport ? "dentro" : "fora"}
        </section>
      );
    }
    render(<ExternalProbe />);
    expect(observeSpy).toHaveBeenCalledTimes(1);
    act(() => observedCallback?.([{ isIntersecting: true }]));
    expect(screen.getByTestId("section").textContent).toBe("dentro");
  });

  it("nunca lança se IntersectionObserver não existir no ambiente (navegador muito antigo)", () => {
    // @ts-expect-error -- simula ausência real da API
    global.IntersectionObserver = undefined;
    expect(() => render(<Probe />)).not.toThrow();
    expect(screen.getByText("fora")).not.toBeNull();
  });
});
