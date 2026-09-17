import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";
import styles from "./Checkbox.module.css";

export interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
}

/** `<input type="radio">` nativo (Fase 18) — mesmo raciocínio do `Checkbox.tsx` (controle nativo,
 * `accent-color` para a cor da marca); reaproveita o mesmo CSS por serem visualmente idênticos
 * além do tipo do input. */
const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio({ label, className, id, ...rest }, ref) {
  return (
    <label className={cx(styles.wrapper, className)} htmlFor={id}>
      <input ref={ref} type="radio" id={id} className={styles.input} {...rest} />
      <span className={styles.label}>{label}</span>
    </label>
  );
});

export default Radio;
