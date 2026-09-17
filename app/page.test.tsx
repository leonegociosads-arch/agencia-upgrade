// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Home from "./page";

afterEach(cleanup);

/**
 * Fase ScrollTrigger e Storytelling (Etapa 23) — a Home passou a compor 4 seções com motion de
 * scroll próprio (`features/site/components/home/`). Este teste garante que a composição inteira
 * (todos os hooks de motion juntos, `SiteHeader`/`SiteFooter` incluídos) monta e desmonta sem
 * lançar erro — o comportamento de cada seção isolada já é coberto pelos testes próprios delas.
 */
describe("Home (Fase ScrollTrigger e Storytelling)", () => {
  it("renderiza header, as 4 seções e o footer sem lançar erro", () => {
    const { unmount } = render(<Home />);

    expect(screen.getByText("Um upgrade real na presença digital da sua empresa.")).not.toBeNull();
    expect(screen.getByText("O que fazemos")).not.toBeNull();
    // "Projetos" aparece duas vezes (título da seção-teaser e link do rodapé) — mais específico
    // checar o heading da seção em vez do texto solto.
    expect(screen.getByRole("heading", { name: "Projetos" })).not.toBeNull();
    expect(screen.getByText("Pronto para dar o próximo passo?")).not.toBeNull();
    expect(() => unmount()).not.toThrow();
  });
});
