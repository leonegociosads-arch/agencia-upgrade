import { describe, expect, it } from "vitest";
import { computeFunnelRates } from "./computeFunnelRates";

describe("computeFunnelRates (Fase 17)", () => {
  it("calcula todas as taxas descritas no briefing a partir das contagens do funil", () => {
    const rates = computeFunnelRates({
      page_view: 100,
      builder_started: 50,
      service_completed: 30,
      upgrade_reviewed: 25,
      contact_started: 15,
      lead_submitted: 10,
    });

    expect(rates.builderStartRate).toBeCloseTo(0.5);
    expect(rates.serviceCompletionRate).toBeCloseTo(0.6);
    expect(rates.reviewRate).toBeCloseTo(0.5);
    expect(rates.contactStartRate).toBeCloseTo(0.6);
    expect(rates.leadConversionRate).toBeCloseTo(0.2);
    expect(rates.visitorConversionRate).toBeCloseTo(0.1);
  });

  it("denominador zero/ausente devolve null em vez de Infinity/NaN", () => {
    const rates = computeFunnelRates({});
    expect(rates.builderStartRate).toBeNull();
    expect(rates.leadConversionRate).toBeNull();
  });

  it("numerador ausente com denominador presente conta como 0, não null", () => {
    const rates = computeFunnelRates({ page_view: 10 });
    expect(rates.builderStartRate).toBe(0);
  });
});
