import type { AnalyticsEventMap, AnalyticsEventName } from "../events";
import { recordEvent } from "@/features/analytics/actions/recordEvent";

/**
 * Provider interno (Fase 17) — grava em `analytics_events` (Supabase) via a Server Action
 * `recordEvent` (`features/analytics/actions/recordEvent.ts`). Sempre "ativo" (não depende de
 * nenhuma variável de ambiente opcional, ao contrário de GA4/Meta Pixel) — é o provider que
 * responde às perguntas específicas do Builder que o GA4 sozinho não responderia bem (funil por
 * etapa, abandono, associação com `idempotency_key`).
 *
 * Chamar uma Server Action a partir do cliente já é, por natureza, assíncrono e não-bloqueante
 * (`docs/ANALYTICS.md`, Seção "Performance") — `trackEvent.ts` nunca usa `await` nesta chamada.
 */
export function send<K extends AnalyticsEventName>(sessionId: string, eventName: K, properties: AnalyticsEventMap[K]): void {
  void recordEvent(sessionId, eventName, properties).catch(() => {
    // `recordEvent` já nunca lança (try/catch interno) — este `.catch` é só uma segunda rede de
    // segurança caso a própria chamada de rede da Server Action falhe antes de chegar lá.
  });
}
