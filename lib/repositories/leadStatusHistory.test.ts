import { describe, expect, it, vi } from "vitest";
import { addLeadStatusHistory, listLeadStatusHistory } from "./leadStatusHistory";

function createBuilder(result: { data?: unknown; error?: unknown }) {
  const insertMock = vi.fn(() => Promise.resolve(result));
  const eqMock = vi.fn(() => builder);
  const orderMock = vi.fn(() => Promise.resolve(result));
  const selectMock = vi.fn(() => builder);
  const builder = { insert: insertMock, select: selectMock, eq: eqMock, order: orderMock };
  return { builder, insertMock, eqMock, orderMock };
}

describe("addLeadStatusHistory (Fase 16)", () => {
  it("grava a transição de status com o autor da mudança", async () => {
    const { builder, insertMock } = createBuilder({ error: null });
    const supabase = { from: vi.fn(() => builder) } as never;
    await addLeadStatusHistory(supabase, "lead-1", "new", "contacted", "admin-1");
    expect(insertMock).toHaveBeenCalledWith({ lead_id: "lead-1", old_status: "new", new_status: "contacted", changed_by: "admin-1" });
  });

  it("aceita old_status nulo (primeira entrada de histórico)", async () => {
    const { builder, insertMock } = createBuilder({ error: null });
    const supabase = { from: vi.fn(() => builder) } as never;
    await addLeadStatusHistory(supabase, "lead-1", null, "new", "admin-1");
    expect(insertMock).toHaveBeenCalledWith({ lead_id: "lead-1", old_status: null, new_status: "new", changed_by: "admin-1" });
  });

  it("erro do Supabase não lança (só registra em log)", async () => {
    const { builder } = createBuilder({ error: { message: "boom" } });
    const supabase = { from: vi.fn(() => builder) } as never;
    await expect(addLeadStatusHistory(supabase, "lead-1", "new", "contacted", "admin-1")).resolves.toBeUndefined();
  });
});

describe("listLeadStatusHistory (Fase 16)", () => {
  it("lista o histórico de um lead, mais recente primeiro", async () => {
    const rows = [
      { id: "h1", lead_id: "lead-1", old_status: "new", new_status: "contacted", changed_by: "admin-1", created_at: "2024-01-02T00:00:00.000Z" },
    ];
    const { builder, orderMock } = createBuilder({ data: rows });
    const supabase = { from: vi.fn(() => builder) } as never;
    const history = await listLeadStatusHistory(supabase, "lead-1");
    expect(history).toEqual([
      { id: "h1", leadId: "lead-1", oldStatus: "new", newStatus: "contacted", changedBy: "admin-1", createdAt: "2024-01-02T00:00:00.000Z" },
    ]);
    expect(orderMock).toHaveBeenCalledWith("created_at", { ascending: false });
  });
});
