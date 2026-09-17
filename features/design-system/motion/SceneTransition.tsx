"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { useReducedMotion } from "./useReducedMotion";
import { DURATION, EASE, getSceneDistance } from "./motionConfig";
import styles from "./SceneTransition.module.css";

export type SceneDirection = "forward" | "backward";

interface SceneNavigationContextValue {
  /** Uma transição de cena está em andamento agora — quem chama deve bloquear novos avanços. */
  isTransitioning: boolean;
  /** Chamar ANTES de disparar a ação que muda o estado (Seção 4: estado primeiro, motion depois). */
  markForward: () => void;
  markBackward: () => void;
}

const SceneNavigationContext = createContext<SceneNavigationContextValue>({
  isTransitioning: false,
  markForward: () => {},
  markBackward: () => {},
});

/**
 * Lido pelos botões de fluxo (Continuar/Próximo, opções, Voltar) para (1) saber a direção
 * pretendida antes de disparar a ação real e (2) se bloquear enquanto uma transição já está
 * tocando (briefing, Seção 7 — "impedir duplo clique", "impedir salto de duas perguntas"). Fora
 * de um `SceneTransition` (ex.: um teste isolado do componente), vira um no-op seguro.
 */
export function useSceneNavigation(): SceneNavigationContextValue {
  return useContext(SceneNavigationContext);
}

export interface SceneTransitionProps {
  /** Identidade da cena atual — trocar este valor dispara a transição. */
  sceneKey: string;
  children: ReactNode;
}

interface Snapshot {
  key: string;
  node: ReactNode;
}

/**
 * Transição de cena do Builder com GSAP (Fase GSAP e Transições — `docs/GSAP-TRANSITIONS.md`).
 * Substitui a versão só-CSS da Fase Motion Design (que só animava a entrada) por um crossfade
 * completo: a cena anterior sai (mais rápido, `EASE.exit`) enquanto a nova entra (`EASE.emphasized`,
 * levemente sobreposta — Seção 20 do briefing: "saída pode ser um pouco mais rápida que entrada").
 *
 * A cena ATUAL é sempre renderizada ao vivo (`children` direto, nunca uma cópia congelada) — só a
 * cena de SAÍDA usa um retrato (`outgoing`) capturado no instante da troca, para continuar visível
 * enquanto desaparece sem travar a interatividade da cena nova (ex.: o campo de um formulário
 * continua reagindo a cada tecla mesmo com uma transição de outra pergunta ainda no ar).
 *
 * Nunca decide o que renderizar (Seção 4 do briefing: "primeiro o estado muda, depois o motion
 * responde") — só anima a troca de algo que `BuilderShell`/`getSceneKey` já decidiram.
 */
export default function SceneTransition({ sceneKey, children }: SceneTransitionProps) {
  const currentRef = useRef<HTMLDivElement>(null);
  const previousRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const prevKeyRef = useRef(sceneKey);
  const lastChildrenRef = useRef(children);
  const directionRef = useRef<SceneDirection>("forward");
  const activeDirectionRef = useRef<SceneDirection>("forward");
  const busyRef = useRef(false);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [outgoing, setOutgoing] = useState<Snapshot | null>(null);
  const reducedMotion = useReducedMotion();

  // Detecta a troca de cena e captura um retrato do que estava visível — não anima nada aqui
  // ainda (o DOM do retrato só existe depois do próximo commit); só prepara os dados.
  useEffect(() => {
    const prevKey = prevKeyRef.current;
    const prevChildren = lastChildrenRef.current;
    prevKeyRef.current = sceneKey;
    lastChildrenRef.current = children;

    if (prevKey === sceneKey) return;

    activeDirectionRef.current = directionRef.current;
    directionRef.current = "forward"; // padrão para a próxima troca, até outro marker chegar.
    busyRef.current = true;
    setIsTransitioning(true);
    setOutgoing({ key: prevKey, node: prevChildren });
  }, [sceneKey, children]);

  // Roda a animação de verdade, agora que `outgoing` já commitou e os dois nós existem no DOM.
  useEffect(() => {
    if (!outgoing) return;

    const outgoingEl = previousRef.current;
    const incomingEl = currentRef.current;

    function finish() {
      busyRef.current = false;
      setIsTransitioning(false);
      setOutgoing(null);
    }

    if (!outgoingEl || !incomingEl) {
      finish();
      return;
    }

    // `gsap.context` (Seção 35 do briefing) — cleanup automático se o componente desmontar (ou o
    // Strict Mode do React re-executar o efeito em desenvolvimento, Seção 37) no meio da animação.
    const ctx = gsap.context(() => {
      if (reducedMotion) {
        gsap.set([outgoingEl, incomingEl], { clearProps: "all" });
        finish();
        return;
      }

      const distance = getSceneDistance();
      const direction = activeDirectionRef.current;
      const exitX = direction === "forward" ? -distance : distance;
      const enterX = direction === "forward" ? distance : -distance;

      gsap.set(incomingEl, { x: enterX, opacity: 0 });

      const timeline = gsap.timeline({
        onComplete: finish,
        defaults: { overwrite: "auto" },
      });
      timeline.to(outgoingEl, { x: exitX, opacity: 0, duration: DURATION.fast, ease: EASE.exit }, 0);
      timeline.to(
        incomingEl,
        { x: 0, opacity: 1, duration: DURATION.scene, ease: EASE.emphasized },
        DURATION.fast * 0.4, // leve sobreposição — crossfade, não um "sai tudo, depois entra tudo".
      );
    }, viewportRef);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `outgoing` é o único gatilho real; os elementos são lidos via ref.
  }, [outgoing]);

  return (
    <SceneNavigationContext.Provider
      value={{
        isTransitioning,
        markForward: () => {
          directionRef.current = "forward";
        },
        markBackward: () => {
          directionRef.current = "backward";
        },
      }}
    >
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
    </SceneNavigationContext.Provider>
  );
}
