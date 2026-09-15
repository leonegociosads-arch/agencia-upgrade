import { estimateTotalSteps } from "./flow";
import type { BuilderAnswers, ServiceId } from "../types";

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
