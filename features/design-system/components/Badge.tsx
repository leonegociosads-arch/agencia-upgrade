import type { ReactNode } from "react";
import { cx } from "../utils/cx";
import styles from "./Badge.module.css";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "error" | "info";

export interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

/** Selo pequeno (Fase 18) — status, categoria, contagem. Nunca a única forma de comunicar um
 * estado importante (ver `docs/DESIGN-SYSTEM.md`, Seção "Estados de seleção"): sempre acompanhado
 * de texto, nunca só uma bolinha colorida. */
export default function Badge({ tone = "neutral", children, className }: BadgeProps) {
  return <span className={cx(styles.badge, styles[tone], className)}>{children}</span>;
}
