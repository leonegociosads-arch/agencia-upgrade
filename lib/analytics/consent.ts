import { loadStoredConsent, saveStoredConsent, clearStoredConsent } from "@/lib/privacy/consentStorage";
import { PRIVACY_POLICY_VERSION } from "@/lib/privacy/privacyConfig";

/**
 * Consentimento (Fase 17, revisado na Fase LGPD — `docs/PRIVACY-LGPD.md`, Seção "Consentimento").
 * Dois interruptores independentes; a sessão do Builder (`lib/persistence/builderSession.ts`) é
 * ESSENCIAL — necessária para o próprio funcionamento do produto — e nunca passa por este módulo.
 *
 * **Mudança nesta fase**: o padrão dos dois interruptores agora é `false` (Seção 70 do briefing:
 * "privacy by default — configuração mais restritiva para tracking não essencial"). Na Fase 17,
 * `analytics` tinha padrão `true` (justificado como "mesma classe de dado anônimo que a
 * persistência de sessão já usa sem consentimento") — uma decisão explicitamente marcada como
 * PROVISÓRIA, à espera de uma tela de consentimento real. Agora que ela existe
 * (`features/privacy/components/ConsentBanner.tsx`), a postura mais segura é não medir nada até a
 * pessoa decidir — ver `docs/DECISIONS.md`.
 *
 * Persistência: `lib/privacy/consentStorage.ts` (localStorage, versionado por
 * `PRIVACY_POLICY_VERSION`). Hidratada de forma preguiçosa (só no primeiro acesso em cliente,
 * nunca durante SSR) — `currentConsent` é sempre a mesma referência entre chamadas que não mudam
 * nada, de propósito: `useConsent`/`useHasConsentDecision`
 * (`features/privacy/state/`) usam `useSyncExternalStore`, que exige um snapshot estável para não
 * re-renderizar/loopar à toa.
 */
export interface AnalyticsConsent {
  analytics: boolean;
  marketing: boolean;
}

const DEFAULT_CONSENT: AnalyticsConsent = { analytics: false, marketing: false };

export const CONSENT_CHANGE_EVENT = "upgrade:consent-change";

let currentConsent: AnalyticsConsent = DEFAULT_CONSENT;
let hasDecision = false;
let hydrated = false;

function hydrateFromStorageOnce(): void {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;

  const stored = loadStoredConsent();
  if (stored && stored.policyVersion === PRIVACY_POLICY_VERSION) {
    currentConsent = { analytics: stored.analytics, marketing: stored.marketing };
    hasDecision = true;
  }
}

/** Referência ESTÁVEL enquanto nada muda (ver comentário acima sobre `useSyncExternalStore`). */
export function getConsent(): AnalyticsConsent {
  hydrateFromStorageOnce();
  return currentConsent;
}

/** `false` = nenhuma decisão válida para a versão atual da política — o banner deve aparecer. */
export function hasStoredConsentDecision(): boolean {
  hydrateFromStorageOnce();
  return hasDecision;
}

function notifyChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
  }
}

/**
 * Chamado pelo banner (`ConsentBanner.tsx`) com a decisão completa (Aceitar todos/Recusar não
 * essenciais/Configurar já resolve as duas chaves antes de chamar isto — nunca uma atualização
 * parcial vinda de fora do banner). Persiste e notifica assinantes (`CONSENT_CHANGE_EVENT`) — o
 * próprio banner, o link "Preferências de privacidade" no footer, e qualquer chamada futura de
 * `trackEvent` já leem o valor novo na sequência.
 */
export function setConsent(consent: AnalyticsConsent): AnalyticsConsent {
  currentConsent = { ...consent };
  hasDecision = true;
  saveStoredConsent({ ...consent, policyVersion: PRIVACY_POLICY_VERSION });
  notifyChange();
  return currentConsent;
}

/** "Revogar consentimento" (briefing, Seção 61) — volta ao padrão restritivo e apaga a
 * preferência salva; o banner reaparece na própria sessão (`hasDecision` volta a `false`). */
export function withdrawConsent(): void {
  currentConsent = DEFAULT_CONSENT;
  hasDecision = false;
  clearStoredConsent();
  notifyChange();
}

/** Só para testes — evita que o estado do módulo (`let` de nível de módulo) vaze entre `it()`s. */
export function resetConsentForTests(): void {
  currentConsent = DEFAULT_CONSENT;
  hasDecision = false;
  hydrated = false;
}
