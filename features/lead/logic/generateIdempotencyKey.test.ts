import { describe, expect, it } from "vitest";
import { generateIdempotencyKey } from "./generateIdempotencyKey";

describe("generateIdempotencyKey", () => {
  it("TESTE 1 — gera uma string não vazia", () => {
    expect(generateIdempotencyKey().length).toBeGreaterThan(0);
  });

  it("TESTE 2 — duas chamadas geram valores diferentes", () => {
    const a = generateIdempotencyKey();
    const b = generateIdempotencyKey();
    expect(a).not.toBe(b);
  });
});
