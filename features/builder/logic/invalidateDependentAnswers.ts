import { getServiceQuestions } from "../data/questionsByService";
import type { AnswerValue, BuilderAnswers, Question, ServiceId } from "../types";
import { isQuestionVisible } from "./isQuestionVisible";

/**
 * Quando uma resposta muda, remove apenas as respostas — dentro da MESMA lista de perguntas —
 * que deixaram de fazer sentido. Duas formas de invalidação:
 * 1. A pergunta deixou de ser visível (condição não é mais satisfeita) → resposta removida.
 * 2. A pergunta continua visível, mas suas opções mudaram (ex.: `site_recursos` depende de
 *    `site_tipo`) e a resposta guardada não pertence mais ao novo conjunto de opções válidas.
 *
 * Uma única passagem, na ordem em que `questions` foi declarado, é suficiente mesmo para cadeias
 * de dependência (A → B → C): como cada pergunta dependente é sempre declarada depois de quem ela
 * depende, quando o laço chega em C, `next` já reflete a remoção de B feita alguns passos antes —
 * não há necessidade de repetir a passagem até estabilizar, e por isso não há risco de loop
 * infinito. Função pura — sem React, sem DOM, sem acoplamento a um `serviceId` específico (o que
 * permite testá-la com uma cadeia fabricada, sem depender dos dados reais do projeto).
 */
export function invalidateAnswersForQuestions(
  questions: Question[],
  changedFieldId: string,
  answers: BuilderAnswers,
): BuilderAnswers {
  const next: BuilderAnswers = { ...answers };

  for (const question of questions) {
    if (question.id === changedFieldId) continue;
    const value = next[question.id];
    if (value === undefined) continue;

    if (!isQuestionVisible(question, next)) {
      delete next[question.id];
      continue;
    }

    const options = typeof question.options === "function" ? question.options(next) : question.options;
    const validIds = new Set(options.map((option) => option.id));
    const filtered = filterValidValue(value, validIds);
    if (filtered === undefined) {
      delete next[question.id];
    } else {
      next[question.id] = filtered;
    }
  }

  return next;
}

/**
 * Wrapper usado pelo reducer: aplica `invalidateAnswersForQuestions` às perguntas reais de
 * `serviceId` — nunca toca nas respostas de outro serviço (docs/USER-FLOW.md, Seção 9;
 * docs/BUSINESS-RULES.md, Seção 4), porque só recebe a lista de perguntas daquele mesmo serviço.
 */
export function invalidateDependentAnswers(
  serviceId: ServiceId,
  changedFieldId: string,
  answers: BuilderAnswers,
): BuilderAnswers {
  return invalidateAnswersForQuestions(getServiceQuestions(serviceId), changedFieldId, answers);
}

function filterValidValue(value: AnswerValue, validIds: Set<string>): AnswerValue | undefined {
  if (Array.isArray(value)) {
    const filtered = value.filter((id) => validIds.has(id));
    return filtered.length > 0 ? filtered : undefined;
  }
  return validIds.has(value) ? value : undefined;
}
