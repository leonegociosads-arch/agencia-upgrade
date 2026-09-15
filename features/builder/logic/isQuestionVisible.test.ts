import { describe, expect, it } from "vitest";
import { isQuestionVisible } from "./isQuestionVisible";
import { getServiceQuestions } from "../data/questionsByService";

describe("isQuestionVisible", () => {
  it("uma pergunta sem condição é sempre visível", () => {
    const [siteTipo] = getServiceQuestions("site");
    expect(isQuestionVisible(siteTipo, {})).toBe(true);
  });

  it("pergunta condicional oculta quando a condição não é satisfeita", () => {
    const siteRecursos = getServiceQuestions("site").find((q) => q.id === "site_recursos")!;
    expect(isQuestionVisible(siteRecursos, { site_tipo: "nao_sei" })).toBe(false);
    expect(isQuestionVisible(siteRecursos, {})).toBe(false);
  });

  it("pergunta condicional visível quando a condição é satisfeita", () => {
    const siteRecursos = getServiceQuestions("site").find((q) => q.id === "site_recursos")!;
    expect(isQuestionVisible(siteRecursos, { site_tipo: "ecommerce" })).toBe(true);
  });

  it("pergunta específica de Design só é visível quando o serviço correspondente foi escolhido", () => {
    const identidadeSituacao = getServiceQuestions("design").find((q) => q.id === "identidade_situacao")!;
    expect(isQuestionVisible(identidadeSituacao, { design_servico: "criativos_anuncios" })).toBe(false);
    expect(isQuestionVisible(identidadeSituacao, { design_servico: "identidade_visual" })).toBe(true);
  });
});
