// @vitest-environment jsdom
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import SectionContainer from "./SectionContainer";

afterEach(cleanup);

describe("SectionContainer (Design System, Fase 18)", () => {
  it("renderiza como <section> por padrão", () => {
    render(<SectionContainer>Conteúdo</SectionContainer>);
    const section = screen.getByText("Conteúdo");
    expect(section.tagName).toBe("SECTION");
  });

  it("aceita 'as' para trocar a tag semântica", () => {
    render(<SectionContainer as="header">Topo</SectionContainer>);
    expect(screen.getByText("Topo").tagName).toBe("HEADER");
  });

  it("encaminha 'ref' para o elemento real (Fase ScrollTrigger e Storytelling — motion de scroll precisa medir a seção)", () => {
    const ref = createRef<HTMLElement>();
    render(<SectionContainer ref={ref}>Conteúdo</SectionContainer>);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe("SECTION");
  });
});
