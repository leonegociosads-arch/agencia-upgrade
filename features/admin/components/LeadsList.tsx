import Link from "next/link";
import { SERVICES } from "@/features/builder/data/services";
import { LEAD_STATUS_LABELS } from "../logic/leadStatus";
import { LEAD_SCORE_TIER_LABELS } from "../logic/leadScoreDisplay";
import { formatDate } from "../logic/formatDate";
import type { AdminLeadListItem } from "@/lib/repositories/leads";
import styles from "./LeadsList.module.css";

function serviceNames(item: AdminLeadListItem): string {
  return item.project.services.map((service) => SERVICES[service.serviceId]?.label ?? service.serviceId).join(" + ");
}

/**
 * Lista de oportunidades — tabela no desktop, cards no mobile (mesma marcação, CSS decide o que
 * mostrar; `docs/ADMIN-CRM.md`, "Responsividade": "lista pode virar cards no mobile").
 */
export default function LeadsList({ items }: { items: AdminLeadListItem[] }) {
  return (
    <>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Empresa</th>
            <th>Serviços</th>
            <th>Score</th>
            <th>Status</th>
            <th>Data</th>
            <th aria-hidden />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.company}</td>
              <td>{serviceNames(item)}</td>
              <td>
                {item.leadScore ?? "—"}
                {item.leadScoreTier && (
                  <span className={item.leadScoreTier === "PRIORITY" ? styles.priorityBadge : styles.tierBadge}>
                    {LEAD_SCORE_TIER_LABELS[item.leadScoreTier]}
                  </span>
                )}
              </td>
              <td>{LEAD_STATUS_LABELS[item.status]}</td>
              <td>{formatDate(item.createdAt)}</td>
              <td>
                <Link href={`/admin/leads/${item.id}`} className={styles.openLink}>
                  Abrir
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className={styles.cards}>
        {items.map((item) => (
          <li key={item.id}>
            <Link href={`/admin/leads/${item.id}`} className={styles.card}>
              <div className={styles.cardTop}>
                <strong>{item.name}</strong>
                {item.leadScoreTier && (
                  <span className={item.leadScoreTier === "PRIORITY" ? styles.priorityBadge : styles.tierBadge}>
                    {LEAD_SCORE_TIER_LABELS[item.leadScoreTier]}
                  </span>
                )}
              </div>
              <span className={styles.cardCompany}>{item.company}</span>
              <span className={styles.cardServices}>{serviceNames(item)}</span>
              <div className={styles.cardBottom}>
                <span>{LEAD_STATUS_LABELS[item.status]}</span>
                <span>{item.leadScore ?? "—"} pts</span>
                <span>{formatDate(item.createdAt)}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
