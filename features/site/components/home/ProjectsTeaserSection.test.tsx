// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import ProjectsTeaserSection from "./ProjectsTeaserSection";

afterEach(cleanup);

describe("ProjectsTeaserSection (Fase ScrollTrigger e Storytelling)", () => {
  it("renderiza o teaser e o link para /projetos (motion reduzido, padrão do ambiente de teste)", () => {
    render(<ProjectsTeaserSection />);

    expect(screen.getByText("Projetos")).not.toBeNull();
    expect(screen.getByRole("link", { name: "Ver projetos" }).getAttribute("href")).toBe("/projetos");
  });

  it("desmonta sem lançar erro", () => {
    const { unmount } = render(<ProjectsTeaserSection />);
    expect(() => unmount()).not.toThrow();
  });
});
