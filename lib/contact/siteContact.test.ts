import { afterEach, describe, expect, it, vi } from "vitest";
import { getResponseTimeLabel, getWhatsAppLink, getWhatsAppNumber } from "./siteContact";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("siteContact — nada é inventado: sem configuração, nada aparece", () => {
  it("sem variáveis, não há WhatsApp nem prazo", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "");
    vi.stubEnv("NEXT_PUBLIC_RESPONSE_TIME", "");
    expect(getWhatsAppNumber()).toBeNull();
    expect(getWhatsAppLink()).toBeNull();
    expect(getResponseTimeLabel()).toBeNull();
  });

  it("número incompleto é tratado como não definido", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "12345");
    expect(getWhatsAppNumber()).toBeNull();
  });

  it("com um número, normaliza para dígitos e monta o link wa.me com a mensagem", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "+55 (11) 91234-5678");
    expect(getWhatsAppNumber()).toBe("5511912345678");
    const link = getWhatsAppLink("Oi, tudo bem?");
    expect(link).toBe("https://wa.me/5511912345678?text=Oi%2C%20tudo%20bem%3F");
  });

  it("o prazo só existe quando preenchido (e ignora espaços)", () => {
    vi.stubEnv("NEXT_PUBLIC_RESPONSE_TIME", "  em até 1 dia útil  ");
    expect(getResponseTimeLabel()).toBe("em até 1 dia útil");
  });
});
