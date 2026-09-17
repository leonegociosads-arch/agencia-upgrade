import { describe, expect, it } from "vitest";
import { buildProjectSummary } from "./buildProjectSummary";
import type { MyUpgrade, UpgradeItem } from "../types";

function item(serviceId: UpgradeItem["serviceId"], answers: UpgradeItem["answers"]): UpgradeItem {
  return { serviceId, answers, status: "complete", createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" };
}

describe("buildProjectSummary", () => {
  it("TESTE 1 (Etapa 11) — Site confirmado: o resumo exibe os dados corretos", () => {
    const confirmed: MyUpgrade = {
      site: item("site", { site_tipo: "site_institucional", site_recursos: ["formularios_leads"], site_situacao: "criar_do_zero" }),
    };
    const summary = buildProjectSummary(confirmed);
    expect(summary).toHaveLength(1);
    expect(summary[0].serviceId).toBe("site");
    expect(summary[0].title).toBe("Criar um site");
    expect(summary[0].items.map((i) => i.answer)).toContain("Site Institucional");
  });

  it("TESTE 2 (Etapa 11) — Site + Tráfego: ambos aparecem", () => {
    const confirmed: MyUpgrade = {
      site: item("site", { site_tipo: "nao_sei", site_situacao: "criar_do_zero" }),
      trafego: item("trafego", {
        trafego_negocio: "servicos",
        trafego_destino: "whatsapp",
        trafego_experiencia: "nunca_anunciei",
        trafego_investimento: "ate_1000",
      }),
    };
    const summary = buildProjectSummary(confirmed);
    expect(summary.map((s) => s.serviceId)).toEqual(["site", "trafego"]);
  });

  it("TESTE 3 (Etapa 11) — Site + Tráfego + Design/Social: todos aparecem", () => {
    const confirmed: MyUpgrade = {
      site: item("site", { site_tipo: "nao_sei", site_situacao: "criar_do_zero" }),
      trafego: item("trafego", {
        trafego_negocio: "servicos",
        trafego_destino: "whatsapp",
        trafego_experiencia: "nunca_anunciei",
        trafego_investimento: "ate_1000",
      }),
      design: item("design", {
        design_servico: "identidade_visual",
        identidade_situacao: "sem_identidade",
        identidade_escopo: "identidade_essencial",
      }),
    };
    const summary = buildProjectSummary(confirmed);
    expect(summary.map((s) => s.serviceId)).toEqual(["site", "trafego", "design"]);
    expect(summary.every((s) => s.items.length > 0)).toBe(true);
  });

  it("preserva a ordem de inserção (a ordem em que os serviços foram adicionados ao Meu Upgrade)", () => {
    // Monta na ordem trafego -> site, propositalmente diferente da ordem "natural" das categorias.
    const confirmed: MyUpgrade = {};
    confirmed.trafego = item("trafego", {
      trafego_negocio: "servicos",
      trafego_destino: "whatsapp",
      trafego_experiencia: "nunca_anunciei",
      trafego_investimento: "ate_1000",
    });
    confirmed.site = item("site", { site_tipo: "nao_sei", site_situacao: "criar_do_zero" });
    const summary = buildProjectSummary(confirmed);
    expect(summary.map((s) => s.serviceId)).toEqual(["trafego", "site"]);
  });

  it("projeto vazio produz uma lista vazia", () => {
    expect(buildProjectSummary({})).toEqual([]);
  });
});
