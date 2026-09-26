"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import gsap from "gsap";
import { canFinalizeProject, useBuilder } from "../state/BuilderContext";
import { buildProjectSummary } from "../logic/buildProjectSummary";
import { isRepeatedClick } from "../logic/repeatedClick";
import { SERVICE_IDS } from "../data/services";
import { trackEvent, trackFunnelMilestone } from "@/lib/analytics/trackEvent";
import { useSceneNavigation } from "@/features/design-system/motion/SceneTransition";
import { useEnabledPulse } from "@/features/design-system/motion/useEnabledPulse";
import { useReducedMotion } from "@/features/design-system/motion/useReducedMotion";
import { cx } from "@/features/design-system/utils/cx";
import ProjectReviewService, { SUMMARY_TITLES } from "./ProjectReviewService";
import RemoveServiceDialog from "./RemoveServiceDialog";
import EmptyUpgradeState from "./EmptyUpgradeState";
import type { ServiceId } from "../types";
import styles from "./ProjectReview.module.css";

/**
 * Resumo do Projeto — WF-09 (Etapa 11), aberto por "Ver resumo do projeto" (tela "Serviço
 * adicionado") ou por "Finalizar projeto" (Meu Upgrade). Painel branco estilo janela sobre o fundo
 * escuro, na direção de arte aprovada ("Seu Upgrade está quase pronto!").
 *
 * Não guarda estado próprio dos serviços: renderiza exclusivamente `confirmedServices` (via
 * `buildProjectSummary`) — só os serviços realmente configurados, na ordem em que entraram. As
 * ações usam o que o Builder já tinha:
 * - "Editar" → `startEditingService(id, { returnStep: "reviewing" })`: reabre o MESMO serviço com as
 *   respostas preenchidas e, ao salvar ou cancelar, volta para cá. `confirmedServices` é um objeto
 *   por categoria, então editar sempre substitui o item existente — nunca duplica.
 * - "+ Adicionar outro serviço" → `goToEntry()`: volta à escolha de categoria sem apagar nada
 *   (nunca o "Começar de novo"). Some quando as três categorias já estão no projeto — não existe
 *   botão que leve a uma escolha vazia.
 * - "Quero receber um retorno" → `continueToContact()`: o formulário de contato de sempre.
 * - Remover (lixeira) → o mesmo diálogo de confirmação de antes.
 */
