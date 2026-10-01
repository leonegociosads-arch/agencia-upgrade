// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import HowItWorksSection from "./HowItWorksSection";

afterEach(cleanup);

describe("HowItWorksSection (Home como landing page)", () => {
  it("explica os 4 passos reais do fluxo, em ordem, dentro de uma lista ordenada", () => {
    render(<HowItWorksSection />);

    expect(screen.getByRole("heading", { name: "Como funciona" })).toBeTruthy();
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items).toHaveLength(4);
    expect(items[0].textContent).toContain("Escolha o que precisa");
    expect(items[1].textContent).toContain("Responda poucas perguntas");
    expect(items[2].textContent).toContain("Monte e revise o seu Upgrade");
    expect(items[3].textContent).toContain("Envie e receba o retorno");
  });

  it("a seção tem a âncora usada pelo menu (#como-funciona) e leva ao Builder", () => {
    const { container } = render(<HowItWorksSection />);

    expect(container.querySelector("#como-funciona")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Monte seu Upgrade" }).getAttribute("href")).toBe("/builder");
  });

  it("não promete prazo, preço nem garantia", () => {
    const { container } = render(<HowItWorksSection />);
    expect(container.textContent).not.toMatch(/horas|dias|garantia|R\$|grátis|gratuito/i);
  });

  it("desmonta sem lançar erro", () => {
    const { unmount } = render(<HowItWorksSection />);
    expect(() => unmount()).not.toThrow();
  });
});
