import type { ServiceId } from "../types";
import styles from "./BuilderMovingBackground.module.css";

export interface BuilderMovingBackgroundProps {
  /** Reservado para variações por caminho no futuro — hoje o visual é o mesmo nos três. */
  theme?: ServiceId;
}

/**
 * Fundo "seamless infinite scrolling" das telas de pergunta: um tile SVG hexagonal repetido numa
 * superfície maior que a viewport, deslocada em loop por CSS (só `transform`). Montado pelo
 * `BuilderShell` fora da troca de cena, então segue andando entre as perguntas sem reiniciar.
 */
export default function BuilderMovingBackground({ theme }: BuilderMovingBackgroundProps) {
  return (
    <div className={styles.background} data-theme={theme} aria-hidden="true">
      <div className={styles.pattern} />
      <div className={styles.vignette} />
    </div>
  );
}
