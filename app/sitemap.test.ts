import { describe, expect, it } from "vitest";
import sitemap from "./sitemap";
import { SITE_URL } from "@/lib/seo/siteConfig";

describe("sitemap (Fase SEO, Seção 17 do briefing)", () => {
  it("inclui só as URLs públicas e indexáveis (Home, Projetos, Privacidade)", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls).toEqual([`${SITE_URL}/`, `${SITE_URL}/projetos`, `${SITE_URL}/privacidade`]);
  });

  it("nunca inclui rotas privadas/internas/noindex", () => {
    const urls = sitemap().map((entry) => entry.url);
    for (const url of urls) {
      expect(url).not.toMatch(/\/admin/);
      expect(url).not.toMatch(/\/builder/);
      expect(url).not.toMatch(/\/design-system/);
    }
  });

  it("nunca inclui uma data inventada (`lastModified`)", () => {
    for (const entry of sitemap()) {
      expect(entry.lastModified).toBeUndefined();
    }
  });
});
