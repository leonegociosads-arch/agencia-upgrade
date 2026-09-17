// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import LinkButton from "./LinkButton";

afterEach(cleanup);

describe("LinkButton (Design System, Fase 19)", () => {
  it("renderiza como link real, navegando para o href informado", () => {
    render(<LinkButton href="/builder">Monte seu Upgrade</LinkButton>);
    const link = screen.getByRole("link", { name: "Monte seu Upgrade" });
    expect(link.getAttribute("href")).toBe("/builder");
  });

  it("aceita variant/size sem quebrar", () => {
    render(
      <LinkButton href="/projetos" variant="ghost" size="lg">
        Ver projetos
      </LinkButton>,
    );
    expect(screen.getByRole("link", { name: "Ver projetos" })).toBeTruthy();
  });
});
