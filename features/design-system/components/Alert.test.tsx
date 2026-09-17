// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import Alert from "./Alert";

afterEach(cleanup);

describe("Alert (Design System, Fase 18)", () => {
  it("tone='error' usa role=alert (interrompe o leitor de tela)", () => {
    render(<Alert tone="error">Não foi possível enviar.</Alert>);
    expect(screen.getByRole("alert").textContent).toContain("Não foi possível enviar.");
  });

  it("tone='success'/'warning'/'info' usam role=status (não interrompe)", () => {
    render(<Alert tone="success">Enviado com sucesso.</Alert>);
    expect(screen.getByRole("status").textContent).toContain("Enviado com sucesso.");
  });
});
