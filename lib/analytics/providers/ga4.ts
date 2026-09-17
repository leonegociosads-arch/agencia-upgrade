import type { AnalyticsEventMap, AnalyticsEventName } from "../events";
import { loadScriptOnce } from "./loadScriptOnce";

/**
 * Provider Google Analytics 4 (Fase 17) — `docs/ANALYTICS.md`, Seção "GA4". Só ativo se
 * `NEXT_PUBLIC_GA4_MEASUREMENT_ID` estiver definida (nunca inventamos um Measurement ID, pedido
 * explícito do briefing); sem ela, `send()` não faz nada — a arquitetura fica pronta, documentada
 * em `.env.example`, sem quebrar nada na ausência da variável.
 */
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let hasInitialized = false;

function getMeasurementId(): string | undefined {
  return process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
}

export function isGa4Configured(): boolean {
  return Boolean(getMeasurementId());
}

function ensureInitialized(measurementId: string): void {
  if (hasInitialized || typeof window === "undefined") return;
  hasInitialized = true;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", measurementId);

  loadScriptOnce(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`);
}

/**
 * Todo evento do funil é relevante para o GA4 (é exatamente para isso que ele existe) — nenhuma
 * das 12 propriedades enviadas contém dado pessoal (garantido pelo próprio contrato de tipos,
 * `lib/analytics/events.ts`), então não há necessidade de uma lista de exclusão aqui.
 */
export function send<K extends AnalyticsEventName>(eventName: K, properties: AnalyticsEventMap[K]): void {
  const measurementId = getMeasurementId();
  if (!measurementId || typeof window === "undefined") return;

  ensureInitialized(measurementId);
  window.gtag?.("event", eventName, properties);
}

/** Só para testes. */
export function resetGa4StateForTests(): void {
  hasInitialized = false;
}
