import { estimateTotalSteps } from "./flow";
import { getQuestionNumber } from "./getQuestionLayout";
import type { BuilderAnswers, Question, ServiceId } from "../types";

export interface DraftProgress {
  current: number;
  total: number;
  percentage: number;
}

/**
 * `current`/`total`/`percentage` do mini-fluxo ativo, para a camada visual (docs/USER-FLOW.md,
 * "Comunicação de progresso"). Fica no motor, não no componente, porque depende de regra de
 * negócio (quantas perguntas o serviço tem hoje, dadas as respostas atuais) — o mesmo motivo pelo
 * qual `estimateTotalSteps` já existe em `logic/flow.ts`.
 *
 * `current` conta as respostas hoje guardadas no rascunho: como toda escrita no rascunho já passa
 * por `invalidateDependentAnswers`, o rascunho nunca guarda resposta de uma pergunta que deixou de
 * ser visível — por isso `Object.keys(answers).length` já é exatamente "quantas perguntas
 * atualmente visíveis foram respondidas", sem precisar de um histórico à parte.
 */
export function getProgress(serviceId: ServiceId, answers: BuilderAnswers): DraftProgress {
  const total = estimateTotalSteps(serviceId, answers);
  const current = Math.min(Object.keys(answers).length, total);
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  return { current, total, percentage };
}

export interface QuestionProgress {
  /** Posição REAL (1-based) da pergunta atual no caminho deste serviço. */
  position: number;
  total: number;
  /** Largura da barra do serviço: `position / total` — nunca vazia na 1ª pergunta, cheia na última. */
  percentage: number;
  /** Última pergunta do caminho (o rótulo contextual vira "Só mais uma coisa"). */
  isLast: boolean;
}

/**
 * Progresso DENTRO de um serviço, igual nas duas apresentações de pergunta (tela normal e painel
 * especial) — antes cada uma calculava o seu ("1 de 3" contava respostas; o painel contava a posição
 * e ainda mostrava "03." de outra contagem). Usa a posição real da pergunta no caminho
 * (`getQuestionNumber`), que continua certa ao reabrir uma resposta durante uma edição. Sem número
 * na tela (decisão da Fase 3): vira só a barra + o rótulo contextual.
 */
export function getQuestionProgress(question: Question, answers: BuilderAnswers): QuestionProgress {
  const total = Math.max(estimateTotalSteps(question.service, answers), 1);
  const replayed = getQuestionNumber(question, answers);
  const position = Math.min(replayed > 0 ? replayed : Object.keys(answers).length + 1, total);
  return { position, total, percentage: Math.round((position / total) * 100), isLast: position >= total };
}
