"use client";

import Link from "next/link";
import { useBuilder } from "../state/BuilderContext";
import styles from "./BuilderNavigation.module.css";

interface BuilderNavigationProps {
  onToggleMyUpgrade: () => void;
}

/**
 * Navegação mínima do Builder (docs/WIREFRAME.md, Seção 21): logo, acesso ao Meu Upgrade.
 * "Voltar"/"Cancelar edição" ficam junto da pergunta (contexto local), não aqui.
 */
export default function BuilderNavigation({ onToggleMyUpgrade }: BuilderNavigationProps) {
  const { state } = useBuilder();
  const count = Object.keys(state.confirmedServices).length;

  return (
    <div className={styles.bar}>
      <Link href="/" className={styles.logo}>
        Agência Upgrade
      </Link>
      <button type="button" className={styles.upgradeToggle} onClick={onToggleMyUpgrade}>
        Meu Upgrade {count > 0 ? `(${count})` : ""}
      </button>
    </div>
  );
}
