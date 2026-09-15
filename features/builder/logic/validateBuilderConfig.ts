import { questionsByService } from "../data/questionsByService";
import type { Question, ServiceId } from "../types";

/**
 * Validações de desenvolvimento (docs geral da Etapa 9, "Dev Guards"): detectam erros de
 * configuração de dados antes que virem bugs de fluxo — id de pergunta duplicado dentro do mesmo
 * serviço, opção duplicada dentro da mesma pergunta. Não tenta detectar ciclos de dependência: as
 * condições são funções (`QuestionCondition`), não referências declarativas a outro campo, então
 * não há como inspecioná-las estaticamente sem executá-las — limitação conhecida, registrada em
 * `docs/IMPLEMENTATION-STAGE-09.md`.
 *
 * Função pura — recebe o mapa de perguntas como parâmetro (com o mapa real como padrão) para
 * poder ser testada com dados fabricados, sem depender da configuração real do projeto.
 */
export function validateBuilderConfig(
  data: Partial<Record<ServiceId, Question[]>> = questionsByService,
): string[] {
  const problems: string[] = [];

  for (const [serviceId, questions] of Object.entries(data) as [ServiceId, Question[]][]) {
    const seenQuestionIds = new Set<string>();
    for (const question of questions) {
      if (seenQuestionIds.has(question.id)) {
        problems.push(`Serviço "${serviceId}": id de pergunta duplicado "${question.id}".`);
      }
      seenQuestionIds.add(question.id);

      if (Array.isArray(question.options)) {
        const seenOptionIds = new Set<string>();
        for (const option of question.options) {
          if (seenOptionIds.has(option.id)) {
            problems.push(`Pergunta "${question.id}": opção duplicada "${option.id}".`);
          }
          seenOptionIds.add(option.id);
        }
      }
    }
  }

  return problems;
}
