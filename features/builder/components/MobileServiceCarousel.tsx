"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import gsap from "gsap";
import ServiceSelectorCard from "./ServiceSelectorCard";
import { SERVICE_IDS } from "../data/services";
import { useReducedMotion } from "@/features/design-system/motion/useReducedMotion";
import { cx } from "@/features/design-system/utils/cx";
import type { ServiceId } from "../types";
import styles from "./MobileServiceCarousel.module.css";

const SLOT_COUNT = SERVICE_IDS.length;
const TWO_PI = Math.PI * 2;
const SWIPE_COMMIT_PX = 48;

interface MobileCardData {
  serviceId: ServiceId;
  label: string;
  configured: boolean;
  disabled: boolean;
  onSelect: () => void;
}

interface MobileServiceCarouselProps {
  cards: MobileCardData[]; // na mesma ordem de SERVICE_IDS
  locked: boolean;
}

function noop() {}

/**
 * Posição/escala/profundidade de um card em função do seu ângulo (radianos) num "orbit" de 3
 * posições — pedido do usuário: "os três cards estão orbitando/trocando de posição, como um seletor
 * de personagens". Modelo contínuo (seno/cosseno) em vez de 3 estados discretos (centro/esquerda/
 * direita) de propósito: durante o arraste, o card que está indo de um lado pro outro precisa
 * atravessar o "atrás do centro" sem nenhum salto/teleporte — com seno/cosseno isso é automático
 * (em 180°, `sin=0` então o card fica exatamente atrás do card da frente, e some por trás dele
 * naturalmente, sem precisar de nenhum caso especial).
 *
 * `front` usa uma curva (`Math.pow(..., 0.35)`) em vez de um mapeamento linear do cosseno — sem ela,
 * o valor de repouso a ±120° (onde os cards laterais realmente ficam parados) sairia bem mais baixo
 * do que os ~0.82–0.88 de escala / ~0.65–0.80 de opacidade pedidos; a curva "puxa" esse ponto médio
 * pra cima mantendo os extremos (0 nas costas, 1 na frente) exatos.
 */
function styleForAngle(angle: number) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const front = Math.pow((cos + 1) / 2, 0.35);
  return {
    xPercent: sin * 60,
    scale: 0.7 + front * 0.3,
    opacity: 0.45 + front * 0.55,
    rotateY: -sin * 11,
    zIndex: Math.round(front * 100) + 1,
  };
}

function angleFor(index: number, center: number) {
  return ((index - center) / SLOT_COUNT) * TWO_PI;
}

/**
 * Seletor de serviços em carrossel 3D, exclusivo do mobile (escondido em telas ≥900px via
 * `styles.root` — a versão desktop, em `ServiceSelector.tsx`/`.module.css`, continua sendo a fileira
 * estática de sempre, intocada). Reaproveita `ServiceSelectorCard` como está (mesma arte, mesmo
 * botão/acessibilidade, mesma flutuação idle) — este componente só adiciona uma camada de
 * posicionamento por CIMA dela: `position-wrapper` (`.cardWrapper`, controlado por este componente
 * via GSAP: x/escala/rotateY/opacidade/z-index) → `floating-wrapper` (`.floatOuter`, já existente
 * DENTRO de `ServiceSelectorCard`, dono da flutuação idle) → card. As duas nunca disputam a mesma
 * propriedade porque estão em elementos DIFERENTES.
 */
