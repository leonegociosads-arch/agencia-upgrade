"use client";

import styles from "./SceneNavigation.module.css";

export interface SceneNavigationProps {
  onBack: () => void;
  onForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  isTransitioning: boolean;
  /** Mensagem visível quando avançar ainda não está disponível — reforça "selecionar ≠ avançar"
   * (briefing "Navegação") sem depender só do estado visual do botão desabilitado. */
  forwardHint?: string;
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {direction === "left" ? <path d="M15 6 9 12l6 6" /> : <path d="m9 6 6 6-6 6" />}
    </svg>
  );
}

/**
 * Navegação por setas da Prova de Conceito (briefing "Navegação"/"Estado selecionado"). Nunca
 * avança sozinha ao selecionar — só reage a clique real nesta barra, sempre com botões de verdade
 * (foco/teclado nativos). Vira barra fixa no rodapé em telas pequenas (briefing "Mobile": "botão
 * de avançar fixo").
 */
export default function SceneNavigation({ onBack, onForward, canGoBack, canGoForward, isTransitioning, forwardHint }: SceneNavigationProps) {
  return (
    <div className={styles.bar}>
      <button type="button" className={styles.arrow} onClick={onBack} disabled={!canGoBack || isTransitioning} aria-label="Voltar para a cena anterior">
        <ArrowIcon direction="left" />
        <span>Voltar</span>
      </button>

      {forwardHint && !canGoForward && (
        <span className={styles.hint} role="status">
          {forwardHint}
        </span>
      )}

      <button type="button" className={styles.arrowPrimary} onClick={onForward} disabled={!canGoForward || isTransitioning} aria-label="Avançar para a próxima cena">
        <span>Avançar</span>
        <ArrowIcon direction="right" />
      </button>
    </div>
  );
}
