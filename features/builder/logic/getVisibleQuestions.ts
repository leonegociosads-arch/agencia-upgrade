import { getServiceQuestions } from "../data/questionsByService";
import type { BuilderAnswers, Question, ServiceId } from "../types";
import { isQuestionVisible } from "./isQuestionVisible";

/**
 * Lista, na ordem declarada em `data/*`, apenas as perguntas de `serviceId` que estão visíveis
 * para as respostas atuais. Função pura — não decide "qual é a próxima" (isso continua sendo
 * `logic/flow.ts`, que trata o caso particular do combo de Design/Social Media — ver
 * docs/DECISIONS.md, Fase 8); usada para introspecção: progresso, revisão de edição, testes e
 * validações de desenvolvimento.
 */
export function getVisibleQuestions(serviceId: ServiceId, answers: BuilderAnswers): Question[] {
  return getServiceQuestions(serviceId).filter((question) => isQuestionVisible(question, answers));
}
