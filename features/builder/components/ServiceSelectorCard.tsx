"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";
import gsap from "gsap";
import Badge from "@/features/design-system/components/Badge";
import { useFinePointer } from "@/features/design-system/motion/pointerCapability";
import { useReducedMotion } from "@/features/design-system/motion/useReducedMotion";
import { cx } from "@/features/design-system/utils/cx";
import type { ServiceId } from "../types";
import styles from "./ServiceSelectorCard.module.css";

// Os PNGs fornecidos SÃO o card (briefing, Seção 2/7: "não redesenhar em CSS", "os próprios
// assets já são os cards") — 1080x1080, com bastante margem transparente ao redor da peça real.
// `object-fit: contain` no CSS preserva a proporção integralmente (nunca corta/estica).
const CARD_IMAGE: Record<ServiceId, string> = {
  site: "/builder/service-select/card-site.png",
  trafego: "/builder/service-select/card-trafego.png",
  design: "/builder/service-select/card-design.png",
};

// Composição orgânica (Seção 8) + flutuação dessincronizada (Seção 9) — valores de referência do
// próprio briefing, um objeto por serviço para nunca precisar de lógica condicional espalhada.
// `mobile` reduz amplitude/rotação (Seção 15: "flutuação ainda mais suave no mobile"), nunca a
// duração (a duração diferente entre cards já é o que evita "os três subindo/descendo juntos").
const FLOAT_CONFIG: Record<ServiceId, { baseRotate: number; floatY: number; floatRot: number; duration: number; delay: number }> = {
  site: { baseRotate: -2, floatY: -8, floatRot: 0.5, duration: 5.8, delay: 0 },
  trafego: { baseRotate: 0, floatY: -11, floatRot: 0.35, duration: 6.5, delay: -1.8 },
  design: { baseRotate: 2, floatY: -7, floatRot: 0.6, duration: 5.3, delay: -3.4 },
};

interface ServiceSelectorCardProps {
  serviceId: ServiceId;
  label: string;
  configured: boolean;
  disabled: boolean;
  /** Este card está em hover/foco OU foi o selecionado (Seção 10, Seção 11 Fase B). */
  active: boolean;
  /** OUTRO card da cena está ativo/selecionado (Seção 10.7: "reduzir discretamente os outros"). */
  dimmed: boolean;
  onHoverChange: (hovered: boolean) => void;
  onSelect: () => void;
}

/**
 * Card único da tela "Escolha o seu Upgrade" (WF-03, Seção 7-11 do briefing). A imagem fornecida é
 * só apresentação visual — toda a interação (clique, teclado, tilt, hover) vive nesta camada React
 * por cima/ao redor dela (Seção 19: "imagem = visual, componente = interação").
 */
