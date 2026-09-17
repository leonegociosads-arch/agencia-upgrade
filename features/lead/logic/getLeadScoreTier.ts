import { LEAD_SCORE_TIER_THRESHOLDS } from "./leadScoreConfig";

/**
 * Classificação interna estável (Fase 15) — os labels (`LOW`/`MEDIUM`/`HIGH`/`PRIORITY`) nunca
 * mudam de nome, mesmo que a apresentação futura no admin use "Baixo/Médio/Alto/Prioritário"
 * (tradução de exibição, não o identificador interno).
 */
export type LeadScoreTier = "LOW" | "MEDIUM" | "HIGH" | "PRIORITY";

/** Única fonte de verdade para os limites de tier — nunca duplicar esses ranges em outro lugar. */
export function getLeadScoreTier(score: number): LeadScoreTier {
  if (score >= LEAD_SCORE_TIER_THRESHOLDS.PRIORITY) return "PRIORITY";
  if (score >= LEAD_SCORE_TIER_THRESHOLDS.HIGH) return "HIGH";
  if (score >= LEAD_SCORE_TIER_THRESHOLDS.MEDIUM) return "MEDIUM";
  return "LOW";
}
