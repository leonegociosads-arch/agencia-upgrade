import { cx } from "@/features/design-system/utils/cx";
import { PROJECT_FINALIZING_LABEL } from "../types";
import styles from "./ProjectStatusBadge.module.css";

interface ProjectStatusBadgeProps {
  className?: string;
  /** `"sm"`: versão compacta (teaser da Home). */
  size?: "md" | "sm";
}

/**
 * Selo "Projeto em finalização" — aparece no lugar do botão "Ver projeto ao vivo" quando o case tem
 * `liveLinkStatus: "finalizing"` (`features/projects/data/projects.ts`). É um STATUS, não um controle:
 * sem hover, sem cursor de clique e fora da ordem de Tab, para nunca parecer um botão quebrado.
 */
export default function ProjectStatusBadge({ className, size = "md" }: ProjectStatusBadgeProps) {
  return (
    <span className={cx(styles.badge, size === "sm" && styles.small, className)}>
      <span className={styles.dot} aria-hidden="true" />
      {PROJECT_FINALIZING_LABEL}
    </span>
  );
}
