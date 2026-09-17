"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { getScrollTrigger } from "@/features/design-system/motion/scrollTrigger";
import { useReducedMotion } from "@/features/design-system/motion/useReducedMotion";
import { DISTANCE } from "@/features/design-system/motion/motionConfig";
import { DESKTOP_SCROLL_QUERY, MOBILE_SCROLL_QUERY, SCRUB, HERO_GRAPHIC_SCALE } from "@/features/design-system/motion/scrollMotionConfig";
import styles from "../components/home/HeroSection.module.css";

/**
 * Motion do Hero (briefing, Seção 4): comportamento de scroll ("o conteúdo abre espaço para a
 * próxima seção conforme rola", "grafismo muda de escala"). A entrada escalonada ao montar
 * (badge → título → subtítulo → CTAs) NÃO vive mais aqui — virou uma animação CSS pura em
 * `HeroSection.module.css` (Etapa 30 — Performance, Seção 75 do briefing: "preferir CSS quando
 * mais barato que GSAP"). Motivo: o H1 do Hero é o elemento de LCP real da Home (confirmado via
 * Lighthouse), e escondê-lo com `gsap.set(opacity:0)` dentro de um `useEffect` atrasava a pintura
 * dele até depois da hidratação — sob throttle de CPU mobile, competindo com o bootstrap do
 * GSAP/Three.js/Lenis no mesmo main thread, esse atraso chegava a ~2,2s. Uma animação CSS começa
 * a rodar assim que o navegador aplica o stylesheet, sem depender de nenhum JavaScript.
 *
 * Estado primeiro, animação depois (mesma regra da Fase GSAP e Transições): este hook nunca lê nem
 * altera nada do Builder/CRM — só anima elementos puramente visuais que já existem no DOM.
 */
export function useHeroScrollMotion(sectionRef: RefObject<HTMLElement | null>) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reducedMotion) return;

    const ScrollTrigger = getScrollTrigger();
    const query = (value: string) => gsap.utils.toArray<Element>(value, section);
    const content = [...query(`.${styles.badge}`), ...query(`.${styles.heroTitle}`), ...query(`.${styles.heroSubtitle}`), ...query(`.${styles.heroActions}`)];
    const graphic = query(`.${styles.heroGraphic}`);

    // Scroll: o Hero "abre espaço" para a seção seguinte (Seção 4) — desktop recebe mais
    // deslocamento/escala que o mobile (Seção 30: "reduzir parallax", nunca a mesma timeline).
    const mm = gsap.matchMedia();
    mm.add(DESKTOP_SCROLL_QUERY, () => {
      gsap.timeline({
        scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: SCRUB.smooth },
      })
        .to(content, { y: -DISTANCE.scene, opacity: 0.25, ease: "none" }, 0)
        .to(graphic, { scale: HERO_GRAPHIC_SCALE, opacity: 0.35, ease: "none" }, 0);
    });
    mm.add(MOBILE_SCROLL_QUERY, () => {
      gsap.timeline({
        scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: SCRUB.smooth },
      }).to(content, { y: -DISTANCE.reveal, opacity: 0.4, ease: "none" }, 0);
    });

    return () => {
      mm.revert();
      ScrollTrigger.refresh();
    };
  }, [sectionRef, reducedMotion]);
}
