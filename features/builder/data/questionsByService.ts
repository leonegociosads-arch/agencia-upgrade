import type { Question, ServiceId } from "../types";
import { SITE_QUESTIONS } from "./site";
import { TRAFEGO_QUESTIONS } from "./trafego";
import { DESIGN_QUESTIONS } from "./design";

/**
 * Perguntas declaradas como dados, por serviço — nunca hardcoded em componentes.
 * Usada para introspecção (visibilidade, invalidação em cascata, testes), não para decidir a
 * próxima pergunta a exibir (isso é `features/builder/logic/flow.ts`, que já lida com as
 * particularidades de cada serviço).
 */
export const questionsByService: Record<ServiceId, Question[]> = {
  site: SITE_QUESTIONS,
  trafego: TRAFEGO_QUESTIONS,
  design: DESIGN_QUESTIONS,
};

export function getServiceQuestions(serviceId: ServiceId): Question[] {
  return questionsByService[serviceId];
}
