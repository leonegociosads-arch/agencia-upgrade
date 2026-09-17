import { beforeEach, describe, expect, it, vi } from "vitest";

const insertAnalyticsEventMock = vi.fn();
vi.mock("@/lib/repositories/analyticsEvents", () => ({
  insertAnalyticsEvent: (...args: unknown[]) => insertAnalyticsEventMock(...args),
}));

import { recordEvent } from "./recordEvent";
import { resetRateLimitForTests } from "@/lib/security/rateLimit";

beforeEach(() => {
  insertAnalyticsEventMock.mockReset();
  insertAnalyticsEventMock.mockResolvedValue({ ok: true });
  resetRateLimitForTests();
});

describe("recordEvent (Server Action, Fase 17)", () => {
  it("evento válido é gravado com a categoria correta", async () => {
    await recordEvent("session-1", "service_selected", { serviceId: "site" });
    expect(insertAnalyticsEventMock).toHaveBeenCalledWith({
      sessionId: "session-1",
      eventName: "service_selected",
      eventCategory: "funnel",
      properties: { serviceId: "site" },
    });
  });

  it("sessionId vazio é rejeitado, nada é gravado", async () => {
    await recordEvent("", "page_view", { path: "/" });
    expect(insertAnalyticsEventMock).not.toHaveBeenCalled();
  });

  it("nome de evento desconhecido é rejeitado, nada é gravado", async () => {
    await recordEvent("session-1", "evento_que_nao_existe", {});
    expect(insertAnalyticsEventMock).not.toHaveBeenCalled();
  });

  it("TESTE (validação server-side) — propriedades fora do formato do evento são rejeitadas", async () => {
    await recordEvent("session-1", "service_selected", { serviceId: "servico_invalido" });
    expect(insertAnalyticsEventMock).not.toHaveBeenCalled();
  });

  it("TESTE 13/14/15 (PII) — uma tentativa de anexar um campo extra (ex.: email) é rejeitada inteira, nunca gravada parcialmente", async () => {
    await recordEvent("session-1", "service_selected", { serviceId: "site", email: "a@a.com" });
    expect(insertAnalyticsEventMock).not.toHaveBeenCalled();
  });

  it("nunca lança, mesmo se insertAnalyticsEvent lançar de forma inesperada", async () => {
    insertAnalyticsEventMock.mockRejectedValue(new Error("falha inesperada"));
    await expect(recordEvent("session-1", "page_view", { path: "/" })).resolves.toBeUndefined();
  });

  it("TESTE (Etapa 29, Seção 33/44 — rate limit) — o 61º evento em 5 minutos da mesma sessão é descartado", async () => {
    for (let i = 0; i < 60; i += 1) {
      await recordEvent("session-rate-limit", "page_view", { path: "/" });
    }
    expect(insertAnalyticsEventMock).toHaveBeenCalledTimes(60);

    await recordEvent("session-rate-limit", "page_view", { path: "/" });
    expect(insertAnalyticsEventMock).toHaveBeenCalledTimes(60);
  });

  it("TESTE (Etapa 29 — rate limit) — o limite é por sessão, não global", async () => {
    for (let i = 0; i < 60; i += 1) {
      await recordEvent("session-a", "page_view", { path: "/" });
    }
    await recordEvent("session-b", "page_view", { path: "/" });
    expect(insertAnalyticsEventMock).toHaveBeenCalledTimes(61);
  });
});
