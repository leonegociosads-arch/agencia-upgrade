"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { getScrollTrigger } from "@/features/design-system/motion/scrollTrigger";
import { useReducedMotion } from "@/features/design-system/motion/useReducedMotion";
import { DURATION, EASE, STAGGER, DISTANCE } from "@/features/design-system/motion/motionConfig";

export interface RevealScrollMotionOptions {
  /** Seletores (classes do CSS module da própria seção) revelados em sequência, um `stagger`
   * curto entre eles — não passos de pin/scrub, só uma entrada única ao alcançar a seção. */
  itemSelectors: string[];
  /** `y` inicial em px — `DISTANCE.reveal` por padrão (deslocamento pequeno, Seção 34). */
  distance?: number;
}

/**
 * Hook genérico para as duas seções "leves" da Home (Projetos/Prova e CTA final) — uma revelação
 * única (fade + translateY, stagger curto) ao entrar na tela, sem pin/scrub/matchMedia: nem todo
 * ScrollTrigger precisa da complexidade das Seções 6/8/28 do briefing (Seção 45: "melhor 4
 * interações excelentes do que 20 medianas" — aqui a interação certa é a mais simples possível).
 */
export function useRevealScrollMotion(sectionRef: RefObject<HTMLElement | null>, { itemSelectors, distance = DISTANCE.reveal }: RevealScrollMotionOptions) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reducedMotion || itemSelectors.length === 0) return;

    const ScrollTrigger = getScrollTrigger();

    const ctx = gsap.context(() => {
      const items = itemSelectors.map((item) => gsap.utils.toArray<Element>(item, section));

      const timeline = gsap.timeline({
        scrollTrigger: { trigger: section, start: "top 82%", toggleActions: "play none none none" },
        defaults: { duration: DURATION.slow, ease: EASE.emphasized },
      });
      items.forEach((item, index) => {
        // `fromTo` (não `from`) de propósito: com vários itens na mesma timeline e posicionamento
        // relativo (`"<+…"`), `from()` precisa capturar o valor "de chegada" a partir do estilo
        // computado no momento em que a timeline monta — arriscado quando o item anterior já foi
        // para opacidade 0 nesse instante. Valores explícitos nos dois lados eliminam a ambiguidade.
        timeline.fromTo(item, { opacity: 0, y: distance }, { opacity: 1, y: 0 }, index === 0 ? 0 : `<+${STAGGER.md}`);
      });
    }, section);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `itemSelectors` é um array literal recriado a cada render nos componentes que chamam este hook; comparar por referência recriaria o efeito sem necessidade. O conteúdo (classes de CSS module) nunca muda em tempo de execução.
  }, [sectionRef, reducedMotion, distance]);
}
