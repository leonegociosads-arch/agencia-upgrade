import { JOURNEY_STEPS } from "../data/journeySteps";
import { getJourneyStage } from "../logic/getJourneyStage";
import { cx } from "@/features/design-system/utils/cx";
import type { BuilderStep } from "../types";
import styles from "./BuilderJourneyProgress.module.css";

interface BuilderJourneyProgressProps {
  step: BuilderStep;
  className?: string;
}

/**
 * Progresso GERAL do Builder: o nome do passo atual (um dos 4 passos que a Home promete em "Como
 * funciona") + 4 traços que avançam de verdade a cada fase (escolha → perguntas → resumo → envio).
 * Sem números na tela (decisão da Fase 3: rótulo contextual + barra não numérica); leitores de tela
 * ouvem também "passo X de 4". Usado pelos DOIS cabeçalhos do Builder (`ServiceSelectorHeader` e
 * `BuilderNavigation`), para a pessoa nunca ver dois sistemas diferentes.
 */
export default function BuilderJourneyProgress({ step, className }: BuilderJourneyProgressProps) {
  const stage = getJourneyStage(step);
  const done = stage.index >= stage.total;
  const srText = done
    ? `${stage.label}: todos os passos concluídos`
    : `Passo ${stage.index + 1} de ${stage.total}: ${stage.label}`;

  return (
    <div className={cx(styles.root, className)} data-journey-stage={stage.index}>
      <span className={styles.label} aria-hidden="true">
        {stage.label}
      </span>
      <span className={styles.srOnly}>{srText}</span>
      <div className={styles.track} aria-hidden="true">
        {JOURNEY_STEPS.map((journeyStep, index) => (
          <span
            key={journeyStep.title}
            className={cx(styles.segment, index < stage.index && styles.segmentDone, index === stage.index && styles.segmentCurrent)}
          />
        ))}
      </div>
    </div>
  );
}
