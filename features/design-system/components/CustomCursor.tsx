"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useFinePointer } from "../motion/pointerCapability";
import { useReducedMotion } from "../motion/useReducedMotion";
import styles from "./CustomCursor.module.css";

/**
 * Cursor customizado (briefing Microinterações, Seção 9) — "avaliar... somente se realmente
 * agregar". Implementado como um halo que ACOMPANHA o cursor nativo, nunca o substitui: a seta do
 * sistema continua sempre visível (Seção 9: "não substituir usabilidade normal"). Se este
 * componente falhar silenciosamente por qualquer motivo, a navegação normal não é afetada em nada
 * — decisão deliberada para manter o risco baixo (`docs/DECISIONS.md`).
 *
 * Estados: cresce e ganha um contorno verde sobre elementos interativos (`a`, `button`,
 * `[role="button"]`, inputs) — detectado via UM listener delegado de `pointerover`/`pointerout`
 * no `document` (não um listener por elemento, briefing Seção 56/57), então o custo não cresce com
 * o número de botões/links da página.
 *
 * Só desktop com ponteiro fino (`useFinePointer`), nunca com `prefers-reduced-motion`, e nunca no
 * admin (montado só em `SiteHeader`/`BuilderNavigation` — Seção 49: "sem cursor customizado no
 * admin").
 */
export default function CustomCursor() {
  const haloRef = useRef<HTMLDivElement>(null);
  const isFinePointer = useFinePointer();
  const reducedMotion = useReducedMotion();
  const enabled = isFinePointer && !reducedMotion;

  useEffect(() => {
    if (!enabled) return;
    const halo = haloRef.current;
    if (!halo) return;

    const quickX = gsap.quickTo(halo, "x", { duration: 0.35, ease: "power3.out" });
    const quickY = gsap.quickTo(halo, "y", { duration: 0.35, ease: "power3.out" });
    let visible = false;

    function showOnFirstMove() {
      if (visible) return;
      visible = true;
      gsap.to(halo!, { opacity: 1, duration: 0.2 });
    }

    function handleMove(event: PointerEvent) {
      showOnFirstMove();
      quickX(event.clientX);
      quickY(event.clientY);
    }

    function handleOver(event: PointerEvent) {
      const target = event.target as Element | null;
      const isInteractive = Boolean(target?.closest('a, button, [role="button"], input, textarea, select'));
      halo!.classList.toggle(styles.pointerState, isInteractive);
    }

    function handleLeaveWindow() {
      visible = false;
      gsap.to(halo!, { opacity: 0, duration: 0.2 });
    }

    window.addEventListener("pointermove", handleMove);
    document.addEventListener("pointerover", handleOver);
    document.addEventListener("pointerleave", handleLeaveWindow);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerover", handleOver);
      document.removeEventListener("pointerleave", handleLeaveWindow);
    };
  }, [enabled]);

  if (!enabled) return null;

  return <div ref={haloRef} className={styles.halo} aria-hidden="true" />;
}
