import { describe, expect, it, vi, beforeEach } from "vitest";

const createLeadMock = vi.fn();
vi.mock("@/lib/repositories/leads", () => ({
  createLead: (...args: unknown[]) => createLeadMock(...args),
}));

vi.mock("@/lib/security/getClientIp", () => ({
  getClientIp: () => Promise.resolve("203.0.113.1"),
}));

import { submitLead } from "./submitLead";
import { calculateLeadScore } from "../logic/calculateLeadScore";
import { resetRateLimitForTests } from "@/lib/security/rateLimit";
import type { LeadPayload } from "../types";

function validPayload(): LeadPayload {
  return {
    contact: {
      name: "João Silva",
      company: "ABC Móveis",
      whatsapp: "5513999999999",
      email: "joao@teste.com",
      websiteOrInstagram: "@abcmoveis",
    },
    project: { services: [{ serviceId: "site", answers: { site_tipo: "nao_sei" } }] },
    meta: { createdAt: new Date().toISOString(), idempotencyKey: "chave-1" },
  };
}

describe("submitLead (Server Action, Fase 13)", () => {
  beforeEach(() => {
    createLeadMock.mockReset();
    resetRateLimitForTests();
  });

  it("TESTE 1 — payload válido é repassado para createLead e o resultado é devolvido", async () => {
    createLeadMock.mockResolvedValue({ ok: true });
    const result = await submitLead(validPayload());
    expect(result).toEqual({ ok: true });
    expect(createLeadMock).toHaveBeenCalledTimes(1);
  });

  it("TESTE 2 — payload malformado (ex.: sem serviços) é rejeitado antes de chegar em createLead", async () => {
    const payload = validPayload();
    payload.project.services = [];
    const result = await submitLead(payload);
    expect(result.ok).toBe(false);
    expect(result.message).toBe("Não conseguimos enviar agora. Seus dados continuam preenchidos.");
    expect(createLeadMock).not.toHaveBeenCalled();
  });

  it("TESTE 3 — whatsapp fora do formato normalizado é rejeitado (nunca confia no formato vindo do cliente)", async () => {
    const payload = validPayload();
    payload.contact.whatsapp = "(13) 99999-9999";
    const result = await submitLead(payload);
    expect(result.ok).toBe(false);
    expect(createLeadMock).not.toHaveBeenCalled();
  });

  it("TESTE 4 — propaga a falha de createLead (ex.: erro do Supabase) sem esconder o resultado", async () => {
    createLeadMock.mockResolvedValue({ ok: false, message: "Não conseguimos enviar agora. Seus dados continuam preenchidos." });
    const result = await submitLead(validPayload());
    expect(result).toEqual({
      ok: false,
      message: "Não conseguimos enviar agora. Seus dados continuam preenchidos.",
      errorCategory: "persistence",
    });
  });

  it("TESTE 22 (Fase 17) — falha de validação é categorizada como 'validation' (nunca a mensagem crua vira categoria)", async () => {
    const payload = validPayload();
    payload.project.services = [];
    const result = await submitLead(payload);
    expect(result.errorCategory).toBe("validation");
  });

  it("TESTE 5 (Fase 15) — o Lead Score é calculado no servidor e passado para createLead, com o formato correto", async () => {
    createLeadMock.mockResolvedValue({ ok: true });
    const payload = validPayload();
    await submitLead(payload);

    expect(createLeadMock).toHaveBeenCalledTimes(1);
    const [, leadScore] = createLeadMock.mock.calls[0];
    const expected = calculateLeadScore(payload.project);
    expect(leadScore).toEqual(expected);
  });

  it("TESTE 21 (Fase 15, segurança) — score/tier/breakdown enviados pelo cliente são ignorados; o servidor recalcula", async () => {
    createLeadMock.mockResolvedValue({ ok: true });
    const payload = validPayload();
    // Simula um cliente malicioso injetando campos que não existem no tipo LeadPayload.
    const tampered = { ...payload, lead_score: 999, lead_score_tier: "PRIORITY", lead_score_breakdown: [] } as unknown as LeadPayload;

    await submitLead(tampered);

    const [, leadScore] = createLeadMock.mock.calls[0];
    const expected = calculateLeadScore(payload.project);
    expect(leadScore.score).toBe(expected.score);
    expect(leadScore.score).not.toBe(999);
    expect(leadScore.tier).not.toBe("PRIORITY");
  });

  it("TESTE (Etapa 29, Seção 38 — honeypot) — campo-armadilha preenchido é rejeitado sem tocar createLead", async () => {
    const result = await submitLead(validPayload(), "um bot preencheu isto");
    expect(result.ok).toBe(false);
    expect(createLeadMock).not.toHaveBeenCalled();
  });

  it("TESTE (Etapa 29, Seção 38 — honeypot) — honeypot vazio/ausente não afeta o envio normal", async () => {
    createLeadMock.mockResolvedValue({ ok: true });
    const result = await submitLead(validPayload(), "");
    expect(result).toEqual({ ok: true });
  });

  it("TESTE (Etapa 29, Seção 34 — rate limit) — a 6ª tentativa em 10 minutos do mesmo IP é bloqueada", async () => {
    createLeadMock.mockResolvedValue({ ok: true });
    for (let i = 0; i < 5; i += 1) {
      const result = await submitLead({ ...validPayload(), meta: { createdAt: new Date().toISOString(), idempotencyKey: `chave-${i}` } });
      expect(result.ok).toBe(true);
    }
    const sixth = await submitLead({ ...validPayload(), meta: { createdAt: new Date().toISOString(), idempotencyKey: "chave-6" } });
    expect(sixth.ok).toBe(false);
    expect(createLeadMock).toHaveBeenCalledTimes(5);
  });
});
