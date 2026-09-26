"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useBuilder } from "../state/BuilderContext";
import { useBuilderSessionPersistence } from "../state/useBuilderSessionPersistence";
import { getSceneKey } from "../logic/getSceneKey";
import SceneTransition from "@/features/design-system/motion/SceneTransition";
import { SceneCutsceneProvider } from "@/features/design-system/motion/SceneCutscene";
import Drawer from "@/features/design-system/motion/Drawer";
import { useScrollLock } from "@/features/design-system/motion/useScrollLock";
import { playSound, preloadSoundEffect } from "@/features/design-system/motion/sound";
import BuilderNavigation from "./BuilderNavigation";
import BuilderMovingBackground from "./BuilderMovingBackground";
import ParticleNucleusBackground from "./ParticleNucleusBackground";
import { getProgress } from "../logic/getProgress";
import ServiceSelector from "./ServiceSelector";
import QuestionRenderer from "./QuestionRenderer";
import ServiceCompleteScene, { ServiceCompleteBackdrop } from "./serviceComplete/ServiceCompleteScene";
import ProjectReview from "./ProjectReview";
import MyUpgrade from "./MyUpgrade";
import LeadForm from "@/features/lead/components/LeadForm";
import SubmissionSuccess from "@/features/lead/components/SubmissionSuccess";
import SubmissionError from "@/features/lead/components/SubmissionError";
import styles from "./BuilderShell.module.css";

/**
 * Orquestra as telas estruturais do Builder (WF-03/04/05/06/09/10/11/12) a partir do estado
 * central — nunca decide ramificação sozinho, apenas escolhe qual tela mostrar conforme
 * `activeService`/`step` (docs/TECHNICAL-ARCHITECTURE.md, Seção 6).
 *
 * Ordem de checagem importa: `"reviewing"`/`"contact"`/`"submitting"`/`"success"`/`"error"` só são
 * alcançados com `activeService` nulo (o reducer garante isso), então checá-los primeiro é seguro.
 * `"contact"` e `"submitting"` mostram o MESMO componente (`LeadForm`) — "enviando" é só o mesmo
 * formulário travado, não uma tela própria (Etapa 12); é o próprio `LeadForm` que decide, olhando
 * `state.step`, se deve desabilitar os campos. Ao salvar um serviço NOVO, `activeService`
 * permanece preenchido (para saber qual serviço mostrar na tela de conclusão) mas `step` vira
 * "service_complete" — por isso essa checagem vem antes de renderizar `QuestionRenderer`.
 */
