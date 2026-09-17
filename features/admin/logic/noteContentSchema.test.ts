import { describe, expect, it } from "vitest";
import { noteContentSchema } from "./noteContentSchema";

describe("noteContentSchema", () => {
  it("aceita um texto simples", () => {
    expect(noteContentSchema.safeParse("Cliente pediu retorno depois das 18h.").success).toBe(true);
  });

  it("rejeita string vazia", () => {
    expect(noteContentSchema.safeParse("").success).toBe(false);
  });

  it("rejeita string só com espaços (trim antes de validar)", () => {
    expect(noteContentSchema.safeParse("   ").success).toBe(false);
  });

  it("rejeita texto acima de 2000 caracteres", () => {
    expect(noteContentSchema.safeParse("a".repeat(2001)).success).toBe(false);
  });

  it("aceita exatamente 2000 caracteres", () => {
    expect(noteContentSchema.safeParse("a".repeat(2000)).success).toBe(true);
  });

  it("aplica trim no resultado", () => {
    const result = noteContentSchema.safeParse("  nota com espaço  ");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("nota com espaço");
  });
});
