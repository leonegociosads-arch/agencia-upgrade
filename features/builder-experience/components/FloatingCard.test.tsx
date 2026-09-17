// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import FloatingCard from "./FloatingCard";

afterEach(cleanup);

describe("FloatingCard (Prova de Conceito — Builder)", () => {
  it("é um <button> real, com aria-pressed refletindo o estado selecionado", () => {
    render(<FloatingCard label="Sites" index={0} selected={false} floating onSelect={() => {}} />);
    const card = screen.getByRole("button", { name: /Sites/ });
    expect(card.getAttribute("aria-pressed")).toBe("false");
  });

  it("dispara onSelect ao clicar", () => {
    const onSelect = vi.fn();
    render(<FloatingCard label="Sites" index={0} selected={false} floating onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button", { name: /Sites/ }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("selecionado mostra aria-pressed=true e um selo de check (nunca só cor)", () => {
    render(<FloatingCard label="Sites" index={0} selected floating={false} onSelect={() => {}} />);
    const card = screen.getByRole("button", { name: /Sites/ });
    expect(card.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("✓")).not.toBeNull();
  });

  it("desabilitado não dispara onSelect", () => {
    const onSelect = vi.fn();
    render(<FloatingCard label="Sites" index={0} selected={false} floating disabled onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button", { name: /Sites/ }));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("renderiza a descrição quando informada", () => {
    render(<FloatingCard label="Sites" description="Sites, landing pages e sistemas." index={0} selected={false} floating onSelect={() => {}} />);
    expect(screen.getByText("Sites, landing pages e sistemas.")).not.toBeNull();
  });
});
