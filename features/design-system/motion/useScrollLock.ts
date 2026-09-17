"use client";

import { useEffect } from "react";
import { useSmoothScroll } from "./SmoothScrollProvider";

/** Contador em módulo — suporta dois locks simultâneos (ex.: um overlay aberto sobre outro) sem
 * que o segundo feche o `overflow: hidden` do primeiro cedo demais ao desmontar. */
let lockCount = 0;

/**
 * Bloqueia o scroll da página por trás de um overlay (Fase Smooth Scroll, Seções 27-30 do
 * briefing: "Meu Upgrade; modal; menu mobile; drawer... avaliar bloqueio de scroll"; "scroll da
 * página não pode vazar"). Autocontido — funciona em QUALQUER rota, com ou sem Lenis ativo (o
 * Builder, onde o painel "Meu Upgrade" vive, nunca tem uma instância — Seção 4: "Builder não deve
 * depender do Lenis"): `overflow: hidden` + compensação da largura da scrollbar é o mecanismo
 * real; parar o Lenis (`lenis?.stop()`) é só um extra para as rotas que o têm, evitando que a
 * própria suavização do Lenis continue "perseguindo" um alvo de scroll atrás do overlay.
 *
 * Compensa a largura da scrollbar com `padding-right` para o conteúdo por trás não "pular"
 * horizontalmente quando ela desaparece (`overflow: hidden` remove a scrollbar do documento).
 */
export function useScrollLock(active: boolean): void {
  const lenis = useSmoothScroll();

  useEffect(() => {
    if (!active) return;

    lenis?.stop();
    lockCount += 1;
    if (lockCount === 1) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      lenis?.start();
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      }
    };
  }, [active, lenis]);
}
