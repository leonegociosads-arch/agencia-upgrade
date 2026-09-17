import type { AnalyticsEventMap, AnalyticsEventName } from "./events";
import { getConsent } from "./consent";
import { getOrCreateAnalyticsSession, markFunnelStepOnce } from "./session";
import * as ga4 from "./providers/ga4";
import * as metaPixel from "./providers/metaPixel";
import * as internal from "./providers/internal";

/**
 * Camada única de analytics (Fase 17) — `docs/ANALYTICS.md`, Seção "Camada única". Nenhum
 * componente conhece `gtag`/`fbq`/Supabase diretamente; todos chamam só `trackEvent`/
 * `trackFunnelMilestone`. Princípio central do briefing, respeitado por construção: esta função
 * NUNCA é chamada antes de a aplicação já ter feito algo (o dispatch de uma ação do reducer, uma
 * navegação real, um resultado real de `submitLead`) — nunca o inverso.
 *
 * NUNCA lança e NUNCA bloqueia: cada provider roda dentro de um `try/catch` isolado, então uma
 * falha de um (ex.: GA4 bloqueado por um ad-blocker) nunca impede os outros nem devolve um erro
 * para quem chamou (Testes 19 e 18 do briefing).
 */
function safeCall(run: () => void): void {
  try {
    run();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[analytics] um provider falhou, ignorado:", error);
    }
  }
}

function currentLocation(): { searchParams: URLSearchParams; pathname: string } {
  return { searchParams: new URLSearchParams(window.location.search), pathname: window.location.pathname };
}

/** Dispara um evento para todo provider habilitado pelo consentimento atual (`lib/analytics/consent.ts`).
 * Uso direto para eventos que podem/devem repetir na mesma sessão (`page_view`, `service_selected`,
 * `service_completed`, `service_edited`, `service_removed`, `lead_submit_attempted`,
 * `lead_submit_failed`). Para os marcos "uma vez por sessão", ver `trackFunnelMilestone`. */
export function trackEvent<K extends AnalyticsEventName>(eventName: K, properties: AnalyticsEventMap[K]): void {
  if (typeof window === "undefined") return;

  try {
    const { searchParams, pathname } = currentLocation();
    const session = getOrCreateAnalyticsSession(searchParams, pathname);
    const consent = getConsent();

    if (consent.analytics) {
      safeCall(() => ga4.send(eventName, properties));
      safeCall(() => internal.send(session.sessionId, eventName, properties));
    }
    if (consent.marketing) {
      safeCall(() => metaPixel.send(eventName, properties));
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[analytics] trackEvent falhou, ignorado:", error);
    }
  }
}

/** Nomes que representam um marco do funil alcançado uma única vez por sessão — ver
 * `docs/ANALYTICS.md`, Seção "Funil", e `lib/analytics/session.ts` (`markFunnelStepOnce`). */
export type FunnelMilestoneName = "builder_started" | "upgrade_reviewed" | "contact_started" | "lead_submitted";

/**
 * Como `trackEvent`, mas só dispara na PRIMEIRA vez que esta sessão alcança `eventName` — protege
 * contra refresh/remontagem reenviando o mesmo marco (ex.: dar refresh na tela de resumo não deve
 * contar um segundo `upgrade_reviewed` para a mesma sessão).
 */
export function trackFunnelMilestone<K extends FunnelMilestoneName>(eventName: K, properties: AnalyticsEventMap[K]): void {
  if (typeof window === "undefined") return;

  try {
    const { searchParams, pathname } = currentLocation();
    const session = getOrCreateAnalyticsSession(searchParams, pathname);
    if (!markFunnelStepOnce(session.sessionId, eventName)) return;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[analytics] trackFunnelMilestone falhou ao checar o marco, ignorado:", error);
    }
    return;
  }

  trackEvent(eventName, properties);
}
