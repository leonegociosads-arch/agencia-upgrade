import { cx } from "../utils/cx";
import styles from "./Spinner.module.css";

export interface SpinnerProps {
  /** `currentColor` por padrão — herda a cor de texto de quem o envolve (ex.: `Button`). */
  size?: "sm" | "md";
  className?: string;
  /** `true` quando outro elemento já anuncia o estado de carregamento (ex.: `Button loading`, via
   * `aria-busy`) — evita que o nome acessível do Spinner ("Carregando") se misture ao nome
   * acessível de quem o envolve. Padrão `false`: o Spinner anuncia a si mesmo. */
  decorative?: boolean;
}

/** Indicador de carregamento (Fase 18, "Feedback" — loading). CSS puro, sem dependência externa;
 * `@media (prefers-reduced-motion: reduce)` (`styles/tokens.css`) já neutraliza a rotação para
 * quem pediu menos movimento. */
export default function Spinner({ size = "md", className, decorative = false }: SpinnerProps) {
  return (
    <span
      className={cx(styles.spinner, size === "sm" && styles.sm, className)}
      role={decorative ? undefined : "status"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : "Carregando"}
    />
  );
}
