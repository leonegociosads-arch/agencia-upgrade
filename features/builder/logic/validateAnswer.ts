import type { AnswerValue, Question } from "../types";

/**
 * Validação de experiência (docs/TECHNICAL-ARCHITECTURE.md, Seção 17.1): só o essencial —
 * pergunta obrigatória respondida, e ao menos uma opção marcada em `multi_choice`. Não é a
 * fronteira de segurança (essa, quando existir, é a validação de servidor da Fase 12/13); aqui é
 * só o que decide se o botão "Continuar" pode ser clicado. Função pura.
 */
export function validateAnswer(question: Question, value: AnswerValue | undefined): boolean {
  if (value === undefined) return !question.required;
  if (question.type === "multi_choice") return Array.isArray(value) && value.length > 0;
  return typeof value === "string" && value.length > 0;
}
