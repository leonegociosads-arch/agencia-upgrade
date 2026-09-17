import type { AnalyticsEventName } from "@/lib/analytics/events";

/**
 * Taxas conceituais do funil (Fase 17, `docs/ANALYTICS.md`, Seção "Conversão") — função pura,
 * testável sem Supabase. `counts` já vem agregado por `getAnalyticsOverview`
 * (`lib/repositories/analyticsEvents.ts`) como "sessões distintas por evento" — a mesma sessão
 * disparando `service_selected` várias vezes (multi-serviço) não infla essas taxas.
 */
export interface FunnelRates {
  builderStartRate: number | null;
  serviceCompletionRate: number | null;
  reviewRate: number | null;
  contactStartRate: number | null;
  leadConversionRate: number | null;
  visitorConversionRate: number | null;
}

function rate(numerator: number | undefined, denominator: number | undefined): number | null {
  if (!denominator) return null;
  return (numerator ?? 0) / denominator;
}

export function computeFunnelRates(counts: Partial<Record<AnalyticsEventName, number>>): FunnelRates {
  return {
    builderStartRate: rate(counts.builder_started, counts.page_view),
    serviceCompletionRate: rate(counts.service_completed, counts.builder_started),
    reviewRate: rate(counts.upgrade_reviewed, counts.builder_started),
    contactStartRate: rate(counts.contact_started, counts.upgrade_reviewed),
    leadConversionRate: rate(counts.lead_submitted, counts.builder_started),
    visitorConversionRate: rate(counts.lead_submitted, counts.page_view),
  };
}
