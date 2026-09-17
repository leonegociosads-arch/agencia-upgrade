import type { ServiceId } from "@/features/builder/types";
import { getExperienceQuestionPreview } from "../data/experienceQuestions";
import ExperienceScene from "./ExperienceScene";
import FloatingCard from "./FloatingCard";
import styles from "./QuestionPreviewScene.module.css";

export interface QuestionPreviewSceneProps {
  serviceId: ServiceId;
  selectedOptionId: string | null;
  onSelect: (optionId: string) => void;
  disabled: boolean;
}

/**
 * Cena 2 da Prova de Conceito — a PRIMEIRA pergunta real do serviço escolhido em Cena 1
 * (`getExperienceQuestionPreview`, dado já aprovado, nunca inventado), com a mesma linguagem de
 * cards da Cena 1. Suficiente para validar a transição com conteúdo genuíno (briefing
 * "Implementação nesta prova": "apenas isso já é suficiente para testar a transição").
 */
export default function QuestionPreviewScene({ serviceId, selectedOptionId, onSelect, disabled }: QuestionPreviewSceneProps) {
  const { title, options } = getExperienceQuestionPreview(serviceId);

  return (
    <ExperienceScene
      eyebrow="Prova de conceito — Builder"
      title={title}
      description="Pergunta real do fluxo escolhido — usada aqui só para validar a transição de cena."
    >
      <div className={styles.grid}>
        {options.map((option, index) => (
          <FloatingCard
            key={option.id}
            index={index}
            label={option.label}
            description={option.description}
            selected={selectedOptionId === option.id}
            floating={selectedOptionId === null}
            dimmed={selectedOptionId !== null && selectedOptionId !== option.id}
            disabled={disabled}
            onSelect={() => onSelect(option.id)}
          />
        ))}
      </div>
    </ExperienceScene>
  );
}
