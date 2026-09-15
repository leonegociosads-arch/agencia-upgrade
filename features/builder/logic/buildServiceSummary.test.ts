import { describe, expect, it } from "vitest";
import { buildServiceSummary } from "./buildServiceSummary";

describe("buildServiceSummary", () => {
  it("resumo de um serviço (Site) traduz ids em labels legíveis", () => {
    const summary = buildServiceSummary("site", {
      site_tipo: "ecommerce",
      site_recursos: ["pagamento_online", "area_cliente"],
      site_situacao: "criar_do_zero",
    });
    expect(summary).toEqual([
      { question: "Que tipo de site você precisa?", answer: "Loja Virtual / E-commerce" },
      { question: "O que esse projeto precisa ter?", answer: "Pagamento online, Área do cliente" },
      { question: "Em que situação está esse projeto?", answer: "Vou criar do zero" },
    ]);
  });

  it("resumo de Tráfego Pago inclui a pergunta de investimento", () => {
    const summary = buildServiceSummary("trafego", {
      trafego_negocio: "ecommerce",
      trafego_destino: "loja_virtual",
      trafego_experiencia: "nunca_anunciei",
      trafego_investimento: "acima_5000",
    });
    expect(summary.map((item) => item.question)).toContain("Quanto pretende investir em anúncios por mês?");
    expect(summary.find((item) => item.question === "Quanto pretende investir em anúncios por mês?")?.answer).toBe(
      "Acima de R$ 5.000",
    );
  });

  it("resumo de uma combinação de Design lista os serviços escolhidos e as respostas de cada um", () => {
    const summary = buildServiceSummary("design", {
      design_servico: ["design_redes_sociais", "gestao_social_media"],
      design_formato: "pacote_artes",
      marca_identidade: "sim",
      social_necessidade: "gestao_completa",
    });
    expect(summary[0]).toEqual({
      question: "O que sua marca precisa?",
      answer: "Design para Redes Sociais, Gestão de Social Media",
    });
    expect(summary).toHaveLength(4);
  });

  it("não inclui perguntas sem resposta", () => {
    const summary = buildServiceSummary("site", { site_tipo: "nao_sei" });
    expect(summary).toEqual([{ question: "Que tipo de site você precisa?", answer: "Ainda não sei" }]);
  });
});
