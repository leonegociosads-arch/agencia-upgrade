import { describe, expect, it } from "vitest";
import { getProgress } from "./getProgress";

describe("getProgress", () => {
  it("nenhuma resposta ainda: current 0, total estimado, 0%", () => {
    expect(getProgress("trafego", {})).toEqual({ current: 0, total: 4, percentage: 0 });
  });

  it("recalcula quando uma resposta muda o total estimado (Site: 'Ainda não sei' tem 2 passos, não 3)", () => {
    expect(getProgress("site", { site_tipo: "nao_sei" })).toEqual({ current: 1, total: 2, percentage: 50 });
  });

  it("100% quando o mini-fluxo está completo", () => {
    const answers = { trafego_negocio: "servicos", trafego_destino: "whatsapp", trafego_experiencia: "nunca_anunciei", trafego_investimento: "ate_1000" };
    expect(getProgress("trafego", answers)).toEqual({ current: 4, total: 4, percentage: 100 });
  });
});
