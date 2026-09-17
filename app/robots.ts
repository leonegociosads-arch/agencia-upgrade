import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/siteConfig";

/**
 * `robots.txt` (Fase SEO, Seção 16 do briefing). Só bloqueia `/admin` — uma área privada de
 * verdade (login obrigatório, `requireAdminSession`), sem nenhum valor de SEO e sem motivo para
 * bots gastarem orçamento de rastreamento nela.
 *
 * `/builder` NÃO é bloqueado aqui de propósito, mesmo sendo `noindex` (`app/builder/page.tsx`):
 * bloquear via `robots.txt` impediria o Google de sequer buscar a página para LER a diretiva
 * `noindex` — a combinação correta (documentada pelo próprio Google) é deixar a página
 * rastreável e usar a meta tag `robots: noindex` para controlar indexação, nunca as duas coisas
 * juntas na mesma URL. `/design-system` e `/builder/experiencia` também não precisam de regra
 * aqui: já retornam 404 de verdade em produção (`notFound()`), o que já impede indexação sem
 * precisar de `robots.txt`.
 *
 * `robots.txt` NUNCA substitui autenticação (Seção 16) — `/admin` já é protegido de verdade por
 * sessão; esta regra só evita rastreamento desnecessário, não é o mecanismo de segurança.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
