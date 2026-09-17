export const ANALYTICS_PERIODS = ["today", "7d", "30d"] as const;
export type AnalyticsPeriod = (typeof ANALYTICS_PERIODS)[number];

export const ANALYTICS_PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  today: "Hoje",
  "7d": "Últimos 7 dias",
  "30d": "Últimos 30 dias",
};

export function isValidAnalyticsPeriod(value: string): value is AnalyticsPeriod {
  return (ANALYTICS_PERIODS as readonly string[]).includes(value);
}

/**
 * Resolve o período pedido para um instante inicial (ISO), sem date picker (briefing: "não criar
 * date picker complexo ainda" — só hoje/7 dias/30 dias). `now` é injetado para o teste controlar o
 * "agora" sem mockar `Date` globalmente.
 */
export function resolvePeriodStart(period: AnalyticsPeriod, now: Date = new Date()): string {
  if (period === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return start.toISOString();
  }

  const days = period === "7d" ? 7 : 30;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}
