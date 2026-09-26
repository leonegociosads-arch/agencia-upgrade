"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useBuilder } from "../../state/BuilderContext";
import { isRepeatedClick } from "../../logic/repeatedClick";
import { SHOWCASE_THEMES } from "../special/showcaseQuestionTheme";
import { useSceneNavigation } from "@/features/design-system/motion/SceneTransition";
import { useReducedMotion } from "@/features/design-system/motion/useReducedMotion";
import { playSound } from "@/features/design-system/motion/sound";
import type { ServiceId } from "../../types";
import styles from "./ServiceCompleteScene.module.css";

interface ServiceCompleteSceneProps {
  /** Serviço que acabou de ser configurado — já salvo em `confirmedServices` quando esta tela
   * aparece (`SAVE_SERVICE_DRAFT` troca o `step` para "service_complete" na mesma ação). */
  serviceId: ServiceId;
}

/** Entrada do card: começa rápido e desacelera bastante no fim, sem quique. `power3.out` (e não
 * `expo.out`, que percorre quase todo o caminho nos primeiros milissegundos): a travessia desde a
 * borda da tela precisa ser VISTA, não só o pouso. */
const ENTRY_DURATION = 1;
const ENTRY_EASE = "power3.out";
/** Espera curtíssima antes de sair: o primeiro quadro depois de montar a cena é pesado (imagens,
 * layout) e, sem isto, engoliria justamente o início da travessia. */
const ENTRY_DELAY = 0.08;

/**
 * Tela "Serviço adicionado" (WF-05), exibida ao concluir um serviço NOVO de qualquer caminho (Site,
 * Tráfego Pago, Design e Social Media) — um único componente para os três. Não salva nada: o
 * serviço já está em `confirmedServices` quando ela monta. As duas ações usam o que já existia:
 * "Adicionar outro serviço" = `goToEntry()` (volta à escolha de categoria, mantendo tudo o que já
 * foi configurado — nunca o "Começar de novo"); "Ver resumo do projeto" = `finalizeProject()`, o
 * mesmo caminho do "Finalizar projeto" do Meu Upgrade, que leva ao Resumo do Projeto de sempre.
 *
 * Cena deliberadamente calma (preto, terreno fixo embaixo — `ServiceCompleteBackdrop`); o único
 * movimento é o card atravessando a tela desde FORA da viewport, pela esquerda.
 */
export default function ServiceCompleteScene({ serviceId }: ServiceCompleteSceneProps) {
  const { goToEntry, finalizeProject } = useBuilder();
  const { isTransitioning, markForward } = useSceneNavigation();
  const reducedMotion = useReducedMotion();
  const cardRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [leaving, setLeaving] = useState(false);
  const titleId = useId();
  const tag = SHOWCASE_THEMES[serviceId].tag;

  useEffect(() => {
    // Toca ao CHEGAR nesta cena (o momento real da conclusão) — mesmo som de antes.
    playSound("service_complete");
  }, []);

  // Layout effect: posiciona o card fora da tela ANTES da primeira pintura (nunca aparece no lugar
  // final por um frame para depois "voltar" e entrar).
  useLayoutEffect(() => {
    const card = cardRef.current;
    const content = contentRef.current;
    if (!card || !content) return;
    if (reducedMotion) {
      gsap.set([card, content], { clearProps: "all" });
      return;
    }
    // Ponto de partida calculado: a borda DIREITA do card começa um pouco à esquerda da borda
    // esquerda da viewport — o card inteiro está fora da tela, e atravessa até a posição final.
    // Desconta um deslocamento que já esteja aplicado (efeito re-executado no meio da entrada),
    // para medir sempre a partir da posição FINAL do card.
    const appliedX = Number(gsap.getProperty(card, "x")) || 0;
    const startX = -(card.getBoundingClientRect().right - appliedX + 48);
    const timeline = gsap.timeline({ delay: ENTRY_DELAY });
    timeline
      .fromTo(card, { x: startX, opacity: 1 }, { x: 0, duration: ENTRY_DURATION, ease: ENTRY_EASE, clearProps: "transform" })
      // Microentrada interna, curta, já com o card quase parado.
      .fromTo(content, { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out", clearProps: "all" }, ENTRY_DURATION * 0.62);
    return () => {
      // `revert` (e não só `kill`): devolve o card ao estado de antes da entrada — se o efeito
      // rodar de novo, a próxima medição parte da posição final, nunca de "já fora da tela".
      timeline.revert();
    };
  }, [reducedMotion]);

  const locked = leaving || isTransitioning;

  function handleAddAnother(event: MouseEvent) {
    if (locked || isRepeatedClick(event)) return;
    setLeaving(true);
    markForward();
    goToEntry();
  }

  function handleViewSummary(event: MouseEvent) {
    if (locked || isRepeatedClick(event)) return;
    setLeaving(true);
    markForward();
    finalizeProject();
  }

  return (
    <div className={styles.scene}>
      <section ref={cardRef} className={styles.card} aria-labelledby={titleId}>
        <div className={styles.titlebar}>
          <span className={styles.dots} aria-hidden="true">
            <span className={styles.dotRed} />
            <span className={styles.dotYellow} />
            <span className={styles.dotGreen} />
          </span>
          <span className={styles.tag}>{tag}</span>
        </div>

        <div ref={contentRef} className={styles.content}>
          <Image
            src="/assets/builder/service-complete/pixel-check.png"
            alt=""
            width={221}
            height={216}
            className={styles.check}
            sizes="96px"
            priority
          />
          <h2 id={titleId} className={styles.title}>
            Serviço <span className={styles.titleBreak}>adicionado!</span>
          </h2>
          <p className={styles.subtitle}>Seu serviço de {tag} foi configurado com sucesso.</p>

          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={handleAddAnother} disabled={locked}>
              Adicionar outro serviço
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 12h15M13 5.5 19.5 12 13 18.5" />
              </svg>
            </button>
            <button type="button" className={styles.secondary} onClick={handleViewSummary} disabled={locked}>
              Ver resumo do projeto
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * Cenário fixo da tela "Serviço adicionado": preto, um brilho de estrelas bem discreto no alto e o
 * terreno atravessando a base da viewport. Montado pelo `BuilderShell` FORA da transição de cena
 * (mesmo motivo dos fundos das perguntas: um `position: fixed` dentro de um elemento animado com
 * `transform` passaria a andar junto com ele). Nunca anima — o cenário já está lá; quem entra é o
 * card.
 */
export function ServiceCompleteBackdrop() {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <Image
        src="/assets/builder/service-complete/stars-green.png"
        alt=""
        width={450}
        height={185}
        className={styles.stars}
        sizes="450px"
      />
      <Image
        src="/assets/builder/service-complete/terrain.png"
        alt=""
        width={1536}
        height={289}
        className={styles.terrain}
        sizes="(max-width: 640px) 220vw, 110vw"
        priority
      />
    </div>
  );
}
