import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils/cx";
import styles from "./Typography.module.css";

export type HeadingVariant = "display" | "h1" | "h2" | "h3";

const DEFAULT_TAG: Record<HeadingVariant, ElementType> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
};

const VARIANT_CLASS: Record<HeadingVariant, string> = {
  display: styles.display,
  h1: styles.h1,
  h2: styles.h2,
  h3: styles.h3,
};

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  variant: HeadingVariant;
  /** Tag semântica real (`h1`-`h4`) — separada do `variant` visual de propósito: uma seção pode
   * precisar de um `h2` na hierarquia do documento com a aparência visual de `h3`, por exemplo. */
  as?: ElementType;
  children?: ReactNode;
}

/** Título (Fase 18, Seção "Tipografia"). Nunca define tamanho/peso fora da escala — sempre uma
 * das 4 variantes. */
export default function Heading({ variant, as, className, children, ...rest }: HeadingProps) {
  const Component = as ?? DEFAULT_TAG[variant];
  return (
    <Component className={cx(VARIANT_CLASS[variant], styles.primary, className)} {...rest}>
      {children}
    </Component>
  );
}
