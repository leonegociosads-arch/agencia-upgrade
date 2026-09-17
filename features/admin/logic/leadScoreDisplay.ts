import type { LeadScoreTier } from "@/features/lead/logic/getLeadScoreTier";

/** Tradução de exibição dos tiers internos (`docs/LEAD-SCORE.md`, Seção 5: os IDs internos nunca
 * mudam, só a exibição pode). */
export const LEAD_SCORE_TIER_LABELS: Record<LeadScoreTier, string> = {
  LOW: "Baixo",
  MEDIUM: "Médio",
  HIGH: "Alto",
  PRIORITY: "Prioritário",
};
