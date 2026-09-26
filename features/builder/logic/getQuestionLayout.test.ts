import { describe, expect, it } from "vitest";
import { getNextQuestion } from "./flow";
import { getQuestionLayout } from "./getQuestionLayout";
import type { BuilderAnswers, ServiceId } from "../types";

/** Layout da pergunta que o Builder mostraria agora, com estas respostas no rascunho. */
function layoutOfNext(serviceId: ServiceId, answers: BuilderAnswers) {
  const question = getNextQuestion(serviceId, answers);
  if (!question) throw new Error("fluxo já completo");
  return { id: question.id, layout: getQuestionLayout(question, answers) };
}

describe("getQuestionLayout", () => {
  it("Site: só a etapa 3 (site_recursos) usa o painel especial", () => {
    expect(layoutOfNext("site", {})).toEqual({ id: "site_tipo", layout: "default" });
    expect(layoutOfNext("site", { site_tipo: "ecommerce" })).toEqual({ id: "site_recursos", layout: "browser-panel" });
    expect(layoutOfNext("site", { site_tipo: "ecommerce", site_recursos: ["pagamento_online"] })).toEqual({
      id: "site_situacao",
      layout: "default",
    });
  });

  it("Site no ramo 'Ainda não sei': site_recursos nem aparece e a etapa 3 continua normal", () => {
    expect(layoutOfNext("site", { site_tipo: "nao_sei" })).toEqual({ id: "site_situacao", layout: "default" });
  });

  it("Tráfego Pago: só a etapa 4 (trafego_experiencia) usa o painel especial", () => {
    const layouts = [
      layoutOfNext("trafego", {}),
      layoutOfNext("trafego", { trafego_negocio: "servicos" }),
      layoutOfNext("trafego", { trafego_negocio: "servicos", trafego_destino: "whatsapp" }),
      layoutOfNext("trafego", { trafego_negocio: "servicos", trafego_destino: "whatsapp", trafego_experiencia: "nunca_anunciei" }),
    ];
    expect(layouts.map((entry) => entry.layout)).toEqual(["default", "default", "browser-panel", "default"]);
    expect(layouts[2].id).toBe("trafego_experiencia");
  });

  it.each([
    ["identidade_visual", "identidade_situacao"],
    ["design_redes_sociais", "design_formato"],
    ["gestao_social_media", "social_necessidade"],
    ["criativos_anuncios", "criativos_formato"],
    ["edicao_video", "video_material"],
  ])("Design (%s): a etapa 3 (%s) usa o painel especial", (servico, expectedId) => {
    expect(layoutOfNext("design", {})).toEqual({ id: "design_servico", layout: "default" });
    expect(layoutOfNext("design", { design_servico: servico })).toEqual({ id: expectedId, layout: "browser-panel" });
  });

  it("edição: reabrir a pergunta especial na revisão mantém o painel, mesmo com as seguintes já respondidas", () => {
    const reopened = { trafego_negocio: "servicos", trafego_destino: "whatsapp", trafego_investimento: "ate_1000" };
    expect(layoutOfNext("trafego", reopened)).toEqual({ id: "trafego_experiencia", layout: "browser-panel" });
  });

  it("Design, pacote: a mesma pergunta mais adiante no fluxo continua com o layout normal", () => {
    const pacote = ["design_redes_sociais", "gestao_social_media"];
    expect(layoutOfNext("design", { design_servico: pacote })).toEqual({ id: "design_formato", layout: "browser-panel" });
    // design_formato → marca_identidade → social_necessidade (agora a 4ª pergunta, não a 2ª).
    expect(
      layoutOfNext("design", { design_servico: pacote, design_formato: "pacote_artes", marca_identidade: "sim" }),
    ).toEqual({ id: "social_necessidade", layout: "default" });
  });
});
