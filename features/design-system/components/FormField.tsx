import { cloneElement, isValidElement, type ReactNode } from "react";
import styles from "./FormField.module.css";

export interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

/**
 * Envolve um controle (`Input`/`Textarea`/`Select`) com label e mensagem — padrão único de erro
 * em todo o Design System (Fase 18, Seção "Inputs": "mensagens de erro devem ter padrão
 * consistente"). Quem chama garante que `htmlFor` bate com o `id` do controle passado como filho —
 * é essa associação real (não só visual) que faz leitores de tela lerem o rótulo certo.
 */
export default function FormField({ label, htmlFor, error, hint, required, children }: FormFieldProps) {
  const messageId = error ? `${htmlFor}-error` : hint ? `${htmlFor}-hint` : undefined;

  // Liga a mensagem de erro/dica ao controle via `aria-describedby` (além do `htmlFor`/`id` do
  // rótulo) — só quando o filho é um único elemento real, para nunca quebrar um uso composto.
  const control =
    isValidElement(children) && messageId
      ? cloneElement(children as React.ReactElement<{ "aria-describedby"?: string; "aria-invalid"?: boolean }>, {
          "aria-describedby": messageId,
          ...(error ? { "aria-invalid": true } : {}),
        })
      : children;

  return (
    <div className={styles.field}>
      <label htmlFor={htmlFor} className={styles.label}>
        {label}
        {required && (
          <span aria-hidden="true" className={styles.requiredMark}>
            {" "}
            *
          </span>
        )}
      </label>
      {control}
      {error ? (
        <p id={messageId} role="alert" className={styles.errorText}>
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className={styles.hintText}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
