"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useReducedMotion } from "@/features/design-system/motion/useReducedMotion";
import styles from "./LeadFormBackdrop.module.css";

/** Ciclo completo do desenho atravessando a tela (segundos). Lento de propósito: é cenário. */
const CYCLE_SECONDS = { desktop: 38, mobile: 52 } as const;
const MOBILE_BREAKPOINT_PX = 640;
/** Sem animação (reduced motion) o desenho fica parado, já cortado pela lateral. */
const STATIC_OFFSET_PERCENT = -14;

/**
 * Uma volta da faixa. Duas cópias idênticas são emendadas em `LeadFormBackdrop`: como cada grupo
 * tem, no mínimo, a largura da viewport, a faixa nunca deixa um buraco e o loop (`xPercent: -50`)
 * reinicia exatamente onde o segundo grupo começa, sem salto.
 *
 * Assets reais da identidade (nada novo foi criado): a marca "U" (`/logo-mark.png`), as estrelas
 * verdes e o mascote pixelado do resumo do projeto. Para trocar o desenho que atravessa o fundo,
 * basta trocar as imagens abaixo.
 */
function MarqueeGroup({ eager }: { eager: boolean }) {
  return (
    <div className={styles.group}>
      <Image src="/logo-mark.png" alt="" width={556} height={731} className={styles.mark} sizes="600px" priority={eager} loading={eager ? undefined : "eager"} />
      <Image
        src="/assets/builder/service-complete/stars-green.png"
        alt=""
        width={450}
        height={185}
        className={styles.stars}
        sizes="460px"
        loading="eager"
      />
      <Image
        src="/assets/builder/project-summary/summary-mascot.png"
        alt=""
        width={183}
        height={207}
        className={styles.mascot}
        sizes="150px"
        loading="eager"
      />
    </div>
  );
}

/**
 * Cenário da tela de dados/envio: o desenho da Upgrade atravessa o fundo, lento, em loop contínuo.
 * Montado pelo `BuilderShell` FORA da transição de cena (um `position: fixed` dentro de um elemento
 * animado com `transform` andaria junto com ele — mesmo motivo de `ServiceCompleteBackdrop`).
 * Puramente decorativo: `aria-hidden` e `pointer-events: none`.
 */
export default function LeadFormBackdrop() {
  const trackRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // `gsap.context` limpa tudo ao desmontar (e no Strict Mode), então voltar ao formulário nunca
    // empilha um segundo tween.
    const ctx = gsap.context(() => {
      if (reducedMotion) {
        gsap.set(track, { xPercent: STATIC_OFFSET_PERCENT });
        return;
      }
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT_PX;
      gsap.fromTo(
        track,
        { xPercent: 0 },
        {
          xPercent: -50,
          duration: isMobile ? CYCLE_SECONDS.mobile : CYCLE_SECONDS.desktop,
          ease: "none",
          repeat: -1,
        },
      );
    }, track);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <div className={styles.backdrop} aria-hidden="true" data-testid="lead-form-backdrop">
      <div className={styles.stage}>
        <div ref={trackRef} className={styles.track}>
          <MarqueeGroup eager />
          <MarqueeGroup eager={false} />
        </div>
      </div>
      <div className={styles.veil} />
    </div>
  );
}
