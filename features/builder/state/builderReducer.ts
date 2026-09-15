import { getNextQuestion } from "../logic/flow";
import { invalidateDependentAnswers } from "../logic/invalidateDependentAnswers";
import { validateServiceDraft } from "../logic/validateServiceDraft";
import { cloneAnswers } from "../utils/cloneAnswers";
import type { AnswerValue, BuilderState, ServiceId } from "../types";

export type BuilderAction =
  | { type: "START_NEW_SERVICE"; serviceId: ServiceId }
  | { type: "START_EDITING_SERVICE"; serviceId: ServiceId }
  | { type: "UPDATE_DRAFT_ANSWER"; questionId: string; value: AnswerValue }
  | { type: "EDIT_DRAFT_FIELD"; questionId: string }
  | { type: "BACK_DRAFT" }
  | { type: "SAVE_SERVICE_DRAFT" }
  | { type: "CANCEL_SERVICE_DRAFT" }
  | { type: "REMOVE_SERVICE"; serviceId: ServiceId }
  | { type: "GO_TO_ENTRY" }
  | { type: "FINALIZE_PROJECT" };

export const initialBuilderState: BuilderState = {
  step: "choosing_service",
  activeService: null,
  editingService: null,
  serviceDraft: {},
  draftHistory: [],
  confirmedServices: {},
  error: null,
};

/**
 * Reducer puro do Builder — sem React, sem DOM. A separação entre `serviceDraft` (o que o
 * usuário está alterando agora) e `confirmedServices` (o que já está salvo no "Meu Upgrade") é a
 * pendência crítica identificada nas Fases 4/6/7, implementada aqui pela primeira vez:
 * nenhuma ação além de SAVE_SERVICE_DRAFT altera `confirmedServices`.
 */
export function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case "START_NEW_SERVICE":
      return {
        ...state,
        step: "configuring",
        activeService: action.serviceId,
        editingService: null,
        serviceDraft: {},
        draftHistory: [],
        error: null,
      };

    case "START_EDITING_SERVICE": {
      const existing = state.confirmedServices[action.serviceId];
      return {
        ...state,
        step: "configuring",
        activeService: action.serviceId,
        editingService: action.serviceId,
        // Cópia segura — editar o rascunho nunca pode alterar o item já confirmado.
        serviceDraft: existing ? cloneAnswers(existing.answers) : {},
        draftHistory: [],
        error: null,
      };
    }

    case "UPDATE_DRAFT_ANSWER": {
      if (!state.activeService) return state;
      const withNewAnswer = { ...state.serviceDraft, [action.questionId]: action.value };
      const nextDraft = invalidateDependentAnswers(state.activeService, action.questionId, withNewAnswer);
      return {
        ...state,
        serviceDraft: nextDraft,
        draftHistory: [...state.draftHistory, action.questionId],
      };
    }

    case "EDIT_DRAFT_FIELD": {
      // Usado na revisão de uma edição em andamento: reabre uma pergunta específica já
      // respondida no rascunho, sem afetar a configuração confirmada. Cascata igual à de
      // qualquer outra mudança de resposta (docs/BUSINESS-RULES.md, Seção 4).
      if (!state.activeService) return state;
      const draftWithoutField = { ...state.serviceDraft };
      delete draftWithoutField[action.questionId];
      const nextDraft = invalidateDependentAnswers(state.activeService, action.questionId, draftWithoutField);
      return {
        ...state,
        serviceDraft: nextDraft,
        draftHistory: state.draftHistory.filter((fieldId) => nextDraft[fieldId] !== undefined),
      };
    }

    case "BACK_DRAFT": {
      if (state.draftHistory.length === 0) return state;
      const lastFieldId = state.draftHistory[state.draftHistory.length - 1];
      const nextDraft = { ...state.serviceDraft };
      delete nextDraft[lastFieldId];
      return {
        ...state,
        serviceDraft: nextDraft,
        draftHistory: state.draftHistory.slice(0, -1),
      };
    }

    case "SAVE_SERVICE_DRAFT": {
      if (!state.activeService) return state;
      const validation = validateServiceDraft(state.activeService, state.serviceDraft);
      if (!validation.valid) {
        return {
          ...state,
          error: { step: state.step, message: "Responda todas as perguntas antes de salvar." },
        };
      }
      const now = new Date().toISOString();
      const existing = state.confirmedServices[state.activeService];
      const wasEditing = state.editingService !== null;
      return {
        ...state,
        // Uma configuração NOVA mostra a tela de conclusão (docs/USER-FLOW.md, Seção 6);
        // salvar uma EDIÇÃO volta direto para onde a edição começou (Seção 9) — nunca mostra a
        // tela de "serviço adicionado", pois o serviço já existia.
        step: wasEditing ? "choosing_service" : "service_complete",
        confirmedServices: {
          ...state.confirmedServices,
          [state.activeService]: {
            serviceId: state.activeService,
            answers: cloneAnswers(state.serviceDraft),
            status: "complete",
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
          },
        },
        activeService: wasEditing ? null : state.activeService,
        editingService: null,
        serviceDraft: {},
        draftHistory: [],
        error: null,
      };
    }

    case "CANCEL_SERVICE_DRAFT":
      // Descarta o rascunho — `confirmedServices` permanece exatamente como estava.
      return {
        ...state,
        step: "choosing_service",
        activeService: null,
        editingService: null,
        serviceDraft: {},
        draftHistory: [],
        error: null,
      };

    case "REMOVE_SERVICE": {
      const next = { ...state.confirmedServices };
      delete next[action.serviceId];
      // Se o serviço removido é o que está ativo/em edição agora (Meu Upgrade e a tela de
      // pergunta podem estar visíveis ao mesmo tempo — docs/IMPLEMENTATION-STAGE-10.md), o
      // rascunho relacionado fica órfão: descarta-o e volta para um estado seguro, em vez de
      // deixar `activeService`/`editingService` apontando para um item que não existe mais.
      const wasBeingConfigured = state.activeService === action.serviceId;
      return {
        ...state,
        confirmedServices: next,
        ...(wasBeingConfigured
          ? {
              step: "choosing_service" as const,
              activeService: null,
              editingService: null,
              serviceDraft: {},
              draftHistory: [],
            }
          : {}),
      };
    }

    case "GO_TO_ENTRY":
      return {
        ...state,
        step: "choosing_service",
        activeService: null,
        editingService: null,
        serviceDraft: {},
        draftHistory: [],
        error: null,
      };

    case "FINALIZE_PROJECT": {
      // Nunca finaliza silenciosamente com uma edição/configuração pendente de verdade, nem com o
      // projeto vazio — a UI decide o que mostrar (diálogo de rascunho pendente, botão
      // desabilitado), mas o reducer garante a regra mesmo se for chamado diretamente.
      if (hasPendingDraft(state)) return state;
      if (Object.keys(state.confirmedServices).length === 0) return state;
      return {
        ...state,
        step: "reviewing",
        activeService: null,
        editingService: null,
        serviceDraft: {},
        draftHistory: [],
        error: null,
      };
    }

    default:
      return state;
  }
}

