"use client";

import Heading from "@/features/design-system/components/Heading";
import Button from "@/features/design-system/components/Button";
import TrashIcon from "@/features/design-system/components/TrashIcon";
import { playSound } from "@/features/design-system/motion/sound";
import type { ServiceReviewSummary } from "../types";
import styles from "./ProjectReviewService.module.css";

interface ProjectReviewServiceProps {
  summary: ServiceReviewSummary;
  onEdit: () => void;
  onRemove: () => void;
}

/**
 * Um bloco de serviço no Resumo do Projeto (Etapa 11) — resumo DETALHADO (lista completa de
 * `summary.items`, sem o corte de 3 linhas do Meu Upgrade). Recebe dados já prontos
 * (`buildProjectSummary`), nunca decide o que mostrar sozinho.
 *
 * Não reaproveita `MyUpgradeItem`: a lista de itens aqui é completa e em formato rótulo/valor
 * empilhado (o próprio mockup desta fase), enquanto o Meu Upgrade mostra "Pergunta: Resposta" em
 * uma linha só e corta em 3 — visualmente são coisas diferentes por design, não uma duplicação
 * acidental (docs/IMPLEMENTATION-STAGE-11.md, Seção "Componentes"). "Editar" tem mais destaque
 * visual que "Remover", como pedido nesta fase.
 */
export default function ProjectReviewService({ summary, onEdit, onRemove }: ProjectReviewServiceProps) {
  const headingId = `review-service-${summary.serviceId}`;

  return (
    <section className={styles.block} aria-labelledby={headingId}>
      <Heading variant="h3" as="h3" id={headingId} className={styles.title}>
        {summary.title}
      </Heading>

      {summary.items.length === 0 ? (
        <p className={styles.emptyItem}>Configuração salva.</p>
      ) : (
        <dl className={styles.items}>
          {summary.items.map((entry) => (
            <div key={entry.question} className={styles.item}>
              <dt className={styles.label}>{entry.question}</dt>
              <dd className={styles.value}>{entry.answer}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className={styles.actions}>
        <Button variant="secondary" size="sm" onClick={onEdit} aria-label={`Editar ${summary.title}`}>
          Editar
        </Button>
        <button
          type="button"
          className={styles.removeButton}
          onClick={() => {
            playSound("ui_press");
            onRemove();
          }}
          aria-label={`Remover ${summary.title}`}
        >
          <span className={styles.removeIcon}>
            <TrashIcon />
          </span>
          Remover
        </button>
      </div>
    </section>
  );
}
