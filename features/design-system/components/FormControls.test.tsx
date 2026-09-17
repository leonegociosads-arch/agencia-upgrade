// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import Input from "./Input";
import Textarea from "./Textarea";
import Select from "./Select";
import Checkbox from "./Checkbox";
import Radio from "./Radio";

afterEach(cleanup);

describe("Input (Design System, Fase 18)", () => {
  it("renderiza e aceita digitação", () => {
    render(<Input aria-label="Nome" />);
    const input = screen.getByLabelText("Nome") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Ana" } });
    expect(input.value).toBe("Ana");
  });

  it("disabled: marcado como desabilitado", () => {
    render(<Input aria-label="Nome" disabled />);
    expect((screen.getByLabelText("Nome") as HTMLInputElement).disabled).toBe(true);
  });

  it("invalid: marca aria-invalid", () => {
    render(<Input aria-label="E-mail" invalid />);
    expect(screen.getByLabelText("E-mail").getAttribute("aria-invalid")).toBe("true");
  });

  it("suporta type='email'/'tel' via a prop nativa, sem componente próprio para cada um", () => {
    render(<Input aria-label="WhatsApp" type="tel" />);
    expect(screen.getByLabelText("WhatsApp").getAttribute("type")).toBe("tel");
  });
});

describe("Textarea (Design System, Fase 18)", () => {
  it("renderiza e aceita digitação", () => {
    render(<Textarea aria-label="Mensagem" />);
    const textarea = screen.getByLabelText("Mensagem") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "Olá" } });
    expect(textarea.value).toBe("Olá");
  });
});

describe("Select (Design System, Fase 18)", () => {
  it("renderiza as opções e responde a mudança de valor", () => {
    const onChange = vi.fn();
    render(
      <Select aria-label="Status" onChange={onChange}>
        <option value="new">Novo</option>
        <option value="won">Fechado</option>
      </Select>,
    );
    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "won" } });
    expect(onChange).toHaveBeenCalled();
  });
});

describe("Checkbox (Design System, Fase 18)", () => {
  it("associa o label corretamente e alterna ao clicar", () => {
    render(<Checkbox id="aceite" label="Aceito os termos" />);
    const checkbox = screen.getByLabelText("Aceito os termos") as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  it("disabled: marcado como desabilitado", () => {
    render(<Checkbox id="aceite" label="Aceito os termos" disabled />);
    const checkbox = screen.getByLabelText("Aceito os termos") as HTMLInputElement;
    expect(checkbox.disabled).toBe(true);
  });
});

describe("Radio (Design System, Fase 18)", () => {
  it("associa o label corretamente e marca ao clicar", () => {
    render(
      <>
        <Radio id="op1" name="opcao" label="Opção 1" />
        <Radio id="op2" name="opcao" label="Opção 2" />
      </>,
    );
    const opcao1 = screen.getByLabelText("Opção 1") as HTMLInputElement;
    const opcao2 = screen.getByLabelText("Opção 2") as HTMLInputElement;
    fireEvent.click(opcao1);
    expect(opcao1.checked).toBe(true);
    fireEvent.click(opcao2);
    expect(opcao1.checked).toBe(false);
    expect(opcao2.checked).toBe(true);
  });
});
