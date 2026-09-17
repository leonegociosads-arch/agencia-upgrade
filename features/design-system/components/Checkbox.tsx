import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";
import styles from "./Checkbox.module.css";

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
}

/**
 * `<input type="checkbox">` nativo (Fase 18) — deliberadamente não um box customizado desenhado à
 * mão: um controle nativo já vem com todo o comportamento de teclado/leitor de tela correto de
 * graça, e `accent-color` (suportado por todos os navegadores modernos relevantes) já aplica a cor
 * da marca sem reconstruir a caixinha do zero. Suficiente para a fundação desta fase — um visual
 * mais elaborado pode vir depois sem mudar a API deste componente.
 */
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ label, className, id, ...rest }, ref) {
  return (
    <label className={cx(styles.wrapper, className)} htmlFor={id}>
      <input ref={ref} type="checkbox" id={id} className={styles.input} {...rest} />
      <span className={styles.label}>{label}</span>
    </label>
  );
});

export default Checkbox;
