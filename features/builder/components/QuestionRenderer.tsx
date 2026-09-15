"use client";

import { useEffect, useState } from "react";
import { getNextQuestion } from "../logic/flow";
import { getProgress } from "../logic/getProgress";
import { getVisibleQuestions } from "../logic/getVisibleQuestions";
import { validateAnswer } from "../logic/validateAnswer";
import { buildServiceSummary } from "../logic/buildServiceSummary";
import { isDraftReadyToAutoSave, useBuilder } from "../state/BuilderContext";
import { SERVICES } from "../data/services";
import type { AnswerValue, Question, ServiceId } from "../types";
import styles from "./QuestionRenderer.module.css";

interface QuestionRendererProps {
  serviceId: ServiceId;
}

/**
 * Renderer genérico: recebe apenas o serviço ativo e lê a pergunta atual do estado — nunca decide
 * ramificação sozinho (docs/TECHNICAL-ARCHITECTURE.md, Seção 6). Suporta os tipos de resposta
 * realmente usados hoje (`single_choice`, `multi_choice`); `boolean`/`range`/`text` ficam
 * reservados para quando alguma pergunta futura precisar (docs/WIREFRAME.md, Seção 7).
 */
export default function QuestionRenderer({ serviceId }: QuestionRendererProps) {
  const {
    state,
    updateDraftAnswer,
    editDraftField,
    backDraft,
    cancelServiceDraft,
    saveServiceDraft,
    canGoBackDraft,
    goToEntry,
  } = useBuilder();

  const question = getNextQuestion(serviceId, state.serviceDraft);
  const { current, total, percentage } = getProgress(serviceId, state.serviceDraft);
  const isEditing = state.editingService !== null;

  useEffect(() => {
    if (!isEditing && isDraftReadyToAutoSave(state)) {
      saveServiceDraft();
    }
  }, [state, isEditing, saveServiceDraft]);

  const topBar = (
    <div className={styles.topRow}>
      <button type="button" className={styles.backButton} onClick={backDraft} disabled={!canGoBackDraft()}>
        ← Voltar
      </button>
      <button type="button" className={styles.exitLink} onClick={isEditing ? cancelServiceDraft : goToEntry}>
        {isEditing ? "Cancelar edição" : "Escolher outra área"}
      </button>
    </div>
  );

  // Rascunho de edição completo: todas as perguntas foram respondidas, mas editar sempre exige
  // confirmação explícita (docs/USER-FLOW.md, Seção 9) — nunca salva sozinho como um serviço novo.
  // Cada resposta pode ser reaberta individualmente ("Alterar") sem perder as demais.
  if (!question) {
    if (!isEditing) return null; // uma configuração nova salva sozinha via isDraftReadyToAutoSave.

    const answeredQuestions = getVisibleQuestions(serviceId, state.serviceDraft).filter(
      (q) => state.serviceDraft[q.id] !== undefined,
    );
    const summary = buildServiceSummary(serviceId, state.serviceDraft);

    return (
      <div className={styles.wrapper}>
        {topBar}
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: "100%" }} />
        </div>
        <p className={styles.editingBanner}>Editando {SERVICES[serviceId].label}</p>
        <h2 className={styles.title}>Revise as respostas e confirme quando estiver pronto.</h2>

        <div className={styles.reviewList}>
          {summary.map((entry, index) => (
            <div key={answeredQuestions[index].id} className={styles.reviewItem}>
              <div>
                <span className={styles.reviewQuestion}>{entry.question}</span>
                <span className={styles.reviewAnswer}>{entry.answer}</span>
              </div>
              <button
                type="button"
                className={styles.linkButton}
                onClick={() => editDraftField(answeredQuestions[index].id)}
              >
                Alterar
              </button>
            </div>
          ))}
        </div>

        <button type="button" className={styles.primaryButton} onClick={saveServiceDraft}>
          Confirmar alterações
        </button>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {topBar}

      <div className={styles.progressTrack}>
        <div className={styles.progressFill} style={{ width: `${percentage}%` }} />
      </div>

      {isEditing && <p className={styles.editingBanner}>Editando {SERVICES[serviceId].label}</p>}

      <p className={styles.contextLabel}>{current >= total - 1 ? "Só mais uma coisa" : SERVICES[serviceId].label}</p>

      <h2 className={styles.title}>{question.title}</h2>

      {/* `key={question.id}` dá um estado local (pending) fresco a cada pergunta, sem precisar
          de um efeito para resetá-lo (evita setState síncrono dentro de efeito). */}
      <QuestionOptions
        key={question.id}
        question={question}
        answers={state.serviceDraft}
        onAnswer={(value) => updateDraftAnswer(question.id, value)}
      />
    </div>
  );
}

interface QuestionOptionsProps {
  question: Question;
  answers: Record<string, AnswerValue>;
  onAnswer: (value: AnswerValue) => void;
}

function QuestionOptions({ question, answers, onAnswer }: QuestionOptionsProps) {
  const options = typeof question.options === "function" ? question.options(answers) : question.options;
  const [pending, setPending] = useState<string[]>([]);

  function toggleMulti(optionId: string) {
    setPending((prev) => (prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]));
  }

  return (
    <>
      <div className={styles.options}>
        {options.map((option) => {
          const selected = question.type === "multi_choice" && pending.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              className={selected ? `${styles.option} ${styles.optionSelected}` : styles.option}
              onClick={() => (question.type === "multi_choice" ? toggleMulti(option.id) : onAnswer(option.id))}
            >
              <span className={styles.optionLabel}>{option.label}</span>
              {option.description && <span className={styles.optionDescription}>{option.description}</span>}
            </button>
          );
        })}
      </div>

      {question.type === "multi_choice" && (
        <div className={styles.continueRow}>
          <button
            type="button"
            className={styles.continueButton}
            onClick={() => validateAnswer(question, pending) && onAnswer(pending)}
            disabled={!validateAnswer(question, pending)}
          >
            Continuar
          </button>
        </div>
      )}
    </>
  );
}
