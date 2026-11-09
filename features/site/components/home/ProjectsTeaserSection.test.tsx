// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import ProjectsTeaserSection from "./ProjectsTeaserSection";

afterEach(cleanup);

describe("ProjectsTeaserSection — teaser visual dos cases reais (auditoria 09/11/2026)", () => {
  it("renderiza o título e o CTA geral 'Ver projetos' para /projetos", () => {
    render(<ProjectsTeaserSection />);

    expect(screen.getByRole("heading", { level: 2, name: "Projetos" })).not.toBeNull();
    expect(screen.getByRole("link", { name: "Ver projetos" }).getAttribute("href")).toBe("/projetos");
  });

  it("mostra SM Design e Kai Hikari, cada um levando ao seu trecho de /projetos", () => {
    render(<ProjectsTeaserSection />);

    expect(screen.getByRole("link", { name: /^SM Design/ }).getAttribute("href")).toBe("/projetos#sm-design");
    expect(screen.getByRole("link", { name: /^Kai Hikari/ }).getAttribute("href")).toBe("/projetos#kai-hikari");
  });

  it("usa as capturas reais já existentes, carregadas sob demanda (abaixo da dobra)", () => {
    const { container } = render(<ProjectsTeaserSection />);
    const images = Array.from(container.querySelectorAll("img"));
    expect(images.length).toBe(4);
    for (const image of images) {
      expect(image.getAttribute("src")).toMatch(/assets%2Fprojects%2F(sm-design|kai-hikari)%2F(desktop|mobile)\.webp|\/assets\/projects\/(sm-design|kai-hikari)\/(desktop|mobile)\.webp/);
      expect(image.getAttribute("loading")).toBe("lazy");
    }
  });

  it("nenhum link sai do site (nada de site ao vivo, principalmente o do Kai Hikari)", () => {
    const { container } = render(<ProjectsTeaserSection />);
    const hrefs = Array.from(container.querySelectorAll("a")).map((link) => link.getAttribute("href") ?? "");
    expect(hrefs.every((href) => href.startsWith("/"))).toBe(true);
    expect(container.querySelector('a[href*="kaihikari"]')).toBeNull();
  });

  it("desmonta sem lançar erro", () => {
    const { unmount } = render(<ProjectsTeaserSection />);
    expect(() => unmount()).not.toThrow();
  });
});
