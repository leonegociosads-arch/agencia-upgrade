import { describe, expect, it, vi, beforeEach } from "vitest";

const insertMock = vi.fn();
const fromMock = vi.fn(() => ({ insert: insertMock }));
const getSupabaseServerClientMock = vi.fn(() => ({ from: fromMock }));

vi.mock("../supabase/server", () => ({
  getSupabaseServerClient: () => getSupabaseServerClientMock(),
}));

import { getAnalyticsOverview, insertAnalyticsEvent } from "./analyticsEvents";

beforeEach(() => {
  insertMock.mockReset();
  fromMock.mockClear();
  getSupabaseServerClientMock.mockClear();
});

describe("insertAnalyticsEvent (escrita, sempre via service role)", () => {
  it("grava na tabela analytics_events com as colunas corretas", async () => {
    insertMock.mockResolvedValue({ error: null });
    const result = await insertAnalyticsEvent({
      sessionId: "session-1",
      eventName: "service_selected",
      eventCategory: "funnel",
      properties: { serviceId: "site" },
    });

    expect(result).toEqual({ ok: true });
    expect(fromMock).toHaveBeenCalledWith("analytics_events");
    expect(insertMock).toHaveBeenCalledWith({
      session_id: "session-1",
      event_name: "service_selected",
      event_category: "funnel",
      properties: { serviceId: "site" },
    });
  });

  it("erro do Supabase retorna ok: false sem lançar", async () => {
    insertMock.mockResolvedValue({ error: { message: "falhou" } });
    const result = await insertAnalyticsEvent({
      sessionId: "session-1",
      eventName: "page_view",
      eventCategory: "engagement",
      properties: { path: "/" },
    });
    expect(result).toEqual({ ok: false });
  });

  it("Supabase não configurado (sem variáveis de ambiente) retorna ok: false sem lançar", async () => {
    getSupabaseServerClientMock.mockImplementationOnce(() => {
      throw new Error("Supabase não configurado");
    });
    const result = await insertAnalyticsEvent({
      sessionId: "session-1",
      eventName: "page_view",
      eventCategory: "engagement",
      properties: { path: "/" },
    });
    expect(result).toEqual({ ok: false });
  });
});

describe("getAnalyticsOverview (leitura administrativa, cliente de SESSÃO)", () => {
  it("TESTE 21 — chama a RPC analytics_overview com o período pedido, usando o cliente recebido (não o de service role)", async () => {
    const rpcMock = vi.fn().mockResolvedValue({ data: { funnel: { page_view: 10, builder_started: 4 }, topService: "site" }, error: null });
    const fakeSessionClient = { rpc: rpcMock } as never;

    const result = await getAnalyticsOverview(fakeSessionClient, "2024-01-01T00:00:00.000Z");

    expect(rpcMock).toHaveBeenCalledWith("analytics_overview", { period_start: "2024-01-01T00:00:00.000Z" });
    expect(result).toEqual({ funnel: { page_view: 10, builder_started: 4 }, topService: "site" });
    expect(getSupabaseServerClientMock).not.toHaveBeenCalled();
  });

  it("TESTE 22 — erro/RLS bloqueando (não-admin) devolve agregados vazios, nunca lança", async () => {
    const rpcMock = vi.fn().mockResolvedValue({ data: null, error: { message: "permission denied" } });
    const fakeSessionClient = { rpc: rpcMock } as never;

    const result = await getAnalyticsOverview(fakeSessionClient, "2024-01-01T00:00:00.000Z");
    expect(result).toEqual({ funnel: {}, topService: null });
  });
});
