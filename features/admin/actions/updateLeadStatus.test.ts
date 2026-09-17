import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAdminSessionMock = vi.fn();
vi.mock("@/lib/auth/adminSession", () => ({ requireAdminSession: () => requireAdminSessionMock() }));

const getLeadStatusMock = vi.fn();
const updateLeadStatusRowMock = vi.fn();
vi.mock("@/lib/repositories/leads", () => ({
  getLeadStatus: (...args: unknown[]) => getLeadStatusMock(...args),
  updateLeadStatusRow: (...args: unknown[]) => updateLeadStatusRowMock(...args),
}));

const addLeadStatusHistoryMock = vi.fn();
vi.mock("@/lib/repositories/leadStatusHistory", () => ({
  addLeadStatusHistory: (...args: unknown[]) => addLeadStatusHistoryMock(...args),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { updateLeadStatus } from "./updateLeadStatus";

const fakeSupabase = {};
const VALID_ID = "11111111-1111-4111-8111-111111111111";

beforeEach(() => {
  requireAdminSessionMock.mockReset();
  getLeadStatusMock.mockReset();
  updateLeadStatusRowMock.mockReset();
  addLeadStatusHistoryMock.mockReset();
  requireAdminSessionMock.mockResolvedValue({ user: { id: "admin-1" }, supabase: fakeSupabase });
});

describe("updateLeadStatus (Server Action, Fase 16)", () => {
  it("TESTE 18 — id que não é UUID é rejeitado no servidor, sem tocar o banco", async () => {
    const result = await updateLeadStatus("nao-e-um-uuid", "contacted");
    expect(result).toEqual({ ok: false, message: "Identificador de projeto inválido." });
    expect(getLeadStatusMock).not.toHaveBeenCalled();
  });

  it("TESTE 18 — status desconhecido é rejeitado no servidor, sem tocar o banco", async () => {
    const result = await updateLeadStatus(VALID_ID, "arquivado_para_sempre");
    expect(result).toEqual({ ok: false, message: "Status inválido." });
    expect(updateLeadStatusRowMock).not.toHaveBeenCalled();
  });

  it("lead inexistente retorna falha", async () => {
    getLeadStatusMock.mockResolvedValue(null);
    const result = await updateLeadStatus(VALID_ID, "contacted");
    expect(result).toEqual({ ok: false, message: "Projeto não encontrado." });
  });

  it("TESTE 17 — new -> contacted: atualiza a linha e grava o histórico com o status anterior", async () => {
    getLeadStatusMock.mockResolvedValue("new");
    updateLeadStatusRowMock.mockResolvedValue({ ok: true });
    const result = await updateLeadStatus(VALID_ID, "contacted");
    expect(result).toEqual({ ok: true });
    expect(updateLeadStatusRowMock).toHaveBeenCalledWith(fakeSupabase, VALID_ID, "contacted");
    expect(addLeadStatusHistoryMock).toHaveBeenCalledWith(fakeSupabase, VALID_ID, "new", "contacted", "admin-1");
  });

  it("propaga a falha de updateLeadStatusRow sem gravar histórico", async () => {
    getLeadStatusMock.mockResolvedValue("new");
    updateLeadStatusRowMock.mockResolvedValue({ ok: false, message: "Não foi possível atualizar o status." });
    const result = await updateLeadStatus(VALID_ID, "contacted");
    expect(result.ok).toBe(false);
    expect(addLeadStatusHistoryMock).not.toHaveBeenCalled();
  });

  it("TESTE 25 (segurança) — sempre passa por requireAdminSession antes de qualquer coisa", async () => {
    getLeadStatusMock.mockResolvedValue("new");
    updateLeadStatusRowMock.mockResolvedValue({ ok: true });
    await updateLeadStatus(VALID_ID, "won");
    expect(requireAdminSessionMock).toHaveBeenCalled();
  });
});
