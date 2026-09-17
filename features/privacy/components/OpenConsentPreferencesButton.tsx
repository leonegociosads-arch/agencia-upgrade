"use client";

import type { ButtonHTMLAttributes } from "react";
import { openConsentPreferences } from "../state/consentBannerVisibility";

/**
 * Fronteira de Client Component mínima em volta de `openConsentPreferences` (Fase LGPD) — existe
 * porque `SiteFooter.tsx` é um Server Component (usado a partir de páginas que também são Server
 * Components, incluindo `app/not-found.tsx`); anexar um `onClick` direto a um `<button>` ali
 * lançaria em build ("Event handlers cannot be passed to Client Component props"). Repassa
 * qualquer outra prop (`className`, `children`, etc.) sem opinar sobre estilo — cada lugar que usa
 * decide a própria aparência.
 */
export default function OpenConsentPreferencesButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" onClick={openConsentPreferences} {...props} />;
}
