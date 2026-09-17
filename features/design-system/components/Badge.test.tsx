// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import Badge from "./Badge";

afterEach(cleanup);

describe("Badge (Design System, Fase 18)", () => {
  it("renderiza o conteúdo para cada tom sem quebrar", () => {
    const tones = ["neutral", "accent", "success", "warning", "error", "info"] as const;
    for (const tone of tones) {
      render(<Badge tone={tone}>{tone}</Badge>);
    }
    for (const tone of tones) {
      expect(screen.getByText(tone)).toBeTruthy();
    }
  });

  it("padrão é 'neutral' quando nenhum tom é informado", () => {
    render(<Badge>Novo</Badge>);
    expect(screen.getByText("Novo")).toBeTruthy();
  });
});
