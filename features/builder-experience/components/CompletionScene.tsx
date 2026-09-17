import Button from "@/features/design-system/components/Button";
import ExperienceScene from "./ExperienceScene";
import styles from "./CompletionScene.module.css";

export interface CompletionSceneProps {
  onRestart: () => void;
}

/**
 * Cena 3 (fechamento da prova) — não faz parte do fluxo real do Builder; existe só para a Cena 2
 * também poder demonstrar "Avançar" (não só "Voltar"), provando que a transição funciona nos dois
 * sentidos com conteúdo diferente em cada extremidade, não só entre as Cenas 1 e 2.
 */
export default function CompletionScene({ onRestart }: CompletionSceneProps) {
  return (
    <ExperienceScene
      eyebrow="Prova de conceito — Builder"
      title="Fim da prova de conceito"
      description="Essa é a mesma transição de cena que seria replicada nas próximas perguntas do fluxo real, depois de aprovada."
    >
      <div className={styles.actions}>
        <Button onClick={onRestart}>Reiniciar prova</Button>
      </div>
    </ExperienceScene>
  );
}
