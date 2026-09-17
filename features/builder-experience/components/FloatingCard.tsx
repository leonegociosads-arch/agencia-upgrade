"use client";

import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/features/design-system/utils/cx";
import styles from "./FloatingCard.module.css";

export interface FloatingCardProps {
  label: string;
  description?: string;
  icon?: ReactNode;
  /** Posição entre os cards da mesma cena — só usado para dessincronizar a fase do floating
   * (Seção "Movimento dos cards": "não quero todos subindo e descendo juntos"). */
  index: number;
  selected: boolean;
  /** `false` quando qualquer card da cena está selecionado (Seção "Estado selecionado": "pode
   * reduzir ou pausar o floating") ou quando `prefers-reduced-motion` está ativo (via CSS). */
  floating: boolean;
  /** `true` quando OUTRO card da mesma cena está selecionado — "outros cards perdem destaque"
   * (briefing "Comportamento conceitual da transição"), nunca somem, só recuam em opacidade. */
  dimmed?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

/**
 * Card-base da Prova de Conceito (linguagem de interação do Builder) — um `<button>` real (nunca
 * uma `div` com `onClick`, briefing "Acessibilidade": "cards precisam funcionar com teclado").
 * O estado selecionado nunca depende só de cor: borda, fundo, sombra, escala E um selo de check
 * (`aria-pressed` + `.selectedMark`) — mesmo princípio já estabelecido em `Card`
 * (`features/design-system/components/Card.tsx`), reaplicado aqui com o floating por cima.
 */
export default function FloatingCard({ label, description, icon, index, selected, floating, dimmed, disabled, onSelect }: FloatingCardProps) {
  return (
    <button
      type="button"
      className={cx(styles.card, floating && styles.floating, selected && styles.selected, dimmed && styles.dimmed)}
      style={{ "--float-index": index } as CSSProperties}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
    >
      {selected && (
        <span className={styles.selectedMark} aria-hidden="true">
          ✓
        </span>
      )}
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={styles.label}>{label}</span>
      {description && <span className={styles.description}>{description}</span>}
    </button>
  );
}
