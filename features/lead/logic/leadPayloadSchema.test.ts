import { describe, expect, it } from "vitest";
import { leadPayloadSchema } from "./leadPayloadSchema";

type AnyAnswers = Record<string, string | string[]>;

function validPayload() {
  return {
    contact: {
      name: "João Silva",
      company: "ABC Móveis",
      whatsapp: "5513999999999",
      email: "joao@teste.com",
      websiteOrInstagram: "@abcmoveis",
    },
    project: {
      services: [{ serviceId: "site" as string, answers: { site_tipo: "nao_sei" } as AnyAnswers }],
    },
    meta: { createdAt: new Date().toISOString(), idempotencyKey: "chave-1" },
  };
}

describe("leadPayloadSchema (Fase 13 — segunda camada de validação, no servidor)", () => {
  it("TESTE 1 — aceita um payload válido tal como o cliente produz", () => {
    expect(leadPayloadSchema.safeParse(validPayload()).success).toBe(true);
  });

  it("TESTE 2 — aceita sem websiteOrInstagram (campo opcional)", () => {
    const payload = validPayload();
    delete (payload.contact as Record<string, unknown>).websiteOrInstagram;
    expect(leadPayloadSchema.safeParse(payload).success).toBe(true);
  });

  it("TESTE 3 — rejeita whatsapp fora do formato normalizado (ex.: ainda com parênteses)", () => {
    const payload = validPayload();
    payload.contact.whatsapp = "(13) 99999-9999";
    expect(leadPayloadSchema.safeParse(payload).success).toBe(false);
  });

  it("TESTE 4 — rejeita e-mail inválido", () => {
    const payload = validPayload();
    payload.contact.email = "nao-e-email";
    expect(leadPayloadSchema.safeParse(payload).success).toBe(false);
  });

  it("TESTE 5 — rejeita projeto sem nenhum serviço", () => {
    const payload = validPayload();
    payload.project.services = [];
    expect(leadPayloadSchema.safeParse(payload).success).toBe(false);
  });

  it("TESTE 6 — rejeita serviceId desconhecido (não é site/trafego/design)", () => {
    const payload = validPayload();
    payload.project.services[0].serviceId = "algo_invalido"; // valor inválido de propósito
    expect(leadPayloadSchema.safeParse(payload).success).toBe(false);
  });

  it("TESTE 7 — rejeita meta.createdAt que não é uma data ISO", () => {
    const payload = validPayload();
    payload.meta.createdAt = "ontem";
    expect(leadPayloadSchema.safeParse(payload).success).toBe(false);
  });

  it("TESTE 8 — rejeita meta.idempotencyKey vazio", () => {
    const payload = validPayload();
    payload.meta.idempotencyKey = "";
    expect(leadPayloadSchema.safeParse(payload).success).toBe(false);
  });

  it("TESTE (Etapa 29, Seção 20/41) — rejeita excesso de serviços (payload artificialmente grande)", () => {
    const payload = validPayload();
    payload.project.services = Array.from({ length: 11 }, () => ({ serviceId: "site" as const, answers: { site_tipo: "nao_sei" } }));
    expect(leadPayloadSchema.safeParse(payload).success).toBe(false);
  });

  it("TESTE (Etapa 29) — rejeita excesso de respostas dentro de um único serviço", () => {
    const payload = validPayload();
    const answers: Record<string, string> = {};
    for (let i = 0; i < 51; i += 1) answers[`pergunta_${i}`] = "valor";
    payload.project.services[0].answers = answers;
    expect(leadPayloadSchema.safeParse(payload).success).toBe(false);
  });

  it("TESTE (Etapa 29) — rejeita um valor de resposta absurdamente longo (texto livre não é esperado)", () => {
    const payload = validPayload();
    payload.project.services[0].answers = { site_tipo: "x".repeat(500) };
    expect(leadPayloadSchema.safeParse(payload).success).toBe(false);
  });

  it("TESTE (Etapa 29) — rejeita um array de resposta com itens demais (múltipla escolha real nunca tem tantas opções)", () => {
    const payload = validPayload();
    payload.project.services[0].answers = { site_recursos: Array.from({ length: 25 }, (_, i) => `opcao_${i}`) };
    expect(leadPayloadSchema.safeParse(payload).success).toBe(false);
  });

  it("TESTE (Etapa 29) — aceita respostas dentro dos limites normais (multi_choice com poucas opções)", () => {
    const payload = validPayload();
    payload.project.services[0].answers = { site_recursos: ["blog", "loja", "agenda"] };
    expect(leadPayloadSchema.safeParse(payload).success).toBe(true);
  });
});
