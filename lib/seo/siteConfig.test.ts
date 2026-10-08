import { describe, expect, it } from "vitest";
import { OFFICIAL_SITE_URL, resolveSiteUrl } from "./siteConfig";

describe("resolveSiteUrl (endereço do site para canonical, sitemap, robots e og:url)", () => {
  it("mantém o endereço oficial correto como está", () => {
    expect(resolveSiteUrl("https://somosupgrade.com.br", "production")).toBe("https://somosupgrade.com.br");
  });

  it("remove barra no final, espaços e aspas", () => {
    expect(resolveSiteUrl("https://somosupgrade.com.br/", "production")).toBe("https://somosupgrade.com.br");
    expect(resolveSiteUrl("  https://somosupgrade.com.br//  ", "production")).toBe("https://somosupgrade.com.br");
    expect(resolveSiteUrl('"https://somosupgrade.com.br"', "production")).toBe("https://somosupgrade.com.br");
  });

  it("troca http:// por https:// em host público (o site só existe em HTTPS)", () => {
    expect(resolveSiteUrl("http://somosupgrade.com.br", "production")).toBe("https://somosupgrade.com.br");
  });

  it("sem protocolo, assume https:// (e nunca deixa new URL() quebrar)", () => {
    const url = resolveSiteUrl("somosupgrade.com.br", "production");
    expect(url).toBe("https://somosupgrade.com.br");
    expect(() => new URL(url)).not.toThrow();
  });

  it("não mexe em http:// de endereço local", () => {
    expect(resolveSiteUrl("http://localhost:3000", "development")).toBe("http://localhost:3000");
    expect(resolveSiteUrl("http://127.0.0.1:3100/", "test")).toBe("http://127.0.0.1:3100");
  });

  it("variável vazia: produção usa o endereço oficial; desenvolvimento/teste usam localhost", () => {
    expect(resolveSiteUrl(undefined, "production")).toBe(OFFICIAL_SITE_URL);
    expect(resolveSiteUrl("", "production")).toBe(OFFICIAL_SITE_URL);
    expect(resolveSiteUrl("   ", "production")).toBe(OFFICIAL_SITE_URL);
    expect(resolveSiteUrl(undefined, "development")).toBe("http://localhost:3000");
    expect(resolveSiteUrl(undefined, "test")).toBe("http://localhost:3000");
  });

  it("o endereço oficial é https e sem www", () => {
    expect(OFFICIAL_SITE_URL).toBe("https://somosupgrade.com.br");
  });
});
