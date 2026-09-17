// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import Card from "./Card";

afterEach(cleanup);

describe("Card (Design System, Fase 18)", () => {
  it("renderiza o conteúdo", () => {
    render(<Card>Conteúdo do card</Card>);
    expect(screen.getByText("Conteúdo do card")).toBeTruthy();
  });

  it("selected: mostra uma marca de seleção visível além da cor (nunca só cor)", () => {
    render(<Card selected>Serviço selecionado</Card>);
    // A marca de check é decorativa (aria-hidden) — confirmamos que ela existe no DOM, não que é
    // acessível por si só (o texto ao redor do card carrega o significado real).
    expect(screen.getByText("✓")).toBeTruthy();
  });

  it("sem selected: nenhuma marca de seleção aparece", () => {
    render(<Card>Serviço não selecionado</Card>);
    expect(screen.queryByText("✓")).toBeNull();
  });
});
