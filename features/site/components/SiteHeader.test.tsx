// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import SiteHeader from "./SiteHeader";

afterEach(cleanup);

describe("SiteHeader (Fase 19)", () => {
  it("mostra a marca e os links para rotas que realmente existem", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: "Início" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Projetos" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Monte seu Upgrade" })).toBeTruthy();
  });

  it("TESTE (Fase 19) — o menu mobile começa fechado (sem duplicar os links de navegação)", () => {
    render(<SiteHeader />);
    expect(screen.queryByRole("navigation", { name: "Navegação principal (mobile)" })).toBeNull();
    expect(screen.getByRole("button", { name: "Abrir menu" })).toBeTruthy();
  });

  it("TESTE (Fase 19) — abrir o menu mobile mostra os links de navegação; fechar os remove de novo", () => {
    render(<SiteHeader />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));
    const mobileMenu = screen.getByRole("navigation", { name: "Navegação principal (mobile)" });
    expect(mobileMenu).toBeTruthy();
    expect(screen.getByRole("button", { name: "Fechar menu" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Fechar menu" }));
    expect(screen.queryByRole("navigation", { name: "Navegação principal (mobile)" })).toBeNull();
  });

  it("clicar num link do menu mobile fecha o menu (não fica aberto após navegar)", () => {
    render(<SiteHeader />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));
    const mobileMenu = screen.getByRole("navigation", { name: "Navegação principal (mobile)" });
    fireEvent.click(within(mobileMenu).getByRole("link", { name: "Privacidade" }));
    expect(screen.queryByRole("navigation", { name: "Navegação principal (mobile)" })).toBeNull();
  });
});
