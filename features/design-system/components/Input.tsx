import { forwardRef, type InputHTMLAttributes } from "react";
import { cx } from "../utils/cx";
import styles from "./Input.module.css";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

/** Campo de texto-base (Fase 18) — cobre `text`/`email`/`tel`/etc. via a prop nativa `type`, sem
 * precisar de um componente por tipo. Estados `default`/`focus`/`filled`/`disabled` em CSS puro;
 * `error` via a prop `invalid` (normalmente definida a partir de `FormField error=...`). */
const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ invalid, className, ...rest }, ref) {
  return (
    <input
      ref={ref}
      className={cx(styles.control, invalid && styles.invalid, className)}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
});

export default Input;
