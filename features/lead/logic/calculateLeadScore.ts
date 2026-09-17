import type { ProjectSnapshot } from "../../builder/types";
import { LEAD_SCORE_RULES, LEAD_SCORE_VERSION, type LeadScoreContext } from "./leadScoreConfig";
import { getLeadScoreTier, type LeadScoreTier } from "./getLeadScoreTier";

export interface LeadScoreReason {
  ruleId: string;
  points: number;
}

export interface LeadScoreResult {
  score: number;
  tier: LeadScoreTier;
  reasons: LeadScoreReason[];
  version: number;
}

/**
 * Extrai do `ProjectSnapshot` só o que as regras de `leadScoreConfig.ts` precisam — nunca lê
 * `serviceDraft`, `leadDraft` nem qualquer estado de UI (o Lead Score usa SOMENTE dados
 * confirmados e realmente enviados, `docs/LEAD-SCORE.md`, "Fonte dos dados").
 */
function buildLeadScoreContext(snapshot: ProjectSnapshot): LeadScoreContext {
  const site = snapshot.services.find((service) => service.serviceId === "site");
  const trafego = snapshot.services.find((service) => service.serviceId === "trafego");
  const design = snapshot.services.find((service) => service.serviceId === "design");

  return {
    serviceCount: snapshot.services.length,
    siteTipo: typeof site?.answers.site_tipo === "string" ? site.answers.site_tipo : undefined,
    trafegoInvestimento: typeof trafego?.answers.trafego_investimento === "string" ? trafego.answers.trafego_investimento : undefined,
    trafegoExperiencia: typeof trafego?.answers.trafego_experiencia === "string" ? trafego.answers.trafego_experiencia : undefined,
    designServico: design?.answers.design_servico as string | string[] | undefined,
  };
}

/**
 * Função central do Lead Score (Fase 15) — pura e determinística: a mesma entrada sempre produz a
 * mesma saída, sem chamadas externas, sem aleatoriedade. Recebe o `ProjectSnapshot` (não o
 * `LeadPayload` inteiro) porque dados de contato nunca influenciam o score
 * (`docs/LEAD-SCORE.md`).
 *
 * `reasons` guarda cada regra que disparou, para auditoria/explicabilidade — a soma de `reasons`
 * é o score ANTES do clamp; `score` é o valor já limitado a [0, 100].
 */
export function calculateLeadScore(snapshot: ProjectSnapshot): LeadScoreResult {
  const ctx = buildLeadScoreContext(snapshot);

  const reasons: LeadScoreReason[] = LEAD_SCORE_RULES.filter((rule) => rule.condition(ctx)).map((rule) => ({
    ruleId: rule.ruleId,
    points: rule.points,
  }));

  const rawScore = reasons.reduce((sum, reason) => sum + reason.points, 0);
  const score = Math.min(100, Math.max(0, rawScore));

  return { score, tier: getLeadScoreTier(score), reasons, version: LEAD_SCORE_VERSION };
}
