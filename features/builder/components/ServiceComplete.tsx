"use client";

import { buildServiceSummary } from "../logic/buildServiceSummary";
import { SERVICES } from "../data/services";
import { useBuilder } from "../state/BuilderContext";
import type { ServiceId } from "../types";
import styles from "./ServiceComplete.module.css";

interface ServiceCompleteProps {
  serviceId: ServiceId;
}

/**
 * Tela de conclusão de um serviço NOVO (WF-05). CTA principal "Finalizar meu projeto" à frente
 * de "Adicionar outro serviço" — hierarquia decidida na correção da Fase 4
 * (docs/DECISIONS.md). O envio/resumo real fica para a Etapa 9+; aqui o CTA principal apenas
 * volta ao "Meu Upgrade", que é onde o fluxo de finalização vai começar.
 */
export default function ServiceComplete({ serviceId }: ServiceCompleteProps) {
  const { state, goToEntry } = useBuilder();
  const item = state.confirmedServices[serviceId];
  const summary = item ? buildServiceSummary(serviceId, item.answers) : [];

  return (
    <div className={styles.wrapper}>
      <div className={styles.check}>✓</div>
      <h2 className={styles.title}>{SERVICES[serviceId].label} adicionado ao seu Upgrade</h2>

      <div className={styles.summary}>
        {summary.map((entry) => (
          <div key={entry.question} className={styles.summaryItem}>
            <span className={styles.summaryQuestion}>{entry.question}</span>
            <span className={styles.summaryAnswer}>{entry.answer}</span>
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.primaryButton} onClick={goToEntry}>
          Ver Meu Upgrade / Finalizar
        </button>
        <button type="button" className={styles.secondaryButton} onClick={goToEntry}>
          Adicionar outro serviço
        </button>
      </div>
    </div>
  );
}
