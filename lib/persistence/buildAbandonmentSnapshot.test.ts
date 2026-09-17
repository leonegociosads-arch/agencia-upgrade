import { describe, expect, it } from "vitest";
import { buildAbandonmentSnapshot } from "./buildAbandonmentSnapshot";
import { initialBuilderState } from "@/features/builder/state/builderReducer";
import type { BuilderState } from "@/features/builder/types";

describe("buildAbandonmentSnapshot", () => {
  it("TESTE 1 — sessão recém-iniciada: contactStarted e submitted são false", () => {
    const snapshot = buildAbandonmentSnapshot("s1", initialBuilderState, "2024-01-01T00:00:00.000Z");
    expect(snapshot).toEqual({
      sessionId: "s1",
      lastStep: "choosing_service",
      activeService: null,
      confirmedServiceCount: 0,
      contactStarted: false,
      submitted: false,
      updatedAt: "2024-01-01T00:00:00.000Z",
    });
  });

  it("TESTE 2 — conta serviços confirmados corretamente", () => {
    const state: BuilderState = {
      ...initialBuilderState,
      confirmedServices: {
        site: { serviceId: "site", answers: {}, status: "complete", createdAt: "x", updatedAt: "x" },
        trafego: { serviceId: "trafego", answers: {}, status: "complete", createdAt: "x", updatedAt: "x" },
      },
    };
    expect(buildAbandonmentSnapshot("s2", state, "x").confirmedServiceCount).toBe(2);
  });

  it("TESTE 3 — step 'contact' marca contactStarted, mas não submitted", () => {
    const state: BuilderState = { ...initialBuilderState, step: "contact" };
    const snapshot = buildAbandonmentSnapshot("s3", state, "x");
    expect(snapshot.contactStarted).toBe(true);
    expect(snapshot.submitted).toBe(false);
  });

  it("TESTE 4 — step 'success' marca contactStarted e submitted", () => {
    const state: BuilderState = { ...initialBuilderState, step: "success" };
    const snapshot = buildAbandonmentSnapshot("s4", state, "x");
    expect(snapshot.contactStarted).toBe(true);
    expect(snapshot.submitted).toBe(true);
  });

  it("TESTE 5 — nunca inclui dados pessoais (nem sequer as chaves existem na estrutura)", () => {
    const snapshot = buildAbandonmentSnapshot("s5", initialBuilderState, "x");
    expect(Object.keys(snapshot).sort()).toEqual(
      ["activeService", "confirmedServiceCount", "contactStarted", "lastStep", "sessionId", "submitted", "updatedAt"].sort(),
    );
  });
});