export default function BuilderShell() {
  const { state } = useBuilder();
  const [showMyUpgrade, setShowMyUpgrade] = useState(false);
  const { isHydrating, justRestored, resetSession } = useBuilderSessionPersistence();

  // A partir da Etapa 11: o Resumo do Projeto e as telas de contato/envio já têm sua própria
  // forma de navegar/editar — mostrar o painel "Meu Upgrade" ao mesmo tempo duplicaria ações em
  // dois lugares da tela (descoberto no teste manual da Etapa 11). Lista de permissão (em vez de
  // negação) para nunca esquecer de excluir um novo `step` futuro por engano. `showMyUpgrade`
  // continua com o mesmo valor por baixo — o painel volta a aparecer normalmente assim que
  // "Voltar" retornar a um desses três estados.
  const canShowMyUpgradePanel =
    state.step === "choosing_service" || state.step === "configuring" || state.step === "service_complete";
  // Drawer é um overlay de tela cheia sobre o Builder (Fase Smooth Scroll, Seção 27 do briefing:
  // "avaliar bloqueio de scroll"; Seção 4: continua funcionando sem depender do Lenis — o Builder
  // nunca tem uma instância ativa). Precisa vir antes do `return` antecipado de `isHydrating`
  // logo abaixo (regra dos Hooks: sempre chamado, nunca condicional).
  useScrollLock(showMyUpgrade && canShowMyUpgradePanel);

  // Efeito do "Começar de novo" já baixado antes do primeiro clique.
  useEffect(() => {
    preloadSoundEffect("reset");
  }, []);

  // Estado curto de hidratação (Fase 14) — evita mostrar o seletor vazio por um instante antes de
  // trocar para uma sessão restaurada (docs/SESSION-PERSISTENCE.md, "Hidratação"). A checagem real
  // de localStorage só acontece depois da montagem no cliente, nunca durante o render em si, para
  // nunca gerar hydration mismatch de SSR — por isso o valor inicial aqui é sempre o mesmo no
  // servidor e no primeiro render do cliente.
  if (isHydrating) {
    return (
      <div className={styles.shell}>
        <div className={styles.hydrating}>Carregando...</div>
      </div>
    );
  }

  let content: ReactNode;
  if (state.step === "success") {
    content = <SubmissionSuccess onStartNewProject={resetSession} />;
  } else if (state.step === "error") {
    content = <SubmissionError />;
  } else if (state.step === "contact" || state.step === "submitting") {
    content = <LeadForm />;
  } else if (state.step === "reviewing") {
    content = <ProjectReview />;
  } else if (state.activeService && state.step === "service_complete") {
    content = <ServiceCompleteScene serviceId={state.activeService} />;
  } else if (state.activeService) {
    content = <QuestionRenderer serviceId={state.activeService} />;
  } else {
    content = <ServiceSelector onToggleMyUpgrade={handleToggleMyUpgrade} onResetSession={resetSession} />;
  }

  function closeMyUpgrade() {
    playSound("panel_close");
    setShowMyUpgrade(false);
  }

  function handleToggleMyUpgrade() {
    setShowMyUpgrade((prev) => {
      playSound(prev ? "panel_close" : "panel_open");
      return !prev;
    });
  }

  // A tela "Escolha o seu Upgrade" (WF-03) tem seu próprio cabeçalho, integrado ao cenário
  // espacial (pedido do usuário, ver `ServiceSelectorHeader.tsx`) — `BuilderNavigation` (a barra
  // plana de sempre) só faz sentido nas outras telas, que continuam 100% inalteradas. Nenhuma
  // lógica nova: `ServiceSelectorHeader` recebe as MESMAS duas funções (`onToggleMyUpgrade`/
  // `onResetSession`) que `BuilderNavigation` sempre recebeu, só muda quem desenha o botão.
  const isChoosingService = state.step === "choosing_service";
  // Fundo infinito só nas telas de pergunta; montado aqui (fora do SceneTransition) para seguir
  // andando entre uma pergunta e outra, e já estar pronto quando a cutscene revela a tela.
  const isQuestionScreen = state.step === "configuring" && state.activeService !== null;
  // Terceira etapa = segunda pergunta do caminho (etapa 1 = escolha do caminho, etapa 2 = primeira
  // pergunta) — mesmo cálculo do "2 de N" da barra de progresso.
  // Tela "Serviço adicionado": cenário preto próprio (terreno fixo na base), também fora da transição.
  const isServiceComplete = state.step === "service_complete" && state.activeService !== null;
  const isThirdStep = isQuestionScreen && state.activeService !== null && getProgress(state.activeService, state.serviceDraft).current === 1;

  return (
    <SceneCutsceneProvider>
      <div className={isQuestionScreen || isServiceComplete ? `${styles.shell} ${styles.shellTransparent}` : styles.shell}>
        {isQuestionScreen && <BuilderMovingBackground theme={state.activeService ?? undefined} />}
        {isQuestionScreen && <ParticleNucleusBackground active={isThirdStep} theme={state.activeService ?? undefined} />}
        {isServiceComplete && <ServiceCompleteBackdrop />}
        {!isChoosingService && <BuilderNavigation onToggleMyUpgrade={handleToggleMyUpgrade} onResetSession={resetSession} />}

        {justRestored && <div className={styles.restoredBanner}>Seu progresso foi recuperado.</div>}

        <div className={styles.body}>
          {/* Drawer (desktop: painel lateral; mobile: bottom sheet — só CSS, `BuilderShell.module.css`
           * decide via media query) — Fase 19, Seção 12; abertura/fechamento animados via GSAP desde
           * a Fase GSAP e Transições (`Drawer`, Seção 24-25). Fecha pelo "×" ou por Esc — não mais
           * clicando no fundo escurecido (Etapa 31: `.upgradeOverlay` virou `pointer-events: none`
           * para não bloquear a interação com a tela por baixo, já que este painel é uma seção
           * persistente, não um modal — ver o comentário em `BuilderShell.module.css`). Sem
           * `overlayProps.onClick` porque um elemento com `pointer-events: none` nunca recebe clique. */}
          <Drawer
            open={showMyUpgrade && canShowMyUpgradePanel}
            overlayClassName={styles.upgradeOverlay}
            panelClassName={styles.upgradePanel}
            onClose={closeMyUpgrade}
          >
            <MyUpgrade onClose={closeMyUpgrade} />
          </Drawer>

          <SceneTransition sceneKey={getSceneKey(state)}>{content}</SceneTransition>
        </div>
      </div>
    </SceneCutsceneProvider>
  );
}
