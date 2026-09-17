"use client";

import { useCallback, useState } from "react";
import type { ServiceId } from "@/features/builder/types";
import AnimatedBackground from "./AnimatedBackground";
import DeckTransition, { type DeckDirection } from "./DeckTransition";
import SceneNavigation from "./SceneNavigation";
import ServicePickerScene from "./ServicePickerScene";
import QuestionPreviewScene from "./QuestionPreviewScene";
import CompletionScene from "./CompletionScene";
import styles from "./BuilderExperiencePoc.module.css";

type Scene = 1 | 2 | 3;

/**
 * Prova de conceito da linguagem de interação principal do Builder (fundo contínuo, cards
 * flutuantes, seleção separada de avançar, transição "deck") — isolada em
 * `features/builder-experience/`, nunca tocando `features/builder/state`, `features/builder/logic`
 * nem `MyUpgrade`. Estado 100% local a este componente: nenhuma seleção feita aqui é salva em
 * `BuilderContext` — isto é uma demonstração da CENA, não uma implementação alternativa do fluxo.
 *
 * 3 cenas: escolha de serviço (real, `SERVICES`) → primeira pergunta real do serviço escolhido
 * (`getExperienceQuestionPreview`) → encerramento da prova (permite testar avançar/voltar duas
 * vezes, com conteúdo diferente em cada cena, não só ida e volta entre as duas primeiras).
 */
export default function BuilderExperiencePoc() {
  const [scene, setScene] = useState<Scene>(1);
  const [selectedService, setSelectedService] = useState<ServiceId | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Partial<Record<ServiceId, string>>>({});
  const [direction, setDirection] = useState<DeckDirection>("forward");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleTransitioningChange = useCallback((value: boolean) => {
    setIsTransitioning(value);
  }, []);

  const selectedOptionId = selectedService ? (selectedOptions[selectedService] ?? null) : null;

  const canGoForward = scene === 1 ? selectedService !== null : scene === 2 ? selectedOptionId !== null : false;
  const canGoBack = scene > 1;

  function handleBack() {
    if (isTransitioning) return;
    if (scene === 2) {
      setDirection("backward");
      setScene(1);
    } else if (scene === 3) {
      setDirection("backward");
      setScene(2);
    }
  }

  function handleForward() {
    if (isTransitioning || !canGoForward) return;
    if (scene === 1) {
      setDirection("forward");
      setScene(2);
    } else if (scene === 2) {
      setDirection("forward");
      setScene(3);
    }
  }

  function handleSelectService(serviceId: ServiceId) {
    if (isTransitioning) return;
    setSelectedService(serviceId);
  }

  function handleSelectOption(optionId: string) {
    if (isTransitioning || !selectedService) return;
    setSelectedOptions((current) => ({ ...current, [selectedService]: optionId }));
  }

  function handleRestart() {
    if (isTransitioning) return;
    setDirection("backward");
    setScene(1);
    setSelectedService(null);
    setSelectedOptions({});
  }

  const sceneKey = scene === 2 ? `2-${selectedService}` : `scene-${scene}`;

  return (
    <div className={styles.stage} data-theme="dark">
      <AnimatedBackground />
      <div className={styles.content}>
        <DeckTransition sceneKey={sceneKey} direction={direction} onTransitioningChange={handleTransitioningChange}>
          {scene === 1 && <ServicePickerScene selected={selectedService} onSelect={handleSelectService} disabled={isTransitioning} />}
          {scene === 2 && selectedService && (
            <QuestionPreviewScene serviceId={selectedService} selectedOptionId={selectedOptionId} onSelect={handleSelectOption} disabled={isTransitioning} />
          )}
          {scene === 3 && <CompletionScene onRestart={handleRestart} />}
        </DeckTransition>
      </div>
      <SceneNavigation
        onBack={handleBack}
        onForward={handleForward}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        isTransitioning={isTransitioning}
        forwardHint={scene === 1 ? "Selecione uma área para continuar" : scene === 2 ? "Selecione uma opção para continuar" : undefined}
      />
    </div>
  );
}
