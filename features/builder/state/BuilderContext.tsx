"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { builderReducer, canFinalizeProject, hasPendingDraft, initialBuilderState, isDraftReadyToAutoSave } from "./builderReducer";
import { validateBuilderConfig } from "../logic/validateBuilderConfig";
import type { AnswerValue, BuilderState, ServiceId } from "../types";

interface BuilderContextValue {
  state: BuilderState;
  startNewService: (serviceId: ServiceId) => void;
  startEditingService: (serviceId: ServiceId) => void;
  updateDraftAnswer: (questionId: string, value: AnswerValue) => void;
  editDraftField: (questionId: string) => void;
  backDraft: () => void;
  saveServiceDraft: () => void;
  cancelServiceDraft: () => void;
  removeService: (serviceId: ServiceId) => void;
  goToEntry: () => void;
  finalizeProject: () => void;
  canGoBackDraft: () => boolean;
}

const BuilderContext = createContext<BuilderContextValue | null>(null);

interface BuilderProviderProps {
  children: ReactNode;
  /** Só para testes: permite montar o Provider já num estado específico, sem precisar simular
   * cliques por toda a árvore de perguntas para chegar lá. Nunca usado em produção (o app real
   * sempre monta a partir de `initialBuilderState`). */
  initialState?: BuilderState;
}

export function BuilderProvider({ children, initialState = initialBuilderState }: BuilderProviderProps) {
  const [state, dispatch] = useReducer(builderReducer, initialState);

  // Dev guard (Etapa 9): falha de forma clara em desenvolvimento se a configuração de dados das
  // perguntas tiver um id ou uma opção duplicados — nunca roda em produção. Ver
  // logic/validateBuilderConfig.ts.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const problems = validateBuilderConfig();
    if (problems.length > 0) {
      throw new Error(`Configuração inválida do Upgrade Builder:\n${problems.join("\n")}`);
    }
  }, []);

  const value = useMemo<BuilderContextValue>(() => {
    function updateDraftAnswer(questionId: string, val: AnswerValue) {
      dispatch({ type: "UPDATE_DRAFT_ANSWER", questionId, value: val });
    }

    return {
      state,
      startNewService: (serviceId) => dispatch({ type: "START_NEW_SERVICE", serviceId }),
      startEditingService: (serviceId) => dispatch({ type: "START_EDITING_SERVICE", serviceId }),
      updateDraftAnswer,
      editDraftField: (questionId) => dispatch({ type: "EDIT_DRAFT_FIELD", questionId }),
      backDraft: () => dispatch({ type: "BACK_DRAFT" }),
      saveServiceDraft: () => dispatch({ type: "SAVE_SERVICE_DRAFT" }),
      cancelServiceDraft: () => dispatch({ type: "CANCEL_SERVICE_DRAFT" }),
      removeService: (serviceId) => dispatch({ type: "REMOVE_SERVICE", serviceId }),
      goToEntry: () => dispatch({ type: "GO_TO_ENTRY" }),
      finalizeProject: () => dispatch({ type: "FINALIZE_PROJECT" }),
      canGoBackDraft: () => state.draftHistory.length > 0,
    };
  }, [state]);

  return <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>;
}

export function useBuilder(): BuilderContextValue {
  const ctx = useContext(BuilderContext);
  if (!ctx) throw new Error("useBuilder deve ser usado dentro de um BuilderProvider");
  return ctx;
}

/**
 * Regra de negócio (docs/BUSINESS-RULES.md, Seção 5): concluir o mini-fluxo de um serviço NOVO já
 * o adiciona ao "Meu Upgrade" automaticamente — não existe um clique separado de "adicionar".
 * Isso só se aplica a uma configuração nova (`editingService` nulo); editar um serviço já
 * existente sempre exige confirmação explícita (`saveServiceDraft`), nunca salva sozinho.
 */
export { isDraftReadyToAutoSave, canFinalizeProject, hasPendingDraft };
