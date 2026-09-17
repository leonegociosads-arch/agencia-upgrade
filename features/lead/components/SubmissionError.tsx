"use client";

import { useBuilder } from "@/features/builder/state/BuilderContext";
import Alert from "@/features/design-system/components/Alert";
import Button from "@/features/design-system/components/Button";
import styles from "./SubmissionError.module.css";

const DEFAULT_MESSAGE = "Não conseguimos enviar agora. Seus dados continuam preenchidos.";

/** Estado `"error"` (WF-12) — preparado mesmo sem backend real, para quando a Etapa 13 acrescentar
 * uma chamada de rede que pode genuinamente falhar (erro de rede, do servidor, timeout). "Tentar
 * novamente" volta para o formulário de contato, com o rascunho intacto (`LeadContext`, nunca
 * tocado por esta tela); "Voltar" volta ao Resumo do Projeto — nenhuma das duas ações apaga nada. */
export default function SubmissionError() {
  const { state, retrySubmit, backToReview } = useBuilder();
  const message = state.error?.message ?? DEFAULT_MESSAGE;

  return (
    <div className={styles.wrapper}>
      <Alert tone="error">{message}</Alert>
      <div className={styles.actions}>
        <Button onClick={retrySubmit}>Tentar novamente</Button>
        <Button variant="secondary" onClick={backToReview}>
          Voltar
        </Button>
      </div>
    </div>
  );
}
