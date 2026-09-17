// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import Button from "./Button";

afterEach(cleanup);

describe("Button (Design System, Fase 18)", () => {
  it("renderiza o texto e responde a clique", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Enviar</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disabled: fica marcado como desabilitado", () => {
    render(<Button disabled>Enviar</Button>);
    const button = screen.getByRole("button", { name: "Enviar" }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("loading: fica desabilitado, marca aria-busy e mantém 'Enviar' como nome acessível (Spinner é decorativo aqui)", () => {
    render(<Button loading>Enviar</Button>);
    const button = screen.getByRole("button", { name: "Enviar" }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.getAttribute("aria-busy")).toBe("true");
  });

  it("foco visível: o botão consegue receber foco (:focus-visible aplicado via CSS, testável pelo foco em si)", () => {
    render(<Button>Enviar</Button>);
    const button = screen.getByRole("button", { name: "Enviar" });
    button.focus();
    expect(document.activeElement).toBe(button);
  });

  it("type padrão é 'button' (nunca dispara submit de um form por acidente)", () => {
    render(<Button>Enviar</Button>);
    expect(screen.getByRole("button").getAttribute("type")).toBe("button");
  });

  it("aceita variant/size/fullWidth sem quebrar a renderização", () => {
    render(
      <Button variant="danger" size="lg" fullWidth>
        Remover
      </Button>,
    );
    expect(screen.getByRole("button", { name: "Remover" })).toBeTruthy();
  });
});
