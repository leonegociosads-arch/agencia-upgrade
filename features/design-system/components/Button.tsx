import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cx } from "../utils/cx";
import Spinner from "./Spinner";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Mostra o `Spinner` no lugar do conteúdo e desabilita o botão (Fase 18, Seção "Botões" —
   * estado `loading`). O texto original continua no DOM (`aria-live` via `aria-busy`), só
   * visualmente escondido, para leitores de tela não perderem o rótulo do botão. */
  loading?: boolean;
  fullWidth?: boolean;
}

/**
 * Botão-base do Design System (Fase 18) — `docs/DESIGN-SYSTEM.md`, Seção "Botões". Nenhuma cor é
 * escrita aqui diretamente: tudo vem de `--ds-*` (`styles/tokens.css`). Texto sobre
 * `variant="primary"` é sempre `--ds-color-on-accent` (quase preto), nunca branco — é a única
 * combinação que atinge contraste adequado sobre o verde da marca nos dois temas (ver
 * `docs/DESIGN-SYSTEM.md`, Seção "Contraste").
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading = false, fullWidth = false, disabled, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={rest.type ?? "button"}
      className={cx(
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        loading && styles.loading,
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <Spinner decorative size={size === "lg" ? "md" : "sm"} className={styles.spinner} />}
      <span className={loading ? styles.hiddenLabel : undefined}>{children}</span>
    </button>
  );
});

export default Button;
