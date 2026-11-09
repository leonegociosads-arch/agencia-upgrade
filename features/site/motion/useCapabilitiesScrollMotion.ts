"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { getScrollTrigger } from "@/features/design-system/motion/scrollTrigger";
import { useReducedMotion } from "@/features/design-system/motion/useReducedMotion";
import { DURATION, EASE, STAGGER, DISTANCE } from "@/features/design-system/motion/motionConfig";
import { DESKTOP_SCROLL_QUERY, MOBILE_SCROLL_QUERY } from "@/features/design-system/motion/scrollMotionConfig";
import styles from "../components/home/CapabilitiesSection.module.css";

/**
 * Motion de "O que fazemos" — apresentação sequencial dos 3 serviços, a mesma intenção de antes,
 * agora SEM `pin` (correção da auditoria de 09/11/2026, achado A5).
 *
 * Por que o pin saiu: o pin começava em "top top", então enquanto a seção subia até o topo da tela os
 * cards ainda estavam invisíveis (início da timeline) — a pessoa via o título e uma tela inteira
 * vazia, e depois ficava "presa" por mais 90% de altura de tela. E o recorte da moldura era ligado ao
 * scroll (`scrub`): parado no meio, deixava o texto de apoio cortado ("rojeto" em 1920×1080). Pela
 * regra do projeto ("melhora a experiência ou só existe porque conseguimos fazer?"), o pin só existia.
 *
 * Agora, em qualquer largura:
 * - a moldura ainda "abre" (recorte + escala, não um fade simples — a primeira transição depois do
 *   Hero continua marcante), mas como animação de TEMPO disparada ao entrar na tela: nunca para no
 *   meio, então nunca há texto cortado parado;
 * - os cards sobem em sequência quando a grade aparece (desktop com um pouco mais de deslocamento);
 * - nada fica escondido esperando um scroll que talvez não aconteça: `once` + estado final limpo.
 * Movimento reduzido: nada anima (os elementos já nascem no estado final).
 */
export function useCapabilitiesScrollMotion(sectionRef: RefObject<HTMLElement | null>) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reducedMotion) return;

    const ScrollTrigger = getScrollTrigger();
    const query = (value: string) => gsap.utils.toArray<Element>(value, section);
    const frame = query(`.${styles.frame}`);
    const grid = query(`.${styles.capabilities}`)[0] ?? section;
    const cards = query(`.${styles.capabilityCard}`);

    // Abertura da moldura: tocada uma vez, por tempo (não por scroll), ao a seção entrar na tela.
    const ctx = gsap.context(() => {
      gsap.fromTo(
        frame,
        { clipPath: "inset(6% 4% round 28px)", scale: 0.97, opacity: 0.6 },
        {
          clipPath: "inset(0% 0% round 0px)",
          scale: 1,
          opacity: 1,
          duration: DURATION.scene,
          ease: EASE.emphasized,
          clearProps: "clipPath,transform,opacity",
          scrollTrigger: { trigger: section, start: "top 88%", once: true },
        },
      );
    }, section);

    const mm = gsap.matchMedia();
    const revealCards = (distance: number, stagger: number) => {
      gsap.from(cards, {
        opacity: 0,
        y: distance,
        duration: DURATION.scene,
        ease: EASE.emphasized,
        stagger,
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: grid, start: "top 85%", once: true },
      });
    };
    mm.add(DESKTOP_SCROLL_QUERY, () => revealCards(DISTANCE.scene, STAGGER.md * 1.5));
    mm.add(MOBILE_SCROLL_QUERY, () => revealCards(DISTANCE.reveal, STAGGER.sm));

    return () => {
      ctx.revert();
      mm.revert();
      ScrollTrigger.refresh();
    };
  }, [sectionRef, reducedMotion]);
}
