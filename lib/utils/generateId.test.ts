import { describe, expect, it } from "vitest";
import { generateId } from "./generateId";

describe("generateId", () => {
  it("TESTE 1 — gera uma string não vazia", () => {
    expect(generateId().length).toBeGreaterThan(0);
  });

  it("TESTE 2 — duas chamadas geram valores diferentes", () => {
    expect(generateId()).not.toBe(generateId());
  });
});
