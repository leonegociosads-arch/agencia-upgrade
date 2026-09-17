"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import SectionContainer from "@/features/design-system/components/SectionContainer";
import Heading from "@/features/design-system/components/Heading";
import Text from "@/features/design-system/components/Text";
import Badge from "@/features/design-system/components/Badge";
import LinkButton from "@/features/design-system/components/LinkButton";
import { useHeroScrollMotion } from "../../motion/useHeroScrollMotion";
import { useMagneticHover } from "@/features/design-system/motion/useMagneticHover";
import styles from "./HeroSection.module.css";

// Client-only + code-split (Fase 3D/WebGL, Seções 43/44/21 do briefing: "WebGL só no client";
// "Home comum carrega primeiro, 3D depois") — `three` nunca entra no bundle inicial da Home.
// `.heroGraphic` (abaixo) mantém o gradiente CSS original como fundo o tempo todo: se este import
// falhar, demorar, ou `hasWebGL()` recusar dentro do próprio componente, o fallback já shipado
// continua exatamente igual (Seção 31: "fallback é obrigatório").
const UpgradeLogo3D = dynamic(() => import("@/features/design-system/webgl/UpgradeLogo3D"), { ssr: false });

/**
 * Hero da Home (Fase 19, `docs/UI-FINAL.md`) — conteúdo idêntico ao de antes da Fase ScrollTrigger
 * e Storytelling; o que muda nesta fase é só o motion (`useHeroScrollMotion`), nunca a copy. Fase
 * Microinterações adiciona o efeito magnético no CTA principal (briefing Seção 7/8 — só no CTA
 * mais importante da página, nunca no link secundário "Ver projetos").
 *
 * Fase 3D/WebGL: o grafismo decorativo (`.heroGraphic`) ganha o monograma "U" em 3D
 * (`UpgradeLogo3D`) por cima do gradiente CSS que já existia. A interação-surpresa que vivia aqui
 * (`useAvoidCursor`, Fase Microinterações — "afastar-se do cursor") foi retirada deste elemento: a
 * peça 3D agora tem sua própria reação (bem mais sutil) ao cursor, e as duas não fazem sentido no
 * mesmo objeto ao mesmo tempo — ver `docs/DECISIONS.md`.
 */
export default function HeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  useHeroScrollMotion(sectionRef);
  const ctaRef = useMagneticHover<HTMLAnchorElement>();

  // Etapa 30 (Performance, Seções 9/46 do briefing): adia a inicialização do WebGL para depois do
  // navegador ter uma folga no main thread, em vez de competir com hidratação/GSAP/Lenis pelo
  // mesmo frame — medido via Lighthouse (mobile, CPU throttled): o H1 do Hero é o elemento de LCP
  // real da Home, e o trabalho síncrono de `THREE.WebGLRenderer`/geometria no mount imediato
  // atrasava a folga que o navegador precisa para pintar. `requestIdleCallback` (com fallback
  // `setTimeout` para navegadores sem suporte, ex. Safari) e um `timeout` de segurança — nunca
  // espera para sempre se o navegador ficar ocupado. O gradiente CSS (`.heroGraphicFallback`) já
  // preenche o espaço reservado enquanto isso, então não há "pulo" de layout nem de conteúdo.
  const [webglReady, setWebglReady] = useState(false);
  useEffect(() => {
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => setWebglReady(true), { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => setWebglReady(true), 200);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <SectionContainer as="section" ref={sectionRef} className={styles.hero}>
      <Badge tone="accent" className={styles.badge}>
        Estúdio digital de performance
      </Badge>
      <Heading variant="display" className={styles.heroTitle}>
        Um upgrade real na presença digital da sua empresa.
      </Heading>
      <Text size="lg" color="secondary" className={styles.heroSubtitle}>
        Sites, tráfego pago e design trabalhando juntos — com um processo claro do primeiro clique
        ao projeto entregue.
      </Text>
      <div className={styles.heroActions}>
        <LinkButton ref={ctaRef} href="/builder" size="lg">
          Monte seu Upgrade
        </LinkButton>
        <LinkButton href="/projetos" variant="ghost" size="lg">
          Ver projetos
        </LinkButton>
      </div>
      <div className={styles.heroGraphic} aria-hidden="true">
        <div className={styles.heroGraphicFallback} />
        {webglReady && <UpgradeLogo3D />}
      </div>
    </SectionContainer>
  );
}
