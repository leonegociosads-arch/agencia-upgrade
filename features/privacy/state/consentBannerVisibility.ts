/**
 * Reabertura manual do banner (Fase LGPD, briefing Seção 19: "permitir alterar escolha depois...
 * link no footer 'Preferências de privacidade'"). Estado em módulo + pub-sub simples — mesmo
 * padrão de outros pequenos estados globais reativos do projeto (`SOUND_ENABLED_CHANGE_EVENT` na
 * Fase Microinterações), só que sem precisar de `CustomEvent`/`window` porque nada aqui precisa
 * atravessar um provider de terceiro nem ser lido fora de React.
 */
let manuallyOpen = false;
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function openConsentPreferences(): void {
  manuallyOpen = true;
  notify();
}

export function closeConsentPreferences(): void {
  manuallyOpen = false;
  notify();
}

export function isConsentPreferencesManuallyOpen(): boolean {
  return manuallyOpen;
}

export function subscribeConsentPreferencesVisibility(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

/** Só para testes. */
export function resetConsentBannerVisibilityForTests(): void {
  manuallyOpen = false;
  listeners.clear();
}
