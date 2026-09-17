import type { AdminLeadCounts } from "@/lib/repositories/leads";
import styles from "./DashboardSummary.module.css";

/** Resumo mínimo — 4 números, sem gráfico (`docs/ADMIN-CRM.md`: "central de oportunidades", não
 * dashboard cheio de gráficos). */
export default function DashboardSummary({ counts }: { counts: AdminLeadCounts }) {
  const items = [
    { label: "Novos hoje", value: counts.newToday },
    { label: "Prioritários", value: counts.priority },
    { label: "Em proposta", value: counts.proposal },
    { label: "Fechados", value: counts.won },
  ];

  return (
    <div className={styles.grid}>
      {items.map((item) => (
        <div key={item.label} className={styles.card}>
          <span className={styles.value}>{item.value}</span>
          <span className={styles.label}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
