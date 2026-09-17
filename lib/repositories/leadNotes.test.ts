import { describe, expect, it, vi } from "vitest";
import { addLeadNote, listLeadNotes } from "./leadNotes";

function createBuilder(result: { data?: unknown; error?: unknown }) {
  const insertMock = vi.fn(() => Promise.resolve(result));
  const eqMock = vi.fn(() => builder);
  const orderMock = vi.fn(() => Promise.resolve(result));
  const selectMock = vi.fn(() => builder);
  const builder = { insert: insertMock, select: selectMock, eq: eqMock, order: orderMock };
  return { builder, insertMock, eqMock, orderMock, selectMock };
}

describe("addLeadNote (Fase 16)", () => {
  it("TESTE 19/20 — grava a nota vinculada ao lead, com o autor", async () => {
    const { builder, insertMock } = createBuilder({ error: null });
    const supabase = { from: vi.fn(() => builder) } as never;
    const result = await addLeadNote(supabase, "lead-1", "Cliente pediu retorno depois das 18h.", "admin-1");
    expect(result.ok).toBe(true);
    expect(insertMock).toHaveBeenCalledWith({ lead_id: "lead-1", content: "Cliente pediu retorno depois das 18h.", created_by: "admin-1" });
  });

  it("erro do Supabase retorna falha recuperável", async () => {
    const { builder } = createBuilder({ error: { message: "boom" } });
    const supabase = { from: vi.fn(() => builder) } as never;
    const result = await addLeadNote(supabase, "lead-1", "nota", "admin-1");
    expect(result.ok).toBe(false);
  });
});

describe("listLeadNotes (Fase 16)", () => {
  it("lista as notas de um lead, mais recentes primeiro", async () => {
    const rows = [{ id: "n1", lead_id: "lead-1", content: "nota", created_by: "admin-1", created_at: "2024-01-01T00:00:00.000Z" }];
    const { builder, orderMock, eqMock } = createBuilder({ data: rows });
    const supabase = { from: vi.fn(() => builder) } as never;
    const notes = await listLeadNotes(supabase, "lead-1");
    expect(notes).toEqual([{ id: "n1", leadId: "lead-1", content: "nota", createdBy: "admin-1", createdAt: "2024-01-01T00:00:00.000Z" }]);
    expect(eqMock).toHaveBeenCalledWith("lead_id", "lead-1");
    expect(orderMock).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  it("erro do Supabase retorna lista vazia, nunca lança", async () => {
    const { builder } = createBuilder({ data: null, error: { message: "boom" } });
    const supabase = { from: vi.fn(() => builder) } as never;
    expect(await listLeadNotes(supabase, "lead-1")).toEqual([]);
  });
});
