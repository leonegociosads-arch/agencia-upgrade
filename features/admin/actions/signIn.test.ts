import { afterEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.fn((path: string) => {
  throw new Error(`REDIRECT:${path}`);
});
vi.mock("next/navigation", () => ({ redirect: (path: string) => redirectMock(path) }));

const createSupabaseServerSessionClientMock = vi.fn();
vi.mock("@/lib/supabase/serverSessionClient", () => ({
  createSupabaseServerSessionClient: () => createSupabaseServerSessionClientMock(),
}));

vi.mock("@/lib/security/getClientIp", () => ({
  getClientIp: () => Promise.resolve("203.0.113.1"),
}));

import { signInAdmin } from "./signIn";
import { resetRateLimitForTests } from "@/lib/security/rateLimit";

function mockSupabase(options: { signInError?: boolean; user?: { id: string } | null; isAdminRow?: object | null; signOut?: ReturnType<typeof vi.fn> }) {
  const user = options.user === undefined ? { id: "user-1" } : options.user;
  const maybeSingle = vi.fn(() => Promise.resolve({ data: options.isAdminRow ?? null }));
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  return {
    auth: {
      signInWithPassword: vi.fn(() =>
        Promise.resolve(options.signInError ? { data: { user: null }, error: { message: "invalid" } } : { data: { user }, error: null }),
      ),
      signOut: options.signOut ?? vi.fn(),
    },
    from: vi.fn(() => ({ select })),
  };
}

function formData(email: string, password: string) {
  const fd = new FormData();
  fd.set("email", email);
  fd.set("password", password);
  return fd;
}

afterEach(() => {
  redirectMock.mockClear();
  createSupabaseServerSessionClientMock.mockReset();
  resetRateLimitForTests();
});

describe("signInAdmin (Fase 16)", () => {
  it("rejeita e-mail inválido antes de chamar o Supabase", async () => {
    const result = await signInAdmin(undefined, formData("nao-e-email", "senha123"));
    expect(result.ok).toBe(false);
    expect(createSupabaseServerSessionClientMock).not.toHaveBeenCalled();
  });

  it("rejeita senha vazia antes de chamar o Supabase", async () => {
    const result = await signInAdmin(undefined, formData("admin@upgrade.com", ""));
    expect(result.ok).toBe(false);
    expect(createSupabaseServerSessionClientMock).not.toHaveBeenCalled();
  });

  it("credenciais erradas retornam mensagem genérica (não revela se o e-mail existe)", async () => {
    createSupabaseServerSessionClientMock.mockResolvedValue(mockSupabase({ signInError: true }));
    const result = await signInAdmin(undefined, formData("admin@upgrade.com", "senhaerrada"));
    expect(result).toEqual({ ok: false, message: "E-mail ou senha inválidos." });
  });

  it("TESTE 2 — login certo mas sem estar em admin_users: desloga de novo e explica o motivo", async () => {
    const signOut = vi.fn();
    createSupabaseServerSessionClientMock.mockResolvedValue(mockSupabase({ isAdminRow: null, signOut }));
    const result = await signInAdmin(undefined, formData("cliente@teste.com", "senha123"));
    expect(result).toEqual({ ok: false, message: "Esta conta não tem acesso ao painel administrativo." });
    expect(signOut).toHaveBeenCalled();
  });

  it("TESTE 3 — admin válido é redirecionado para /admin", async () => {
    createSupabaseServerSessionClientMock.mockResolvedValue(mockSupabase({ isAdminRow: { user_id: "user-1" } }));
    await expect(signInAdmin(undefined, formData("admin@upgrade.com", "senha123"))).rejects.toThrow("REDIRECT:/admin");
  });

  it("TESTE (Etapa 29, Seção 35/36 — rate limit) — a 6ª tentativa em 5 minutos do mesmo IP+e-mail é bloqueada antes do Supabase", async () => {
    createSupabaseServerSessionClientMock.mockResolvedValue(mockSupabase({ signInError: true }));
    for (let i = 0; i < 5; i += 1) {
      await signInAdmin(undefined, formData("admin@upgrade.com", "senhaerrada"));
    }
    createSupabaseServerSessionClientMock.mockClear();
    const result = await signInAdmin(undefined, formData("admin@upgrade.com", "senhaerrada"));
    expect(result.message).toBe("Muitas tentativas de login. Aguarde alguns minutos e tente de novo.");
    expect(createSupabaseServerSessionClientMock).not.toHaveBeenCalled();
  });

  it("TESTE (Etapa 29 — rate limit) — o limite é por chave IP+e-mail, não global (outro e-mail não é afetado)", async () => {
    createSupabaseServerSessionClientMock.mockResolvedValue(mockSupabase({ signInError: true }));
    for (let i = 0; i < 5; i += 1) {
      await signInAdmin(undefined, formData("admin@upgrade.com", "senhaerrada"));
    }
    const result = await signInAdmin(undefined, formData("outra@upgrade.com", "senhaerrada"));
    expect(result.message).not.toBe("Muitas tentativas de login. Aguarde alguns minutos e tente de novo.");
  });
});
