import { forwardRef, type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";
import styles from "./SectionContainer.module.css";

export interface SectionContainerProps extends HTMLAttributes<HTMLElement> {
  /** Elemento semântico a renderizar — `"section"` por padrão. */
  as?: ElementType;
  children?: ReactNode;
}

/**
 * Aplica a largura máxima e as margens/gutters do grid (Fase 18, Seção "Grid e Containers") —
 * nenhum layout de página, só o container que qualquer seção real vai usar na Etapa 19.
 *
 * Encaminha `ref` para o elemento real (Fase ScrollTrigger e Storytelling, Etapa 23) — o motion de
 * scroll da Home precisa medir/observar a seção de verdade (`trigger`/escopo do `gsap.context`),
 * o que um componente de função comum não permite sem `forwardRef`.
 */
const SectionContainer = forwardRef<HTMLElement, SectionContainerProps>(function SectionContainer(
  { as: Component = "section", className, children, ...rest },
  ref,
) {
  return (
    <Component ref={ref} className={cx(styles.container, className)} {...rest}>
      {children}
    </Component>
  );
});

export default SectionContainer;
