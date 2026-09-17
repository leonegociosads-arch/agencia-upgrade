"use client";

import Button from "@/features/design-system/components/Button";
import { openConsentPreferences } from "../state/consentBannerVisibility";

/**
 * Atalho para reabrir o `ConsentBanner` (Fase LGPD, briefing Seção 62: "seção de cookies dentro
 * da Política de Privacidade" pode linkar para as preferências em vez de duplicar os controles).
 * Usa o mesmo mecanismo do link "Preferências de privacidade" do footer
 * (`SiteFooter.tsx`) — nunca uma segunda tela de configuração.
 */
export default function PrivacyPreferencesButton() {
  return (
    <Button type="button" variant="secondary" size="sm" onClick={openConsentPreferences}>
      Abrir preferências de privacidade
    </Button>
  );
}
