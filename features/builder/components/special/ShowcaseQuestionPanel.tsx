"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import gsap from "gsap";
import { validateAnswer } from "../../logic/validateAnswer";
import { isRepeatedClick } from "../../logic/repeatedClick";
import type { DraftProgress } from "../../logic/getProgress";
import type { AnswerValue, Question, QuestionOption, ServiceId } from "../../types";
import { playSound } from "@/features/design-system/motion/sound";
import { useSceneNavigation } from "@/features/design-system/motion/SceneTransition";
import { useReducedMotion } from "@/features/design-system/motion/useReducedMotion";
import { useSceneCutscene } from "@/features/design-system/motion/SceneCutscene";
import { useEnabledPulse } from "@/features/design-system/motion/useEnabledPulse";
import { cx } from "@/features/design-system/utils/cx";
import {
  SHOWCASE_LAB_ACCENTS,
  SHOWCASE_LAB_POST_IT,
  SHOWCASE_THEMES,
  getShowcaseLabVariant,
} from "./showcaseQuestionTheme";
import { animatePanelEntry, animatePanelExit } from "./panelMotion";
import { getShowcaseOptionIcon } from "./showcaseOptionIcons";
import styles from "./ShowcaseQuestionPanel.module.css";

export interface ShowcaseQuestionPanelProps {
  serviceId: ServiceId;
  question: Question;
  options: QuestionOption[];
  /** "Etapa geral" mostrada no cabeçalho escuro (etapa 1 = escolha do caminho). */
  stepNumber: number;
  /** O mesmo progresso da tela normal (`getProgress`) — integrado ao painel, nunca duplicado. */
  progress: DraftProgress;
  /** "Escolher outra área"/"Cancelar edição" — os mesmos controles da tela normal. */
  exitControls: ReactNode;
  canGoBack: boolean;
  /** Exatamente o "voltar" da tela normal (som, direção da transição, `backDraft`). */
  onBack: () => void;
  /** Grava a resposta pelo mesmo caminho da tela normal (`updateDraftAnswer`). `enterFromLeft`:
   * a cena saiu pela direita, então a próxima deve chegar pela esquerda (só escolhe o lado do
   * deslize da `SceneTransition` — não é um "voltar"). */
  onSubmit: (value: AnswerValue, options?: { enterFromLeft?: boolean }) => void;
}

/**
 * Cena especial de pergunta: painel/browser branco inclinado sobre o fundo escuro do Builder
 * (direção de arte aprovada pelo usuário). Só APRESENTA a pergunta que o Builder já escolheu —
 * nenhuma regra própria de fluxo: quem decide quando esta cena aparece é `getQuestionLayout`, e
 * voltar/gravar a resposta são os callbacks da tela normal, recebidos por props.
 *
 * Diferença de interação em relação à tela normal: aqui a escolha única também passa por "Próxima"
 * (a referência mostra a opção marcada em verde + o botão), em vez de avançar no próprio clique. A
 * regra do dado não muda — continua exigindo exatamente uma opção (`validateAnswer`), e a resposta
 * gravada é a mesma.
 */
