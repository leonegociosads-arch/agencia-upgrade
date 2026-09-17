// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { isMetaPixelConfigured, resetMetaPixelStateForTests, send } from "./metaPixel";
import { resetLoadedScriptsForTests } from "./loadScriptOnce";

function fbqQueue(): unknown[] {
  return (window as unknown as { fbq: { queue: unknown[] } }).fbq.queue;
}

const ENV_KEY = "NEXT_PUBLIC_META_PIXEL_ID";

afterEach(() => {
  delete process.env[ENV_KEY];
  resetMetaPixelStateForTests();
  resetLoadedScriptsForTests();
  delete (window as unknown as { fbq?: unknown }).fbq;
  document.head.innerHTML = "";
});

describe("Provider Meta Pixel (Fase 17)", () => {
  it("sem NEXT_PUBLIC_META_PIXEL_ID: não configurado, send() não faz nada", () => {
    expect(isMetaPixelConfigured()).toBe(false);
    send("lead_submitted", { serviceCount: 1, idempotencyKey: "abc" });
    expect(window.fbq).toBeUndefined();
  });

  it("Seção 'Meta Events' do briefing — mapeia lead_submitted para o evento padrão 'Lead'", () => {
    process.env[ENV_KEY] = "1234567890";
    send("lead_submitted", { serviceCount: 1, idempotencyKey: "abc" });

    expect(typeof window.fbq).toBe("function");
    expect(fbqQueue()).toContainEqual(["init", "1234567890"]);
    expect(fbqQueue()).toContainEqual(["track", "Lead"]);
  });

  it("nunca dispara 'Lead' para contact_started (formulário abriu)", () => {
    process.env[ENV_KEY] = "1234567890";
    send("contact_started", {});
    expect(window.fbq).toBeUndefined(); // nem chega a inicializar — evento fora do mapeamento.
  });

  it("nunca dispara 'Lead' para lead_submit_failed (submit falhou)", () => {
    process.env[ENV_KEY] = "1234567890";
    send("lead_submit_failed", { errorCategory: "unknown" });
    expect(window.fbq).toBeUndefined();
  });
});