export default function ServiceSelectorCard({ serviceId, label, configured, disabled, active, dimmed, onHoverChange, onSelect }: ServiceSelectorCardProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const isFinePointer = useFinePointer();
  const reducedMotion = useReducedMotion();
  const float = FLOAT_CONFIG[serviceId];

  // Tilt 3D pela posição do cursor (Seção 10: "leve sensação 3D... MUITO controlada") + aproximar/
  // escalar no hover. Feito aqui (não via `useTilt`, já usado noutros cards do Builder) porque
  // precisa compor com `active`/`dimmed` vindos do pai (quais dos três cards recebem o quê depende
  // da cena inteira, não só deste card sozinho) — reaproveitar o hook genérico exigiria os mesmos
  // efeitos duplicados por fora dele de qualquer forma.
  useEffect(() => {
    const el = buttonRef.current;
    if (!el || !isFinePointer || reducedMotion) return;

    gsap.set(el, { transformPerspective: 800 });
    const quickRotateX = gsap.quickTo(el, "rotateX", { duration: 0.35, ease: "power2.out" });
    const quickRotateY = gsap.quickTo(el, "rotateY", { duration: 0.35, ease: "power2.out" });
    const quickScale = gsap.quickTo(el, "scale", { duration: 0.3, ease: "power2.out" });
    const quickY = gsap.quickTo(el, "y", { duration: 0.3, ease: "power2.out" });

    function handleMove(event: PointerEvent) {
      const rect = el!.getBoundingClientRect();
      const relativeX = (event.clientX - rect.left) / rect.width - 0.5;
      const relativeY = (event.clientY - rect.top) / rect.height - 0.5;
      // Amplitude pequena de propósito (Seção 10: "Não quero efeito de cartão girando"). 5deg de
      // teto é suficiente para "sensação de profundidade" sem nunca parecer um cartão virando.
      quickRotateY(relativeX * 10);
      quickRotateX(-relativeY * 10);
    }

    function handleEnter() {
      onHoverChange(true);
      quickScale(1.06);
      quickY(-6);
    }

    function handleLeave() {
      onHoverChange(false);
      quickScale(1);
      quickY(0);
      gsap.to(el!, { rotateX: 0, rotateY: 0, duration: 0.4, ease: "power2.out" });
    }

    el.addEventListener("pointermove", handleMove);
    el.addEventListener("pointerenter", handleEnter);
    el.addEventListener("pointerleave", handleLeave);
    el.addEventListener("focus", handleEnter);
    el.addEventListener("blur", handleLeave);

    return () => {
      el.removeEventListener("pointermove", handleMove);
      el.removeEventListener("pointerenter", handleEnter);
      el.removeEventListener("pointerleave", handleLeave);
      el.removeEventListener("focus", handleEnter);
      el.removeEventListener("blur", handleLeave);
      gsap.set(el, { clearProps: "rotationX,rotationY,scale,y,transformPerspective" });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `onHoverChange` é estável o bastante (vem de um `useState` setter no pai); recriar por causa dela recriaria os listeners a cada hover.
  }, [isFinePointer, reducedMotion]);

  // Resposta tátil imediata ao clique (Seção 11, Fase A) — compressão curta, na MESMA propriedade
  // que o tilt já controla (mesma razão documentada em `useTilt.ts`: um `transform` inline sempre
  // vence uma regra `:active` do CSS para o mesmo elemento).
  function handlePointerDown() {
    if (disabled || reducedMotion || !isFinePointer) return;
    gsap.to(buttonRef.current, { scale: 0.95, duration: 0.09, ease: "power2.out" });
  }

  return (
    <div
      className={cx(styles.floatOuter, active && styles.settled)}
      style={
        {
          "--card-base-rotate": `${float.baseRotate}deg`,
          "--card-float-y": `${float.floatY}px`,
          "--card-float-rot": `${float.floatRot}deg`,
          "--card-float-duration": `${float.duration}s`,
          "--card-float-delay": `${float.delay}s`,
        } as CSSProperties
      }
    >
      <button
        ref={buttonRef}
        type="button"
        className={cx(styles.tilt, active && styles.active, dimmed && styles.dimmed)}
        disabled={disabled}
        // Só o rótulo do serviço (igual ao nome acessível de antes desta reformulação visual, que
        // vinha do texto visível do card) — nunca "Editar"/"Começar" aqui: o painel "Meu Upgrade"
        // (`MyUpgradeItem.tsx`) já usa "Editar" para seus próprios botões, e como esse painel é uma
        // seção persistente (pode ficar aberto AO MESMO TEMPO que esta tela, nunca um modal),
        // reaproveitar a mesma palavra criaria dois botões "Editar ..." ambíguos na mesma árvore de
        // acessibilidade. O selo visual "Configurado" (abaixo) já comunica o estado para quem vê a
        // tela; a diferença de comportamento (editar vs. começar) não muda o CLIQUE em si.
        aria-label={label}
        onPointerDown={handlePointerDown}
        onClick={onSelect}
      >
        <span className={styles.visuallyHidden}>{label}</span>
        {configured && (
          <Badge tone="success" className={styles.badge}>
            Configurado
          </Badge>
        )}
        <Image src={CARD_IMAGE[serviceId]} alt="" width={1080} height={1080} className={styles.image} priority={serviceId === "site"} sizes="(max-width: 640px) 78vw, 26vw" />
      </button>
    </div>
  );
}
