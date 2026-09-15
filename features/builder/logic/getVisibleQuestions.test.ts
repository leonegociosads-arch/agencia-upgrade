import { describe, expect, it } from "vitest";
import { getVisibleQuestions } from "./getVisibleQuestions";

describe("getVisibleQuestions (Etapa 9)", () => {
  it("TESTE 1 — pergunta condicional visível quando a resposta determinante habilita ela (identidade_escopo para Identidade Visual)", () => {
    const ids = getVisibleQuestions("design", { design_servico: "identidade_visual" }).map((q) => q.id);
    expect(ids).toContain("identidade_escopo");
  });

  it("TESTE 2 — a mesma pergunta fica invisível quando a resposta determinante é outra (Criativos para Anúncios)", () => {
    const ids = getVisibleQuestions("design", { design_servico: "criativos_anuncios" }).map((q) => q.id);
    expect(ids).not.toContain("identidade_escopo");
    expect(ids).toContain("criativos_formato");
  });

  it("TESTE 3 — condição em cadeia: trocar o serviço combinado recalcula todas as perguntas dependentes de uma vez", () => {
    const comSocial = getVisibleQuestions("design", {
      design_servico: ["design_redes_sociais", "gestao_social_media"],
    }).map((q) => q.id);
    expect(comSocial).toEqual(expect.arrayContaining(["design_formato", "marca_identidade", "social_necessidade"]));

    const semSocial = getVisibleQuestions("design", { design_servico: ["identidade_visual"] }).map((q) => q.id);
    expect(semSocial).not.toContain("design_formato");
    expect(semSocial).not.toContain("marca_identidade");
    expect(semSocial).not.toContain("social_necessidade");
    expect(semSocial).toEqual(expect.arrayContaining(["identidade_situacao", "identidade_escopo"]));
  });

  it("preserva a ordem declarada das perguntas (Site, e-commerce)", () => {
    const ids = getVisibleQuestions("site", { site_tipo: "ecommerce" }).map((q) => q.id);
    expect(ids).toEqual(["site_tipo", "site_recursos", "site_situacao"]);
  });

  it("Site: site_recursos some da lista visível quando site_tipo = 'Ainda não sei' (não existe pergunta técnica extra)", () => {
    const ids = getVisibleQuestions("site", { site_tipo: "nao_sei" }).map((q) => q.id);
    expect(ids).toEqual(["site_tipo", "site_situacao"]);
  });

  it("Tráfego Pago: as 4 perguntas fixas estão sempre todas visíveis, sem depender de resposta alguma", () => {
    const ids = getVisibleQuestions("trafego", {}).map((q) => q.id);
    expect(ids).toEqual(["trafego_negocio", "trafego_destino", "trafego_experiencia", "trafego_investimento"]);
  });
});
