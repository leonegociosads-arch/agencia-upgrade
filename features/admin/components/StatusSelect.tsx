"use client";

import { useState, useTransition, type ChangeEvent } from "react";
import { updateLeadStatus } from "../actions/updateLeadStatus";
import { LEAD_STATUSES, LEAD_STATUS_LABELS, type LeadStatus } from "../logic/leadStatus";
import Select from "@/features/design-system/components/Select";
import Text from "@/features/design-system/components/Text";
import Alert from "@/features/design-system/components/Alert";
import styles from "./StatusSelect.module.css";

/**
 * Muda automaticamente ao selecionar — "ação clara e feedback rápido" (`docs/ADMIN-CRM.md`).
 * Otimista: a UI já mostra o novo status enquanto a Server Action roda; se ela falhar (ex.: status
 * rejeitado no servidor), volta pro valor anterior e mostra o motivo — nunca finge sucesso.
 */
export default function StatusSelect({ leadId, initialStatus }: { leadId: string; initialStatus: LeadStatus }) {
  const [status, setStatus] = useState<LeadStatus>(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const newStatus = event.target.value as LeadStatus;
    const previous = status;
    setStatus(newStatus);
    setError(null);
    setJustSaved(false);

    startTransition(async () => {
      const result = await updateLeadStatus(leadId, newStatus);
      if (!result.ok) {
        setStatus(previous);
        setError(result.message ?? "Não foi possível atualizar o status.");
        return;
      }
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    });
  }

  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>
        Status
        <Select value={status} onChange={handleChange} disabled={isPending}>
          {LEAD_STATUSES.map((value) => (
            <option key={value} value={value}>
              {LEAD_STATUS_LABELS[value]}
            </option>
          ))}
        </Select>
      </label>
      {isPending && (
        <Text as="span" size="caption" color="secondary">
          Salvando...
        </Text>
      )}
      {justSaved && (
        <Text as="span" size="caption" color="success">
          Salvo.
        </Text>
      )}
      {error && (
        <div className={styles.error}>
          <Alert tone="error">{error}</Alert>
        </div>
      )}
    </div>
  );
}
