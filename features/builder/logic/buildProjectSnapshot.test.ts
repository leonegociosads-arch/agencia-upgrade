import { describe, expect, it } from "vitest";
import { buildProjectSnapshot } from "./buildProjectSnapshot";
import type { MyUpgrade, UpgradeItem } from "../types";

function item(serviceId: UpgradeItem["serviceId"], answers: UpgradeItem["answers"]): UpgradeItem {
  return { serviceId, answers, status: "complete", createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" };
}

describe("buildProjectSnapshot", () => {
  it("TESTE 11 (Etapa 11) — retorna apenas os serviços confirmados", () => {
    const confirmed: MyUpgrade = {
      site: item("site", { site_tipo: "nao_sei", site_situacao: "criar_do_zero" }),
    };
    const snapshot = buildProjectSnapshot(confirmed);
    expect(snapshot.services).toEqual([{ serviceId: "site", answers: { site_tipo: "nao_sei", site_situacao: "criar_do_zero" } }]);
  });

  it("TESTE 12 (Etapa 11) — não contém serviceDraft, editingService, estado de componente nem funções", () => {
    const confirmed: MyUpgrade = {
      trafego: item("trafego", {
        trafego_negocio: "servicos",
        trafego_destino: "whatsapp",
        trafego_experiencia: "nunca_anunciei",
        trafego_investimento: "ate_1000",
      }),
    };
    const snapshot = buildProjectSnapshot(confirmed);
    const keys = Object.keys(snapshot);
    expect(keys).toEqual(["services"]);
    for (const service of snapshot.services) {
      expect(Object.keys(service).sort()).toEqual(["answers", "serviceId"]);
      for (const value of Object.values(service.answers)) {
        expect(typeof value === "string" || Array.isArray(value)).toBe(true);
      }
    }
  });

  it("TESTE 13 (Etapa 11) — é serializável com JSON.stringify (sem lançar, sem perder dados)", () => {
    const confirmed: MyUpgrade = {
      design: item("design", { design_servico: ["identidade_visual", "design_redes_sociais"], design_formato: "pacote_artes" }),
    };
    const snapshot = buildProjectSnapshot(confirmed);
    const serialized = JSON.stringify(snapshot);
    expect(JSON.parse(serialized)).toEqual(snapshot);
  });

  it("a cópia das respostas é segura: alterar o snapshot depois de gerado não afeta o confirmado original", () => {
    const confirmed: MyUpgrade = {
      site: item("site", { site_tipo: "ecommerce", site_recursos: ["pagamento_online"] }),
    };
    const snapshot = buildProjectSnapshot(confirmed);
    (snapshot.services[0].answers.site_recursos as string[]).push("area_cliente");
    expect(confirmed.site?.answers.site_recursos).toEqual(["pagamento_online"]);
  });

  it("projeto vazio produz um snapshot com lista de serviços vazia", () => {
    expect(buildProjectSnapshot({})).toEqual({ services: [] });
  });
});
