/**
 * Configuração central de SEO (Fase SEO, `docs/SEO.md`) — nenhum outro arquivo deve declarar nome/
 * URL/descrição do site à parte; sempre importar daqui (mesmo princípio de `SERVICES`,
 * `features/builder/data/services.ts`: uma fonte única, nunca duplicada).
 *
 * `SITE_URL` NUNCA é um domínio inventado. Lê de `NEXT_PUBLIC_SITE_URL` (documentado em
 * `.env.example`) — sem essa variável definida em produção, `metadataBase`/sitemap/OG/structured
 * data apontam para o fallback de desenvolvimento (`http://localhost:3000`), o que é visível e
 * fácil de notar (nunca um domínio real errado silenciosamente).
 */
export const SITE_NAME = "Agência Upgrade";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

/** Descrição da Home (meta description). Diz o que a Upgrade faz e o que dá para fazer no site, com a
 * mesma ideia do subtítulo do Hero (`HeroSection.tsx`) — antes repetia o subtítulo antigo, que
 * falava de "processo claro" sem dizer o que a agência faz. */
export const SITE_DESCRIPTION =
  "A Upgrade cria sites, gerencia tráfego pago e cuida de design e social media. Escolha o que a sua empresa precisa e monte o seu Upgrade.";

export const SITE_TITLE = `${SITE_NAME} — Sites, Tráfego Pago e Design`;

export const SITE_LOCALE = "pt_BR";
