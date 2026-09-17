"use client";

import { useEffect, useState } from "react";
import { canFinalizeProject, useBuilder } from "../state/BuilderContext";
import { buildProjectSummary } from "../logic/buildProjectSummary";
import { trackEvent, trackFunnelMilestone } from "@/lib/analytics/trackEvent";
import Heading from "@/features/design-system/components/Heading";
import Text from "@/features/design-system/components/Text";
import Badge from "@/features/design-system/components/Badge";
import Button from "@/features/design-system/components/Button";
import { useSceneNavigation } from "@/features/design-system/motion/SceneTransition";
import { useEnabledPulse } from "@/features/design-system/motion/useEnabledPulse";
import { cx } from "@/features/design-system/utils/cx";
import ProjectReviewService from "./ProjectReviewService";
import RemoveServiceDialog from "./RemoveServiceDialog";
import EmptyUpgradeState from "./EmptyUpgradeState";
import type { ServiceId } from "../types";
import styles from "./ProjectReview.module.css";

/**
 * Resumo do Projeto — WF-09 (Etapa 11), alcançado a partir de "Finalizar projeto" no Meu Upgrade
 * (Etapa 10). Renderiza exclusivamente `confirmedServices`, via `buildProjectSummary` (nunca
 * `serviceDraft`) — o próprio reducer só permite chegar aqui sem nenhuma edição pendente
 * (`FINALIZE_PROJECT`), então esta tela nunca precisa se preocupar com rascunho.
 *
 * Editar a partir daqui usa o mesmo fluxo já existente (`startEditingService`), passando
 * `returnStep: "reviewing"` — o "returnContext" desta fase — para que salvar ou cancelar volte
 * para cá, não para o seletor (docs/IMPLEMENTATION-STAGE-11.md, Seção 10).
 */
export default function ProjectReview() {
  const { state, startEditingService, removeService, goToEntry, continueToContact } = useBuilder();
  const { isTransitioning, markForward, markBackward } = useSceneNavigation();
  const summaries = buildProjectSummary(state.confirmedServices);
  const [pendingRemoval, setPendingRemoval] = useState<ServiceId | null>(null);
  const canContinue = canFinalizeProject(state) && !isTransitioning;
  const continuePulsing = useEnabledPulse(canContinue);

  useEffect(() => {
    // `upgrade_reviewed` (Fase 17) — dispara ao chegar no Resumo, uma vez por sessão
    // (`trackFunnelMilestone`); um refresh nesta tela nunca conta uma segunda vez.
    const serviceIds = summaries.map((summary) => summary.serviceId);
    trackFunnelMilestone("upgrade_reviewed", { serviceCount: serviceIds.length, serviceIds });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só no mount desta tela, de propósito.
  }, []);

  function handleRemoveConfirmed() {
    if (!pendingRemoval) return;
    trackEvent("service_removed", { serviceId: pendingRemoval });
    removeService(pendingRemoval);
    setPendingRemoval(null);
  }

  // Defensivo: remover o último serviço a partir daqui já leva o reducer de volta para
  // "choosing_service" sozinho (Etapa 11, REMOVE_SERVICE) — esta tela nunca deveria renderizar
  // vazia na prática, mas não fica quebrada se algum dia acontecer.
  if (summaries.length === 0) {
    return (
      <div className={styles.wrapper}>
        <Badge tone="accent">Seu Upgrade</Badge>
        <Heading variant="h2" as="h2" className={styles.title}>
          Confira seu projeto
        </Heading>
        <EmptyUpgradeState onAddService={goToEntry} />
      </div>
    );
  }

  const pendingLabel = pendingRemoval ? summaries.find((summary) => summary.serviceId === pendingRemoval)?.title : undefined;

  return (
    <div className={styles.wrapper}>
      <Badge tone="accent">Seu Upgrade</Badge>
      <Heading variant="h2" as="h2" className={styles.title}>
        Confira seu projeto
      </Heading>
      <Text color="secondary" className={styles.subtitle}>
        Revise o que você configurou antes de continuar.
      </Text>

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

      {pendingRemoval && pendingLabel && (
        <RemoveServiceDialog
          serviceLabel={pendingLabel}
          onCancel={() => setPendingRemoval(null)}
          onConfirm={handleRemoveConfirmed}
        />
      )}

      <div className={styles.actions}>
        <Button
          variant="secondary"
          disabled={isTransitioning}
          onClick={() => {
            if (isTransitioning) return;
            markBackward();
            goToEntry();
          }}
        >
          Voltar
        </Button>
        <Button
          disabled={!canContinue}
          className={cx(continuePulsing && styles.continuePulse)}
          onClick={() => {
            if (!canContinue) return;
            markForward();
            continueToContact();
          }}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
