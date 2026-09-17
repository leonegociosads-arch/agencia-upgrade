// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import EmptyState from "./EmptyState";
import Button from "./Button";

afterEach(cleanup);

describe("EmptyState (Design System, Fase 18)", () => {
  it("renderiza título, descrição e ação quando informados", () => {
    render(
      <EmptyState
        title="Nenhum projeto ainda"
        description="Comece configurando seu primeiro serviço."
        action={<Button>Começar</Button>}
      />,
    );
    expect(screen.getByText("Nenhum projeto ainda")).toBeTruthy();
    expect(screen.getByText("Comece configurando seu primeiro serviço.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Começar" })).toBeTruthy();
  });

  it("descrição e ação são opcionais", () => {
    render(<EmptyState title="Nenhum projeto ainda" />);
    expect(screen.getByText("Nenhum projeto ainda")).toBeTruthy();
  });
});
