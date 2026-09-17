"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { getScrollTrigger } from "@/features/design-system/motion/scrollTrigger";
import { useReducedMotion } from "@/features/design-system/motion/useReducedMotion";
import { DURATION, EASE, STAGGER, DISTANCE } from "@/features/design-system/motion/motionConfig";
import { DESKTOP_SCROLL_QUERY, MOBILE_SCROLL_QUERY, SCRUB } from "@/features/design-system/motion/scrollMotionConfig";
import styles from "../components/home/CapabilitiesSection.module.css";

/**
 * Motion de "O que fazemos" (briefing, Seções 6 e 12): "apresentação sequencial de serviços" é
 * exatamente um dos casos que o próprio briefing lista como justificativa boa para `pin` (Seção
 * 6). No desktop, o título fica fixo enquanto os 3 cards entram em sequência; no mobile, sem pin
 * (Seção 30: "remover pin longo") — os cards só revelam em bloco ao entrar na tela.
 *
 * A "primeira transição" (Seção 5: "a passagem Hero → próxima seção deve ser marcante... evitar
 * simples fade") acontece aqui, na entrada do `.frame`: um `clip-path` que "abre" a moldura da
 * seção, não um fade.
 */
export function useCapabilitiesScrollMotion(sectionRef: RefObject<HTMLElement | null>) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reducedMotion) return;

    const ScrollTrigger = getScrollTrigger();
    const query = (value: string) => gsap.utils.toArray<Element>(value, section);
    const frame = query(`.${styles.frame}`);
    const cards = query(`.${styles.capabilityCard}`);

    // Transição de entrada (Seção 5) — clip-path + escala, nunca um fade simples. Roda nos dois
    // breakpoints: é uma reação de chegada, não uma sequência longa que precise de matchMedia.
    const ctx = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: { trigger: section, start: "top 92%", end: "top 60%", scrub: SCRUB.smooth },
      }).fromTo(
        frame,
        { clipPath: "inset(8% 6% round 28px)", scale: 0.96, opacity: 0.5 },
        { clipPath: "inset(0% 0% round 0px)", scale: 1, opacity: 1, ease: "none" },
      );
    }, section);

    // `gsap.matchMedia()` PRÓPRIO, fora do `gsap.context()` acima — nunca aninhado (ver o
    // comentário equivalente em `useHeroScrollMotion.ts`: aninhar os dois faz o `pin` abaixo ser
    // desfeito duas vezes ao desmontar, um `NotFoundError` real quando o segundo `revert()`
    // encontra nós que o primeiro já restaurou).
    const mm = gsap.matchMedia();

    // Desktop: título permanece fixo (pin) enquanto os cards entram em sequência (Seção 6/12).
    mm.add(DESKTOP_SCROLL_QUERY, () => {
      const cardsTimeline = gsap.timeline().from(cards, {
        opacity: 0,
        y: DISTANCE.scene,
        scale: 0.96,
        duration: DURATION.scene,
        ease: EASE.emphasized,
        stagger: STAGGER.md * 2.5,
      });

      // Duração do pin curta (Seção 7: "pins não podem parecer intermináveis") — só o suficiente
      // para os 3 cards entrarem com sensação de progresso constante, nunca um scroll vazio.
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=90%",
        pin: true,
        pinSpacing: true,
        scrub: SCRUB.responsive,
        animation: cardsTimeline,
      });
    });

    // Mobile: sem pin — revelação em bloco, uma vez, ao entrar na tela (Seção 30).
    mm.add(MOBILE_SCROLL_QUERY, () => {
      gsap
        .timeline({ scrollTrigger: { trigger: section, start: "top 80%", toggleActions: "play none none none" } })
        .from(cards, {
          opacity: 0,
          y: DISTANCE.reveal,
          duration: DURATION.normal,
          ease: EASE.standard,
          stagger: STAGGER.sm,
        });
    });

    return () => {
      ctx.revert();
      mm.revert();
      ScrollTrigger.refresh();
    };
  }, [sectionRef, reducedMotion]);
}
