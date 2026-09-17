import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils/cx";
import styles from "./Typography.module.css";

export type TextSize = "lg" | "body" | "sm" | "label" | "caption";
export type TextColor = "primary" | "secondary" | "disabled" | "accent" | "success" | "warning" | "error" | "info";
export type TextWeight = "regular" | "medium" | "semibold" | "bold";

const SIZE_CLASS: Record<TextSize, string> = {
  lg: styles.bodyLg,
  body: styles.body,
  sm: styles.bodySm,
  label: styles.label,
  caption: styles.caption,
};

const WEIGHT_CLASS: Record<TextWeight, string> = {
  regular: styles.weightRegular,
  medium: styles.weightMedium,
  semibold: styles.weightSemibold,
  bold: styles.weightBold,
};

export interface TextProps extends HTMLAttributes<HTMLElement> {
  size?: TextSize;
  color?: TextColor;
  weight?: TextWeight;
  as?: ElementType;
  children?: ReactNode;
}

/** Texto corrido (Fase 18, Seção "Tipografia") — `size="label"` cobre rótulos de campo/legendas
 * curtas em maiúsculas/negrito leve; `size="caption"` cobre metadados pequenos (datas, contagens). */
export default function Text({ size = "body", color = "primary", weight, as: Component = "p", className, children, ...rest }: TextProps) {
  return (
    <Component className={cx(SIZE_CLASS[size], styles[color], weight && WEIGHT_CLASS[weight], className)} {...rest}>
      {children}
    </Component>
  );
}
