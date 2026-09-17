import Link from "next/link";
import type { AnalyticsOverview as AnalyticsOverviewData } from "@/lib/repositories/analyticsEvents";
import { computeFunnelRates } from "../logic/computeFunnelRates";
import { ANALYTICS_PERIODS, ANALYTICS_PERIOD_LABELS, type AnalyticsPeriod } from "../logic/resolvePeriodStart";
import { SERVICES } from "@/features/builder/data/services";
import type { ServiceId } from "@/features/builder/types";
import styles from "./AnalyticsOverview.module.css";

const FUNNEL_STEPS = [
  { key: "page_view", label: "Visitas" },
  { key: "builder_started", label: "Iniciaram o Builder" },
  { key: "service_selected", label: "Selecionaram um serviço" },
  { key: "service_completed", label: "Concluíram um serviço" },
  { key: "upgrade_reviewed", label: "Chegaram ao resumo" },
  { key: "contact_started", label: "Começaram o contato" },
  { key: "lead_submitted", label: "Enviaram o projeto" },
] as const;

function formatPercent(value: number | null): string {
  if (value === null) return "—";
  return `${Math.round(value * 1000) / 10}%`;
}

function hrefForPeriod(currentParams: Record<string, string | undefined>, period: AnalyticsPeriod): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(currentParams)) {
    if (value) params.set(key, value);
  }
  params.set("analyticsPeriod", period);
  return `/admin?${params.toString()}`;
}

interface AnalyticsOverviewProps {
  overview: AnalyticsOverviewData;
  period: AnalyticsPeriod;
  /** Todos os `searchParams` ATUAIS da página (filtros de lead incluídos) — os links de período
   * preservam tudo, trocando só `analyticsPeriod` (mesmo padrão de `Pagination.tsx`). */
  currentParams: Record<string, string | undefined>;
}

/**
 * "Visão geral" (Fase 17) — `docs/ANALYTICS.md`, Seção "Admin". Funil + taxas + serviço mais
 * escolhido, sem nenhum gráfico (briefing: "não criar gráfico só por decoração"). Metricas vêm
 * de `analytics_events` via a RPC `analytics_overview` — nunca do zero se o Supabase/migration
 * ainda não estiver aplicado (nesse caso todo contador aparece como 0/—, sem quebrar a página).
 */
export default function AnalyticsOverview({ overview, period, currentParams }: AnalyticsOverviewProps) {
  const rates = computeFunnelRates(overview.funnel);
  const topServiceLabel = overview.topService ? SERVICES[overview.topService as ServiceId]?.label : null;

  return (
    <section className={styles.wrapper} aria-label="Visão geral de analytics">
      <div className={styles.header}>
        <h2 className={styles.title}>Visão geral</h2>
        <nav className={styles.periods} aria-label="Selecionar período">
          {ANALYTICS_PERIODS.map((candidate) => (
            <Link
              key={candidate}
              href={hrefForPeriod(currentParams, candidate)}
              className={candidate === period ? `${styles.periodLink} ${styles.periodLinkActive}` : styles.periodLink}
            >
              {ANALYTICS_PERIOD_LABELS[candidate]}
            </Link>
          ))}
        </nav>
      </div>

      <div className={styles.funnel}>
        {FUNNEL_STEPS.map((step) => (
          <div key={step.key} className={styles.step}>
            <span className={styles.stepValue}>{overview.funnel[step.key] ?? 0}</span>
            <span className={styles.stepLabel}>{step.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.rates}>
        <span>Início do Builder: {formatPercent(rates.builderStartRate)}</span>
        <span>Conclusão de serviço: {formatPercent(rates.serviceCompletionRate)}</span>
        <span>Chegada ao resumo: {formatPercent(rates.reviewRate)}</span>
        <span>Início de contato: {formatPercent(rates.contactStartRate)}</span>
        <span>Conversão (leads/builder): {formatPercent(rates.leadConversionRate)}</span>
        <span>Conversão (leads/visitas): {formatPercent(rates.visitorConversionRate)}</span>
      </div>

      {topServiceLabel && <p className={styles.topService}>Serviço mais escolhido no período: {topServiceLabel}</p>}
    </section>
  );
}
