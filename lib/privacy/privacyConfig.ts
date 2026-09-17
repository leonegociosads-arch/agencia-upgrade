/**
 * Configuração central de privacidade/LGPD (Fase LGPD, `docs/PRIVACY-LGPD.md`). Só uma constante
 * por enquanto — `PRIVACY_POLICY_VERSION` existe separada de qualquer outro número de versão do
 * projeto porque tem um gatilho de negócio próprio (Seção 21 do briefing: "se a política mudar
 * significativamente, avaliar solicitar [consentimento] novamente") — incrementar este número faz
 * `hasStoredConsentDecision()` (`lib/analytics/consent.ts`) tratar qualquer preferência já salva
 * como obsoleta, reabrindo o banner para uma nova decisão.
 */
export const PRIVACY_POLICY_VERSION = 1;
