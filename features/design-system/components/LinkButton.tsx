import Link, { type LinkProps } from "next/link";
import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";
import type { ButtonSize, ButtonVariant } from "./Button";
import styles from "./Button.module.css";

export interface LinkButtonProps extends LinkProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children?: ReactNode;
}

/**
 * Mesmo visual do `Button` (reaproveita `Button.module.css`, nunca duplica tokens/estilos), mas
 * navega em vez de disparar uma ação — para CTAs que são links de verdade (ex.: "Monte seu
 * Upgrade" no header, que leva a `/builder`). `Button` continua sempre um `<button>` de verdade
 * (semanticamente uma ação), nunca um link disfarçado.
 *
 * Encaminha `ref` para o `<a>` real (Fase Microinterações, Etapa 24) — o efeito magnético dos
 * CTAs principais (`useMagneticHover`) precisa do elemento de verdade para animar.
 */
const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(function LinkButton(
  { variant = "primary", size = "md", fullWidth = false, className, children, ...rest },
  ref,
) {
  return (
    <Link ref={ref} className={cx(styles.button, styles[variant], styles[size], fullWidth && styles.fullWidth, className)} {...rest}>
      {children}
    </Link>
  );
});

export default LinkButton;