/** Verdadeiro quando existe pelo menos 1 serviço confirmado — condição para habilitar "Finalizar
 * projeto" na UI (docs/IMPLEMENTATION-STAGE-10.md). Não considera `activeService`: um rascunho em
 * andamento não desabilita o botão, ele faz o clique abrir o diálogo de rascunho pendente em vez
 * de finalizar — ver `hasPendingDraft`. */
export function canFinalizeProject(state: BuilderState): boolean {
  return Object.keys(state.confirmedServices).length > 0;
}

/**
 * Verdadeiro quando existe uma edição ou configuração com alterações que ainda seriam perdidas se
 * o usuário saísse agora. Duas situações contam:
 * 1. `editingService` não-nulo — uma edição está aberta, com o rascunho carregado a partir da
 *    configuração confirmada (mesmo que nenhum campo tenha sido alterado ainda, a edição está em
 *    aberto e precisa ser salva ou cancelada explicitamente).
 * 2. Uma configuração NOVA com pelo menos uma resposta já dada no rascunho.
 *
 * Deliberadamente NÃO é apenas `activeService !== null`: logo depois que uma configuração NOVA
 * termina e salva sozinha (Etapa 8, `isDraftReadyToAutoSave`), `activeService` continua preenchido
 * só para a tela de conclusão saber qual serviço mostrar — nesse momento `serviceDraft` já está
 * vazio e não há nada pendente para perder, então essa situação não deve disparar o aviso de
 * rascunho não salvo.
 */
export function hasPendingDraft(state: BuilderState): boolean {
  if (state.editingService !== null) return true;
  return state.activeService !== null && Object.keys(state.serviceDraft).length > 0;
}

/** Verdadeiro quando a última resposta do rascunho ativo completou o mini-fluxo do serviço. */
export function isDraftReadyToAutoSave(state: BuilderState): boolean {
  if (!state.activeService || state.editingService) return false;
  return getNextQuestion(state.activeService, state.serviceDraft) === null && state.draftHistory.length > 0;
}
