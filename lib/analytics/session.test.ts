// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import {
  ANALYTICS_SESSION_STORAGE_KEY,
  ANALYTICS_SESSION_TTL_MS,
  ANALYTICS_SESSION_VERSION,
  getOrCreateAnalyticsSession,
  markFunnelStepOnce,
  resetAnalyticsSession,
} from "./session";

function params(query = ""): URLSearchParams {
  return new URLSearchParams(query);
}

describe("Sessão de analytics (Fase 17)", () => {
  it("TESTE 9 — cria uma sessão na primeira chamada e a reutiliza nas seguintes (refresh não cria uma nova)", () => {
    const first = getOrCreateAnalyticsSession(params(), "/");
    const second = getOrCreateAnalyticsSession(params(), "/builder");
    expect(second.sessionId).toBe(first.sessionId);
  });

  it("TESTE 8 — o mesmo sessionId fica disponível em qualquer página (Home, Builder etc.)", () => {
    const home = getOrCreateAnalyticsSession(params(), "/");
    const builder = getOrCreateAnalyticsSession(params(), "/builder");
    expect(builder.sessionId).toBe(home.sessionId);
  });

  it("TESTE 10 — captura UTM de first-touch na criação da sessão", () => {
    const session = getOrCreateAnalyticsSession(
      params("utm_source=instagram&utm_medium=social&utm_campaign=upgrade"),
      "/builder",
    );
    expect(session.firstTouch).toMatchObject({
      utmSource: "instagram",
      utmMedium: "social",
      utmCampaign: "upgrade",
      origin: "utm",
      landingPath: "/builder",
    });
  });

  it("TESTE 11 — navegação interna (sem UTM na 2ª chamada) não substitui o first-touch já capturado", () => {
    getOrCreateAnalyticsSession(params("utm_source=instagram"), "/");
    const second = getOrCreateAnalyticsSession(params(), "/projetos");
    expect(second.firstTouch.utmSource).toBe("instagram");
    expect(second.firstTouch.landingPath).toBe("/"); // landing path original, não a página atual.
  });

  it("sem UTM e sem referrer: origem é 'direct'", () => {
    const session = getOrCreateAnalyticsSession(params(), "/");
    expect(session.firstTouch.origin).toBe("direct");
  });

  it("sessão expirada (fora do TTL) é descartada e uma nova é criada", () => {
    const oldUpdatedAt = new Date(Date.now() - ANALYTICS_SESSION_TTL_MS - 1000).toISOString();
    localStorage.setItem(
      ANALYTICS_SESSION_STORAGE_KEY,
      JSON.stringify({
        version: ANALYTICS_SESSION_VERSION,
        sessionId: "sessao-antiga",
        updatedAt: oldUpdatedAt,
        firstTouch: {
          utmSource: null,
          utmMedium: null,
          utmCampaign: null,
          utmContent: null,
          utmTerm: null,
          referrerHost: null,
          landingPath: "/",
          origin: "direct",
        },
        firedOnceEvents: [],
      }),
    );

    const session = getOrCreateAnalyticsSession(params(), "/");
    expect(session.sessionId).not.toBe("sessao-antiga");
  });

  it("markFunnelStepOnce retorna true só na primeira vez que um marco é alcançado nesta sessão", () => {
    const session = getOrCreateAnalyticsSession(params(), "/");
    expect(markFunnelStepOnce(session.sessionId, "builder_started")).toBe(true);
    expect(markFunnelStepOnce(session.sessionId, "builder_started")).toBe(false);
    // Um marco DIFERENTE continua liberado.
    expect(markFunnelStepOnce(session.sessionId, "contact_started")).toBe(true);
  });

  it("resetAnalyticsSession ('Começar de novo') gera um sessionId novo e recaptura o first-touch", () => {
    const first = getOrCreateAnalyticsSession(params("utm_source=instagram"), "/");
    const resetted = resetAnalyticsSession(params(), "/");
    expect(resetted.sessionId).not.toBe(first.sessionId);
    expect(resetted.firstTouch.utmSource).toBeNull();
  });
});
