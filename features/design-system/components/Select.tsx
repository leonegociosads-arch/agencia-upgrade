import { forwardRef, type SelectHTMLAttributes } from "react";
import { cx } from "../utils/cx";
import inputStyles from "./Input.module.css";
import styles from "./Select.module.css";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

/** `<select>` nativo estilizado (Fase 18) — mantém todo o comportamento de teclado/leitor de tela
 * do controle nativo; só a seta é customizada (`appearance: none` + um `::after` no wrapper). */
const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ invalid, className, children, ...rest }, ref) {
  return (
    <span className={styles.wrapper}>
      <select
        ref={ref}
        className={cx(inputStyles.control, styles.select, invalid && inputStyles.invalid, className)}
        aria-invalid={invalid || undefined}
        {...rest}
      >
        {children}
      </select>
      <span className={styles.chevron} aria-hidden="true" />
    </span>
  );
});

export default Select;
