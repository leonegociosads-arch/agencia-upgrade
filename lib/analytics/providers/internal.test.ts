import { describe, expect, it, vi } from "vitest";

const recordEventMock = vi.fn();
vi.mock("@/features/analytics/actions/recordEvent", () => ({
  recordEvent: (...args: unknown[]) => recordEventMock(...args),
}));

import { send } from "./internal";

describe("Provider interno (Fase 17)", () => {
  it("repassa sessionId, nome do evento e propriedades para a Server Action recordEvent", () => {
    recordEventMock.mockResolvedValue(undefined);
    send("session-1", "page_view", { path: "/" });
    expect(recordEventMock).toHaveBeenCalledWith("session-1", "page_view", { path: "/" });
  });

  it("nunca lança mesmo se a Server Action rejeitar (rede indisponível etc.)", () => {
    recordEventMock.mockRejectedValue(new Error("falha de rede"));
    expect(() => send("session-1", "page_view", { path: "/" })).not.toThrow();
  });
});
