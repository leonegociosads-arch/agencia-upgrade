"use client";

import { useEffect, useRef } from "react";
import Button from "@/features/design-system/components/Button";
import { playSound } from "@/features/design-system/motion/sound";
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

  // Etapa 31 (Testes Funcionais, briefing Seção 93) — mesmo gap encontrado em `Drawer.tsx`: Esc
  // fecha (equivalente a "Cancelar", a ação seguindo o mesmo caminho seguro de sempre).
  //
  // Bug real encontrado ao testar: este diálogo é renderizado DENTRO do Drawer "Meu Upgrade"
  // (também `Drawer.tsx` escuta Esc). Sem a fase de captura + `stopPropagation`, um único Esc
  // disparava os DOIS listeners de `document` — fechava o diálogo E o drawer inteiro junto.
  // Listener na FASE DE CAPTURA sempre roda antes de um listener em fase de bolha no mesmo alvo
  // (aqui, `document`), então `stopPropagation` aqui impede o handler do Drawer de sequer rodar.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      onCancel();
    }
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [onCancel]);

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
        <Button
          ref={cancelButtonRef}
          variant="secondary"
          size="sm"
          onClick={() => {
            playSound("ui_press");
            onCancel();
          }}
        >
          Cancelar
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => {
            playSound("ui_press");
            onConfirm();
          }}
        >
          Remover
        </Button>
      </div>
    </div>
  );
}
