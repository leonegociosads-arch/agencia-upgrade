"use client";

import { useCallback, useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * `true` assim que a página rola além de `thresholdPx` (briefing Microinterações, Seção 30:
 * "header pode reagir ao scroll"). `useSyncExternalStore` (mesmo padrão de `useReducedMotion.ts`)
 * em vez de `useState`+`useEffect` — evita o mesmo problema de "setState síncrono dentro de
 * efeito" já resolvido nessa fase anterior, e mantém o SSR seguro (`getServerSnapshot` = `false`,
 * nunca rolado no servidor). `getSnapshot` é memoizado por `thresholdPx` para não recriar o
 * listener a cada render (o próprio `useSyncExternalStore` reassina sempre que a referência de
 * `subscribe`/`getSnapshot` muda).
 */
export function useScrolled(thresholdPx = 8): boolean {
  const getSnapshot = useCallback(() => window.scrollY > thresholdPx, [thresholdPx]);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
