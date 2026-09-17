"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(hover: hover) and (pointer: fine)";

function subscribe(onChange: () => void) {
  const mediaQuery = window.matchMedia(QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * `true` só quando o dispositivo tem mouse/trackpad de verdade (Fase Microinterações, Seção 52:
 * "diferenciar fine pointer de coarse pointer"). Todo efeito exclusivo de desktop (tilt, magnético,
 * cursor customizado) é gated por este hook — nunca por `window.innerWidth`, que não diz nada
 * sobre a presença de um ponteiro de precisão (um tablet largo com touch continua "coarse").
 * Mesmo padrão de `useReducedMotion.ts` (`useSyncExternalStore`, SSR-safe).
 */
export function useFinePointer(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
