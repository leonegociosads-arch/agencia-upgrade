import { getServiceQuestions } from "@/features/builder/data/questionsByService";
import type { QuestionOption, ServiceId } from "@/features/builder/types";

export interface ExperienceQuestionPreview {
  title: string;
  options: QuestionOption[];
}

/**
 * Prova de conceito da linguagem de interação do Builder — lê a PRIMEIRA pergunta real de cada
 * serviço (dado já aprovado, `features/builder/data/*`) só para exibir na Cena 2. Nunca decide
 * fluxo/navegação real: nenhuma resposta aqui é salva em `BuilderContext`, e nada de
 * `features/builder/logic` é reaproveitado — só leitura de dados estáticos já existentes, para a
 * prova validar a transição com conteúdo real em vez de texto inventado.
 */
export function getExperienceQuestionPreview(serviceId: ServiceId): ExperienceQuestionPreview {
  const [firstQuestion] = getServiceQuestions(serviceId);
  const options = typeof firstQuestion.options === "function" ? firstQuestion.options({}) : firstQuestion.options;
  return { title: firstQuestion.title, options };
}
