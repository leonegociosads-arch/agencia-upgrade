import { describe, expect, it } from "vitest";
import { buildLeadPayload } from "./buildLeadPayload";
import { buildProjectSnapshot } from "../../builder/logic/buildProjectSnapshot";
import type { LeadContactData } from "../types";
import type { MyUpgrade, UpgradeItem } from "../../builder/types";

function item(serviceId: UpgradeItem["serviceId"], answers: UpgradeItem["answers"]): UpgradeItem {
  return { serviceId, answers, status: "complete", createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" };
}

const contact: LeadContactData = {
  name: "João Silva",
  company: "ABC Móveis",
  whatsapp: "5513999999999",
  email: "joao@teste.com",
  websiteOrInstagram: "@abcmoveis",
};

describe("buildLeadPayload", () => {
  it("TESTE 11 (Etapa 12) — inclui contact e project", () => {
    const confirmed: MyUpgrade = { site: item("site", { site_tipo: "nao_sei", site_situacao: "criar_do_zero" }) };
    const payload = buildLeadPayload(contact, buildProjectSnapshot(confirmed), "idem-key-1");
    expect(payload.contact).toEqual(contact);
    expect(payload.project.services).toHaveLength(1);
    expect(payload.project.services[0].serviceId).toBe("site");
  });

  it("TESTE 12 — o payload não contém serviceDraft nem qualquer campo fora de contact/project/meta", () => {
    const confirmed: MyUpgrade = { site: item("site", { site_tipo: "nao_sei", site_situacao: "criar_do_zero" }) };
    const payload = buildLeadPayload(contact, buildProjectSnapshot(confirmed), "idem-key-1");
    expect(Object.keys(payload).sort()).toEqual(["contact", "meta", "project"]);
    expect("serviceDraft" in payload).toBe(false);
  });

  it("TESTE 13 — o payload não contém editingService nem nenhum campo de estado de UI", () => {
    const confirmed: MyUpgrade = { site: item("site", { site_tipo: "nao_sei", site_situacao: "criar_do_zero" }) };
    const payload = buildLeadPayload(contact, buildProjectSnapshot(confirmed), "idem-key-1");
    expect("editingService" in payload).toBe(false);
    expect("activeService" in payload).toBe(false);
    expect("step" in payload).toBe(false);
  });

  it("TESTE 14 — o payload é serializável com JSON.stringify", () => {
    const confirmed: MyUpgrade = {
      site: item("site", { site_tipo: "ecommerce", site_recursos: ["pagamento_online"] }),
      trafego: item("trafego", { trafego_negocio: "servicos", trafego_investimento: "ate_1000" }),
    };
    const payload = buildLeadPayload(contact, buildProjectSnapshot(confirmed), "idem-key-1");
    const serialized = JSON.stringify(payload);
    expect(JSON.parse(serialized)).toEqual(payload);
  });

  it("TESTE 15 — Site + Tráfego confirmados: o payload contém ambos", () => {
    const confirmed: MyUpgrade = {
      site: item("site", { site_tipo: "nao_sei", site_situacao: "criar_do_zero" }),
      trafego: item("trafego", {
        trafego_negocio: "servicos",
        trafego_destino: "whatsapp",
        trafego_experiencia: "nunca_anunciei",
        trafego_investimento: "ate_1000",
      }),
    };
    const payload = buildLeadPayload(contact, buildProjectSnapshot(confirmed), "idem-key-1");
    expect(payload.project.services.map((s) => s.serviceId)).toEqual(["site", "trafego"]);
  });

  it("meta.createdAt é uma data ISO válida, gerada no momento da construção do payload", () => {
    const before = Date.now();
    const payload = buildLeadPayload(contact, buildProjectSnapshot({}), "idem-key-1");
    const parsed = Date.parse(payload.meta.createdAt);
    expect(parsed).toBeGreaterThanOrEqual(before);
    expect(Object.keys(payload.meta).sort()).toEqual(["createdAt", "idempotencyKey"]);
  });

  it("TESTE 16 (Fase 13) — meta.idempotencyKey é exatamente o valor recebido, sem gerar um novo", () => {
    const payload = buildLeadPayload(contact, buildProjectSnapshot({}), "chave-fixa-123");
    expect(payload.meta.idempotencyKey).toBe("chave-fixa-123");
  });

  it("nunca mistura um campo pessoal dentro de project, nem uma resposta de serviço dentro de contact", () => {
    const confirmed: MyUpgrade = { site: item("site", { site_tipo: "ecommerce" }) };
    const payload = buildLeadPayload(contact, buildProjectSnapshot(confirmed), "idem-key-1");
    expect(payload.project.services[0]).not.toHaveProperty("name");
    expect(payload.project.services[0]).not.toHaveProperty("email");
    expect(payload.contact).not.toHaveProperty("site_tipo");
    expect(payload.contact).not.toHaveProperty("answers");
  });
});
