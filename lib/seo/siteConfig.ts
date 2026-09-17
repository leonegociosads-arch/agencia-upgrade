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

/** Mesma frase já usada como subtítulo do Hero (`HeroSection.tsx`) e como `description` original do
 * `app/layout.tsx` — reaproveitada aqui, nunca reescrita só por causa de SEO (briefing, Seção 29). */
export const SITE_DESCRIPTION =
  "Sites, tráfego pago e design trabalhando juntos — com um processo claro do primeiro clique ao projeto entregue.";

export const SITE_TITLE = `${SITE_NAME} — Sites, Tráfego Pago e Design`;

export const SITE_LOCALE = "pt_BR";
