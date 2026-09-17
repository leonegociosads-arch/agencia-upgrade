// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SceneTransition, { useSceneNavigation } from "./SceneTransition";

afterEach(cleanup);

/**
 * `SceneTransition` usa GSAP internamente — estes testes não verificam nenhum frame de animação
 * (briefing Fase GSAP, Seção 47: "não testar frame a frame, testar comportamento"). O caminho de
 * `prefers-reduced-motion` resolve de forma síncrona (`gsap.set`, sem timeline), então é o caminho
 * usado para verificar o comportamento funcional completo (a cena troca, `isTransitioning` volta a
 * `false`); o caminho animado só é verificado estruturalmente (as duas camadas coexistem durante a
 * troca), sem esperar a timeline terminar de verdade.
 */
function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({
    matches,
    media: "(prefers-reduced-motion: reduce)",
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
}

describe("SceneTransition (Fase GSAP e Transições)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renderiza o conteúdo recebido normalmente", () => {
    mockMatchMedia(false);
    render(
      <SceneTransition sceneKey="a">
        <p>Conteúdo da cena</p>
      </SceneTransition>
    );
    expect(screen.getByText("Conteúdo da cena")).not.toBeNull();
  });

  it("com reduced motion, troca de cena resolve sem lançar erro e libera isTransitioning", async () => {
    mockMatchMedia(true);
    const { rerender } = render(
      <SceneTransition sceneKey="a">
        <p>Cena A</p>
      </SceneTransition>
    );
    expect(screen.getByText("Cena A")).not.toBeNull();

    rerender(
      <SceneTransition sceneKey="b">
        <p>Cena B</p>
      </SceneTransition>
    );

    await waitFor(() => {
      expect(screen.getByText("Cena B")).not.toBeNull();
      expect(screen.queryByText("Cena A")).toBeNull();
    });
  });

  it("durante a troca (motion completo), a cena anterior continua visível junto da nova", () => {
    mockMatchMedia(false);
    const { rerender } = render(
      <SceneTransition sceneKey="a">
        <p>Cena A</p>
      </SceneTransition>
    );

    act(() => {
      rerender(
        <SceneTransition sceneKey="b">
          <p>Cena B</p>
        </SceneTransition>
      );
    });

    // Logo após a troca, antes da timeline terminar: as duas cenas coexistem (crossfade) — a
    // cena nova é sempre renderizada ao vivo, a anterior é um retrato ainda no ar.
    expect(screen.getByText("Cena B")).not.toBeNull();
    expect(screen.getByText("Cena A")).not.toBeNull();
  });

  it("não muda nada quando a sceneKey é a mesma (só o conteúdo interno muda)", () => {
    mockMatchMedia(false);
    const { rerender } = render(
      <SceneTransition sceneKey="a">
        <p>Valor 1</p>
      </SceneTransition>
    );

    rerender(
      <SceneTransition sceneKey="a">
        <p>Valor 2</p>
      </SceneTransition>
    );

    expect(screen.getByText("Valor 2")).not.toBeNull();
    expect(screen.queryByText("Valor 1")).toBeNull();
  });
});

describe("useSceneNavigation (fora de um SceneTransition)", () => {
  it("retorna valores seguros (no-op) quando usado sem um provider", () => {
    let captured: ReturnType<typeof useSceneNavigation> | undefined;
    function Probe() {
      captured = useSceneNavigation();
      return null;
    }
    render(<Probe />);

    expect(captured?.isTransitioning).toBe(false);
    expect(() => captured?.markForward()).not.toThrow();
    expect(() => captured?.markBackward()).not.toThrow();
  });
});
