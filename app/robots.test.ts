import { describe, expect, it } from "vitest";
import robots from "./robots";
import { SITE_URL } from "@/lib/seo/siteConfig";

describe("robots (Fase SEO, Seção 16 do briefing)", () => {
  it("permite tudo por padrão e bloqueia só /admin", () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules[0] : result.rules;
    expect(rules?.allow).toBe("/");
    expect(rules?.disallow).toBe("/admin");
  });

  it("nunca bloqueia /builder — noindex é feito via meta tag, não via robots.txt", () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules[0] : result.rules;
    const disallow = ([] as string[]).concat(rules?.disallow ?? []);
    expect(disallow).not.toContain("/builder");
  });

  it("referencia o sitemap com a URL absoluta correta", () => {
    const result = robots();
    expect(result.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
  });
});
