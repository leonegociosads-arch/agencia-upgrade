import { afterEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.fn((path: string) => {
  throw new Error(`REDIRECT:${path}`);
});

vi.mock("next/navigation", () => ({
  redirect: (path: string) => redirectMock(path),
}));

const createSupabaseServerSessionClientMock = vi.fn();
vi.mock("../supabase/serverSessionClient", () => ({
  createSupabaseServerSessionClient: () => createSupabaseServerSessionClientMock(),
}));

/**
 * `getAdminSession` é embrulhada em `React.cache()`, cujo comportamento de memoização é pensado
 * para durar uma renderização de Server Component — fora desse contexto (aqui, em teste), o mais
 * seguro é não presumir nada sobre reaproveitamento entre chamadas. Por isso cada teste reimporta o
 * módulo do zero (`vi.resetModules()`), garantindo um `cache()` novo por teste, sem depender de
 * como ele se comporta entre chamadas sucessivas fora de um render real.
 */
async function importFresh() {
  vi.resetModules();
  return import("./adminSession");
}

function mockSupabase(user: { id: string } | null, isAdminRow: object | null) {
  const maybeSingle = vi.fn(() => Promise.resolve({ data: isAdminRow }));
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  return {
    auth: { getUser: vi.fn(() => Promise.resolve({ data: { user } })) },
    from: vi.fn(() => ({ select })),
  };
}

afterEach(() => {
  redirectMock.mockClear();
  createSupabaseServerSessionClientMock.mockReset();
});

describe("getAdminSession (Fase 16)", () => {
  it("TESTE 1 — sem usuário autenticado: retorna null", async () => {
    createSupabaseServerSessionClientMock.mockResolvedValue(mockSupabase(null, null));
    const { getAdminSession } = await importFresh();
    expect(await getAdminSession()).toBeNull();
  });

  it("TESTE 2 — autenticado, mas fora de admin_users: retorna null (estar logado não basta)", async () => {
    createSupabaseServerSessionClientMock.mockResolvedValue(mockSupabase({ id: "user-1" }, null));
    const { getAdminSession } = await importFresh();
    expect(await getAdminSession()).toBeNull();
  });

  it("TESTE 3 — autenticado e presente em admin_users: retorna a sessão", async () => {
    createSupabaseServerSessionClientMock.mockResolvedValue(mockSupabase({ id: "user-1" }, { user_id: "user-1" }));
    const { getAdminSession } = await importFresh();
    const session = await getAdminSession();
    expect(session).not.toBeNull();
    expect(session?.user.id).toBe("user-1");
  });
});

describe("requireAdminSession (Fase 16)", () => {
  it("TESTE 1 — redireciona para /admin/login quando não há sessão", async () => {
    createSupabaseServerSessionClientMock.mockResolvedValue(mockSupabase(null, null));
    const { requireAdminSession } = await importFresh();
    await expect(requireAdminSession()).rejects.toThrow("REDIRECT:/admin/login");
  });

  it("TESTE 2 — redireciona para /admin/login quando autenticado mas não é admin", async () => {
    createSupabaseServerSessionClientMock.mockResolvedValue(mockSupabase({ id: "user-1" }, null));
    const { requireAdminSession } = await importFresh();
    await expect(requireAdminSession()).rejects.toThrow("REDIRECT:/admin/login");
  });

  it("TESTE 3 — retorna a sessão normalmente para um admin válido", async () => {
    createSupabaseServerSessionClientMock.mockResolvedValue(mockSupabase({ id: "user-1" }, { user_id: "user-1" }));
    const { requireAdminSession } = await importFresh();
    const session = await requireAdminSession();
    expect(session.user.id).toBe("user-1");
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
