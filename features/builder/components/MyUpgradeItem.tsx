"use client";

import { buildServiceSummary } from "../logic/buildServiceSummary";
import { SERVICES } from "../data/services";
import type { ServiceId, UpgradeItem } from "../types";
import styles from "./MyUpgradeItem.module.css";

interface MyUpgradeItemProps {
  serviceId: ServiceId;
  item: UpgradeItem;
  onEdit: () => void;
  onRemove: () => void;
}

/** Resumo curto: no máximo isto, o detalhamento completo pertence ao Resumo final (Etapa 11). */
const MAX_VISIBLE_SUMMARY_ITEMS = 3;

/**
 * Um item do "Meu Upgrade" (WF-06). Renderiza sempre a partir de `confirmedServices` — nunca
 * recebe um rascunho. Usa `buildServiceSummary` (Etapa 9) como única fonte do resumo; nunca
 * mostra um id interno de pergunta/resposta (`site_tipo`, `trafego_investimento`...), só os
 * textos já traduzidos que a função retorna.
 */
export default function MyUpgradeItem({ serviceId, item, onEdit, onRemove }: MyUpgradeItemProps) {
  const service = SERVICES[serviceId];
  if (!service) return null; // guard de desenvolvimento: serviceId desconhecido nunca deveria chegar aqui.

  const summary = buildServiceSummary(serviceId, item.answers);
  const visible = summary.slice(0, MAX_VISIBLE_SUMMARY_ITEMS);
  const hiddenCount = summary.length - visible.length;

  return (
    <div className={styles.item}>
      <div className={styles.info}>
        <span className={styles.title}>{service.label}</span>

        {visible.length === 0 ? (
          <span className={styles.summaryLine}>Configuração salva.</span>
        ) : (
          <ul className={styles.summaryList}>
            {visible.map((entry) => (
              <li key={entry.question} className={styles.summaryLine}>
                {entry.question}: {entry.answer}
              </li>
            ))}
          </ul>
        )}
        {hiddenCount > 0 && <span className={styles.moreLabel}>+ {hiddenCount} mais</span>}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.linkButton} onClick={onEdit} aria-label={`Editar ${service.label}`}>
          Editar
        </button>
        <button type="button" className={styles.linkButton} onClick={onRemove} aria-label={`Remover ${service.label}`}>
          Remover
        </button>
      </div>
    </div>
  );
}
