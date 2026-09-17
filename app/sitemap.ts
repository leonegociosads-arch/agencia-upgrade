import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/siteConfig";

/**
 * Sitemap (Fase SEO, Seção 17 do briefing) — só as 3 URLs públicas e indexáveis de verdade hoje.
 * Excluídas de propósito: `/builder` (`noindex`, Seção 11), `/admin`/`/admin/login` (privado,
 * Seção 12/13), `/design-system`/`/builder/experiencia` (ferramentas internas que retornam 404 em
 * produção). Nenhuma URL de serviço individual (`/servicos/...`) — essas páginas não existem
 * ainda (ver `docs/SEO.md`, "Páginas de serviço").
 *
 * Sem `lastModified` (Seção 77 do briefing: "evitar datas falsas em conteúdo") — nenhuma dessas
 * páginas tem uma data de última modificação real rastreada; inventar `new Date()` a cada build
 * não reflete nada verdadeiro sobre o conteúdo em si.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/projetos`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/privacidade`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
