"use client";

import { Fragment, type MouseEvent } from "react";
import ServiceIcon from "@/features/design-system/components/ServiceIcon";
import TrashIcon from "@/features/design-system/components/TrashIcon";
import { playSound } from "@/features/design-system/motion/sound";
import { isRepeatedClick } from "../logic/repeatedClick";
import type { ServiceId, ServiceReviewSummary } from "../types";
import styles from "./ProjectReviewService.module.css";

/** Nome da categoria como aparece no card do Resumo (direção de arte aprovada: "Site", "Tráfego
 * Pago", "Design e Social Media") — os rótulos de `SERVICES` ("Criar um site"…) são chamadas de
 * ação da tela de escolha, não nomes de categoria. */
export const SUMMARY_TITLES: Readonly<Record<ServiceId, string>> = {
  site: "Site",
  trafego: "Tráfego Pago",
  design: "Design e Social Media",
};

interface ProjectReviewServiceProps {
  summary: ServiceReviewSummary;
  onEdit: () => void;
  onRemove: () => void;
}

/**
 * Card de um serviço no Resumo do Projeto — um por serviço REALMENTE configurado (nunca os três
 * fixos da arte de referência). Recebe dados prontos (`buildProjectSummary`, a mesma tradução de
 * respostas em rótulos usada no resto do Builder): a linha de baixo são as respostas reais, em
 * rótulo humano, separadas por "•" — cada uma num `<span>` próprio, então um valor ausente
 * simplesmente não aparece (nunca "undefined" nem separador sobrando).
 *
 * "Editar" é a ação principal (botão escuro, como na arte); "Remover" continua existindo como um
 * botão pequeno de lixeira ao lado — funcionalidade que já existia e não pode sumir.
 */
export default function ProjectReviewService({ summary, onEdit, onRemove }: ProjectReviewServiceProps) {
  const headingId = `review-service-${summary.serviceId}`;
  const title = SUMMARY_TITLES[summary.serviceId];

  function handleEdit(event: MouseEvent) {
    if (isRepeatedClick(event)) return;
    onEdit();
  }

  return (
    <article className={styles.card} aria-labelledby={headingId} data-summary-card>
      <span className={styles.icon} aria-hidden="true">
        <ServiceIcon serviceId={summary.serviceId} />
      </span>

      <div className={styles.body}>
        <h3 id={headingId} className={styles.title}>
          {title}
        </h3>
        {summary.items.length === 0 ? (
          <p className={styles.answers}>Configuração salva.</p>
        ) : (
          <p className={styles.answers}>
            {summary.items.map((entry, index) => (
              <Fragment key={entry.question}>
                {index > 0 && (
                  <span className={styles.separator} aria-hidden="true">
                    •
                  </span>
                )}
                <span className={styles.answer}>{entry.answer}</span>
              </Fragment>
            ))}
          </p>
        )}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.edit} onClick={handleEdit} aria-label={`Editar ${title}`}>
          Editar
        </button>
        <button
          type="button"
          className={styles.remove}
          onClick={() => {
            playSound("ui_press");
            onRemove();
          }}
          aria-label={`Remover ${title}`}
          title="Remover"
        >
          <TrashIcon />
        </button>
      </div>
    </article>
  );
}
