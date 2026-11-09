import { describe, expect, it } from "vitest";
import { buildServiceSummary } from "./buildServiceSummary";
import { formatSummaryAnswer, getSummaryAnswerContext } from "./summaryAnswerContext";

const TRAFEGO_ANSWERS = {
  trafego_negocio: "negocio_local",
  trafego_destino: ["whatsapp"],
  trafego_experiencia: "nunca_anunciei",
  trafego_investimento: "de_1000_a_3000",
};

describe("summaryAnswerContext — o investimento em anúncios nunca aparece como preço da Upgrade", () => {
  it("a verba de Tráfego Pago ganha o rótulo 'Investimento mensal em anúncios'", () => {
    const summary = buildServiceSummary("trafego", TRAFEGO_ANSWERS);
    const investment = summary.find((item) => item.answer === "R$ 1.000 a R$ 3.000");
    expect(investment).toBeDefined();
    expect(formatSummaryAnswer("trafego", investment!)).toBe("Investimento mensal em anúncios: R$ 1.000 a R$ 3.000");
  });

  it("as outras respostas continuam só com o texto da opção", () => {
    const summary = buildServiceSummary("trafego", TRAFEGO_ANSWERS);
    const others = summary.filter((item) => item.answer !== "R$ 1.000 a R$ 3.000");
    expect(others.length).toBeGreaterThan(0);
    for (const item of others) {
      expect(getSummaryAnswerContext("trafego", item)).toBeNull();
      expect(formatSummaryAnswer("trafego", item)).toBe(item.answer);
    }
  });

  it("não altera os dados: o resumo base continua igual (mesma pergunta e mesma resposta)", () => {
    const summary = buildServiceSummary("trafego", TRAFEGO_ANSWERS);
    expect(summary.at(-1)).toEqual({ question: "Quanto pretende investir em anúncios por mês?", answer: "R$ 1.000 a R$ 3.000" });
  });
});
