import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

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
 * Espelha `prefers-reduced-motion` em JS (Motion Design, `docs/MOTION-DESIGN.md`, Seção "Reduced
 * motion"). A regra global em `styles/tokens.css` já zera qualquer `animation`/`transition` via
 * CSS puro — isso é suficiente para tudo que é só CSS. Este hook serve para o caso que a regra
 * CSS não cobre: motion orquestrado em JS (ex.: um `setTimeout` esperando uma animação terminar
 * antes de trocar algo) precisa saber, no próprio JS, que não deve esperar — senão a pessoa sente
 * um atraso funcional sem nenhuma animação visível para justificá-lo.
 *
 * `useSyncExternalStore` (não `useState`+`useEffect`) porque isto é exatamente o caso de uso que
 * ele resolve: ler um valor de fora do React (aqui, `matchMedia`) e assinar mudanças futuras, com
 * um "retrato" seguro para o servidor (`getServerSnapshot` sempre `false` — sem isso, o primeiro
 * render do cliente já leria o valor real da mídia antes da hidratação terminar, divergindo do
 * HTML gerado no servidor).
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
