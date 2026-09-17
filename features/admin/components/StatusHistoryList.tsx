import type { LeadStatusHistoryEntry } from "@/lib/repositories/leadStatusHistory";
import { LEAD_STATUS_LABELS } from "../logic/leadStatus";
import { formatDateTime } from "../logic/formatDate";
import styles from "./StatusHistoryList.module.css";

export default function StatusHistoryList({ history }: { history: LeadStatusHistoryEntry[] }) {
  if (history.length === 0) {
    return <p className={styles.empty}>Nenhuma mudança de status ainda.</p>;
  }

  return (
    <ul className={styles.list}>
      {history.map((entry) => (
        <li key={entry.id} className={styles.item}>
          <span>
            {entry.oldStatus ? LEAD_STATUS_LABELS[entry.oldStatus] : "—"} → <strong>{LEAD_STATUS_LABELS[entry.newStatus]}</strong>
          </span>
          <span className={styles.meta}>{formatDateTime(entry.createdAt)}</span>
        </li>
      ))}
    </ul>
  );
}
