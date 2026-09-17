"use client";

import { useState } from "react";
import { buildServiceSummary } from "../logic/buildServiceSummary";
import { SERVICES } from "../data/services";
import Text from "@/features/design-system/components/Text";
import TrashIcon from "@/features/design-system/components/TrashIcon";
import { playSound } from "@/features/design-system/motion/sound";
import type { ServiceId, UpgradeItem } from "../types";
import styles from "./MyUpgradeItem.module.css";

interface MyUpgradeItemProps {
  serviceId: ServiceId;
  item: UpgradeItem;
  onEdit: () => void;
  onRemove: () => void;
}

/** Resumo curto por padrão: no máximo isto visível de cara, o resto some atrás de "+ N mais"
 * (expansível — briefing Microinterações, Seção 17). O detalhamento completo continua pertencendo
 * ao Resumo final (Etapa 11). */
const MAX_VISIBLE_SUMMARY_ITEMS = 3;

/**
 * Um item do "Meu Upgrade" (WF-06). Renderiza sempre a partir de `confirmedServices` — nunca
 * recebe um rascunho. Usa `buildServiceSummary` (Etapa 9) como única fonte do resumo; nunca
 * mostra um id interno de pergunta/resposta (`site_tipo`, `trafego_investimento`...), só os
 * textos já traduzidos que a função retorna.
 */
export default function MyUpgradeItem({ serviceId, item, onEdit, onRemove }: MyUpgradeItemProps) {
  const [expanded, setExpanded] = useState(false);
  const service = SERVICES[serviceId];
  if (!service) return null; // guard de desenvolvimento: serviceId desconhecido nunca deveria chegar aqui.

  const summary = buildServiceSummary(serviceId, item.answers);
  const visible = expanded ? summary : summary.slice(0, MAX_VISIBLE_SUMMARY_ITEMS);
  const hiddenCount = summary.length - visible.length;

  return (
    <div className={styles.item}>
      <div className={styles.info}>
        <Text as="span" weight="semibold" className={styles.title}>
          {service.label}
        </Text>

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
        {hiddenCount > 0 && (
          <button type="button" className={styles.moreButton} onClick={() => setExpanded(true)}>
            + {hiddenCount} mais
          </button>
        )}
        {expanded && summary.length > MAX_VISIBLE_SUMMARY_ITEMS && (
          <button type="button" className={styles.moreButton} onClick={() => setExpanded(false)}>
            Mostrar menos
          </button>
        )}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.editButton} onClick={onEdit} aria-label={`Editar ${service.label}`}>
          Editar
        </button>
        <button
          type="button"
          className={styles.removeButton}
          onClick={() => {
            playSound("ui_press");
            onRemove();
          }}
          aria-label={`Remover ${service.label}`}
        >
          <span className={styles.removeIcon}>
            <TrashIcon />
          </span>
          Remover
        </button>
      </div>
    </div>
  );
}
