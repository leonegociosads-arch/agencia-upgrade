"use client";

import { cx } from "../utils/cx";
import { playSound, setSoundEnabled } from "../motion/sound";
import { useSoundEnabled } from "../motion/useSoundEnabled";
import styles from "./SoundToggle.module.css";

export interface SoundToggleProps {
  className?: string;
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 9v6h4l5 4V5L8 9H4Z" />
      {muted ? <path d="m16 9 5 6M21 9l-5 6" /> : <path d="M17.5 8.5a5 5 0 0 1 0 7M20 6a8.5 8.5 0 0 1 0 12" />}
    </svg>
  );
}

/**
 * Controle de som (briefing Microinterações, Seção 39: "criar controle de som acessível. Estado
 * deve persistir localmente"). Som começa desligado (`sound.ts`) até o usuário clicar aqui — o
 * próprio clique é a "interação clara do usuário" que a Seção 40 pede antes de qualquer áudio
 * tocar. Reaproveitado no `SiteHeader` e no `BuilderNavigation`; nunca duplicado com uma segunda
 * fonte de verdade (os dois leem/escrevem o mesmo `localStorage` via `useSoundEnabled`/
 * `setSoundEnabled`).
 */
export default function SoundToggle({ className }: SoundToggleProps) {
  const soundEnabled = useSoundEnabled();

  function handleClick() {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) {
      // Confirmação imediata de que o som está ligado — sem isto, a primeira ação sonora do
      // usuário só aconteceria minutos depois, em outro clique qualquer.
      playSound("ui_press");
    }
  }

  return (
    <button
      type="button"
      className={cx(styles.toggle, className)}
      onClick={handleClick}
      aria-pressed={soundEnabled}
      aria-label={soundEnabled ? "Desativar som" : "Ativar som"}
      title={soundEnabled ? "Som ligado" : "Som desligado"}
    >
      <SpeakerIcon muted={!soundEnabled} />
    </button>
  );
}
