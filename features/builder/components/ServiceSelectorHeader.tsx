"use client";

import Image from "next/image";
import Link from "next/link";
import SoundToggle from "@/features/design-system/components/SoundToggle";
import { cx } from "@/features/design-system/utils/cx";
import styles from "./ServiceSelectorHeader.module.css";

interface ServiceSelectorHeaderProps {
  configuredCount: number;
  hasSomethingToReset: boolean;
  onToggleMyUpgrade: () => void;
  onResetSession: () => void;
}

const TOTAL_STEPS = 4;
const CURRENT_STEP = 1;

/**
 * Cabeçalho da tela "Escolha o seu Upgrade" (WF-03, Seção 4 do briefing) — visual próprio desta
 * cena (substitui `BuilderNavigation` só aqui, ver `BuilderShell.tsx`), mas SEM nenhuma lógica
 * nova: as duas ações reais (som, "Meu Upgrade") são as MESMAS de `BuilderNavigation`, recebidas
 * por props exatamente como lá — só o botão redondo de menu é novo, e ele aciona o MESMO drawer do
 * "Meu Upgrade" que já existe (não há um segundo "menu" de verdade no Builder para abrir).
 *
 * "ETAPA 1/4" é só um rótulo desta cena (o Builder não tem hoje um contador de 4 macro-fases nas
 * outras telas) — nenhum estado real é lido para ele, de propósito: inventar uma contagem para as
 * telas seguintes não foi pedido nesta tarefa e mudaria a experiência delas.
 */
export default function ServiceSelectorHeader({ configuredCount, hasSomethingToReset, onToggleMyUpgrade, onResetSession }: ServiceSelectorHeaderProps) {
  function handleResetClick() {
    if (window.confirm("Começar um novo projeto? Isso vai apagar o progresso atual.")) {
      onResetSession();
    }
  }

  return (
    <header className={styles.bar}>
      <Link href="/" className={styles.logo}>
        <Image src="/logo-mark.png" alt="" width={33} height={44} className={styles.logoMark} priority />
        Upgrade
      </Link>

      <div className={styles.center}>
        <span className={styles.stepLabel}>
          Etapa {CURRENT_STEP}/{TOTAL_STEPS}
        </span>
        <div className={styles.progress} role="presentation">
          {Array.from({ length: TOTAL_STEPS }, (_, index) => (
            <span key={index} className={cx(styles.segment, index === 0 && styles.segmentActive)} />
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <SoundToggle className={styles.soundToggle} />
        {hasSomethingToReset && (
          <button type="button" className={styles.resetLink} onClick={handleResetClick}>
            Começar de novo
          </button>
        )}
        <span className={styles.menuLabel}>Menu</span>
        <button
          type="button"
          className={styles.menuButton}
          onClick={onToggleMyUpgrade}
          aria-label={configuredCount > 0 ? `Meu Upgrade — ${configuredCount} serviço(s) configurado(s)` : "Meu Upgrade"}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
          {configuredCount > 0 && (
            <span className={styles.menuCount} aria-hidden="true">
              {configuredCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
