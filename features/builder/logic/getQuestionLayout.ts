import { getNextQuestion } from "./flow";
import type { BuilderAnswers, Question } from "../types";

/**
 * Como uma pergunta é APRESENTADA — nunca muda o que ela pergunta, as opções ou a ramificação
 * (isso continua todo em `data/*` + `logic/flow.ts`). `"default"` = o renderer de sempre
 * (`QuestionRenderer`); `"browser-panel"` = a cena especial do painel/browser inclinado
 * (`ShowcaseQuestionPanel`).
 */
export type QuestionLayout = "default" | "browser-panel";

interface SpecialLayoutRule {
  layout: Exclude<QuestionLayout, "default">;
  /**
   * Número da pergunta dentro do caminho (1 = primeira pergunta depois de escolher o caminho), no
   * qual a regra vale. Existe porque algumas perguntas aparecem em posições diferentes conforme a
   * ramificação — no "Montar um pacote" de Design, por exemplo, `social_necessidade` pode ser a 4ª
   * pergunta; a cena especial é da ETAPA, então fora da posição combinada a pergunta continua com
   * o layout normal. A "etapa geral" que o usuário vê é este número + 1 (a etapa 1 é a escolha do
   * caminho).
   */
  atQuestionNumber: number;
}

/**
 * Única fonte da decisão de layout especial. Para aplicar a cena em outra pergunta, basta
 * acrescentar o id aqui — nenhum componente precisa mudar.
 *
 * - Site, etapa 3 → `site_recursos` (sempre a 2ª pergunta quando visível; no ramo "Ainda não sei"
 *   ela nem aparece, e a etapa 3 desse ramo continua normal).
 * - Tráfego Pago, etapa 4 → `trafego_experiencia` (fluxo fixo de 4 perguntas, sem ramificação).
 * - Design e Social Media, etapa 3 → a 2ª pergunta depende do serviço escolhido na 1ª, então a
 *   regra lista a primeira pergunta de cada sub-fluxo, sempre travada na posição 2.
 */
export const SPECIAL_QUESTION_LAYOUTS: Readonly<Record<string, SpecialLayoutRule>> = {
  site_recursos: { layout: "browser-panel", atQuestionNumber: 2 },
  trafego_experiencia: { layout: "browser-panel", atQuestionNumber: 3 },
  identidade_situacao: { layout: "browser-panel", atQuestionNumber: 2 },
  design_formato: { layout: "browser-panel", atQuestionNumber: 2 },
  social_necessidade: { layout: "browser-panel", atQuestionNumber: 2 },
  criativos_formato: { layout: "browser-panel", atQuestionNumber: 2 },
  video_material: { layout: "browser-panel", atQuestionNumber: 2 },
};

/**
 * Posição (1-based) da pergunta na ORDEM EM QUE O FLUXO A FAZ, ou 0 se ela não estiver no caminho
 * destas respostas. Refaz o caminho com o próprio `getNextQuestion` (a mesma fonte de verdade da
 * navegação), repondo uma resposta de cada vez — a lista declarativa de `getVisibleQuestions` não
 * serve aqui, porque em Design a ordem declarada não é a ordem perguntada (`marca_identidade` é
 * declarada antes de `social_necessidade`, mas perguntada depois). Também continua certa ao reabrir
 * uma resposta na revisão de uma edição, quando a contagem de respostas do rascunho já não indica a
 * posição.
 */
export function getQuestionNumber(question: Question, answers: BuilderAnswers): number {
  const replayed: BuilderAnswers = {};
  // Limite só de segurança contra laço infinito; nenhum caminho real passa de meia dúzia de perguntas.
  for (let number = 1; number <= 50; number++) {
    const next = getNextQuestion(question.service, replayed);
    if (!next) return 0;
    if (next.id === question.id) return number;
    const answer = answers[next.id];
    if (answer === undefined) return 0;
    replayed[next.id] = answer;
  }
  return 0;
}

export function getQuestionLayout(question: Question, answers: BuilderAnswers): QuestionLayout {
  const rule = SPECIAL_QUESTION_LAYOUTS[question.id];
  if (!rule) return "default";
  return getQuestionNumber(question, answers) === rule.atQuestionNumber ? rule.layout : "default";
}