export default function MobileServiceCarousel({ cards, locked }: MobileServiceCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(1); // Tráfego Pago — mesmo card central do briefing
  const reducedMotion = useReducedMotion();
  const wrapperRefs = useRef<Array<HTMLDivElement | null>>([]);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; deciding: boolean; horizontal: boolean } | null>(null);
  const introPlayedRef = useRef(false);

  function applyPositions(centerIndex: number, opts: { animate: boolean; progress?: number }) {
    const center = centerIndex + (opts.progress ?? 0);
    SERVICE_IDS.forEach((_, index) => {
      const el = wrapperRefs.current[index];
      if (!el) return;
      const style = styleForAngle(angleFor(index, center));
      if (opts.animate) {
        gsap.set(el, { zIndex: style.zIndex });
        gsap.to(el, {
          xPercent: style.xPercent,
          scale: style.scale,
          opacity: style.opacity,
          rotateY: style.rotateY,
          duration: reducedMotion ? 0 : 0.55,
          ease: "power3.out",
          overwrite: true,
        });
      } else {
        gsap.set(el, {
          xPercent: style.xPercent,
          scale: style.scale,
          opacity: style.opacity,
          rotateY: style.rotateY,
          zIndex: style.zIndex,
        });
      }
    });
  }

  // Troca de card ativo (seta, swipe completo, ou tocar num card lateral) — sempre animado.
  useEffect(() => {
    applyPositions(activeIndex, { animate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `applyPositions` é recriada a cada render mas só lê refs/estado estáveis; incluí-la quebraria a intenção de "só reagir a activeIndex/reducedMotion".
  }, [activeIndex, reducedMotion]);

  // Micro-puxada de affordance (Seção "INDICAÇÃO VISUAL"): uma vez só, ensina que dá pra arrastar.
  useEffect(() => {
    if (reducedMotion || introPlayedRef.current) return;
    introPlayedRef.current = true;
    const el = viewportRef.current;
    if (!el) return;
    const timeline = gsap.timeline({ delay: 1.1 });
    timeline
      .to(el, { x: -16, duration: 0.26, ease: "power2.out" })
      .to(el, { x: 8, duration: 0.2, ease: "power2.inOut" })
      .to(el, { x: 0, duration: 0.28, ease: "power2.out" });
    return () => {
      timeline.kill();
    };
  }, [reducedMotion]);

  function goTo(delta: 1 | -1) {
    if (locked) return;
    setActiveIndex((current) => (current + delta + SLOT_COUNT) % SLOT_COUNT);
  }

  // Tocar no card central seleciona de verdade; tocar num card lateral só o traz pro centro (Seção
  // "CLIQUE NOS CARDS" — "manter a lógica de seleção semelhante a um videogame").
  function handleCardActivate(index: number) {
    if (locked) return;
    if (index === activeIndex) {
      cards[index]?.onSelect();
      return;
    }
    setActiveIndex(index);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (locked) return;
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, deciding: true, horizontal: false };
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;

    if (drag.deciding) {
      // Threshold mínimo antes de decidir a intenção do gesto (Seção "diferenciar intenção
      // horizontal de vertical") — evita "sequestrar" um scroll vertical que só encostou no
      // carrossel de leve, e evita trocar de card com tremores mínimos do dedo.
      if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) return;
      drag.deciding = false;
      drag.horizontal = Math.abs(deltaX) > Math.abs(deltaY);
      if (!drag.horizontal) {
        // Gesto é vertical: solta a captura e deixa o scroll nativo da página assumir.
        dragRef.current = null;
        return;
      }
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    if (!drag.horizontal) return;
    event.preventDefault();
    const viewportWidth = viewportRef.current?.clientWidth || 320;
    // Arrastar pra ESQUERDA (deltaX negativo) avança pro próximo serviço — mesma direção de
    // "conteúdo desliza sob o dedo" de qualquer carrossel/feed horizontal.
    const progress = Math.max(-1, Math.min(1, -deltaX / viewportWidth));
    applyPositions(activeIndex, { animate: false, progress });
  }

  function handlePointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag || !drag.horizontal) return;
    const deltaX = event.clientX - drag.startX;
    if (Math.abs(deltaX) > SWIPE_COMMIT_PX) {
      setActiveIndex((current) => (current + (deltaX < 0 ? 1 : -1) + SLOT_COUNT) % SLOT_COUNT);
    } else {
      // Abaixo do threshold: volta suavemente pro estado atual (nunca fica "preso" a meio caminho).
      applyPositions(activeIndex, { animate: true });
    }
  }

  return (
    <div className={styles.root}>
      <div
        ref={viewportRef}
        className={styles.viewport}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        {SERVICE_IDS.map((serviceId, index) => {
          const card = cards[index];
          if (!card) return null;
          return (
            <div
              key={serviceId}
              ref={(el) => {
                wrapperRefs.current[index] = el;
              }}
              className={styles.cardWrapper}
            >
              <ServiceSelectorCard
                serviceId={card.serviceId}
                label={card.label}
                configured={card.configured}
                disabled={card.disabled}
                active={false}
                dimmed={false}
                onHoverChange={noop}
                onSelect={() => handleCardActivate(index)}
              />
            </div>
          );
        })}
      </div>

      <div className={styles.indicator}>
        <button type="button" className={styles.arrowButton} aria-label="Serviço anterior" disabled={locked} onClick={() => goTo(-1)}>
          ‹
        </button>
        <div className={styles.dots} aria-hidden="true">
          {SERVICE_IDS.map((serviceId, index) => (
            <span key={serviceId} className={cx(styles.dot, index === activeIndex && styles.dotActive)} />
          ))}
        </div>
        <button type="button" className={styles.arrowButton} aria-label="Próximo serviço" disabled={locked} onClick={() => goTo(1)}>
          ›
        </button>
      </div>
    </div>
  );
}
