import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit, resetRateLimitForTests } from "./rateLimit";

beforeEach(() => {
  resetRateLimitForTests();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("checkRateLimit (Etapa 29 — Segurança)", () => {
  it("permite até o limite configurado dentro da janela", () => {
    for (let i = 0; i < 3; i += 1) {
      expect(checkRateLimit("k", 3, 1000).ok).toBe(true);
    }
  });

  it("bloqueia a partir da tentativa que excede o limite", () => {
    for (let i = 0; i < 3; i += 1) checkRateLimit("k", 3, 1000);
    const result = checkRateLimit("k", 3, 1000);
    expect(result.ok).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it("chaves diferentes têm contadores independentes", () => {
    for (let i = 0; i < 3; i += 1) checkRateLimit("a", 3, 1000);
    expect(checkRateLimit("a", 3, 1000).ok).toBe(false);
    expect(checkRateLimit("b", 3, 1000).ok).toBe(true);
  });

  it("libera de novo depois que a janela expira", () => {
    for (let i = 0; i < 3; i += 1) checkRateLimit("k", 3, 1000);
    expect(checkRateLimit("k", 3, 1000).ok).toBe(false);

    vi.advanceTimersByTime(1001);

    expect(checkRateLimit("k", 3, 1000).ok).toBe(true);
  });

  it("resetRateLimitForTests limpa todos os contadores", () => {
    for (let i = 0; i < 3; i += 1) checkRateLimit("k", 3, 1000);
    expect(checkRateLimit("k", 3, 1000).ok).toBe(false);

    resetRateLimitForTests();

    expect(checkRateLimit("k", 3, 1000).ok).toBe(true);
  });
});
