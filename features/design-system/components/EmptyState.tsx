import type { ReactNode } from "react";
import styles from "./EmptyState.module.css";

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

/**
 * Estado vazio genérico (Fase 18, Seção "Feedback"). `features/admin/components/EmptyState.tsx`
 * (Fase 16) continua como está — específico do admin, não migrado agora (fora do escopo desta
 * fase, "não redesenhar o site inteiro"). Este é o primitivo reutilizável para a Etapa 19 usar em
 * qualquer lugar novo que precisar do mesmo padrão (Builder, páginas institucionais etc.).
 */
export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
