import { describe, expect, it } from "vitest";
import { getLeadScoreTier } from "./getLeadScoreTier";

describe("getLeadScoreTier — limites de tier (Etapa 15)", () => {
  it("TESTE 11 — 29 → LOW", () => expect(getLeadScoreTier(29)).toBe("LOW"));
  it("TESTE 12 — 30 → MEDIUM", () => expect(getLeadScoreTier(30)).toBe("MEDIUM"));
  it("TESTE 13 — 59 → MEDIUM", () => expect(getLeadScoreTier(59)).toBe("MEDIUM"));
  it("TESTE 14 — 60 → HIGH", () => expect(getLeadScoreTier(60)).toBe("HIGH"));
  it("TESTE 15 — 79 → HIGH", () => expect(getLeadScoreTier(79)).toBe("HIGH"));
  it("TESTE 16 — 80 → PRIORITY", () => expect(getLeadScoreTier(80)).toBe("PRIORITY"));
  it("TESTE 17 — 100 → PRIORITY", () => expect(getLeadScoreTier(100)).toBe("PRIORITY"));

  it("0 → LOW (extremo inferior)", () => expect(getLeadScoreTier(0)).toBe("LOW"));
});
