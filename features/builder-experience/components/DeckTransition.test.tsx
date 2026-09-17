// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DeckTransition from "./DeckTransition";

afterEach(cleanup);

/**
 * Mesma filosofia de teste da `SceneTransition` real (Fase GSAP e Transições): comportamento, não
 * frame de animação. O caminho de `prefers-reduced-motion` resolve de forma síncrona
 * (`gsap.set`), então é o caminho usado para verificar o fluxo funcional completo.
 */
function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({
    matches,
    media: "(prefers-reduced-motion: reduce)",
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
}

describe("DeckTransition (Prova de Conceito — Builder)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renderiza o conteúdo recebido normalmente", () => {
    mockMatchMedia(false);
    render(
      <DeckTransition sceneKey="a" direction="forward">
        <p>Cena A</p>
      </DeckTransition>,
    );
    expect(screen.getByText("Cena A")).not.toBeNull();
  });

  it("com reduced motion, troca de cena resolve sem lançar erro e chama onTransitioningChange(false) ao final", async () => {
    mockMatchMedia(true);
    const onTransitioningChange = vi.fn();
    const { rerender } = render(
      <DeckTransition sceneKey="a" direction="forward" onTransitioningChange={onTransitioningChange}>
        <p>Cena A</p>
      </DeckTransition>,
    );

    rerender(
      <DeckTransition sceneKey="b" direction="forward" onTransitioningChange={onTransitioningChange}>
        <p>Cena B</p>
      </DeckTransition>,
    );

    await waitFor(() => {
      expect(screen.getByText("Cena B")).not.toBeNull();
      expect(screen.queryByText("Cena A")).toBeNull();
    });
    expect(onTransitioningChange).toHaveBeenCalledWith(true);
    expect(onTransitioningChange).toHaveBeenCalledWith(false);
  });

  it("durante a troca (motion completo), a cena anterior continua visível junto da nova", () => {
    mockMatchMedia(false);
    const { rerender } = render(
      <DeckTransition sceneKey="a" direction="forward">
        <p>Cena A</p>
      </DeckTransition>,
    );

    rerender(
      <DeckTransition sceneKey="b" direction="backward">
        <p>Cena B</p>
      </DeckTransition>,
    );

    expect(screen.getByText("Cena B")).not.toBeNull();
    expect(screen.getByText("Cena A")).not.toBeNull();
  });

  it("não faz nada quando a sceneKey é a mesma", () => {
    mockMatchMedia(false);
    const { rerender } = render(
      <DeckTransition sceneKey="a" direction="forward">
        <p>Valor 1</p>
      </DeckTransition>,
    );

    rerender(
      <DeckTransition sceneKey="a" direction="forward">
        <p>Valor 2</p>
      </DeckTransition>,
    );

    expect(screen.getByText("Valor 2")).not.toBeNull();
    expect(screen.queryByText("Valor 1")).toBeNull();
  });

  it("desmonta sem lançar erro no meio de uma transição animada", () => {
    mockMatchMedia(false);
    const { rerender, unmount } = render(
      <DeckTransition sceneKey="a" direction="forward">
        <p>Cena A</p>
      </DeckTransition>,
    );
    rerender(
      <DeckTransition sceneKey="b" direction="forward">
        <p>Cena B</p>
      </DeckTransition>,
    );
    expect(() => unmount()).not.toThrow();
  });
});
