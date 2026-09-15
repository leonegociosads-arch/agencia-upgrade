"use client";

import { useState, type ReactNode } from "react";
import { useBuilder } from "../state/BuilderContext";
import BuilderNavigation from "./BuilderNavigation";
import ServiceSelector from "./ServiceSelector";
import QuestionRenderer from "./QuestionRenderer";
import ServiceComplete from "./ServiceComplete";
import ProjectReview from "./ProjectReview";
import MyUpgrade from "./MyUpgrade";
import styles from "./BuilderShell.module.css";

/**
 * Orquestra as telas estruturais do Builder (WF-03/04/05/06/09-provisória) a partir do estado
 * central — nunca decide ramificação sozinho, apenas escolhe qual tela mostrar conforme
 * `activeService`/`step` (docs/TECHNICAL-ARCHITECTURE.md, Seção 6).
 *
 * Ordem de checagem importa: `"reviewing"` (PROJECT_REVIEW, Etapa 10) só é alcançado com
 * `activeService` nulo (o reducer garante isso em `FINALIZE_PROJECT`), então checá-lo primeiro é
 * seguro. Ao salvar um serviço NOVO, `activeService` permanece preenchido (para saber qual
 * serviço mostrar na tela de conclusão) mas `step` vira "service_complete" — por isso essa
 * checagem vem antes de renderizar `QuestionRenderer`.
 */
export default function BuilderShell() {
  const { state } = useBuilder();
  const [showMyUpgrade, setShowMyUpgrade] = useState(false);

  let content: ReactNode;
  if (state.step === "reviewing") {
    content = <ProjectReview />;
  } else if (state.activeService && state.step === "service_complete") {
    content = <ServiceComplete serviceId={state.activeService} />;
  } else if (state.activeService) {
    content = <QuestionRenderer serviceId={state.activeService} />;
  } else {
    content = <ServiceSelector />;
  }

  return (
    <div className={styles.shell}>
      <BuilderNavigation onToggleMyUpgrade={() => setShowMyUpgrade((prev) => !prev)} />

      <div className={styles.body}>
        {showMyUpgrade && (
          <div className={styles.upgradePanel}>
            <MyUpgrade />
          </div>
        )}

        {content}
      </div>
    </div>
  );
}
