"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import SectionContainer from "@/features/design-system/components/SectionContainer";
import Heading from "@/features/design-system/components/Heading";
import LinkButton from "@/features/design-system/components/LinkButton";
import { useRevealScrollMotion } from "../../motion/useRevealScrollMotion";
import { useMagneticHover } from "@/features/design-system/motion/useMagneticHover";
import { useInViewport } from "@/features/design-system/webgl/useInViewport";
import styles from "./FinalCtaSection.module.css";

// Mesmo raciocínio de `HeroSection.tsx` (Fase 3D/WebGL) — client-only + code-split, nunca no
// bundle inicial da Home. `.finalGraphic` mantém o gradiente CSS original como fallback.
const ProceduralAura = dynamic(() => import("@/features/design-system/webgl/ProceduralAura"), { ssr: false });

/**
 * CTA final (briefing, Seção 22) — a narrativa da Home converge para "Monte seu Upgrade", nunca um
 * botão solto depois das animações. O grafismo decorativo (`.finalGraphic`) ganha um "momento
 * especial" em WebGL (`ProceduralAura`, Fase 3D/WebGL, Seção 60 — efeito 3) por cima do mesmo
 * gradiente CSS de sempre: um brilho procedural sutil nas cores da marca, reagindo de leve ao
 * cursor no desktop. Só monta quando a seção está perto da viewport (`useInViewport`, Seção 20 do
 * briefing) — o CTA final fica abaixo da dobra, então `three`/o shader nunca entram no
 * carregamento inicial da Home.
 */
export default function FinalCtaSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  useRevealScrollMotion(sectionRef, {
    itemSelectors: [`.${styles.heading}`, `.${styles.cta}`],
  });
  const ctaRef = useMagneticHover<HTMLAnchorElement>();
  const [, nearViewport] = useInViewport<HTMLElement>("200px", sectionRef);

  return (
    <SectionContainer as="section" ref={sectionRef} className={styles.finalCta}>
      <div className={styles.finalGraphic} aria-hidden="true">
        <div className={styles.finalGraphicFallback} />
        {nearViewport && <ProceduralAura />}
      </div>
      <Heading variant="h2" className={styles.heading}>
        Pronto para dar o próximo passo?
      </Heading>
      <LinkButton ref={ctaRef} href="/builder" size="lg" className={styles.cta}>
        Monte seu Upgrade
      </LinkButton>
    </SectionContainer>
  );
}
