"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useFinePointer } from "./pointerCapability";
import { useReducedMotion } from "./useReducedMotion";
import { playSound } from "./sound";

/**
 * A ÚNICA interação "surpresa" do site (briefing Microinterações, Seções 34/35: "pode existir 1
 * ou 2... objetivo: criar memória... nunca em CTA principal, formulário, submit ou ação
 * comercial"). Aplicada só a um elemento puramente decorativo (`aria-hidden`, sem função — o
 * grafismo diagonal do Hero), nunca a um botão real: o elemento se afasta um pouco quando o
 * cursor chega perto, dando a sensação de "objeto vivo" (inspirado na ideia do botão que foge do
 * Nodeck, Seção 35 — sem copiar o elemento, o conteúdo ou a mecânica literal de clique).
 *
 * Toca `hover_special` só na PRIMEIRA vez que a "fuga" acontece na sessão da página — um easter
 * egg é descoberto uma vez, não repetido a cada passada de mouse (Seção 37: "nunca constantes").
 */
export function useAvoidCursor<T extends HTMLElement>(radiusPx = 180, maxOffset = 24) {
  const ref = useRef<T | null>(null);
  const isFinePointer = useFinePointer();
  const reducedMotion = useReducedMotion();
  const discoveredRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !isFinePointer || reducedMotion) return;

    const quickX = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
    const quickY = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });

    function handleMove(event: PointerEvent) {
      const rect = el!.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = centerX - event.clientX;
      const deltaY = centerY - event.clientY;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance > radiusPx || distance === 0) {
        quickX(0);
        quickY(0);
        return;
      }

      if (!discoveredRef.current) {
        discoveredRef.current = true;
        playSound("hover_special");
      }

      const strength = (1 - distance / radiusPx) * maxOffset;
      quickX((deltaX / distance) * strength);
      quickY((deltaY / distance) * strength);
    }

    window.addEventListener("pointermove", handleMove);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      // Mesmo bug de `useTilt.ts` (Etapa 31 — encontrado via E2E, um warning que `jsdom` não pega):
      // `clearProps: "transform"` não funciona para propriedades animadas como componentes
      // individuais (`x`/`y`, via `quickTo`) — GSAP avisa "not eligible for reset" e não limpa
      // nada. Nomear as propriedades reais é a correção.
      gsap.set(el, { clearProps: "x,y" });
    };
  }, [isFinePointer, reducedMotion, radiusPx, maxOffset]);

  return ref;
}
