"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getNextQuestion } from "../logic/flow";
import { getOptionAsset } from "../data/optionAssets";
import { getProgress } from "../logic/getProgress";
import { getVisibleQuestions } from "../logic/getVisibleQuestions";
import { validateAnswer } from "../logic/validateAnswer";
import { buildServiceSummary } from "../logic/buildServiceSummary";
import { isDraftReadyToAutoSave, useBuilder } from "../state/BuilderContext";
import { SERVICES } from "../data/services";
import { trackEvent } from "@/lib/analytics/trackEvent";
import Heading from "@/features/design-system/components/Heading";
import Text from "@/features/design-system/components/Text";
import Badge from "@/features/design-system/components/Badge";
import Button from "@/features/design-system/components/Button";
import { playSound } from "@/features/design-system/motion/sound";
import { useSceneNavigation } from "@/features/design-system/motion/SceneTransition";
import { useTilt } from "@/features/design-system/motion/useTilt";
import { useEnabledPulse } from "@/features/design-system/motion/useEnabledPulse";
import { cx } from "@/features/design-system/utils/cx";
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
  const { isTransitioning, markForward, markBackward } = useSceneNavigation();

  const question = getNextQuestion(serviceId, state.serviceDraft);
  const { current, total, percentage } = getProgress(serviceId, state.serviceDraft);
  const isEditing = state.editingService !== null;

  useEffect(() => {
    if (!isEditing && isDraftReadyToAutoSave(state)) {
      // `service_completed` (Fase 17) — só a configuração NOVA salva sozinha aqui; editar sempre
      // passa por "Confirmar alterações" (`service_edited`, abaixo), nunca por este efeito.
      trackEvent("service_completed", { serviceId, questionCount: state.draftHistory.length });
      saveServiceDraft();
    }
  }, [state, isEditing, saveServiceDraft, serviceId]);

  const topBar = (
    <div className={styles.topRow}>
      <button
        type="button"
        className={styles.backButton}
        onClick={() => {
          if (isTransitioning) return;
          playSound("scene_back");
          markBackward();
          backDraft();
        }}
        disabled={!canGoBackDraft() || isTransitioning}
      >
        ← Voltar
      </button>
      {isEditing && <Badge tone="warning">Editando {SERVICES[serviceId].label}</Badge>}
      <button
        type="button"
        className={styles.exitLink}
        onClick={() => {
          if (isTransitioning) return;
          markForward();
          if (isEditing) {
            cancelServiceDraft();
          } else {
            goToEntry();
          }
        }}
        disabled={isTransitioning}
      >
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
        <Heading variant="h2" as="h2" className={styles.title}>
          Revise as respostas e confirme quando estiver pronto.
        </Heading>

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

        <Button
          onClick={() => {
            if (isTransitioning) return;
            playSound("confirm");
            markForward();
            // `service_edited` (Fase 17) — este botão só aparece quando o rascunho de edição já
            // está completo (`!question`), então salvar aqui sempre é bem-sucedido.
            trackEvent("service_edited", { serviceId });
            saveServiceDraft();
          }}
          disabled={isTransitioning}
        >
          Confirmar alterações
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {topBar}

      <div className={styles.progressRow}>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${percentage}%` }} />
        </div>
        <Text as="span" size="caption" color="secondary" className={styles.progressCount}>
          {current + 1} de {total}
        </Text>
      </div>

      <Text as="span" size="label" color="secondary" className={styles.contextLabel}>
        {current >= total - 1 ? "Só mais uma coisa" : SERVICES[serviceId].label}
      </Text>

      <Heading variant="h2" as="h2" className={styles.title}>
        {question.title}
      </Heading>

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
  const { isTransitioning, markForward } = useSceneNavigation();

  function toggleMulti(optionId: string) {
    setPending((prev) => (prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]));
  }

  const hasSelection = question.type === "multi_choice" && pending.length > 0;

  return (
    <>
      <div className={cx(styles.options, hasSelection && styles.optionsHasSelection)}>
        {options.map((option) => {
          const selected = question.type === "multi_choice" && pending.includes(option.id);
          return (
            <OptionCard
              key={option.id}
              question={question}
              optionId={option.id}
              label={option.label}
              description={option.description}
              selected={selected}
              showCheck={question.type === "multi_choice"}
              disabled={question.type !== "multi_choice" && isTransitioning}
              onClick={() => {
                playSound("card_select");
                if (question.type === "multi_choice") {
                  toggleMulti(option.id);
                  return;
                }
                if (isTransitioning) return;
                markForward();
                onAnswer(option.id);
              }}
            />
          );
        })}
      </div>

      {question.type === "multi_choice" && (
        <div className={styles.continueRow}>
          <ContinueButton
            enabled={validateAnswer(question, pending) && !isTransitioning}
            onClick={() => {
              if (!validateAnswer(question, pending) || isTransitioning) return;
              playSound("scene_advance");
              markForward();
              onAnswer(pending);
            }}
          />
        </div>
      )}
    </>
  );
}

interface OptionCardProps {
  question: Question;
  optionId: string;
  label: string;
  description?: string;
  selected: boolean;
  showCheck: boolean;
  disabled: boolean;
  onClick: () => void;
}

/**
 * Extraído para poder chamar `useTilt()` uma vez POR OPÇÃO — um Hook não pode viver dentro do
 * `.map()` do componente pai (mesmo motivo de `ServiceCard` em `ServiceSelector.tsx`). Prioridade
 * #1 do briefing Microinterações (Seção 60: "Builder cards" em primeiro lugar).
 *
 * Quando existe arte pronta para a opção (`optionAssets.ts`), o PNG É o card: moldura, ícone,
 * título, descrição, seta e caixa de seleção já fazem parte da imagem, então nada disso é
 * redesenhado por CSS/HTML por cima. O que continua vivendo aqui é só a camada interativa —
 * o próprio `<button>`, com clique, teclado, foco, `aria-pressed` e o texto real da opção (visível
 * apenas para leitores de tela, já que a imagem o mostra visualmente). O cartão de texto abaixo
 * continua como está para qualquer opção que ainda não tenha arte.
 */
function OptionCard({ question, optionId, label, description, selected, showCheck, disabled, onClick }: OptionCardProps) {
  const tiltRef = useTilt<HTMLButtonElement>(2.5);
  const asset = getOptionAsset(question, optionId);

  if (asset) {
    return (
      <button
        ref={tiltRef}
        type="button"
        className={cx(styles.assetOption, selected && styles.assetOptionSelected)}
        aria-pressed={showCheck ? selected : undefined}
        disabled={disabled}
        onClick={onClick}
      >
        <Image
          src={asset.src}
          alt=""
          width={asset.width}
          height={asset.height}
          className={styles.assetImage}
          sizes="(max-width: 680px) 100vw, 640px"
          // Só as opções da pergunta ATUAL existem no DOM — nenhuma arte de ramificação não
          // visitada é baixada. Como são poucas e ficam no topo da tela, carregar já (em vez de
          // esperar o observer do lazy) evita o card aparecer em branco na troca de pergunta.
          loading="eager"
        />
        {/* Marca o check DENTRO da caixa que a própria arte já desenhou vazia, na cor que ela
            usa (coordenadas medidas na imagem, ver `optionAssets.ts`) — nunca uma caixa nova. */}
        {selected && asset.checkbox && (
          <span
            className={styles.assetCheck}
            aria-hidden="true"
            style={{
              left: `${asset.checkbox.x * 100}%`,
              top: `${asset.checkbox.y * 100}%`,
              width: `${asset.checkbox.w * 100}%`,
              height: `${asset.checkbox.h * 100}%`,
              color: asset.checkbox.color,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4.5 12.5 10 18 19.5 6.5" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
        {/* Mesmos dois spans do cartão de texto (rótulo + descrição), só que invisíveis: a arte já
            mostra esse texto, mas ele precisa continuar existindo de verdade no DOM para leitores
            de tela e para o nome acessível do botão continuar idêntico ao de antes. */}
        <span className={styles.assetText}>
          <span>{label}</span>
          {description && <span>{description}</span>}
        </span>
      </button>
    );
  }

  return (
    <button
      ref={tiltRef}
      type="button"
      className={cx(styles.option, selected && styles.optionSelected)}
      aria-pressed={showCheck ? selected : undefined}
      disabled={disabled}
      onClick={onClick}
    >
      {showCheck && (
        <span className={cx(styles.optionCheck, selected && styles.optionCheckSelected)} aria-hidden="true">
          {selected ? "✓" : ""}
        </span>
      )}
      <span className={styles.optionText}>
        <span className={styles.optionLabel}>{label}</span>
        {description && <span className={styles.optionDescription}>{description}</span>}
      </span>
    </button>
  );
}

interface ContinueButtonProps {
  enabled: boolean;
  onClick: () => void;
}

/** Microfeedback ao ficar habilitado (briefing Microinterações, Seção 15) — um pulso curto quando
 * `enabled` passa de `false` para `true` (nunca na montagem, nunca enquanto já está habilitado). */
function ContinueButton({ enabled, onClick }: ContinueButtonProps) {
  const pulsing = useEnabledPulse(enabled);

  return (
    <Button onClick={onClick} disabled={!enabled} className={cx(pulsing && styles.continuePulse)}>
      Continuar
    </Button>
  );
}
