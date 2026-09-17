"use client";

import { useId, useState } from "react";
import Link from "next/link";
import Text from "@/features/design-system/components/Text";
import Button from "@/features/design-system/components/Button";
import Checkbox from "@/features/design-system/components/Checkbox";
import { setConsent } from "@/lib/analytics/consent";
import { useConsent } from "../state/useConsent";
import { useConsentBannerVisible } from "../state/useConsentBannerVisible";
import { closeConsentPreferences } from "../state/consentBannerVisibility";
import styles from "./ConsentBanner.module.css";

/**
 * Banner de consentimento (Fase LGPD, briefing Seções 16-21) — arquitetura simples de propósito
 * (Seção 16: "não criar sistema complexo demais"): uma barra fixa no rodapé, nunca um modal de
 * tela cheia com backdrop (não bloqueia o resto da página, nunca "destrói a experiência premium" —
 * Seção 71). Três ações sempre visíveis e do MESMO tamanho/destaque (Seção 18: "recusar precisa
 * ser tão acessível quanto aceitar" — nenhum dark pattern de botão grande vs. link escondido).
 *
 * Aparece sozinho (`useConsentBannerVisible`) quando não existe decisão válida para a versão atual
 * da política, e pode ser reaberto a qualquer momento pelo link "Preferências de privacidade" do
 * footer (`SiteFooter.tsx`) — mesmo componente nos dois casos, nunca uma segunda tela de
 * configuração separada (Seção 19).
 *
 * `role="region"` (não `role="dialog"`): o banner nunca prende o foco nem bloqueia o resto da
 * página — semanticamente é uma região informativa comum, não um diálogo modal (Seção 73: "banner/
 * configurações totalmente navegáveis" já vale de graça para HTML nativo em ordem de tab normal).
 */
export default function ConsentBanner() {
  const visible = useConsentBannerVisible();
  const consent = useConsent();
  const [expanded, setExpanded] = useState(false);
  const [draftAnalytics, setDraftAnalytics] = useState(consent.analytics);
  const [draftMarketing, setDraftMarketing] = useState(consent.marketing);
  const headingId = useId();
  const analyticsCheckboxId = useId();
  const marketingCheckboxId = useId();

  if (!visible) return null;

  function openConfigure() {
    setDraftAnalytics(consent.analytics);
    setDraftMarketing(consent.marketing);
    setExpanded(true);
  }

  function acceptAll() {
    setConsent({ analytics: true, marketing: true });
    setExpanded(false);
    closeConsentPreferences();
  }

  function rejectNonEssential() {
    setConsent({ analytics: false, marketing: false });
    setExpanded(false);
    closeConsentPreferences();
  }

  function savePreferences() {
    setConsent({ analytics: draftAnalytics, marketing: draftMarketing });
    setExpanded(false);
    closeConsentPreferences();
  }

  return (
    <div className={styles.wrapper} role="region" aria-labelledby={headingId}>
      <div className={styles.panel}>
        <div className={styles.text}>
          <Text as="p" id={headingId} weight="semibold">
            Sua privacidade
          </Text>
          <Text as="p" size="sm" color="secondary">
            Usamos armazenamento essencial para o Builder funcionar. Com sua permissão, também
            usamos analytics (medição de uso) e marketing (anúncios) — você escolhe o que preferir.
            Veja a <Link href="/privacidade">Política de Privacidade</Link>.
          </Text>
        </div>

        {expanded && (
          <fieldset className={styles.options}>
            <legend className={styles.optionsLegend}>Escolha o que permitir</legend>
            <Checkbox checked disabled label="Essenciais — sempre ativos (necessários para o Builder funcionar)" />
            <Checkbox
              id={analyticsCheckboxId}
              checked={draftAnalytics}
              onChange={(event) => setDraftAnalytics(event.target.checked)}
              label="Analytics — medição de uso do site (GA4)"
            />
            <Checkbox
              id={marketingCheckboxId}
              checked={draftMarketing}
              onChange={(event) => setDraftMarketing(event.target.checked)}
              label="Marketing — anúncios (Meta Pixel)"
            />
          </fieldset>
        )}

        <div className={styles.actions}>
          <Button variant="secondary" size="sm" onClick={rejectNonEssential}>
            Recusar não essenciais
          </Button>
          {expanded ? (
            <Button variant="ghost" size="sm" onClick={savePreferences}>
              Salvar preferências
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={openConfigure}>
              Configurar
            </Button>
          )}
          <Button size="sm" onClick={acceptAll}>
            Aceitar todos
          </Button>
        </div>
      </div>
    </div>
  );
}
