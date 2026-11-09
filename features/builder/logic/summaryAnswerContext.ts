import { getServiceQuestions } from "../data/questionsByService";
import type { ServiceId, SummaryItem } from "../types";

/**
 * Rótulos curtos de CONTEXTO para respostas que, sozinhas no resumo, dariam margem a mal-entendido —
 * só apresentação: a pergunta, as opções, os valores salvos e o payload do lead não mudam.
 *
 * `trafego_investimento`: sem o rótulo, "R$ 1.000 a R$ 3.000" no resumo podia ser lido como preço,
 * mensalidade ou orçamento da Upgrade. É o investimento do cliente em anúncios (mídia paga), não o
 * valor do serviço (`data/trafego.ts`; achado A10 da auditoria de 09/11/2026).
 */
export const SUMMARY_ANSWER_CONTEXT: Readonly<Record<string, string>> = {
  trafego_investimento: "Investimento mensal em anúncios",
};

/** Rótulo de contexto da resposta (ex.: "Investimento mensal em anúncios"), ou `null` se ela se
 * explica sozinha. Identifica a pergunta pelo título vindo da própria configuração do serviço. */
export function getSummaryAnswerContext(serviceId: ServiceId, item: SummaryItem): string | null {
  const question = getServiceQuestions(serviceId).find((candidate) => candidate.title === item.question);
  return question ? (SUMMARY_ANSWER_CONTEXT[question.id] ?? null) : null;
}

/** A resposta como o visitante deve lê-la no resumo: "Investimento mensal em anúncios: R$ 1.000 a
 * R$ 3.000" quando há contexto, ou só a resposta. */
export function formatSummaryAnswer(serviceId: ServiceId, item: SummaryItem): string {
  const context = getSummaryAnswerContext(serviceId, item);
  return context ? `${context}: ${item.answer}` : item.answer;
}
