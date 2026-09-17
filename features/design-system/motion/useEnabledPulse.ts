"use client";

import { useEffect, useRef, useState } from "react";

/**
 * `true` por um instante curto quando `enabled` passa de `false` para `true` (briefing
 * Microinterações, Seção 15: "quando ficar enabled, pode entrar com microfeedback"). Nunca dispara
 * na montagem inicial (só numa transição real de desabilitado → habilitado) nem quando já estava
 * habilitado (evita reforçar o mesmo estado a cada re-render). Quem chama aplica a classe CSS do
 * pulso enquanto isto for `true` — a duração do pulso vive no CSS (`--ds-duration-*`), não aqui.
 */
export function useEnabledPulse(enabled: boolean): boolean {
  const previousRef = useRef(enabled);
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    const becameEnabled = !previousRef.current && enabled;
    previousRef.current = enabled;
    if (!becameEnabled) return;

    setPulsing(true);
    const timeout = setTimeout(() => setPulsing(false), 260);
    return () => clearTimeout(timeout);
  }, [enabled]);

  return pulsing;
}
