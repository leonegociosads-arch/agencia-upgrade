"use client";

import styles from "./EmptyUpgradeState.module.css";

interface EmptyUpgradeStateProps {
  onAddService: () => void;
}

/**
 * WF-13 (docs/WIREFRAME-SCREENS.md) — estado vazio do "Meu Upgrade". O botão leva ao seletor
 * principal (nunca inicia um serviço específico sozinho — quem escolhe qual é o usuário).
 */
export default function EmptyUpgradeState({ onAddService }: EmptyUpgradeStateProps) {
  return (
    <div className={styles.wrapper}>
      <p className={styles.message}>Seu Upgrade ainda está vazio.</p>
      <button type="button" className={styles.primaryButton} onClick={onAddService}>
        Adicionar um serviço
      </button>
    </div>
  );
}
