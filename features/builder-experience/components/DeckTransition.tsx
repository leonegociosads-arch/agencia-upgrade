"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/features/design-system/motion/useReducedMotion";
import { DURATION, EASE, getSceneDistance } from "@/features/design-system/motion/motionConfig";
import styles from "./DeckTransition.module.css";

export type DeckDirection = "forward" | "backward";

export interface DeckTransitionProps {
  sceneKey: string;
  direction: DeckDirection;
  children: ReactNode;
  /** Chamado com `true` no instante em que uma troca de cena começa e `false` quando a timeline
   * termina — o pai usa isto para bloquear duplo clique em Voltar/Avançar durante a transição
   * (mesma regra da Fase GSAP e Transições: nunca dois avanços/uma troca pela metade). */
  onTransitioningChange?: (isTransitioning: boolean) => void;
}

interface Snapshot {
  key: string;
  node: ReactNode;
}

/**
 * Transição "deck" da Prova de Conceito (briefing "Transição para a próxima cena"): mais expressiva
 * que a `SceneTransition` do Builder real (`features/design-system/motion/SceneTransition.tsx`) —
 * escala + blur leve + deslocamento + opacidade, em vez de só deslocamento + opacidade. Construída
 * como um componente PRÓPRIO desta feature (não uma variante da `SceneTransition` real) de
 * propósito: esta prova de conceito não pode arriscar nenhuma regressão no motion já aprovado do
 * Builder (Fase GSAP e Transições) — as duas evoluem de forma independente até esta linguagem ser
 * aprovada e, aí sim, candidata a substituir a outra.
 *
 * Mesmo esqueleto de crossfade já validado na `SceneTransition` real: a cena ATUAL é sempre
 * renderizada ao vivo; a cena de SAÍDA é um retrato congelado no instante da troca, sobreposto
 * (`position: absolute`) enquanto desaparece — a altura do container sempre reflete a cena nova.
 */
export default function DeckTransition({ sceneKey, direction, children, onTransitioningChange }: DeckTransitionProps) {
  const currentRef = useRef<HTMLDivElement>(null);
  const previousRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const prevKeyRef = useRef(sceneKey);
  const lastChildrenRef = useRef(children);
  const activeDirectionRef = useRef<DeckDirection>(direction);
  const [outgoing, setOutgoing] = useState<Snapshot | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const prevKey = prevKeyRef.current;
    const prevChildren = lastChildrenRef.current;
    prevKeyRef.current = sceneKey;
    lastChildrenRef.current = children;
    if (prevKey === sceneKey) return;
    activeDirectionRef.current = direction;
    onTransitioningChange?.(true);
    setOutgoing({ key: prevKey, node: prevChildren });
  }, [sceneKey, children, direction, onTransitioningChange]);

  useEffect(() => {
    if (!outgoing) return;
    const outgoingEl = previousRef.current;
    const incomingEl = currentRef.current;

    function finish() {
      setOutgoing(null);
      onTransitioningChange?.(false);
    }

    if (!outgoingEl || !incomingEl) {
      finish();
      return;
    }

    const ctx = gsap.context(() => {
      if (reducedMotion) {
        gsap.set([outgoingEl, incomingEl], { clearProps: "all" });
        finish();
        return;
      }

      const distance = getSceneDistance() * 0.6;
      const dir = activeDirectionRef.current;
      const exitX = dir === "forward" ? -distance : distance;
      const enterX = dir === "forward" ? distance : -distance;

      gsap.set(incomingEl, { x: enterX, opacity: 0, scale: 0.94, filter: "blur(8px)" });

      const timeline = gsap.timeline({ onComplete: finish, defaults: { overwrite: "auto" } });
      timeline.to(
        outgoingEl,
        { x: exitX, opacity: 0, scale: 0.94, filter: "blur(8px)", duration: DURATION.fast, ease: EASE.exit },
        0,
      );
      timeline.to(
        incomingEl,
        { x: 0, opacity: 1, scale: 1, filter: "blur(0px)", duration: DURATION.scene, ease: EASE.emphasized },
        DURATION.fast * 0.4,
      );
    }, viewportRef);

    return () => ctx.revert();
  }, [outgoing, reducedMotion, onTransitioningChange]);

  return (
    <div ref={viewportRef} className={styles.viewport}>
      {outgoing && (
        <div ref={previousRef} className={styles.outgoingLayer} aria-hidden="true">
          {outgoing.node}
        </div>
      )}
      <div ref={currentRef} className={styles.currentLayer}>
        {children}
      </div>
    </div>
  );
}
