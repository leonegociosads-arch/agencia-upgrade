import { afterEach, describe, expect, it, vi } from "vitest";
import nextConfig from "./next.config";

/** Etapa 29 — Segurança, Seções 50-56/107: garante que os cabeçalhos de segurança/CSP não regridem
 * silenciosamente numa mudança futura de `next.config.ts`. */
describe("next.config.ts — cabeçalhos de segurança (Etapa 29)", () => {
  it("declara headers() aplicados a todas as rotas", async () => {
    expect(nextConfig.headers).toBeTypeOf("function");
    const rules = await nextConfig.headers!();
    expect(rules).toHaveLength(1);
    expect(rules[0].source).toBe("/(.*)");
  });

  it("inclui os cabeçalhos essenciais, cada um exatamente uma vez", async () => {
    const [{ headers }] = await nextConfig.headers!();
    const keys = headers.map((h) => h.key);
    for (const expectedKey of ["Content-Security-Policy", "X-Frame-Options", "X-Content-Type-Options", "Referrer-Policy", "Permissions-Policy", "Strict-Transport-Security"]) {
      expect(keys.filter((k) => k === expectedKey)).toHaveLength(1);
    }
  });

  it("CSP nunca permite object-src/frame-ancestors abertos", async () => {
    const [{ headers }] = await nextConfig.headers!();
    const csp = headers.find((h) => h.key === "Content-Security-Policy")!.value;
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).not.toContain("script-src *");
  });

  it("X-Content-Type-Options é nosniff e X-Frame-Options é DENY", async () => {
    const [{ headers }] = await nextConfig.headers!();
    expect(headers.find((h) => h.key === "X-Content-Type-Options")!.value).toBe("nosniff");
    expect(headers.find((h) => h.key === "X-Frame-Options")!.value).toBe("DENY");
  });

  it("Permissions-Policy bloqueia câmera, microfone e geolocalização (não usados pelo site)", async () => {
    const [{ headers }] = await nextConfig.headers!();
    const value = headers.find((h) => h.key === "Permissions-Policy")!.value;
    expect(value).toContain("camera=()");
    expect(value).toContain("microphone=()");
    expect(value).toContain("geolocation=()");
  });

  it("não expõe o cabeçalho X-Powered-By", () => {
    expect(nextConfig.poweredByHeader).toBe(false);
  });
});

/**
 * Etapa 31 — Testes Funcionais: bug real encontrado via E2E cross-browser (WebKit/Safari, nunca
 * visível em Chromium/Firefox). WebKit aplica HSTS/`upgrade-insecure-requests` de forma mais
 * estrita mesmo em `localhost` — a primeira resposta com esses cabeçalhos em `next dev` fazia o
 * WebKit forçar HTTPS em toda requisição seguinte, e como o servidor de dev não fala TLS, a
 * página inteira quebrava ("SSL connect error"). Corrigido tornando os dois condicionais a
 * `NODE_ENV !== "development"`; este teste garante que a condição nunca regride.
 */
describe("next.config.ts — HSTS/upgrade-insecure-requests só fora de desenvolvimento (Etapa 31)", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    vi.stubEnv("NODE_ENV", originalNodeEnv ?? "test");
    vi.resetModules();
  });

  it("em desenvolvimento, nenhum dos dois cabeçalhos é enviado", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.resetModules();
    const { default: devConfig } = await import("./next.config");
    const [{ headers }] = await devConfig.headers!();
    expect(headers.some((h) => h.key === "Strict-Transport-Security")).toBe(false);
    const csp = headers.find((h) => h.key === "Content-Security-Policy")!.value;
    expect(csp).not.toContain("upgrade-insecure-requests");
  });

  it("fora de desenvolvimento, os dois continuam presentes", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.resetModules();
    const { default: prodConfig } = await import("./next.config");
    const [{ headers }] = await prodConfig.headers!();
    expect(headers.some((h) => h.key === "Strict-Transport-Security")).toBe(true);
    const csp = headers.find((h) => h.key === "Content-Security-Policy")!.value;
    expect(csp).toContain("upgrade-insecure-requests");
  });
});