export default function ShowcaseQuestionPanel({
  serviceId,
  question,
  options,
  stepNumber,
  progress,
  exitControls,
  canGoBack,
  onBack,
  onSubmit,
}: ShowcaseQuestionPanelProps) {
  const theme = SHOWCASE_THEMES[serviceId];
  // Laboratório de cor do caminho + timeline (ver `getShowcaseLabVariant`): a cena do Site não muda.
  const labVariant = getShowcaseLabVariant(question);
  const isLab = labVariant !== null;
  const accent = labVariant ? SHOWCASE_LAB_ACCENTS[labVariant] : theme.accent;
  const isMulti = question.type === "multi_choice";
  const [selected, setSelected] = useState<string[]>([]);
  const { isTransitioning } = useSceneNavigation();
  const reducedMotion = useReducedMotion();
  const { whenRevealed } = useSceneCutscene();
  const enterRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();
  // Saída em andamento: a trava que impede um segundo clique/Enter de disparar outra saída, outro
  // avanço ou outra gravação (o `data-leaving` do root também corta o ponteiro visualmente).
  const leavingRef = useRef(false);
  const [leaving, setLeaving] = useState(false);
  const exitTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const value: AnswerValue | undefined = isMulti ? selected : selected[0];
  const canSubmit = validateAnswer(question, value) && !isTransitioning;
  const pulsing = useEnabledPulse(canSubmit);

  // Microentrada própria da cena (nunca outra cutscene): sobe um pouco, aparece e termina de
  // "assentar" a inclinação. Espera a cortina da cutscene, se houver uma tocando.
  useEffect(() => {
    const element = enterRef.current;
    if (!element) return;
    if (reducedMotion) {
      gsap.set(element, { clearProps: "all" });
      return;
    }
    let tween: gsap.core.Tween | undefined;
    let timeline: gsap.core.Timeline | undefined;
    const cancelWait = whenRevealed(() => {
      if (isLab) {
        const all = (selector: string) => Array.from(element.querySelectorAll<HTMLElement>(selector));
        const one = (selector: string) => element.querySelector<HTMLElement>(selector);
        timeline = animatePanelEntry(
          {
            enter: element,
            slab: one(`.${styles.greenSlab}`),
            header: all(`.${styles.backHeader}, .${styles.progressTrack}, .${styles.tab}`),
            heading: all(`.${styles.title}, .${styles.subtitle}`),
            options: all(`.${styles.option}`),
            actions: one(`.${styles.actions}`),
            postIt: one(`.${styles.postIt}`),
          },
          () => {},
        );
        return;
      }
      tween = gsap.fromTo(
        element,
        { opacity: 0, y: 20, rotation: -1.5 },
        { opacity: 1, y: 0, rotation: 0, duration: 0.55, ease: "power3.out", clearProps: "transform" },
      );
    });
    return () => {
      cancelWait();
      tween?.kill();
      // `revert` (não só `kill`): se o efeito rodar de novo (Strict Mode), recomeça do zero.
      timeline?.revert();
    };
  }, [reducedMotion, whenRevealed, isLab]);

  // Se a cena sair no meio da saída (ex.: "Escolher outra área"), a timeline morre junto e o
  // avanço que ela dispararia no fim nunca acontece depois.
  useEffect(() => () => void exitTimelineRef.current?.kill(), []);

  function toggle(optionId: string) {
    if (leavingRef.current) return;
    playSound("card_select");
    if (isMulti) {
      setSelected((prev) => (prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]));
    } else {
      setSelected([optionId]);
    }
  }

  function submit(button: HTMLElement | null) {
    if (!canSubmit || value === undefined || leavingRef.current) return;
    playSound("scene_advance");
    const element = enterRef.current;
    if (!isLab || reducedMotion || !element) {
      onSubmit(value);
      return;
    }
    // Laboratório: a cena sai pela direita e SÓ ENTÃO o avanço de sempre acontece.
    leavingRef.current = true;
    setLeaving(true);
    exitTimelineRef.current = animatePanelExit({ enter: element, button }, () => onSubmit(value, { enterFromLeft: true }));
  }

  function handleBack(event: { detail: number }) {
    if (leavingRef.current || isRepeatedClick(event)) return;
    onBack();
  }

  const stepLabel = `${String(stepNumber).padStart(2, "0")}.`;

  return (
    <div
      className={cx(styles.root, isLab && styles.lab, labVariant === "blue" && styles.labBlue)}
      data-leaving={leaving || undefined}
      style={{ "--showcase-accent": accent } as CSSProperties}
    >
      <div className={styles.exitRow}>{exitControls}</div>

      <div ref={enterRef} className={styles.enter}>
        <div className={styles.stage}>
          {/* Cabeçalho escuro atrás do painel — é a MESMA progressão da tela normal, só que
              integrada à composição (a tela normal não mostra a própria barra nesta cena). */}
          <div className={styles.backPanel}>
            <div className={styles.backHeader}>
              <span className={styles.stepLabel}>
                {stepLabel} Pergunta do Builder ({theme.tag})
              </span>
              <span className={styles.progressCount}>
                {progress.current + 1}/{progress.total}
              </span>
            </div>
            <div
              className={styles.progressTrack}
              role="progressbar"
              aria-label="Progresso deste caminho"
              aria-valuemin={0}
              aria-valuemax={progress.total}
              aria-valuenow={progress.current + 1}
            >
              <div className={styles.progressFill} style={{ width: `${Math.max(progress.percentage, 4)}%` }} />
            </div>
          </div>

          <div className={styles.panelWrap}>
            <div className={styles.greenSlab} aria-hidden="true" />

            <section className={styles.panel} aria-labelledby={titleId}>
              <div className={styles.chrome} aria-hidden="true">
                <span className={styles.dots}>
                  <span className={styles.dotRed} />
                  <span className={styles.dotYellow} />
                  <span className={styles.dotGreen} />
                </span>
                <span className={styles.tab}>
                  <span className={styles.tabIcon}>
                    <GlobeIcon />
                  </span>
                  <span className={styles.tabLabel}>{theme.tag}</span>
                </span>
              </div>

              <div className={styles.content}>
                <h2 id={titleId} className={styles.title}>
                  {question.title}
                </h2>
                <p className={styles.subtitle}>
                  {isMulti ? "Selecione uma ou mais opções para continuarmos." : "Selecione uma opção para continuarmos."}
                </p>

                <div className={styles.grid} role="group" aria-labelledby={titleId}>
                  {options.map((option) => {
                    const isSelected = selected.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        className={cx(styles.option, isSelected && styles.optionSelected)}
                        aria-pressed={isSelected}
                        disabled={isTransitioning}
                        onClick={() => toggle(option.id)}
                      >
                        {/* Seleção nunca depende só de cor (regra do projeto, Fase 19): além do
                            verde, um check explícito no canto. */}
                        {isSelected && (
                          <span className={styles.optionCheck} data-selection-check aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none">
                              <path d="M5 12.5 10 17.5 19 7" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        )}
                        {getShowcaseOptionIcon(question.id, option.id) && (
                          <span className={styles.optionIcon} aria-hidden="true">
                            {getShowcaseOptionIcon(question.id, option.id)}
                          </span>
                        )}
                        <span className={styles.optionLabel}>{option.label}</span>
                        {option.description && <span className={styles.optionDescription}>{option.description}</span>}
                      </button>
                    );
                  })}
                </div>

                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.backButton}
                    onClick={handleBack}
                    disabled={!canGoBack || isTransitioning}
                  >
                    <ArrowIcon direction="left" />
                    Voltar
                  </button>
                  <button
                    type="button"
                    className={cx(styles.nextButton, pulsing && styles.nextPulse)}
                    onClick={(event) => {
                      if (!isRepeatedClick(event)) submit(event.currentTarget);
                    }}
                    disabled={!canSubmit}
                  >
                    Próxima
                    <ArrowIcon direction="right" />
                  </button>
                </div>
              </div>
            </section>

            {/* Post-it decorativo (asset aprovado, texto já faz parte da arte) — nunca recebe
                clique, então nunca bloqueia uma opção mesmo quando encosta nela. */}
            <Image
              src={labVariant ? SHOWCASE_LAB_POST_IT[labVariant] : "/assets/builder/special-question/sticky-note.png"}
              alt=""
              aria-hidden="true"
              width={560}
              height={560}
              className={styles.postIt}
              sizes="(max-width: 640px) 110px, 230px"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.6 2.6 3.9 5.6 3.9 9s-1.3 6.4-3.9 9c-2.6-2.6-3.9-5.6-3.9-9S9.4 5.6 12 3Z" />
      <path d="M4.6 7.5h14.8M4.6 16.5h14.8" />
    </svg>
  );
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={styles.arrow}
      style={direction === "left" ? { transform: "scaleX(-1)" } : undefined}
    >
      <path d="M4 12h15M13 5.5 19.5 12 13 18.5" />
    </svg>
  );
}
