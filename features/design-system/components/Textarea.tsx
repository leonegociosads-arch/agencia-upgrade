import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cx } from "../utils/cx";
import inputStyles from "./Input.module.css";
import styles from "./Textarea.module.css";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

/** Mesmo estilo-base do `Input` (Fase 18) — reaproveita `Input.module.css` para não duplicar
 * cor/borda/foco, só ajusta altura/resize (`Textarea.module.css`). */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ invalid, className, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      className={cx(inputStyles.control, styles.textarea, invalid && inputStyles.invalid, className)}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
});

export default Textarea;
