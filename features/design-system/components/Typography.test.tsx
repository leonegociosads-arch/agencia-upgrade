// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import Heading from "./Heading";
import Text from "./Text";

afterEach(cleanup);

describe("Heading (Design System, Fase 18)", () => {
  it("usa a tag semântica correta por padrão para cada variante", () => {
    render(<Heading variant="h1">Título</Heading>);
    expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
  });

  it("'display' também renderiza como <h1> por padrão (é o maior título visual)", () => {
    render(<Heading variant="display">Chamada</Heading>);
    expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
  });

  it("'as' permite uma tag semântica diferente do padrão da variante", () => {
    render(
      <Heading variant="h3" as="h2">
        Subtítulo
      </Heading>,
    );
    expect(screen.getByRole("heading", { level: 2 })).toBeTruthy();
  });
});

describe("Text (Design System, Fase 18)", () => {
  it("renderiza como <p> por padrão", () => {
    render(<Text>Um parágrafo.</Text>);
    expect(screen.getByText("Um parágrafo.").tagName).toBe("P");
  });

  it("aceita 'as' para virar <span> (texto inline)", () => {
    render(<Text as="span">Inline</Text>);
    expect(screen.getByText("Inline").tagName).toBe("SPAN");
  });
});
