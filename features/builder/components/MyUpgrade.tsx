"use client";

import { useState } from "react";
import { canFinalizeProject, hasPendingDraft, useBuilder } from "../state/BuilderContext";
import { SERVICES } from "../data/services";
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
export default function MyUpgrade() {
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

  if (items.length === 0) {
    return (
      <div className={styles.panel}>
        <h2 className={styles.title}>Meu Upgrade</h2>
        <EmptyUpgradeState onAddService={goToEntry} />
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>Meu Upgrade</h2>
      <p className={styles.count}>
        {items.length} {items.length === 1 ? "serviço" : "serviços"}
      </p>

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
            <button type="button" className={styles.secondaryButton} onClick={() => setShowPendingDraftNotice(false)}>
              Continuar edição
            </button>
            <button type="button" className={styles.linkButton} onClick={handleDiscardDraft}>
              Descartar alterações
            </button>
          </div>
        </div>
      )}

      <div className={styles.footer}>
        <button type="button" className={styles.secondaryButton} onClick={goToEntry}>
          + Adicionar outro serviço
        </button>
        <button
          type="button"
          className={styles.primaryButton}
          disabled={!canFinalizeProject(state)}
          onClick={handleFinalizeClick}
        >
          Finalizar projeto
        </button>
      </div>
    </div>
  );
}
