import { estimateSiteTotalSteps, getNextSiteQuestion } from "../data/site";
import { estimateTrafegoTotalSteps, getNextTrafegoQuestion } from "../data/trafego";
import { estimateDesignTotalSteps, getNextDesignQuestion } from "../data/design";
import type { BuilderAnswers, Question, ServiceId } from "../types";

/** Ponto único de despacho: qual pergunta mostrar a seguir, dado o estado atual do serviço. */
export function getNextQuestion(serviceId: ServiceId, answers: BuilderAnswers): Question | null {
  switch (serviceId) {
    case "site":
      return getNextSiteQuestion(answers);
    case "trafego":
      return getNextTrafegoQuestion(answers);
    case "design":
      return getNextDesignQuestion(answers);
    default:
      return null;
  }
}

export function estimateTotalSteps(serviceId: ServiceId, answers: BuilderAnswers): number {
  switch (serviceId) {
    case "site":
      return estimateSiteTotalSteps(answers);
    case "trafego":
      return estimateTrafegoTotalSteps();
    case "design":
      return estimateDesignTotalSteps(answers);
    default:
      return 1;
  }
}

export function isServiceComplete(serviceId: ServiceId, answers: BuilderAnswers): boolean {
  return Object.keys(answers).length > 0 && getNextQuestion(serviceId, answers) === null;
}
