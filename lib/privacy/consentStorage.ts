import { z } from "zod";

/**
 * Persistência local da PREFERÊNCIA de consentimento (Fase LGPD, briefing Seções 20-22). Mesmo
 * padrão de `lib/persistence/builderSession.ts`/`lib/analytics/session.ts` (chave própria,
 * versionada, SSR-safe, falha silenciosa se `localStorage` estiver indisponível) — nenhum PII
 * aqui (Seção 22 do briefing: "preferência local não precisa conter nome/email"), só as duas
 * categorias de consentimento + metadados técnicos.
 *
 * Sem TTL de expiração por tempo — a preferência vale até a pessoa mudar de ideia ou até a
 * política mudar de versão (`policyVersion` desatualizada = decisão tratada como inexistente,
 * banner reaparece).
 */
export const CONSENT_STORAGE_KEY = "upgrade-privacy-consent:v1";
const CONSENT_STORAGE_VERSION = 1;

export interface StoredConsent {
  version: 1;
  policyVersion: number;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
}

const storedConsentSchema = z.object({
  version: z.literal(1),
  policyVersion: z.number(),
  analytics: z.boolean(),
  marketing: z.boolean(),
  updatedAt: z.string(),
});

export function loadStoredConsent(): StoredConsent | null {
  if (typeof window === "undefined") return null;

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    return null;
  }

  const parsed = storedConsentSchema.safeParse(parsedJson);
  return parsed.success ? parsed.data : null;
}

export interface SaveStoredConsentInput {
  analytics: boolean;
  marketing: boolean;
  policyVersion: number;
}

export function saveStoredConsent(input: SaveStoredConsentInput): void {
  if (typeof window === "undefined") return;

  const record: StoredConsent = {
    version: CONSENT_STORAGE_VERSION,
    policyVersion: input.policyVersion,
    analytics: input.analytics,
    marketing: input.marketing,
    updatedAt: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Storage indisponível (modo privado, quota) — a preferência vale só para esta página/aba
    // (fica em memória via `lib/analytics/consent.ts`); falha silenciosa, mesma postura do resto
    // do projeto (`builderSession.ts`, `session.ts`).
  }
}

/** Usado por "revogar consentimento" (briefing, Seção 61) e pelos testes. */
export function clearStoredConsent(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    // Nada a limpar mesmo.
  }
}
