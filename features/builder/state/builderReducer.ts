import { getNextQuestion } from "../logic/flow";
import { invalidateDependentAnswers } from "../logic/invalidateDependentAnswers";
import { validateServiceDraft } from "../logic/validateServiceDraft";
import { cloneAnswers } from "../utils/cloneAnswers";
import type { AnswerValue, BuilderState, BuilderStep, ServiceId } from "../types";

export type BuilderAction =
  | { type: "START_NEW_SERVICE"; serviceId: ServiceId }
  | { type: "START_EDITING_SERVICE"; serviceId: ServiceId; returnStep?: BuilderStep }
  | { type: "UPDATE_DRAFT_ANSWER"; questionId: string; value: AnswerValue }
  | { type: "EDIT_DRAFT_FIELD"; questionId: string }
  | { type: "BACK_DRAFT" }
  | { type: "SAVE_SERVICE_DRAFT" }
  | { type: "CANCEL_SERVICE_DRAFT" }
  | { type: "REMOVE_SERVICE"; serviceId: ServiceId }
  | { type: "GO_TO_ENTRY" }
  | { type: "FINALIZE_PROJECT" }
  | { type: "CONTINUE_TO_CONTACT" }
  | { type: "START_SUBMIT_LEAD" }
  | { type: "SUBMIT_LEAD_SUCCESS" }
  | { type: "SUBMIT_LEAD_FAILURE"; message: string }
  | { type: "BACK_TO_REVIEW" }
  | { type: "RETRY_SUBMIT" }
  | { type: "HYDRATE_SESSION"; builder: RestorableBuilderState }
  | { type: "RESET_BUILDER" };

/**
 * Tudo em `BuilderState` exceto `error` — `error` é transitório (mensagem de uma falha pontual),
 * nunca persistido nem restaurado (Fase 14, `docs/SESSION-PERSISTENCE.md`, "O que NÃO persistir").
 */
export type RestorableBuilderState = Omit<BuilderState, "error">;

export const initialBuilderState: BuilderState = {
  step: "choosing_service",
  activeService: null,
  editingService: null,
  serviceDraft: {},
  draftHistory: [],
  confirmedServices: {},
  returnStep: "choosing_service",
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
        returnStep: "choosing_service",
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
        // "returnContext" (Etapa 11): se a edição começou no Resumo do Projeto, salvar ou
        // cancelar deve voltar para lá, não para o seletor — ver Seção 10 do
        // IMPLEMENTATION-STAGE-11.md.
        returnStep: action.returnStep ?? "choosing_service",
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
        // salvar uma EDIÇÃO volta para onde a edição começou — Seção 9 (Etapa 8) por padrão, ou
        // o Resumo do Projeto quando foi de lá que a edição partiu (`returnStep`, Etapa 11).
        step: wasEditing ? state.returnStep : "service_complete",
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
        returnStep: "choosing_service",
        error: null,
      };
    }

    case "CANCEL_SERVICE_DRAFT":
      // Descarta o rascunho — `confirmedServices` permanece exatamente como estava. Volta para
      // `returnStep` (Etapa 11: o Resumo do Projeto, quando foi de lá que a edição partiu).
      return {
        ...state,
        step: state.returnStep,
        activeService: null,
        editingService: null,
        serviceDraft: {},
        draftHistory: [],
        returnStep: "choosing_service",
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
      // Remover o último serviço enquanto se está no Resumo do Projeto (Etapa 11) não pode deixar
      // a tela de revisão vazia com "Continuar" ali do lado — volta para o Meu Upgrade vazio,
      // a opção mais simples já coberta pelo próprio estado vazio do seletor/painel.
      const emptiedWhileReviewing = state.step === "reviewing" && Object.keys(next).length === 0;
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
              returnStep: "choosing_service" as const,
            }
          : emptiedWhileReviewing
            ? { step: "choosing_service" as const }
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
        returnStep: "choosing_service",
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
        returnStep: "choosing_service",
        error: null,
      };
    }

    case "CONTINUE_TO_CONTACT": {
      // Validação antes de continuar (Etapa 11): só a partir do Resumo já validado — chegar a
      // "reviewing" já exige 1+ serviço confirmado e nenhum rascunho pendente (FINALIZE_PROJECT
      // acima), então checar de novo aqui é defesa redundante, não uma regra nova.
      if (state.step !== "reviewing") return state;
      if (Object.keys(state.confirmedServices).length === 0) return state;
      return { ...state, step: "contact", error: null };
    }

    case "START_SUBMIT_LEAD": {
      // Guard central contra duplo submit (Etapa 12): só sai de "contact" uma vez. Um segundo
      // despacho enquanto já está em "submitting" cai aqui de novo e não faz nada, porque a
      // condição já não bate — o mesmo padrão de defesa em profundidade usado em todo o reducer.
      if (state.step !== "contact") return state;
      return { ...state, step: "submitting", error: null };
    }

    case "SUBMIT_LEAD_SUCCESS": {
      if (state.step !== "submitting") return state;
      return { ...state, step: "success", error: null };
    }

    case "SUBMIT_LEAD_FAILURE": {
      if (state.step !== "submitting") return state;
      // Reaproveita o mesmo campo `error` já usado por SAVE_SERVICE_DRAFT — não precisou de um
      // campo novo só para a mensagem de falha do envio.
      return { ...state, step: "error", error: { step: "contact", message: action.message } };
    }

    case "BACK_TO_REVIEW": {
      // "Voltar ao projeto" (tela de contato) e "Voltar" (tela de erro) levam ao mesmo lugar —
      // nunca perde `confirmedServices`, porque essa ação nunca toca nesse campo.
      if (state.step !== "contact" && state.step !== "error") return state;
      return { ...state, step: "reviewing", error: null };
    }

    case "RETRY_SUBMIT": {
      // Reabre a tela de contato para o usuário tentar enviar de novo — o rascunho do formulário
      // (fora deste reducer, ver features/lead/state/LeadContext.tsx) nunca foi tocado.
      if (state.step !== "error") return state;
      return { ...state, step: "contact", error: null };
    }

    case "HYDRATE_SESSION":
      // Substitui o estado inteiro pelo que veio de `lib/persistence/builderSession.ts` — já
      // validado e saneado antes de chegar aqui (Fase 14). `error` nunca é restaurado.
      return { ...action.builder, error: null };

    case "RESET_BUILDER":
      // "Começar de novo" (Fase 14) — descarta confirmedServices, draft e tudo mais, voltando ao
      // estado inicial exatamente como se a página tivesse acabado de carregar pela primeira vez.
      return { ...initialBuilderState };

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
