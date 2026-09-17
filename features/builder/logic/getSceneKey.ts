import { getNextQuestion } from "./flow";
import { getProgress } from "./getProgress";
import type { BuilderState } from "../types";

/**
 * Identidade da "cena" atual do Builder (fase Motion Design, Nível 3 — docs/MOTION-DESIGN.md).
 * Usada só como `key` de `SceneTransition`, para o React remontar o wrapper e a animação de
 * entrada rodar de novo a cada troca — nunca para decidir o que renderizar (isso continua
 * inteiramente em `BuilderShell.tsx`, na mesma ordem de checagem; esta função só espelha essa
 * ordem para nomear a cena que ela já escolheu).
 *
 * Pergunta a pergunta: a chave usa `getProgress(...).current` (quantas respostas já estão no
 * rascunho) em vez de um índice de pergunta próprio — é o mesmo número que já aparece como "X de
 * Y" na tela (Fase 19), então a cena troca exatamente quando a pergunta visível troca, sem
 * duplicar nenhuma lógica de fluxo.
 */
export function getSceneKey(state: BuilderState): string {
  if (state.step === "success") return "success";
  if (state.step === "error") return "error";
  if (state.step === "contact" || state.step === "submitting") return "contact";
  if (state.step === "reviewing") return "review";
  if (state.activeService && state.step === "service_complete") return `complete-${state.activeService}`;
  if (state.activeService) {
    // A última resposta de uma configuração NOVA deixa `getNextQuestion` nulo por um instante,
    // antes do efeito de auto-save (`isDraftReadyToAutoSave`) trocar `step` para
    // "service_complete" de verdade — sem este caso especial, `SceneTransition` animaria uma
    // troca de cena para o meio disso (que `QuestionRenderer` renderiza como `null`), um flash em
    // branco entre a pergunta e a conclusão. Reaproveita a mesma chave que a cena de conclusão já
    // vai usar, então não há troca de cena nenhuma nesse meio-tempo.
    if (!state.editingService && getNextQuestion(state.activeService, state.serviceDraft) === null) {
      return `complete-${state.activeService}`;
    }
    const { current } = getProgress(state.activeService, state.serviceDraft);
    return `question-${state.activeService}-${current}`;
  }
  return "selector";
}
