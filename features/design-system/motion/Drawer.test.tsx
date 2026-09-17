// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Drawer from "./Drawer";

afterEach(cleanup);

/**
 * O ambiente de teste roda com `prefers-reduced-motion: reduce` por padrão (`vitest.setup.ts`),
 * então abrir/fechar resolve de forma síncrona — sem isso, testar o fim de uma timeline GSAP de
 * verdade exigiria simular `requestAnimationFrame`, o que o briefing pede para evitar (Seção 47).
 */
describe("Drawer (Fase GSAP e Transições)", () => {
  it("não renderiza nada quando fechado", () => {
    render(
      <Drawer open={false} overlayClassName="overlay" panelClassName="panel">
        <p>Conteúdo do drawer</p>
      </Drawer>,
    );
    expect(screen.queryByText("Conteúdo do drawer")).toBeNull();
  });

  it("renderiza o conteúdo quando aberto", () => {
    render(
      <Drawer open overlayClassName="overlay" panelClassName="panel">
        <p>Conteúdo do drawer</p>
      </Drawer>,
    );
    expect(screen.getByText("Conteúdo do drawer")).toBeTruthy();
  });

  it("some do DOM ao fechar", async () => {
    const { rerender } = render(
      <Drawer open overlayClassName="overlay" panelClassName="panel">
        <p>Conteúdo do drawer</p>
      </Drawer>,
    );
    expect(screen.getByText("Conteúdo do drawer")).toBeTruthy();

    rerender(
      <Drawer open={false} overlayClassName="overlay" panelClassName="panel">
        <p>Conteúdo do drawer</p>
      </Drawer>,
    );

    await waitFor(() => {
      expect(screen.queryByText("Conteúdo do drawer")).toBeNull();
    });
  });

  it("move o foco para o painel ao abrir, e devolve ao gatilho ao fechar (Seção 25 do briefing)", async () => {
    function Wrapper({ open }: { open: boolean }) {
      return (
        <div>
          <button type="button">Abrir</button>
          <Drawer open={open} overlayClassName="overlay" panelClassName="panel">
            <p>Conteúdo</p>
          </Drawer>
        </div>
      );
    }

    const { rerender } = render(<Wrapper open={false} />);
    const trigger = screen.getByRole("button", { name: "Abrir" });
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    rerender(<Wrapper open />);
    await waitFor(() => {
      expect(document.activeElement?.className).toBe("panel");
    });

    rerender(<Wrapper open={false} />);
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "Abrir" }));
    });
  });
});
