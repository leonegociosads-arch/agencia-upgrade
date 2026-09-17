"use client";

import { useSyncExternalStore } from "react";
import { isConsentPreferencesManuallyOpen, subscribeConsentPreferencesVisibility } from "./consentBannerVisibility";
import { useHasConsentDecision } from "./useHasConsentDecision";

function getServerSnapshot(): boolean {
  return false;
}

/** O banner aparece sozinho (sem decisão salva ainda) OU quando reaberto manualmente pelo link
 * "Preferências de privacidade" do footer — as duas condições são independentes, então este hook
 * combina os dois hooks menores em vez de duplicar a lógica de assinatura de nenhum dos dois. */
export function useConsentBannerVisible(): boolean {
  const manuallyOpen = useSyncExternalStore(subscribeConsentPreferencesVisibility, isConsentPreferencesManuallyOpen, getServerSnapshot);
  const hasDecision = useHasConsentDecision();
  return manuallyOpen || !hasDecision;
}
