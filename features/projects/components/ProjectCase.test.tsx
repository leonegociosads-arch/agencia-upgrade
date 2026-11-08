// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PROJECT_CASES } from "../data/projects";
import ProjectCase from "./ProjectCase";

afterEach(cleanup);

const [SM_DESIGN, KAI_HIKARI] = PROJECT_CASES;

describe("ProjectCase (Etapa Ver Projetos)", () => {
  it("renderiza o case como uma seção com âncora, título h2 e categoria", () => {
    const { container } = render(<ProjectCase project={SM_DESIGN} />);

    const section = container.querySelector("section#sm-design");
    expect(section).not.toBeNull();
    expect(screen.getByRole("heading", { level: 2, name: "SM Design" })).not.toBeNull();
    expect(screen.getByText(SM_DESIGN.category)).not.toBeNull();
  });

  it("explica os dois termos técnicos e lista os recursos de cada camada", () => {
    render(<ProjectCase project={KAI_HIKARI} />);

    expect(screen.getByText("Front-end")).not.toBeNull();
    expect(screen.getByText("Back-end")).not.toBeNull();
    for (const feature of [...KAI_HIKARI.screen, ...KAI_HIKARI.backstage]) {
      expect(screen.getByText(feature.title)).not.toBeNull();
    }
  });

  it("CTA abre o site real em nova aba, com rel seguro e nome acessível único", () => {
    render(<ProjectCase project={SM_DESIGN} />);

    const link = screen.getByRole("link", { name: /ver projeto ao vivo: sm design \(abre em nova aba\)/i });
    expect(link.getAttribute("href")).toBe("https://www.smdesignoficial.com/");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("mostra o domínio na moldura e as telas com texto alternativo", () => {
    const { container } = render(<ProjectCase project={KAI_HIKARI} />);
    const figure = container.querySelector("figure");
    expect(figure).not.toBeNull();
    expect(within(figure as HTMLElement).getByText("kaihikari.somosupgrade.com.br")).not.toBeNull();
    expect(screen.getByAltText(KAI_HIKARI.media.desktop.alt)).not.toBeNull();
  });

  it("'Ver como funciona' (celular) alterna aria-expanded e aponta para a lista que controla", () => {
    render(<ProjectCase project={SM_DESIGN} />);

    // Nome acessível inclui a camada: os 4 botões da página não ficam todos iguais.
    const toggle = screen.getByRole("button", { name: /^ver como funciona: na tela do cliente$/i });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    const list = document.getElementById(toggle.getAttribute("aria-controls") ?? "");
    expect(list?.tagName).toBe("UL");

    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(toggle.textContent).toContain("Mostrar menos");
    expect(screen.getByRole("button", { name: /^mostrar menos: na tela do cliente$/i })).toBe(toggle);
    expect(list?.getAttribute("data-expanded")).toBe("true");
  });

  it("desmonta sem lançar erro", () => {
    const { unmount } = render(<ProjectCase project={SM_DESIGN} />);
    expect(() => unmount()).not.toThrow();
  });
});
