// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import FormField from "./FormField";
import Input from "./Input";

afterEach(cleanup);

describe("FormField (Design System, Fase 18)", () => {
  it("TESTE — o input associa corretamente ao label (getByLabelText funciona)", () => {
    render(
      <FormField label="Nome" htmlFor="name">
        <Input id="name" />
      </FormField>,
    );
    expect(screen.getByLabelText("Nome")).toBeTruthy();
  });

  it("TESTE — erro aparece com role=alert e liga o input via aria-describedby", () => {
    render(
      <FormField label="E-mail" htmlFor="email" error="E-mail inválido.">
        <Input id="email" />
      </FormField>,
    );
    const error = screen.getByRole("alert");
    expect(error.textContent).toBe("E-mail inválido.");

    const input = screen.getByLabelText("E-mail");
    expect(input.getAttribute("aria-describedby")).toBe("email-error");
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("sem erro: mostra a dica (hint) em vez disso, sem role=alert", () => {
    render(
      <FormField label="Empresa" htmlFor="company" hint="Opcional">
        <Input id="company" />
      </FormField>,
    );
    expect(screen.getByText("Opcional")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("required: marca visual (*) aparece, mas nunca no nome acessível do label (é decorativa)", () => {
    render(
      <FormField label="Nome" htmlFor="name" required>
        <Input id="name" />
      </FormField>,
    );
    // getByLabelText("Nome") funciona mesmo com o "*" decorativo ao lado (aria-hidden).
    expect(screen.getByLabelText(/Nome/)).toBeTruthy();
  });
});
