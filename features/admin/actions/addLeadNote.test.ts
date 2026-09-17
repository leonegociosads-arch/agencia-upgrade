import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAdminSessionMock = vi.fn();
vi.mock("@/lib/auth/adminSession", () => ({ requireAdminSession: () => requireAdminSessionMock() }));

const addLeadNoteRowMock = vi.fn();
vi.mock("@/lib/repositories/leadNotes", () => ({
  addLeadNote: (...args: unknown[]) => addLeadNoteRowMock(...args),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { addLeadNote } from "./addLeadNote";

const fakeSupabase = {};
const VALID_ID = "11111111-1111-4111-8111-111111111111";

beforeEach(() => {
  requireAdminSessionMock.mockReset();
  addLeadNoteRowMock.mockReset();
  requireAdminSessionMock.mockResolvedValue({ user: { id: "admin-1" }, supabase: fakeSupabase });
});

describe("addLeadNote (Server Action, Fase 16)", () => {
  it("id que não é UUID é rejeitado no servidor", async () => {
    const result = await addLeadNote("nao-e-um-uuid", "uma nota qualquer");
    expect(result).toEqual({ ok: false, message: "Identificador de projeto inválido." });
    expect(addLeadNoteRowMock).not.toHaveBeenCalled();
  });

  it("TESTE 26 — conteúdo vazio é rejeitado no servidor, não só no cliente", async () => {
    const result = await addLeadNote(VALID_ID, "   ");
    expect(result.ok).toBe(false);
    expect(addLeadNoteRowMock).not.toHaveBeenCalled();
  });

  it("conteúdo acima do limite é rejeitado no servidor", async () => {
    const result = await addLeadNote(VALID_ID, "a".repeat(2001));
    expect(result.ok).toBe(false);
    expect(addLeadNoteRowMock).not.toHaveBeenCalled();
  });

  it("TESTE 19/20 — nota válida é salva vinculada ao lead e ao admin autenticado", async () => {
    addLeadNoteRowMock.mockResolvedValue({ ok: true });
    const result = await addLeadNote(VALID_ID, "  Cliente pediu retorno depois das 18h.  ");
    expect(result).toEqual({ ok: true });
    expect(addLeadNoteRowMock).toHaveBeenCalledWith(fakeSupabase, VALID_ID, "Cliente pediu retorno depois das 18h.", "admin-1");
  });

  it("TESTE 25 (segurança) — sempre passa por requireAdminSession antes de qualquer coisa", async () => {
    addLeadNoteRowMock.mockResolvedValue({ ok: true });
    await addLeadNote(VALID_ID, "nota");
    expect(requireAdminSessionMock).toHaveBeenCalled();
  });
});
