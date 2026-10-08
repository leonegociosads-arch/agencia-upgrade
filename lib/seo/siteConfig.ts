/**
 * Configuração central de SEO (Fase SEO, `docs/SEO.md`) — nenhum outro arquivo deve declarar nome/
 * URL/descrição do site à parte; sempre importar daqui (mesmo princípio de `SERVICES`,
 * `features/builder/data/services.ts`: uma fonte única, nunca duplicada).
 *
 * `SITE_URL` vem de `NEXT_PUBLIC_SITE_URL` (documentado em `.env.example`), que o Next grava NO BUILD.
 * `resolveSiteUrl` deixa o resultado robusto a deslizes comuns de configuração, para canonical,
 * `og:url`, sitemap e `robots.txt` nunca saírem errados por causa disso:
 * - barra(s) no final, espaços e aspas são removidos;
 * - sem protocolo (ex.: `somosupgrade.com.br`) vira `https://...` (sem isso, `new URL()` quebraria o layout);
 * - `http://` vira `https://` em qualquer host que não seja local (o site só existe em HTTPS);
 * - variável vazia: em produção usa o endereço oficial; em desenvolvimento/teste, `http://localhost:3000`.
 */
export const SITE_NAME = "Agência Upgrade";

/** Endereço oficial de produção (sem www). Só é usado quando `NEXT_PUBLIC_SITE_URL` está vazia em produção. */
export const OFFICIAL_SITE_URL = "https://somosupgrade.com.br";

const LOCAL_FALLBACK_URL = "http://localhost:3000";

export function resolveSiteUrl(raw: string | undefined, nodeEnv: string | undefined): string {
  const value = (raw ?? "").trim().replace(/^["']+|["']+$/g, "").trim().replace(/\/+$/, "");
  if (!value) return nodeEnv === "production" ? OFFICIAL_SITE_URL : LOCAL_FALLBACK_URL;
  if (!/^https?:\/\//i.test(value)) return `https://${value}`;
  const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(value);
  if (/^http:\/\//i.test(value) && !isLocal) return value.replace(/^http:/i, "https:");
  return value;
}

export const SITE_URL = resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL, process.env.NODE_ENV);

/** Descrição da Home (meta description). Diz o que a Upgrade faz e o que dá para fazer no site, com a
 * mesma ideia do subtítulo do Hero (`HeroSection.tsx`) — antes repetia o subtítulo antigo, que
 * falava de "processo claro" sem dizer o que a agência faz. */
export const SITE_DESCRIPTION =
  "A Upgrade cria sites, gerencia tráfego pago e cuida de design e social media. Escolha o que a sua empresa precisa e monte o seu Upgrade.";

export const SITE_TITLE = `${SITE_NAME} — Sites, Tráfego Pago e Design`;

export const SITE_LOCALE = "pt_BR";
