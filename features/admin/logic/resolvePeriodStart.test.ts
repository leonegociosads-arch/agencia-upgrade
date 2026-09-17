import { describe, expect, it } from "vitest";
import { isValidAnalyticsPeriod, resolvePeriodStart } from "./resolvePeriodStart";

describe("resolvePeriodStart (Fase 17 — Visão geral do admin)", () => {
  const now = new Date("2024-06-15T18:30:00.000Z");

  it("'today' resolve para o início do dia (hora local zerada)", () => {
    const start = new Date(resolvePeriodStart("today", now));
    expect(start.getDate()).toBe(now.getDate());
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
  });

  it("'7d' resolve para exatamente 7 dias atrás", () => {
    const start = new Date(resolvePeriodStart("7d", now));
    expect(now.getTime() - start.getTime()).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it("'30d' resolve para exatamente 30 dias atrás", () => {
    const start = new Date(resolvePeriodStart("30d", now));
    expect(now.getTime() - start.getTime()).toBe(30 * 24 * 60 * 60 * 1000);
  });

  it("isValidAnalyticsPeriod aceita só os 3 períodos suportados (sem date picker)", () => {
    expect(isValidAnalyticsPeriod("7d")).toBe(true);
    expect(isValidAnalyticsPeriod("90d")).toBe(false);
  });
});
