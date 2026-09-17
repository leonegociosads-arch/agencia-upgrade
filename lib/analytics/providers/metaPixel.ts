import type { AnalyticsEventMap, AnalyticsEventName } from "../events";
import { loadScriptOnce } from "./loadScriptOnce";

/**
 * Provider Meta Pixel (Fase 17) — `docs/ANALYTICS.md`, Seção "Meta Pixel". Só ativo se
 * `NEXT_PUBLIC_META_PIXEL_ID` estiver definida (nunca inventamos um Pixel ID).
 *
 * Diferente do GA4 (que recebe o funil inteiro), o Meta Pixel só recebe a ÚNICA conversão que o
 * briefing pede para mapear (Seção "Meta Events"): `lead_submitted` → evento padrão `Lead`. Nunca
 * `formulário abriu` (`contact_started`) nem `submit falhou` (`lead_submit_failed`) — exatamente a
 * restrição explícita do briefing ("Não disparar Lead quando: formulário abriu ou submit falhou").
 * Todo o resto do funil fica de fora deste provider de propósito — um pixel de terceiro para
 * publicidade não precisa (nem deveria) replicar o funil inteiro de uso do produto.
 */
declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[] };
  }
}

let hasInitialized = false;

function getPixelId(): string | undefined {
  return process.env.NEXT_PUBLIC_META_PIXEL_ID;
}

export function isMetaPixelConfigured(): boolean {
  return Boolean(getPixelId());
}

function ensureInitialized(pixelId: string): void {
  if (hasInitialized || typeof window === "undefined") return;
  hasInitialized = true;

  const queue: unknown[] = [];
  const fbq = ((...args: unknown[]) => {
    queue.push(args);
  }) as Window["fbq"];
  fbq!.queue = queue;
  window.fbq = fbq;

  window.fbq!("init", pixelId);
  loadScriptOnce("https://connect.facebook.net/en_US/fbevents.js");
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- assinatura igual à dos outros providers (trackEvent.ts chama todos de forma uniforme); só este nunca usa `properties`.
export function send<K extends AnalyticsEventName>(eventName: K, properties: AnalyticsEventMap[K]): void {
  if (eventName !== "lead_submitted") return;

  const pixelId = getPixelId();
  if (!pixelId || typeof window === "undefined") return;

  ensureInitialized(pixelId);
  window.fbq?.("track", "Lead");
}

/** Só para testes. */
export function resetMetaPixelStateForTests(): void {
  hasInitialized = false;
}
