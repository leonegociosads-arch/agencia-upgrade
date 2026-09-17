import { describe, expect, it } from "vitest";
import { getExperienceQuestionPreview } from "./experienceQuestions";

describe("getExperienceQuestionPreview (Prova de Conceito — Builder)", () => {
  it("retorna a primeira pergunta real de Site, com suas opções aprovadas", () => {
    const preview = getExperienceQuestionPreview("site");
    expect(preview.title).toBe("Que tipo de site você precisa?");
    expect(preview.options.some((option) => option.id === "landing_page")).toBe(true);
    expect(preview.options.some((option) => option.id === "nao_sei")).toBe(true);
  });

  it("retorna a primeira pergunta real de Tráfego", () => {
    const preview = getExperienceQuestionPreview("trafego");
    expect(preview.title).toBe("O que você quer divulgar?");
    expect(preview.options.length).toBeGreaterThan(0);
  });

  it("retorna a primeira pergunta real de Design", () => {
    const preview = getExperienceQuestionPreview("design");
    expect(preview.title).toBe("O que sua marca precisa?");
    expect(preview.options.length).toBeGreaterThan(0);
  });
});
