import { JOURNEY_STEPS } from "../data/journeySteps";
import type { BuilderStep } from "../types";

export interface JourneyStage {
  /** Índice (0–3) do passo atual em `JOURNEY_STEPS`; `JOURNEY_STEPS.length` quando tudo foi enviado. */
  index: number;
  /** Rótulo contextual do passo atual (o título de "Como funciona", ou "Projeto enviado"). */
  label: string;
  total: number;
}

/** Rótulo quando a jornada terminou (projeto enviado com sucesso). */
export const JOURNEY_DONE_LABEL = "Projeto enviado";

/**
 * Em qual dos 4 passos da Home ("Como funciona") o visitante está, a partir do `step` do Builder —
 * o progresso GERAL único do Builder. Dentro do passo "Responda", cada serviço tem também a sua
 * barra própria (`getQuestionProgress`). Sem números na tela (decisão da Fase 3: rótulo contextual +
 * barra não numérica); o número só existe para leitores de tela.
 */
export function getJourneyStage(step: BuilderStep): JourneyStage {
  const total = JOURNEY_STEPS.length;
  const at = (index: number): JourneyStage => ({ index, label: JOURNEY_STEPS[index].title, total });
  switch (step) {
    case "idle":
    case "choosing_service":
      return at(0);
    case "configuring":
    case "service_complete":
      return at(1);
    case "reviewing":
      return at(2);
    case "contact":
    case "submitting":
    case "error":
      return at(3);
    case "success":
      return { index: total, label: JOURNEY_DONE_LABEL, total };
  }
}
