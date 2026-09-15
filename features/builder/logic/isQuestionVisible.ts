import type { BuilderAnswers, Question } from "../types";

/**
 * Uma pergunta é visível quando não tem condição (sempre aparece) ou quando sua condição é
 * satisfeita pelas respostas atuais. Função pura — sem React, sem DOM (ver
 * docs/TECHNICAL-ARCHITECTURE.md, Seção 33).
 */
export function isQuestionVisible(question: Question, answers: BuilderAnswers): boolean {
  return !question.condition || question.condition(answers);
}
