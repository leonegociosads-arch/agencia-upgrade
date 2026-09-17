import { afterEach, describe, expect, it, vi } from "vitest";
import {
  closeConsentPreferences,
  isConsentPreferencesManuallyOpen,
  openConsentPreferences,
  resetConsentBannerVisibilityForTests,
  subscribeConsentPreferencesVisibility,
} from "./consentBannerVisibility";

afterEach(resetConsentBannerVisibilityForTests);

describe("consentBannerVisibility (Fase LGPD, briefing Seção 19)", () => {
  it("começa fechado", () => {
    expect(isConsentPreferencesManuallyOpen()).toBe(false);
  });

  it("openConsentPreferences abre, closeConsentPreferences fecha", () => {
    openConsentPreferences();
    expect(isConsentPreferencesManuallyOpen()).toBe(true);
    closeConsentPreferences();
    expect(isConsentPreferencesManuallyOpen()).toBe(false);
  });

  it("notifica assinantes a cada mudança", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeConsentPreferencesVisibility(listener);
    openConsentPreferences();
    closeConsentPreferences();
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
  });

  it("para de notificar depois de cancelar a assinatura", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeConsentPreferencesVisibility(listener);
    unsubscribe();
    openConsentPreferences();
    expect(listener).not.toHaveBeenCalled();
  });
});
