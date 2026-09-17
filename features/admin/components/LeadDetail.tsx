import { buildAdminProjectSummary } from "../logic/buildAdminProjectSummary";
import { buildWhatsAppLink } from "../logic/buildWhatsAppLink";
import { buildMailtoLink } from "../logic/buildMailtoLink";
import { LEAD_SCORE_TIER_LABELS } from "../logic/leadScoreDisplay";
import { formatDateTime } from "../logic/formatDate";
import StatusSelect from "./StatusSelect";
import NoteForm from "./NoteForm";
import NotesList from "./NotesList";
import StatusHistoryList from "./StatusHistoryList";
import type { AdminLeadDetail } from "@/lib/repositories/leads";
import type { LeadNote } from "@/lib/repositories/leadNotes";
import type { LeadStatusHistoryEntry } from "@/lib/repositories/leadStatusHistory";
import styles from "./LeadDetail.module.css";

interface LeadDetailProps {
  lead: AdminLeadDetail;
  notes: LeadNote[];
  history: LeadStatusHistoryEntry[];
}

/**
 * Detalhe do projeto/lead (Fase 16). Respostas mostradas com `buildAdminProjectSummary` (labels
 * humanas, nunca JSON bruto como experiência principal) — o JSON completo só existe atrás de um
 * `<details>` recolhido por padrão ("Ver dados brutos", opção técnica secundária).
 */
export default function LeadDetail({ lead, notes, history }: LeadDetailProps) {
  const summaries = buildAdminProjectSummary(lead.project);
  const firstName = lead.name.trim().split(/\s+/)[0] ?? "";

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{lead.name}</h1>
          <p className={styles.subtitle}>{lead.company}</p>
        </div>
        {lead.leadScoreTier && (
          <span className={lead.leadScoreTier === "PRIORITY" ? styles.priorityBadge : styles.tierBadge}>
            {LEAD_SCORE_TIER_LABELS[lead.leadScoreTier]}
          </span>
        )}
      </div>

      <section className={styles.section}>
        <h2>Contato</h2>
        <dl className={styles.grid}>
          <div>
            <dt>WhatsApp</dt>
            <dd>{lead.whatsapp}</dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd>{lead.email}</dd>
          </div>
          {lead.websiteOrInstagram && (
            <div>
              <dt>Site/Instagram</dt>
              <dd>{lead.websiteOrInstagram}</dd>
            </div>
          )}
        </dl>
        <div className={styles.contactActions}>
          <a href={buildWhatsAppLink(lead.whatsapp, firstName)} target="_blank" rel="noreferrer" className={styles.actionButton}>
            Abrir WhatsApp
          </a>
          <a href={buildMailtoLink(lead.email)} className={styles.actionButtonSecondary}>
            Enviar e-mail
          </a>
          <a href={`tel:+${lead.whatsapp}`} className={styles.actionButtonSecondary}>
            Ligar
          </a>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Projeto</h2>
        {summaries.map((summary) => (
          <div key={summary.serviceId} className={styles.serviceBlock}>
            <h3 className={styles.serviceTitle}>{summary.title}</h3>
            <dl className={styles.grid}>
              {summary.items.map((item) => (
                <div key={item.question}>
                  <dt>{item.question}</dt>
                  <dd>{item.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </section>

      <section className={styles.section}>
        <h2>Score</h2>
        {/* Etapa 32 (Testes de UX, briefing Seção 59: "Score precisa parecer indicador interno, não
         * verdade absoluta"). Antes, o número aparecia sozinho — fácil de ler como uma nota
         * definitiva do lead, quando na verdade é uma heurística interna (`docs/LEAD-SCORE.md`)
         * para ajudar a priorizar contato, não uma avaliação do potencial real do cliente. */}
        <p className={styles.scoreHint}>Indicador interno de prioridade — não é uma nota definitiva sobre o lead.</p>
        <p className={styles.scoreValue}>
          {lead.leadScore ?? "—"} pontos{lead.leadScoreTier ? ` — ${LEAD_SCORE_TIER_LABELS[lead.leadScoreTier]}` : ""}
        </p>
        {lead.leadScoreBreakdown && lead.leadScoreBreakdown.length > 0 && (
          <ul className={styles.breakdownList}>
            {lead.leadScoreBreakdown.map((reason) => (
              <li key={reason.ruleId}>
                {reason.ruleId}: +{reason.points}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles.section}>
        <h2>Status</h2>
        <StatusSelect leadId={lead.id} initialStatus={lead.status} />
        <div className={styles.subBlock}>
          <h3 className={styles.subTitle}>Histórico</h3>
          <StatusHistoryList history={history} />
        </div>
      </section>

      <section className={styles.section}>
        <h2>Notas internas</h2>
        <NoteForm leadId={lead.id} />
        <div className={styles.subBlock}>
          <NotesList notes={notes} />
        </div>
      </section>

      <section className={styles.section}>
        <h2>Metadados</h2>
        <dl className={styles.grid}>
          <div>
            <dt>Criado em</dt>
            <dd>{formatDateTime(lead.createdAt)}</dd>
          </div>
          <div>
            <dt>ID</dt>
            <dd className={styles.mono}>{lead.id}</dd>
          </div>
        </dl>
        <details className={styles.rawData}>
          <summary>Ver dados brutos</summary>
          <pre className={styles.rawPre}>{JSON.stringify(lead, null, 2)}</pre>
        </details>
      </section>
    </div>
  );
}
