// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import Spinner from "./Spinner";

afterEach(cleanup);

describe("Spinner (Design System, Fase 18)", () => {
  it("por padrão, anuncia a si mesmo (role=status + rótulo)", () => {
    render(<Spinner />);
    expect(screen.getByRole("status", { name: "Carregando" })).toBeTruthy();
  });

  it("decorative: fica oculto para leitores de tela (outro elemento já anuncia o estado)", () => {
    render(<Spinner decorative />);
    expect(screen.queryByRole("status")).toBeNull();
  });
});
