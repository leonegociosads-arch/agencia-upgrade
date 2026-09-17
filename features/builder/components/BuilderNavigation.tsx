"use client";

import Image from "next/image";
import Link from "next/link";
import { useBuilder } from "../state/BuilderContext";
import SoundToggle from "@/features/design-system/components/SoundToggle";
import CustomCursor from "@/features/design-system/components/CustomCursor";
import styles from "./BuilderNavigation.module.css";

interface BuilderNavigationProps {
  onToggleMyUpgrade: () => void;
  /** "Começar de novo" (Fase 14) — sem destaque alto na UI, de propósito (ver
   * docs/SESSION-PERSISTENCE.md, "Reset manual"). */
  onResetSession: () => void;
}

/**
 * Navegação mínima do Builder (docs/WIREFRAME.md, Seção 21): logo, acesso ao Meu Upgrade.
 * "Voltar"/"Cancelar edição" ficam junto da pergunta (contexto local), não aqui.
 */
export default function BuilderNavigation({ onToggleMyUpgrade, onResetSession }: BuilderNavigationProps) {
  const { state } = useBuilder();
  const count = Object.keys(state.confirmedServices).length;
  const hasSomethingToReset = count > 0 || state.step !== "choosing_service";

  function handleResetClick() {
    if (window.confirm("Começar um novo projeto? Isso vai apagar o progresso atual.")) {
      onResetSession();
    }
  }

  return (
    <div className={styles.bar}>
      <CustomCursor />
      <Link href="/" className={styles.logo}>
        {/* Etapa 30 (Performance): dimensões intrínsecas = 2x o tamanho exibido (`.logoMark`,
         * `height: 22px`) — ver o mesmo comentário em `SiteHeader.tsx` para o racional completo. */}
        <Image src="/logo-mark.png" alt="" width={33} height={44} className={styles.logoMark} priority />
        Upgrade
      </Link>
      <div className={styles.actions}>
        <SoundToggle className={styles.soundToggle} />
        {hasSomethingToReset && (
          <button type="button" className={styles.resetLink} onClick={handleResetClick}>
            Começar de novo
          </button>
        )}
        <button type="button" className={styles.upgradeToggle} onClick={onToggleMyUpgrade}>
          Meu Upgrade {count > 0 ? `(${count})` : ""}
        </button>
      </div>
    </div>
  );
}
