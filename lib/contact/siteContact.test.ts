import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getContactChannels,
  getContactEmail,
  getInstagramHandle,
  getPrimaryContactChannel,
  getResponseTimeLabel,
  getWhatsAppLink,
  getWhatsAppNumber,
} from "./siteContact";

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

  it("sem nenhuma variável de contato, não existe canal (o atalho e o rodapé somem)", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "");
    vi.stubEnv("NEXT_PUBLIC_INSTAGRAM", "");
    vi.stubEnv("NEXT_PUBLIC_CONTACT_EMAIL", "");
    expect(getContactChannels()).toEqual([]);
    expect(getPrimaryContactChannel()).toBeNull();
  });

  it("e-mail e Instagram só valem com formato plausível", () => {
    vi.stubEnv("NEXT_PUBLIC_CONTACT_EMAIL", "nao-e-email");
    vi.stubEnv("NEXT_PUBLIC_INSTAGRAM", "perfil com espaço");
    expect(getContactEmail()).toBeNull();
    expect(getInstagramHandle()).toBeNull();
    vi.stubEnv("NEXT_PUBLIC_INSTAGRAM", "https://www.instagram.com/perfil.oficial/?hl=pt");
    expect(getInstagramHandle()).toBe("perfil.oficial");
    vi.stubEnv("NEXT_PUBLIC_INSTAGRAM", "@perfil_2");
    expect(getInstagramHandle()).toBe("perfil_2");
  });

  it("preferência: WhatsApp → Instagram → e-mail; cada canal com link, rótulo e texto real", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "5511912345678");
    vi.stubEnv("NEXT_PUBLIC_INSTAGRAM", "@perfil");
    vi.stubEnv("NEXT_PUBLIC_CONTACT_EMAIL", "contato@exemplo.com");
    const channels = getContactChannels();
    expect(channels.map((channel) => channel.kind)).toEqual(["whatsapp", "instagram", "email"]);
    expect(channels[0]).toMatchObject({ display: "+55 11 91234-5678", external: true });
    expect(channels[1]).toMatchObject({ href: "https://www.instagram.com/perfil/", display: "@perfil" });
    expect(channels[2]).toMatchObject({ href: "mailto:contato@exemplo.com", external: false });
    expect(getPrimaryContactChannel()?.kind).toBe("whatsapp");

    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "");
    expect(getPrimaryContactChannel()?.kind).toBe("instagram");
  });
});
