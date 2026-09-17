"use client";

import { useSyncExternalStore } from "react";
import { CONSENT_CHANGE_EVENT, getConsent, type AnalyticsConsent } from "@/lib/analytics/consent";

function subscribe(onChange: () => void) {
  window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
}

// Referência ESTÁVEL fora da função — `getServerSnapshot` precisa devolver o MESMO objeto a cada
// chamada, nunca um literal novo, ou `useSyncExternalStore` trata isso como "mudou" a cada render e
// lança "The result of getServerSnapshot should be cached to avoid an infinite loop" (reproduzido
// de verdade com Playwright ao verificar este componente, não uma preocupação teórica).
const SERVER_SNAPSHOT: AnalyticsConsent = { analytics: false, marketing: false };

function getServerSnapshot(): AnalyticsConsent {
  return SERVER_SNAPSHOT;
}

/**
 * Espelha `getConsent()` reativamente (Fase LGPD) — mesmo padrão de `useSoundEnabled.ts`
 * (Microinterações): `useSyncExternalStore` ouvindo um `CustomEvent` que `setConsent`/
 * `withdrawConsent` despacham. `getServerSnapshot` sempre restritivo (SSR nunca sabe a
 * preferência real do navegador) — o valor real só aparece depois de hidratar no cliente.
 */
export function useConsent(): AnalyticsConsent {
  return useSyncExternalStore(subscribe, getConsent, getServerSnapshot);
}
