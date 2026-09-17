import { describe, expect, it } from "vitest";
import { normalizeWhatsapp } from "./normalizeWhatsapp";

describe("normalizeWhatsapp", () => {
  it("TESTE 7 (Etapa 12) — formatos comuns brasileiros produzem o mesmo valor normalizado", () => {
    const expected = "5513999999999";
    expect(normalizeWhatsapp("(13) 99999-9999")).toBe(expected);
    expect(normalizeWhatsapp("13 99999-9999")).toBe(expected);
    expect(normalizeWhatsapp("13999999999")).toBe(expected);
    expect(normalizeWhatsapp("+55 13 99999-9999")).toBe(expected);
    expect(normalizeWhatsapp("5513999999999")).toBe(expected);
  });

  it("aceita número fixo (8 dígitos, sem o 9 na frente)", () => {
    expect(normalizeWhatsapp("(13) 3222-1111")).toBe("551332221111");
  });

  it("não confunde um DDD igual a '55' (Novo Hamburgo/RS) com o código do país", () => {
    // 10 dígitos = DDD (55) + 8 dígitos — nunca deveria perder o "55" como se fosse DDI.
    expect(normalizeWhatsapp("55 3222-1111")).toBe("55" + "5532221111");
  });

  it("rejeita entradas sem DDD reconhecível", () => {
    expect(normalizeWhatsapp("99999999")).toBeNull();
    expect(normalizeWhatsapp("123")).toBeNull();
    expect(normalizeWhatsapp("")).toBeNull();
    expect(normalizeWhatsapp("abc")).toBeNull();
  });
});
