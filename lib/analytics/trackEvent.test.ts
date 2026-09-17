// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";

const ga4SendMock = vi.fn();
const metaPixelSendMock = vi.fn();
const internalSendMock = vi.fn();
vi.mock("./providers/ga4", () => ({ send: (...args: unknown[]) => ga4SendMock(...args) }));
vi.mock("./providers/metaPixel", () => ({ send: (...args: unknown[]) => metaPixelSendMock(...args) }));
vi.mock("./providers/internal", () => ({ send: (...args: unknown[]) => internalSendMock(...args) }));

import { getConsent, resetConsentForTests, setConsent } from "./consent";
import { clearStoredConsent } from "@/lib/privacy/consentStorage";
import { trackEvent, trackFunnelMilestone } from "./trackEvent";

afterEach(() => {
  resetConsentForTests();
  clearStoredConsent();
  ga4SendMock.mockReset();
  metaPixelSendMock.mockReset();
  internalSendMock.mockReset();
  localStorage.clear();
});

describe("trackEvent (Fase 17, revisado na Fase LGPD) — camada única de analytics", () => {
  it("por padrão (privacy by default, briefing Seção 70 — antes de qualquer decisão de consentimento): nenhum provider recebe o evento", () => {
    trackEvent("page_view", { path: "/" });
    expect(ga4SendMock).not.toHaveBeenCalled();
    expect(internalSendMock).not.toHaveBeenCalled();
    expect(metaPixelSendMock).not.toHaveBeenCalled();
  });

  it("com analytics aceito: GA4 e o provider interno recebem o evento, o Meta Pixel não", () => {
    setConsent({ analytics: true, marketing: false });
    trackEvent("page_view", { path: "/" });
    expect(ga4SendMock).toHaveBeenCalledWith("page_view", { path: "/" });
    expect(internalSendMock).toHaveBeenCalledWith(expect.any(String), "page_view", { path: "/" });
    expect(metaPixelSendMock).not.toHaveBeenCalled();
  });

  it("TESTE 16 — analytics recusado: GA4 (e o provider interno) não recebem o evento", () => {
    setConsent({ analytics: false, marketing: false });
    trackEvent("page_view", { path: "/" });
    expect(ga4SendMock).not.toHaveBeenCalled();
    expect(internalSendMock).not.toHaveBeenCalled();
  });

  it("TESTE 17 — marketing aceito: o Meta Pixel passa a receber o evento", () => {
    setConsent({ analytics: false, marketing: true });
    trackEvent("lead_submitted", { serviceCount: 1, idempotencyKey: "abc" });
    expect(metaPixelSendMock).toHaveBeenCalledWith("lead_submitted", { serviceCount: 1, idempotencyKey: "abc" });
  });

  it("TESTE 19 — um provider lançando (ex.: GA4 bloqueado por ad-blocker) não impede os outros nem propaga o erro", () => {
    setConsent({ analytics: true, marketing: false });
    ga4SendMock.mockImplementation(() => {
      throw new Error("bloqueado");
    });
    expect(() => trackEvent("page_view", { path: "/" })).not.toThrow();
    expect(internalSendMock).toHaveBeenCalled();
  });

  it("todos os eventos da mesma sessão compartilham o mesmo session_id enviado ao provider interno", () => {
    setConsent({ analytics: true, marketing: false });
    trackEvent("page_view", { path: "/" });
    trackEvent("page_view", { path: "/builder" });
    const [firstSessionId] = internalSendMock.mock.calls[0];
    const [secondSessionId] = internalSendMock.mock.calls[1];
    expect(secondSessionId).toBe(firstSessionId);
  });

  it("consentimento não é mutado por engano entre chamadas", () => {
    setConsent({ analytics: true, marketing: false });
    trackEvent("page_view", { path: "/" });
    expect(getConsent()).toEqual({ analytics: true, marketing: false });
  });

  describe("trackFunnelMilestone", () => {
    it("dispara na primeira vez que o marco é alcançado nesta sessão (com analytics aceito)", () => {
      setConsent({ analytics: true, marketing: false });
      trackFunnelMilestone("builder_started", {});
      expect(internalSendMock).toHaveBeenCalledWith(expect.any(String), "builder_started", {});
    });

    it("NÃO dispara de novo para o mesmo marco na mesma sessão (evita duplicar em refresh/remontagem)", () => {
      setConsent({ analytics: true, marketing: false });
      trackFunnelMilestone("builder_started", {});
      internalSendMock.mockClear();
      trackFunnelMilestone("builder_started", {});
      expect(internalSendMock).not.toHaveBeenCalled();
    });
  });
});
