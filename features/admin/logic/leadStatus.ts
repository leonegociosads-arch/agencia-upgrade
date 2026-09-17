/**
 * Status comercial do lead (Fase 16) — poucos estados, de propósito ("prefira poucos estados").
 * `qualified` foi avaliado e descartado: ficaria ambíguo entre `contacted` e `meeting`, sem uma
 * ação própria clara que o justificasse (`docs/ADMIN-CRM.md`).
 */
export const LEAD_STATUSES = ["new", "contacted", "meeting", "proposal", "won", "lost"] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

/** IDs internos continuam em inglês — só a exibição é traduzida. */
export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Novo",
  contacted: "Contatado",
  meeting: "Reunião",
  proposal: "Proposta",
  won: "Fechado",
  lost: "Perdido",
};

export function isValidLeadStatus(value: string): value is LeadStatus {
  return (LEAD_STATUSES as readonly string[]).includes(value);
}
