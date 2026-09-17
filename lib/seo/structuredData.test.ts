import { describe, expect, it } from "vitest";
import { getOrganizationJsonLd, getWebSiteJsonLd, toJsonLd } from "./structuredData";
import { SITE_NAME, SITE_URL } from "./siteConfig";

describe("getOrganizationJsonLd (Fase SEO, Seções 22-24 do briefing)", () => {
  it("descreve a marca com dados reais — nome, URL, logo e descrição", () => {
    const jsonLd = getOrganizationJsonLd();
    expect(jsonLd["@type"]).toBe("Organization");
    expect(jsonLd.name).toBe(SITE_NAME);
    expect(jsonLd.url).toBe(SITE_URL);
    expect(jsonLd.logo).toBe(`${SITE_URL}/logo-mark.png`);
  });

  it("nunca inclui sameAs/endereço/telefone inventados (nenhum existe no projeto ainda)", () => {
    const jsonLd = getOrganizationJsonLd();
    expect(jsonLd).not.toHaveProperty("sameAs");
    expect(jsonLd).not.toHaveProperty("address");
    expect(jsonLd).not.toHaveProperty("telephone");
  });

  it("lista os 3 serviços reais do Builder, nunca uma descrição nova/inventada", () => {
    const jsonLd = getOrganizationJsonLd();
    expect(jsonLd.makesOffer).toHaveLength(3);
    const names = jsonLd.makesOffer.map((offer) => offer.itemOffered.name);
    expect(names).toEqual(["Criar um site", "Atrair mais clientes", "Fortalecer minha marca e conteúdo"]);
  });
});

describe("getWebSiteJsonLd", () => {
  it("descreve o site com nome e URL reais", () => {
    const jsonLd = getWebSiteJsonLd();
    expect(jsonLd["@type"]).toBe("WebSite");
    expect(jsonLd.name).toBe(SITE_NAME);
    expect(jsonLd.url).toBe(SITE_URL);
  });
});

describe("toJsonLd", () => {
  it("serializa para JSON válido", () => {
    const serialized = toJsonLd({ a: 1, b: "texto" });
    expect(() => JSON.parse(serialized)).not.toThrow();
    expect(JSON.parse(serialized)).toEqual({ a: 1, b: "texto" });
  });

  it("escapa '<' para nunca arriscar fechar a tag <script> cedo", () => {
    const serialized = toJsonLd({ value: "</script><script>alert(1)</script>" });
    expect(serialized).not.toContain("</script>");
    expect(serialized).not.toMatch(/<\/?script/);
  });
});
