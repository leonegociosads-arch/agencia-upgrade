import { describe, expect, it } from "vitest";
import { ANALYTICS_EVENT_NAMES, EVENT_PROPERTIES_SCHEMAS, isKnownEventName } from "./events";

const PII_KEY_PATTERN = /email|phone|telefone|whatsapp|nome|name|senha|password/i;

describe("Contrato de eventos de analytics (Fase 17)", () => {
  it("TESTE 13/14/15 — nenhum evento aceita chaves que pareçam dado pessoal (nome/e-mail/telefone)", () => {
    for (const [eventName, schema] of Object.entries(EVENT_PROPERTIES_SCHEMAS)) {
      const shape = "shape" in schema ? (schema as { shape: Record<string, unknown> }).shape : {};
      for (const key of Object.keys(shape)) {
        expect(PII_KEY_PATTERN.test(key), `evento "${eventName}" tem uma propriedade suspeita: "${key}"`).toBe(false);
      }
    }
  });

  it("cada schema rejeita uma chave extra não declarada (validação estrita)", () => {
    const result = EVENT_PROPERTIES_SCHEMAS.service_selected.safeParse({ serviceId: "site", email: "a@a.com" });
    expect(result.success).toBe(false);
  });

  it("rejeita um serviceId que não existe", () => {
    const result = EVENT_PROPERTIES_SCHEMAS.service_selected.safeParse({ serviceId: "video" });
    expect(result.success).toBe(false);
  });

  it("aceita as propriedades corretas de cada evento", () => {
    expect(EVENT_PROPERTIES_SCHEMAS.page_view.safeParse({ path: "/builder" }).success).toBe(true);
    expect(EVENT_PROPERTIES_SCHEMAS.builder_started.safeParse({}).success).toBe(true);
    expect(EVENT_PROPERTIES_SCHEMAS.service_completed.safeParse({ serviceId: "site", questionCount: 3 }).success).toBe(true);
    expect(
      EVENT_PROPERTIES_SCHEMAS.upgrade_reviewed.safeParse({ serviceCount: 2, serviceIds: ["site", "trafego"] }).success,
    ).toBe(true);
    expect(
      EVENT_PROPERTIES_SCHEMAS.lead_submitted.safeParse({ serviceCount: 1, idempotencyKey: "abc-123" }).success,
    ).toBe(true);
    expect(EVENT_PROPERTIES_SCHEMAS.lead_submit_failed.safeParse({ errorCategory: "validation" }).success).toBe(true);
  });

  it("isKnownEventName aceita só os 12 nomes declarados", () => {
    expect(isKnownEventName("page_view")).toBe(true);
    expect(isKnownEventName("evento_inventado")).toBe(false);
    expect(ANALYTICS_EVENT_NAMES).toHaveLength(12);
  });
});
