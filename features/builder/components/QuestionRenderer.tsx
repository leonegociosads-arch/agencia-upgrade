"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import gsap from "gsap";
import { getNextQuestion } from "../logic/flow";
import { getOptionAsset, type OptionAsset } from "../data/optionAssets";
import { getProgress } from "../logic/getProgress";
import { getQuestionLayout, getQuestionNumber } from "../logic/getQuestionLayout";
import { isRepeatedClick } from "../logic/repeatedClick";
import ShowcaseQuestionPanel from "./special/ShowcaseQuestionPanel";
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
import { useReducedMotion } from "@/features/design-system/motion/useReducedMotion";
import { useSceneCutscene } from "@/features/design-system/motion/SceneCutscene";
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

  // "ETAPA GERAL 2" (pedido do usuário): a primeira pergunta de QUALQUER categoria — Site, Tráfego
  // Pago ou Design e Social Media — identificada estruturalmente por `current === 0` (nenhuma
  // resposta ainda no rascunho), o mesmo número que já vira "1 de N" na tela (`getProgress`), nunca
  // um estado novo. Verdadeiro tanto ao ENTRAR numa categoria nova quanto ao voltar até a primeira
  // pergunta — as duas situações são, na prática, "o começo deste caminho", e ambas merecem a
  // mesma apresentação. Único ponto de decisão: quem quiser (`QuestionOptions` abaixo) só precisa
  // perguntar "isFirstQuestionOfService?", nunca reimplementar a checagem por serviço.
  const isFirstQuestionOfService = current === 0;

  useEffect(() => {
    if (!isEditing && isDraftReadyToAutoSave(state)) {
      // `service_completed` (Fase 17) — só a configuração NOVA salva sozinha aqui; editar sempre
      // passa por "Confirmar alterações" (`service_edited`, abaixo), nunca por este efeito.
      trackEvent("service_completed", { serviceId, questionCount: state.draftHistory.length });
      saveServiceDraft();
    }
  }, [state, isEditing, saveServiceDraft, serviceId]);

  // Mesmo "voltar" nas duas apresentações (tela normal e cena especial `ShowcaseQuestionPanel`).
  function handleBack(event?: MouseEvent) {
    if (isTransitioning || isRepeatedClick(event)) return;
    playSound("scene_back");
    markBackward();
    backDraft();
  }

  const editingBadge = isEditing && <Badge tone="warning">Editando {SERVICES[serviceId].label}</Badge>;
  const exitButton = (
    <button
      type="button"
      className={styles.exitLink}
      onClick={(event) => {
        if (isTransitioning || isRepeatedClick(event)) return;
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
  );

  const topBar = (
    <div className={styles.topRow}>
      <button type="button" className={styles.backButton} onClick={handleBack} disabled={!canGoBackDraft() || isTransitioning}>
        ← Voltar
      </button>
      {editingBadge}
      {exitButton}
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
                onClick={(event) => {
                  if (isRepeatedClick(event)) return;
                  editDraftField(answeredQuestions[index].id);
                }}
              >
                Alterar
              </button>
            </div>
          ))}
        </div>

        <Button
          onClick={(event) => {
            if (isTransitioning || isRepeatedClick(event)) return;
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

  // Cena especial (painel/browser inclinado) só para as perguntas listadas em `getQuestionLayout` —
  // mesma pergunta, mesmas opções, mesmos callbacks; muda só a apresentação.
  if (getQuestionLayout(question, state.serviceDraft) === "browser-panel") {
    const options = typeof question.options === "function" ? question.options(state.serviceDraft) : question.options;
    // Posição REAL da pergunta no caminho. `current` (contagem de respostas) só coincide com ela
    // num fluxo novo — ao reabrir uma resposta na revisão de uma edição, as respostas SEGUINTES já
    // existem e o painel mostrava "3/3" numa pergunta que é a 2ª (bug real).
    const questionNumber = getQuestionNumber(question, state.serviceDraft);
    const answeredBefore = Math.max(questionNumber - 1, 0);
    return (
      <ShowcaseQuestionPanel
        key={question.id}
        serviceId={serviceId}
        question={question}
        options={options}
        stepNumber={questionNumber + 1}
        progress={{ current: answeredBefore, total, percentage: total > 0 ? Math.round((answeredBefore / total) * 100) : 0 }}
        exitControls={
          <div className={styles.topRow}>
            {editingBadge}
            {exitButton}
          </div>
        }
        canGoBack={canGoBackDraft()}
        onBack={handleBack}
        onSubmit={(value) => {
          if (isTransitioning) return;
          markForward();
          updateDraftAnswer(question.id, value);
        }}
      />
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
          de um efeito para resetá-lo (evita setState síncrono dentro de efeito) — e, como efeito
          colateral útil, remonta o componente inteiro a cada pergunta nova, exatamente o gatilho
          que a entrada/flutuação abaixo precisam para tocar uma vez por pergunta. */}
      <QuestionOptions
        key={question.id}
        question={question}
        answers={state.serviceDraft}
        isFirstQuestionOfService={isFirstQuestionOfService}
        onAnswer={(value) => updateDraftAnswer(question.id, value)}
      />
    </div>
  );
}

/**
 * Entrada forte da ETAPA GERAL 2 (pedido do usuário, Seções 4-9) — esquerda → posição final, um
 * card de cada vez. Isolada nesta função (em vez de escrita inline no efeito) de propósito: uma
 * futura cutscene entre "Escolha o seu Upgrade" e esta tela vai precisar se encaixar exatamente
 * aqui, sem tocar no resto — o momento em que a categoria foi escolhida já existe
 * (`ServiceSelector.handleSelect`), o momento da transição de cena já existe (`SceneTransition`), e
 * o momento em que os cards estão prontos pra animar é este `cards` recebido como parâmetro; quem
 * chamar esta função no futuro pode, por exemplo, atrasá-la até a cutscene terminar, sem precisar
 * duplicar a coreografia em si. Retorna o tween para o chamador poder cancelá-lo (`.kill()`) se o
 * componente desmontar no meio da entrada.
 */
function animateFirstQuestionEntry(cards: HTMLElement[], onSettled: () => void) {
  return gsap.fromTo(
    cards,
    { x: -72, opacity: 0 },
    {
      x: 0,
      opacity: 1,
      duration: 0.6,
      // Cada card começa antes do anterior terminar (0.09s de espaçamento numa animação de 0.6s) —
      // é isso que produz a sensação de sequência contínua pedida, não N animações independentes.
      stagger: 0.09,
      ease: "power3.out",
      onComplete: onSettled,
    },
  );
}

/**
 * Microflutuação "interface viva" (Seção 3) — deliberadamente muito mais discreta que a dos 3
 * cards de "Escolha o seu Upgrade" (`ServiceSelectorCard.tsx`, onde o movimento É o protagonista da
 * cena): aqui é só um sinal de vida que nunca pode competir com a leitura da pergunta. Só
 * `y`/`opacity` (nunca rotação — Seção 3: "não use rotação perceptível"), amplitude de poucos
 * pixels, duração bem mais longa que qualquer outra animação do projeto, e uma pequena variação de
 * duração por índice para os cards nunca ficarem visivelmente sincronizados. Retorna a função de
 * limpeza (mata os tweens ao desmontar/trocar de pergunta).
 */
function startOptionFloat(cards: HTMLElement[]) {
  const tweens = cards.map((card, index) =>
    gsap.to(card, {
      y: -(3 + (index % 3)),
      duration: 3.2 + index * 0.35,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    }),
  );
  return () => tweens.forEach((tween) => tween.kill());
}

interface QuestionOptionsProps {
  question: Question;
  answers: Record<string, AnswerValue>;
  isFirstQuestionOfService: boolean;
  onAnswer: (value: AnswerValue) => void;
}

function QuestionOptions({ question, answers, isFirstQuestionOfService, onAnswer }: QuestionOptionsProps) {
  const options = typeof question.options === "function" ? question.options(answers) : question.options;
  const [pending, setPending] = useState<string[]>([]);
  const { isTransitioning, markForward } = useSceneNavigation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();
  const { whenRevealed } = useSceneCutscene();

  function toggleMulti(optionId: string) {
    setPending((prev) => (prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]));
  }

  const hasSelection = question.type === "multi_choice" && pending.length > 0;

  // Roda uma vez por pergunta (o componente inteiro remonta a cada troca — ver comentário no
  // `key={question.id}` do chamador). Ordem sempre: PRIMEIRO a entrada (só na Etapa Geral 2),
  // DEPOIS a flutuação — nunca as duas ao mesmo tempo (Seção 15).
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const cards = Array.from(container.querySelectorAll<HTMLElement>(`.${styles.assetOption}, .${styles.option}`));
    if (cards.length === 0) return;

    // Motion reduzido (Seção 12): sem entrada lateral, sem flutuação — só garante que os cards
    // fiquem no estado visual final (o CSS abaixo já cuida disso sozinho; isto é só uma segurança
    // contra um `transform`/`opacity` inline que uma execução anterior possa ter deixado).
    if (reducedMotion) {
      gsap.set(cards, { clearProps: "transform,opacity" });
      return;
    }

    let floatCleanup: (() => void) | undefined;
    let entryTween: gsap.core.Tween | undefined;
    // Se esta cena chegou por trás de uma cutscene (`SceneCutscene`), espera a cortina terminar de
    // revelar antes de qualquer movimento — cortina, depois entrada, depois flutuação. Os cards
    // continuam escondidos pelo `.optionsFirstEntry` enquanto isso (sem flash).
    const cancelWait = whenRevealed(() => {
      if (!isFirstQuestionOfService) {
        floatCleanup = startOptionFloat(cards);
        return;
      }
      entryTween = animateFirstQuestionEntry(cards, () => {
        // Duas limpezas, nesta ordem exata: primeiro tira a classe que aplica o `opacity: 0`
        // inicial (Seção 9) — ela precisa sumir assim que a entrada assenta, senão ficaria
        // reivindicando `opacity` de novo depois do próximo passo. Só então devolve `opacity`
        // para o CSS normal (`clearProps`) — sem isto, o `opacity: 1` que o GSAP deixou inline
        // (sempre vence uma regra de classe) impediria para sempre o
        // `.assetOption:disabled { opacity: 0.7 }` de fazer efeito nesta pergunta.
        container.classList.remove(styles.optionsFirstEntry);
        gsap.set(cards, { clearProps: "opacity" });
        floatCleanup = startOptionFloat(cards);
      });
    });

    return () => {
      cancelWait();
      entryTween?.kill();
      floatCleanup?.();
    };
  }, [isFirstQuestionOfService, reducedMotion, whenRevealed]);

  return (
    <>
      <div
        ref={containerRef}
        className={cx(styles.options, hasSelection && styles.optionsHasSelection, isFirstQuestionOfService && styles.optionsFirstEntry)}
      >
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
              onClick={(event) => {
                if (question.type === "multi_choice") {
                  playSound("card_select");
                  toggleMulti(option.id);
                  return;
                }
                // Escolha única troca a tela no clique — o 2º clique de um clique duplo cairia na
                // pergunta seguinte (ver `repeatedClick.ts`).
                if (isTransitioning || isRepeatedClick(event)) return;
                playSound("card_select");
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
            onClick={(event) => {
              if (!validateAnswer(question, pending) || isTransitioning || isRepeatedClick(event)) return;
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
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
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
/**
 * A posição da caixa de seleção (`asset.checkbox`) foi medida no PNG original, sem zoom. A máscara
 * (`.assetImageMask`) agora cresce em ALTURA junto com o zoom (`aspectRatio` calculado em
 * `maskAspectRatio` abaixo) exatamente o suficiente para caber a imagem ampliada inteira — corrige
 * o corte no topo/rodapé que existia quando a máscara ficava com a altura da imagem SEM zoom
 * (bug real relatado pelo usuário: "as imagens... estão sendo cortadas da parte de cima e a parte
 * de baixo"). Só a LARGURA continua menor que a imagem ampliada (a margem transparente lateral que
 * o zoom existe para recortar).
 *
 * Por isso o eixo vertical do check (`y`/`h`) usa a fração medida no PNG original sem nenhum
 * ajuste: como a altura da máscara cresce na MESMA proporção que a imagem, a imagem passa a
 * preencher a máscara verticalmente de ponta a ponta (sem sobra, sem corte), então uma fração
 * vertical do PNG original já é, também, a fração vertical correta dentro da máscara. Já o eixo
 * horizontal (`x`/`w`) continua com a fórmula de "distância ao centro × escala": a máscara
 * permanece mais estreita que a imagem ampliada nesse eixo (o recorte lateral pretendido), então a
 * posição horizontal real muda em relação ao centro do botão exatamente como antes.
 */
function scaledCheckboxRect(checkbox: NonNullable<OptionAsset["checkbox"]>, scale: number) {
  return {
    x: 0.5 + (checkbox.x - 0.5) * scale,
    y: checkbox.y,
    w: checkbox.w * scale,
    h: checkbox.h,
  };
}

/** Proporção (largura/altura) da máscara de zoom — largura igual à do PNG original (é ela quem
 * define o recorte lateral pretendido) e altura já multiplicada pelo `visualScale`, para a máscara
 * crescer junto com o zoom e nunca cortar a imagem ampliada por cima/por baixo. */
function maskAspectRatio(asset: OptionAsset): string {
  return `${asset.width} / ${asset.height * asset.visualScale}`;
}

function OptionCard({ question, optionId, label, description, selected, showCheck, disabled, onClick }: OptionCardProps) {
  const tiltRef = useTilt<HTMLButtonElement>(2.5);
  const asset = getOptionAsset(question, optionId);
  const checkboxRect = asset?.checkbox ? scaledCheckboxRect(asset.checkbox, asset.visualScale) : null;

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
        {/* Máscara de zoom óptico (`visualScale`, ver comentário em `optionAssets.ts`) — recorta só
            a margem transparente que já sobrava ao redor da peça real, nunca o próprio desenho.
            `overflow: hidden` fica NESTA camada interna, nunca no `<button>` (`.assetOption`): um
            `overflow: hidden` no mesmo elemento do `:focus-visible` cortaria o próprio anel de
            foco, que é desenhado por fora da caixa (mesmo cuidado já tomado em
            `ServiceSelectorCard.module.css`/`.imageMask`). */}
        <span className={styles.assetImageMask} style={{ aspectRatio: maskAspectRatio(asset) }}>
          <Image
            src={asset.src}
            alt=""
            width={asset.width}
            height={asset.height}
            className={styles.assetImage}
            style={asset.visualScale !== 1 ? { transform: `scale(${asset.visualScale})` } : undefined}
            sizes="(max-width: 680px) 100vw, 640px"
            // Só as opções da pergunta ATUAL existem no DOM — nenhuma arte de ramificação não
            // visitada é baixada. Como são poucas e ficam no topo da tela, carregar já (em vez de
            // esperar o observer do lazy) evita o card aparecer em branco na troca de pergunta.
            loading="eager"
          />
        </span>
        {/* Marca o check DENTRO da caixa que a própria arte já desenhou vazia, na cor que ela
            usa (coordenadas medidas na imagem, ver `optionAssets.ts`) — nunca uma caixa nova. */}
        {selected && checkboxRect && (
          <span
            className={styles.assetCheck}
            aria-hidden="true"
            style={{
              left: `${checkboxRect.x * 100}%`,
              top: `${checkboxRect.y * 100}%`,
              width: `${checkboxRect.w * 100}%`,
              height: `${checkboxRect.h * 100}%`,
              color: asset.checkbox!.color,
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
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
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
