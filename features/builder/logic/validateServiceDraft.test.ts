import { describe, expect, it } from "vitest";
import { validateServiceDraft } from "./validateServiceDraft";

describe("validateServiceDraft", () => {
  it("inválido quando o rascunho está vazio", () => {
    expect(validateServiceDraft("site", {}).valid).toBe(false);
  });

  it("inválido enquanto houver pergunta pendente", () => {
    const result = validateServiceDraft("site", { site_tipo: "ecommerce" });
    expect(result.valid).toBe(false);
    expect(result.nextQuestionId).toBe("site_recursos");
  });

  it("válido quando não há mais pergunta pendente", () => {
    const result = validateServiceDraft("site", {
      site_tipo: "nao_sei",
      site_situacao: "criar_do_zero",
    });
    expect(result.valid).toBe(true);
    expect(result.nextQuestionId).toBeNull();
  });
});
