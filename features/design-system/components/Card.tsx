import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";
import styles from "./Card.module.css";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** `surface-elevated` + sombra, em vez de `surface` plana (Fase 18, Seção "Bordas/Radius/Sombras"). */
  elevated?: boolean;
  padding?: "sm" | "md" | "lg";
  /**
   * Estado de seleção (Fase 18, Seção "Estados de seleção") — pensado para os cards de escolha do
   * Builder (Etapa 19 aplica isso lá). Nunca só cor: borda de destaque + fundo levemente tingido +
   * um ícone de check no canto — três sinais independentes, nenhum dependendo só de percepção de
   * cor (`docs/DESIGN-SYSTEM.md`, Seção "Acessibilidade").
   */
  selected?: boolean;
  children?: ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { elevated = false, padding = "md", selected = false, className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx(styles.card, elevated && styles.elevated, styles[`padding-${padding}`], selected && styles.selected, className)}
      {...rest}
    >
      {selected && (
        <span className={styles.selectedMark} aria-hidden="true">
          ✓
        </span>
      )}
      {children}
    </div>
  );
});

export default Card;
