"use client";

import { useState } from "react";
import { canFinalizeProject, hasPendingDraft, useBuilder } from "../state/BuilderContext";
import { SERVICES } from "../data/services";
import { trackEvent } from "@/lib/analytics/trackEvent";
import Heading from "@/features/design-system/components/Heading";
import Text from "@/features/design-system/components/Text";
import Button from "@/features/design-system/components/Button";
import { playSound } from "@/features/design-system/motion/sound";
import MyUpgradeItem from "./MyUpgradeItem";
import EmptyUpgradeState from "./EmptyUpgradeState";
import RemoveServiceDialog from "./RemoveServiceDialog";
import type { ServiceId, UpgradeItem } from "../types";
import styles from "./MyUpgrade.module.css";

/**
 * "Meu Upgrade" (WF-06) — SEMPRE renderiza `confirmedServices`, nunca `serviceDraft`. Enquanto um
 * serviço está em edição, este painel continua mostrando a versão confirmada (a antiga) até o
 * salvamento; é o `QuestionRenderer`, não este componente, quem lê o rascunho.
 *
 * Este painel fica visível ao mesmo tempo que a tela de perguntas (é uma seção persistente, não
 * um modal/rota) — por isso "editar" e "remover" nunca precisam de um mecanismo de "retorno": ao
 * salvar ou cancelar uma edição, o próprio painel, que nunca saiu da tela, já reflete o resultado.
 */
interface MyUpgradeProps {
  /** Fecha o drawer (Fase 19) — opcional para não quebrar quem ainda monta `MyUpgrade` sem um
   * container de drawer ao redor (ex.: um teste isolado do componente). */
  onClose?: () => void;
}

export default function MyUpgrade({ onClose }: MyUpgradeProps) {
  const { state, startEditingService, removeService, goToEntry, finalizeProject, cancelServiceDraft } = useBuilder();
  // Ordem previsível: `confirmedServices` é um objeto simples, e a ordem de suas chaves de string
  // já é a ordem de inserção (a primeira vez que cada `serviceId` foi confirmado) — editar um
  // serviço depois não muda sua posição, então isto já é "ordem em que foram adicionados" sem
  // precisar de nenhuma lista de ordenação à parte.
  const items = Object.entries(state.confirmedServices) as [ServiceId, UpgradeItem][];

  const [pendingRemoval, setPendingRemoval] = useState<ServiceId | null>(null);
  const [showPendingDraftNotice, setShowPendingDraftNotice] = useState(false);

  function handleRemoveConfirmed() {
    if (!pendingRemoval) return;
    trackEvent("service_removed", { serviceId: pendingRemoval });
    removeService(pendingRemoval);
    setPendingRemoval(null);
  }

  function handleFinalizeClick() {
    if (hasPendingDraft(state)) {
      setShowPendingDraftNotice(true);
      return;
    }
    finalizeProject();
  }

  function handleDiscardDraft() {
    cancelServiceDraft();
    setShowPendingDraftNotice(false);
  }

  const header = (
    <div className={styles.header}>
      <div>
        <Heading variant="h3" as="h2" className={styles.title}>
          Meu Upgrade
        </Heading>
        {items.length > 0 && (
          <Text as="span" size="caption" color="secondary">
            {items.length} {items.length === 1 ? "serviço" : "serviços"}
          </Text>
        )}
      </div>
      {onClose && (
        <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Fechar Meu Upgrade">
          ×
        </button>
      )}
    </div>
  );

  if (items.length === 0) {
    return (
      <div className={styles.panel} data-testid="my-upgrade-panel">
        {header}
        <EmptyUpgradeState onAddService={goToEntry} />
      </div>
    );
  }

  return (
    <div className={styles.panel} data-testid="my-upgrade-panel">
      {header}

      {items.map(([serviceId, item]) => (
        <MyUpgradeItem
          key={serviceId}
          serviceId={serviceId}
          item={item}
          onEdit={() => startEditingService(serviceId)}
          onRemove={() => setPendingRemoval(serviceId)}
        />
      ))}

      {pendingRemoval && (
        <RemoveServiceDialog
          serviceLabel={SERVICES[pendingRemoval].label}
          onCancel={() => setPendingRemoval(null)}
          onConfirm={handleRemoveConfirmed}
        />
      )}

      {showPendingDraftNotice && (
        <div className={styles.draftNotice} role="alertdialog" aria-labelledby="pending-draft-title">
          <p id="pending-draft-title" className={styles.draftNoticeMessage}>
            Você está configurando ou editando um serviço. Termine antes de finalizar o projeto.
          </p>
          <div className={styles.draftNoticeActions}>
            <Button variant="secondary" size="sm" onClick={() => setShowPendingDraftNotice(false)}>
              Continuar edição
            </Button>
            <button type="button" className={styles.linkButton} onClick={handleDiscardDraft}>
              Descartar alterações
            </button>
          </div>
        </div>
      )}

      <div className={styles.footer}>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => {
            playSound("ui_press");
            goToEntry();
          }}
        >
          + Adicionar outro serviço
        </Button>
        <Button
          fullWidth
          disabled={!canFinalizeProject(state)}
          onClick={() => {
            playSound("ui_press");
            handleFinalizeClick();
          }}
        >
          Finalizar projeto
        </Button>
      </div>
    </div>
  );
}
