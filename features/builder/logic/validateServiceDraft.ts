import type { BuilderAnswers, ServiceId } from "../types";
import { getNextQuestion } from "./flow";

export interface DraftValidationResult {
  valid: boolean;
  /** Id da próxima pergunta pendente, ou null quando o rascunho está completo. */
  nextQuestionId: string | null;
}

/**
 * Um rascunho só é válido para salvar quando não há mais nenhuma pergunta pendente — reutiliza
 * o mesmo dispatcher (`getNextQuestion`) que decide qual pergunta mostrar, para nunca haver
 * divergência entre "o que falta perguntar" e "pode salvar". Função pura.
 */
export function validateServiceDraft(serviceId: ServiceId, answers: BuilderAnswers): DraftValidationResult {
  const next = getNextQuestion(serviceId, answers);
  return { valid: next === null && Object.keys(answers).length > 0, nextQuestionId: next?.id ?? null };
}
