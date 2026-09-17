// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import SoundToggle from "./SoundToggle";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("SoundToggle (Prova de acessibilidade — briefing Microinterações, Seção 39)", () => {
  it("começa desligado, com rótulo acessível 'Ativar som'", () => {
    render(<SoundToggle />);
    const button = screen.getByRole("button", { name: "Ativar som" });
    expect(button.getAttribute("aria-pressed")).toBe("false");
  });

  it("clicar liga o som e persiste (rótulo/estado mudam)", () => {
    render(<SoundToggle />);
    fireEvent.click(screen.getByRole("button", { name: "Ativar som" }));
    const button = screen.getByRole("button", { name: "Desativar som" });
    expect(button.getAttribute("aria-pressed")).toBe("true");
  });

  it("clicar de novo desliga", () => {
    render(<SoundToggle />);
    fireEvent.click(screen.getByRole("button", { name: "Ativar som" }));
    fireEvent.click(screen.getByRole("button", { name: "Desativar som" }));
    expect(screen.getByRole("button", { name: "Ativar som" }).getAttribute("aria-pressed")).toBe("false");
  });
});
