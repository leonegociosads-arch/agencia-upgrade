"use client";

import { useSyncExternalStore } from "react";
import { CONSENT_CHANGE_EVENT, hasStoredConsentDecision } from "@/lib/analytics/consent";

function subscribe(onChange: () => void) {
  window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
}

function getServerSnapshot(): boolean {
  return false;
}

/** `false` = nenhuma decisão válida para a versão atual da política — usado por
 * `useConsentBannerVisible` para decidir se o banner deve aparecer sozinho. */
export function useHasConsentDecision(): boolean {
  return useSyncExternalStore(subscribe, hasStoredConsentDecision, getServerSnapshot);
}
