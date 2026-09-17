import { getServiceQuestions } from "../data/questionsByService";
import { DESIGN_SERVICO_OPTIONS } from "../data/design";
import { isQuestionVisible } from "./isQuestionVisible";
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
 * compila, nunca analisa, classifica ou sugere (docs/BUSINESS-RULES.md, Seção 11). É, ao mesmo
 * tempo, o "resumo curto" (Meu Upgrade, Etapa 10, que só corta a lista exibida) e o "resumo
 * detalhado" (Resumo do Projeto, Etapa 11, que mostra a lista inteira) — a única diferença entre
 * os dois é uma decisão de exibição na camada visual, não uma segunda função de lógica (ver
 * docs/IMPLEMENTATION-STAGE-11.md, Seção 4). Função pura.
 *
 * Filtragem (Etapa 11): dirigida pela lista de perguntas conhecidas do serviço, não pelas chaves
 * de `answers` — por construção, qualquer campo em `answers` que não corresponda a uma pergunta
 * declarada (metadado futuro, campo de uma versão antiga) é simplesmente nunca visitado, sem
 * precisar de uma lista de exclusão. Verifica `isQuestionVisible` de novo aqui, como segunda
 * camada defensiva: em uso normal, `confirmedServices` nunca deveria conter resposta de uma
 * pergunta hoje invisível (a invalidação em cascata da Etapa 8 já impede isso a cada alteração de
 * rascunho), mas o resumo não deve depender apenas dessa garantia se um dia existir uma
 * configuração salva por outro caminho (ex.: migração de dados, Etapa 13+).
 */
export function buildServiceSummary(serviceId: ServiceId, answers: BuilderAnswers): SummaryItem[] {
  const questions = getServiceQuestions(serviceId);

  if (process.env.NODE_ENV !== "production") {
    const knownIds = new Set(questions.map((question) => question.id));
    for (const key of Object.keys(answers)) {
      if (!knownIds.has(key)) {
        console.warn(`buildServiceSummary: campo desconhecido "${key}" em respostas de "${serviceId}" — ignorado.`);
      }
    }
  }

  const items: SummaryItem[] = [];
  for (const question of questions) {
    const value = answers[question.id];
    if (value === undefined) continue;
    if (!isQuestionVisible(question, answers)) continue;
    items.push({ question: question.title, answer: labelsFor(resolveOptions(question, answers), value) });
  }
  return items;
}
