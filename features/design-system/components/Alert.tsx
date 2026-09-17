import type { ReactNode } from "react";
import { cx } from "../utils/cx";
import styles from "./Alert.module.css";

export type AlertTone = "success" | "warning" | "error" | "info";

const ICON: Record<AlertTone, string> = {
  success: "✓",
  warning: "!",
  error: "×",
  info: "i",
};

export interface AlertProps {
  tone: AlertTone;
  children: ReactNode;
  className?: string;
}

/** Bloco de feedback (Fase 18, Seção "Feedback") — `success`/`warning`/`error`/`info`. Sempre
 * ícone + texto, nunca só a cor da borda (mesmo princípio de `Badge`/`Card selected`). `role`
 * muda conforme a gravidade: erro é `alert` (interrompe o leitor de tela), o resto é `status`
 * (anuncia sem interromper). */
export default function Alert({ tone, children, className }: AlertProps) {
  return (
    <div className={cx(styles.alert, styles[tone], className)} role={tone === "error" ? "alert" : "status"}>
      <span className={styles.icon} aria-hidden="true">
        {ICON[tone]}
      </span>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
