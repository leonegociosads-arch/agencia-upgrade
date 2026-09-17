import { SERVICES, SERVICE_IDS } from "@/features/builder/data/services";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./siteConfig";

/**
 * Dados estruturados (schema.org) — Fase SEO, Seções 22-25 do briefing. Deliberadamente mínimo:
 * só `Organization` e `WebSite`, os dois tipos que descrevem fatos reais e verificáveis sobre o
 * projeto (Seção 22: "não usar schema falso"; Seção 25: "não criar dezenas de schemas sem
 * necessidade"). NENHUM campo inventado:
 *
 * - Sem `sameAs` (perfis de rede social) — a Upgrade não tem nenhum link oficial de rede social no
 *   projeto ainda (`SiteFooter.tsx` já documenta isso: "nenhum contato/rede social foi inventado").
 * - Sem `LocalBusiness`/`ProfessionalService` com endereço/telefone (briefing, Seção 23: "só
 *   adicionar endereço/telefone se forem reais e públicos") — nenhum dos dois existe no projeto.
 * - `makesOffer` usa exatamente os 3 serviços já reais do Builder (`features/builder/data/
 *   services.ts`, a mesma fonte que `CapabilitiesSection` usa na Home) — nunca uma descrição nova.
 *
 * Renderizado só na Home (`app/page.tsx`) — a página que representa a marca como um todo; não
 * repetido em `/projetos`/`/privacidade` (duplicar o mesmo JSON-LD em toda página não agrega nada
 * novo) nem em `/builder`/`/admin` (não são páginas de identidade de marca, e `/admin` é privado).
 */
export function getOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo-mark.png`,
    description: SITE_DESCRIPTION,
    makesOffer: SERVICE_IDS.map((id) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: SERVICES[id].label,
        description: SERVICES[id].shortDescription,
      },
    })),
  };
}

export function getWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  };
}

/** Serializa um objeto JSON-LD para uso em `<script type="application/ld+json"
 * dangerouslySetInnerHTML>`. Escapa `<` para nunca correr o risco de fechar a tag `<script>` cedo
 * — prática padrão para JSON embutido em HTML, mesmo aqui onde nenhum valor vem de entrada do
 * usuário (só constantes/dados já reais do próprio código). */
export function toJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
