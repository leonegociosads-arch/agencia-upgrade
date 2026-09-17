// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { CONSENT_CHANGE_EVENT, getConsent, hasStoredConsentDecision, resetConsentForTests, setConsent, withdrawConsent } from "./consent";
import { clearStoredConsent } from "@/lib/privacy/consentStorage";

afterEach(() => {
  resetConsentForTests();
  clearStoredConsent();
});

describe("Consentimento (Fase 17, revisado na Fase LGPD)", () => {
  it("padrão: as duas categorias começam desligadas (privacy by default, briefing Seção 70)", () => {
    expect(getConsent()).toEqual({ analytics: false, marketing: false });
  });

  it("sem decisão salva, hasStoredConsentDecision é false — o banner deve aparecer", () => {
    expect(hasStoredConsentDecision()).toBe(false);
  });

  it("setConsent grava a decisão completa e passa a reportar hasStoredConsentDecision true", () => {
    setConsent({ analytics: true, marketing: true });
    expect(getConsent()).toEqual({ analytics: true, marketing: true });
    expect(hasStoredConsentDecision()).toBe(true);
  });

  it("getConsent devolve uma referência ESTÁVEL entre chamadas sem mudança (useSyncExternalStore)", () => {
    setConsent({ analytics: true, marketing: false });
    const first = getConsent();
    const second = getConsent();
    expect(first).toBe(second);
  });

  it("dispara CONSENT_CHANGE_EVENT quando a decisão muda", () => {
    const handler = vi.fn();
    window.addEventListener(CONSENT_CHANGE_EVENT, handler);
    setConsent({ analytics: true, marketing: false });
    window.removeEventListener(CONSENT_CHANGE_EVENT, handler);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("persiste a decisão no localStorage — uma nova 'sessão' do módulo lê a mesma preferência", () => {
    setConsent({ analytics: true, marketing: false });
    resetConsentForTests(); // simula recarregar a página (estado do módulo perdido, storage não)
    expect(getConsent()).toEqual({ analytics: true, marketing: false });
    expect(hasStoredConsentDecision()).toBe(true);
  });

  it("withdrawConsent volta ao padrão restritivo e apaga a preferência salva", () => {
    setConsent({ analytics: true, marketing: true });
    withdrawConsent();
    expect(getConsent()).toEqual({ analytics: false, marketing: false });
    expect(hasStoredConsentDecision()).toBe(false);

    resetConsentForTests();
    expect(hasStoredConsentDecision()).toBe(false); // realmente apagado do storage, não só da memória
  });
});
