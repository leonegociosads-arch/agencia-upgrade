// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { isGa4Configured, resetGa4StateForTests, send } from "./ga4";
import { resetLoadedScriptsForTests } from "./loadScriptOnce";

const ENV_KEY = "NEXT_PUBLIC_GA4_MEASUREMENT_ID";

afterEach(() => {
  delete process.env[ENV_KEY];
  resetGa4StateForTests();
  resetLoadedScriptsForTests();
  delete (window as unknown as { gtag?: unknown }).gtag;
  delete (window as unknown as { dataLayer?: unknown }).dataLayer;
  document.head.innerHTML = "";
});

describe("Provider GA4 (Fase 17)", () => {
  it("sem NEXT_PUBLIC_GA4_MEASUREMENT_ID: não configurado, send() não faz nada", () => {
    expect(isGa4Configured()).toBe(false);
    send("page_view", { path: "/" });
    expect(window.gtag).toBeUndefined();
    expect(document.querySelector("script")).toBeNull();
  });

  it("com a variável definida: configurado, send() inicializa o gtag e envia o evento", () => {
    process.env[ENV_KEY] = "G-TESTE123";
    expect(isGa4Configured()).toBe(true);

    send("service_selected", { serviceId: "site" });

    expect(typeof window.gtag).toBe("function");
    expect(document.querySelector('script[src*="G-TESTE123"]')).not.toBeNull();
    expect(window.dataLayer?.length).toBeGreaterThan(0);
  });

  it("nunca inventa um Measurement ID — o valor enviado é exatamente o da variável de ambiente", () => {
    process.env[ENV_KEY] = "G-OUTRO";
    send("page_view", { path: "/" });
    expect(document.querySelector('script[src*="G-OUTRO"]')).not.toBeNull();
  });
});
