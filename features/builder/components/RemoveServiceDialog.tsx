"use client";

import { useEffect, useRef } from "react";
import styles from "./RemoveServiceDialog.module.css";

interface RemoveServiceDialogProps {
  serviceLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * WF-08 (docs/WIREFRAME-SCREENS.md) — confirmação de remoção. Substitui o `window.confirm`
 * provisório da Etapa 8 (registrado em `docs/DECISIONS.md`) por um diálogo real e testável, sem
 * ainda ser a UI final. `role="alertdialog"` e foco inicial no botão seguro ("Cancelar") cobrem o
 * mínimo de acessibilidade pedido nesta etapa.
 */
export default function RemoveServiceDialog({ serviceLabel, onCancel, onConfirm }: RemoveServiceDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelButtonRef.current?.focus();
  }, []);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="remove-service-dialog-title"
      className={styles.dialog}
    >
      <p id="remove-service-dialog-title" className={styles.message}>
        Remover {serviceLabel} do seu Upgrade?
      </p>
      <div className={styles.actions}>
        <button type="button" ref={cancelButtonRef} className={styles.secondaryButton} onClick={onCancel}>
          Cancelar
        </button>
        <button type="button" className={styles.dangerButton} onClick={onConfirm}>
          Remover
        </button>
      </div>
    </div>
  );
}