export default function ProjectReview() {
  const { state, startEditingService, removeService, goToEntry, continueToContact } = useBuilder();
  const { isTransitioning, markForward, markBackward } = useSceneNavigation();
  const reducedMotion = useReducedMotion();
  const summaries = buildProjectSummary(state.confirmedServices);
  const [pendingRemoval, setPendingRemoval] = useState<ServiceId | null>(null);
  const canContinue = canFinalizeProject(state) && !isTransitioning;
  const continuePulsing = useEnabledPulse(canContinue);
  const canAddAnotherService = SERVICE_IDS.some((id) => state.confirmedServices[id] === undefined);
  const titleId = useId();
  const panelRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // `upgrade_reviewed` (Fase 17) — dispara ao chegar no Resumo, uma vez por sessão
    // (`trackFunnelMilestone`); um refresh nesta tela nunca conta uma segunda vez.
    const serviceIds = summaries.map((summary) => summary.serviceId);
    trackFunnelMilestone("upgrade_reviewed", { serviceCount: serviceIds.length, serviceIds });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só no mount desta tela, de propósito.
  }, []);

  // Microentrada discreta: o painel sobe um pouco e aparece, depois os cards em sequência curta.
  // Layout effect + `revert` na limpeza: posiciona antes da primeira pintura e, se o efeito rodar de
  // novo, parte sempre do estado final (mesmo cuidado da tela "Serviço adicionado").
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel || reducedMotion) return;
    const cards = panel.querySelectorAll("[data-summary-card]");
    const timeline = gsap.timeline();
    // `clearProps` no fim: a inclinação do painel vem do CSS (e muda no mobile) — um `transform`
    // deixado inline pela entrada travaria a inclinação do desktop ao girar o celular/redimensionar.
    timeline.from(panel, { opacity: 0, y: 15, duration: 0.45, ease: "power2.out", clearProps: "transform,opacity" });
    if (cards.length > 0) {
      timeline.from(cards, { opacity: 0, y: 12, duration: 0.35, stagger: 0.07, ease: "power2.out", clearProps: "transform,opacity" }, 0.18);
    }
    return () => {
      timeline.revert();
    };
    // Só na chegada à tela — remover um serviço aqui não repete a entrada.
  }, [reducedMotion]);

  function handleRemoveConfirmed() {
    if (!pendingRemoval) return;
    trackEvent("service_removed", { serviceId: pendingRemoval });
    removeService(pendingRemoval);
    setPendingRemoval(null);
  }

  function handleAddAnother(event: MouseEvent) {
    if (isTransitioning || isRepeatedClick(event)) return;
    markBackward();
    goToEntry();
  }

  function handleContinue(event: MouseEvent) {
    if (!canContinue || isRepeatedClick(event)) return;
    markForward();
    continueToContact();
  }

  const pendingLabel = pendingRemoval ? SUMMARY_TITLES[pendingRemoval] : undefined;

  return (
    <div className={styles.scene}>
      <div className={styles.stage}>
        <Image
          src="/assets/builder/project-summary/summary-clipboard.png"
          alt=""
          aria-hidden="true"
          width={161}
          height={206}
          className={styles.clipboard}
          sizes="(max-width: 640px) 64px, 120px"
        />

        <section ref={panelRef} className={styles.panel} aria-labelledby={titleId}>
          <div className={styles.titlebar} aria-hidden="true">
            <span className={styles.dots}>
              <span className={styles.dotRed} />
              <span className={styles.dotYellow} />
              <span className={styles.dotGreen} />
            </span>
            <span className={styles.tag}>Resumo do projeto</span>
          </div>

          <div className={styles.content}>
            <h2 id={titleId} className={styles.title}>
              Seu Upgrade <span className={styles.titleLine}>está quase pronto!</span>
            </h2>
            <Image
              src="/assets/builder/project-summary/summary-brush-stroke.png"
              alt=""
              aria-hidden="true"
              width={131}
              height={20}
              className={styles.brush}
            />
            <p className={styles.subtitle}>
              Confira abaixo os serviços escolhidos. Você pode editar ou adicionar outros antes de enviar.
            </p>

            {summaries.length === 0 ? (
              // Defensivo: remover o último serviço já leva o reducer de volta à escolha de categoria
              // sozinho (REMOVE_SERVICE) — esta tela nunca deveria ficar vazia, mas não quebra se ficar.
              <EmptyUpgradeState onAddService={goToEntry} />
            ) : (
              <>
                <div className={styles.list}>
                  {summaries.map((summary) => (
                    <ProjectReviewService
                      key={summary.serviceId}
                      summary={summary}
                      onEdit={() => startEditingService(summary.serviceId, { returnStep: "reviewing" })}
                      onRemove={() => setPendingRemoval(summary.serviceId)}
                    />
                  ))}
                </div>

                <div className={styles.actions}>
                  {canAddAnotherService && (
                    <button type="button" className={styles.addButton} onClick={handleAddAnother} disabled={isTransitioning}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      Adicionar outro serviço
                    </button>
                  )}
                  <button
                    type="button"
                    className={cx(styles.ctaButton, continuePulsing && styles.ctaPulse)}
                    onClick={handleContinue}
                    disabled={!canContinue}
                  >
                    Quero receber um retorno
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 12h15M13 5.5 19.5 12 13 18.5" />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        </section>

        <Image
          src="/assets/builder/project-summary/summary-mascot.png"
          alt=""
          aria-hidden="true"
          width={183}
          height={207}
          className={styles.mascot}
          sizes="(max-width: 640px) 56px, 112px"
        />
      </div>

      {pendingRemoval && pendingLabel && (
        <RemoveServiceDialog serviceLabel={pendingLabel} onCancel={() => setPendingRemoval(null)} onConfirm={handleRemoveConfirmed} />
      )}
    </div>
  );
}
