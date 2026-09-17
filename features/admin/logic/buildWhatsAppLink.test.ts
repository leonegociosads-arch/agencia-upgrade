import { describe, expect, it } from "vitest";
import { buildWhatsAppLink } from "./buildWhatsAppLink";

describe("buildWhatsAppLink", () => {
  it("gera um link wa.me com o número normalizado", () => {
    const link = buildWhatsAppLink("5513999999999", "João");
    expect(link.startsWith("https://wa.me/5513999999999?text=")).toBe(true);
  });

  it("inclui uma mensagem inicial curta com o primeiro nome", () => {
    const link = buildWhatsAppLink("5513999999999", "João");
    expect(decodeURIComponent(link)).toContain("Olá, João!");
    expect(decodeURIComponent(link)).toContain("Agência Upgrade");
  });

  it("nunca inclui um resumo do projeto na mensagem (mensagem sempre curta)", () => {
    const link = buildWhatsAppLink("5513999999999", "João");
    const message = decodeURIComponent(link.split("text=")[1]);
    expect(message.length).toBeLessThan(200);
  });

  it("funciona mesmo sem nome (fallback genérico)", () => {
    const link = buildWhatsAppLink("5513999999999", "");
    expect(decodeURIComponent(link)).toContain("Olá!");
  });
});
