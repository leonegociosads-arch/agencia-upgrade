"use client";

import { useSyncExternalStore } from "react";
import { isSoundEnabled, SOUND_ENABLED_CHANGE_EVENT } from "./sound";

function subscribe(onChange: () => void) {
  window.addEventListener(SOUND_ENABLED_CHANGE_EVENT, onChange);
  return () => window.removeEventListener(SOUND_ENABLED_CHANGE_EVENT, onChange);
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Versão reativa de `isSoundEnabled()` — `sound.ts` guarda a preferência em `localStorage`, que
 * não notifica sozinho os componentes já montados quando muda (`setSoundEnabled` despacha
 * `SOUND_ENABLED_CHANGE_EVENT` para isso). Usado pelo `SoundToggle` e por qualquer componente que
 * precise refletir o estado atual do som na própria UI.
 */
export function useSoundEnabled(): boolean {
  return useSyncExternalStore(subscribe, isSoundEnabled, getServerSnapshot);
}
