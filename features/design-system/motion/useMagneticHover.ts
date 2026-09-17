"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useFinePointer } from "./pointerCapability";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Efeito magnético leve (briefing Microinterações, Seção 8: "muito leve; apenas desktop; em
 * poucos elementos importantes; com limite de deslocamento"). Usado só nos CTAs "Monte seu
 * Upgrade" (Seção 7) — nunca em botões comuns. `maxOffset` limita o deslocamento mesmo perto da
 * borda do elemento, então o botão nunca "foge" visualmente do próprio espaço reservado no layout.
 */
export function useMagneticHover<T extends HTMLElement>(maxOffset = 8) {
  const ref = useRef<T | null>(null);
  const isFinePointer = useFinePointer();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !isFinePointer || reducedMotion) return;

    const quickX = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
    const quickY = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });

    function handleMove(event: PointerEvent) {
      const rect = el!.getBoundingClientRect();
      const relativeX = event.clientX - (rect.left + rect.width / 2);
      const relativeY = event.clientY - (rect.top + rect.height / 2);
      quickX(gsap.utils.clamp(-maxOffset, maxOffset, relativeX * 0.3));
      quickY(gsap.utils.clamp(-maxOffset, maxOffset, relativeY * 0.3));
    }

    function handleLeave() {
      quickX(0);
      quickY(0);
    }

    el.addEventListener("pointermove", handleMove);
    el.addEventListener("pointerleave", handleLeave);

    return () => {
      el.removeEventListener("pointermove", handleMove);
      el.removeEventListener("pointerleave", handleLeave);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [isFinePointer, reducedMotion, maxOffset]);

  return ref;
}
