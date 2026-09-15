import { getServiceQuestions } from "../data/questionsByService";
import { DESIGN_SERVICO_OPTIONS } from "../data/design";
import type { AnswerValue, BuilderAnswers, Question, QuestionOption, ServiceId, SummaryItem } from "../types";

function labelsFor(options: QuestionOption[], value: AnswerValue): string {
  const ids = Array.isArray(value) ? value : [value];
  return ids.map((id) => options.find((option) => option.id === id)?.label ?? id).join(", ");
}

function resolveOptions(question: Question, answers: BuilderAnswers): QuestionOption[] {
  if (question.id === "design_servico") return DESIGN_SERVICO_OPTIONS;
  return typeof question.options === "function" ? question.options(answers) : question.options;
}

/**
 * Compila as respostas já dadas de um serviço em pares pergunta/resposta legíveis — apenas
 * compila, nunca analisa, classifica ou sugere (docs/BUSINESS-RULES.md, Seção 11). Função pura.
 */
export function buildServiceSummary(serviceId: ServiceId, answers: BuilderAnswers): SummaryItem[] {
  const items: SummaryItem[] = [];
  for (const question of getServiceQuestions(serviceId)) {
    const value = answers[question.id];
    if (value === undefined) continue;
    items.push({ question: question.title, answer: labelsFor(resolveOptions(question, answers), value) });
  }
  return items;
}
