// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import {
  BUILDER_SESSION_STORAGE_KEY,
  BUILDER_SESSION_TTL_MS,
  BUILDER_SESSION_VERSION,
  clearBuilderSession,
  loadBuilderSession,
  saveBuilderSession,
  validateStoredSession,
} from "./builderSession";
import type { RestorableBuilderState } from "@/features/builder/state/builderReducer";
import type { LeadFormData } from "@/features/lead/types";

function baseBuilder(overrides: Partial<RestorableBuilderState> = {}): RestorableBuilderState {
  return {
    step: "choosing_service",
    activeService: null,
    editingService: null,
    serviceDraft: {},
    draftHistory: [],
    confirmedServices: {},
    returnStep: "choosing_service",
    ...overrides,
  };
}

const emptyLead: LeadFormData = { name: "", company: "", whatsapp: "", email: "", websiteOrInstagram: "" };

function item(serviceId: "site" | "trafego" | "design", answers: Record<string, string | string[]>) {
  return { serviceId, answers, status: "complete" as const, createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" };
}

afterEach(() => {
  localStorage.clear();
});

describe("SAVE / LOAD", () => {
  it("TESTE 1 — Site parcial: salvar e carregar traz os mesmos dados", () => {
    const builder = baseBuilder({ step: "configuring", activeService: "site", serviceDraft: { site_tipo: "ecommerce" }, draftHistory: ["site_tipo"] });
    saveBuilderSession({ sessionId: "s1", builder, leadDraft: emptyLead });

    const result = loadBuilderSession();
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.session.builder.serviceDraft).toEqual({ site_tipo: "ecommerce" });
    expect(result.session.builder.activeService).toBe("site");
    expect(result.session.sessionId).toBe("s1");
  });

  it("TESTE 2 — Site + Tráfego confirmados: ambos permanecem depois de carregar", () => {
    const builder = baseBuilder({
      confirmedServices: {
        site: item("site", { site_tipo: "nao_sei" }),
        trafego: item("trafego", { trafego_negocio: "servicos" }),
      },
    });
    saveBuilderSession({ sessionId: "s2", builder, leadDraft: emptyLead });

    const result = loadBuilderSession();
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(Object.keys(result.session.builder.confirmedServices).sort()).toEqual(["site", "trafego"]);
  });
});

describe("DRAFT", () => {
  it("TESTE 3 — confirmed=E-commerce, draft=Institucional: os dois permanecem separados após restaurar", () => {
    const builder = baseBuilder({
      step: "configuring",
      activeService: "site",
      editingService: "site",
      confirmedServices: { site: item("site", { site_tipo: "ecommerce" }) },
      serviceDraft: { site_tipo: "institucional" },
    });
    saveBuilderSession({ sessionId: "s3", builder, leadDraft: emptyLead });

    const result = loadBuilderSession();
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.session.builder.confirmedServices.site?.answers.site_tipo).toBe("ecommerce");
    expect(result.session.builder.serviceDraft.site_tipo).toBe("institucional");
    expect(result.session.builder.editingService).toBe("site");
  });
});

describe("LEAD DRAFT", () => {
  it("TESTE 4 — nome + email parcialmente preenchidos permanecem depois de restaurar", () => {
    const leadDraft: LeadFormData = { ...emptyLead, name: "João", email: "joao@teste.com" };
    saveBuilderSession({ sessionId: "s4", builder: baseBuilder(), leadDraft });

    const result = loadBuilderSession();
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.session.leadDraft.name).toBe("João");
    expect(result.session.leadDraft.email).toBe("joao@teste.com");
  });
});

describe("EXPIRAÇÃO", () => {
  it("TESTE 5 — sessão dentro do TTL carrega normalmente", () => {
    const recentUpdatedAt = new Date(Date.now() - 1000).toISOString();
    localStorage.setItem(
      BUILDER_SESSION_STORAGE_KEY,
      JSON.stringify({ version: BUILDER_SESSION_VERSION, sessionId: "s5", updatedAt: recentUpdatedAt, builder: baseBuilder(), lead: { leadDraft: emptyLead } }),
    );
    expect(loadBuilderSession().status).toBe("ok");
  });

  it("TESTE 6 — sessão expirada não carrega e o storage é limpo", () => {
    const oldUpdatedAt = new Date(Date.now() - BUILDER_SESSION_TTL_MS - 1000).toISOString();
    localStorage.setItem(
      BUILDER_SESSION_STORAGE_KEY,
      JSON.stringify({ version: BUILDER_SESSION_VERSION, sessionId: "s6", updatedAt: oldUpdatedAt, builder: baseBuilder(), lead: { leadDraft: emptyLead } }),
    );
    const result = loadBuilderSession();
    expect(result.status).toBe("expired");
    expect(localStorage.getItem(BUILDER_SESSION_STORAGE_KEY)).toBeNull();
  });
});

describe("VERSION", () => {
  it("TESTE 7 — version atual carrega normalmente", () => {
    saveBuilderSession({ sessionId: "s7", builder: baseBuilder(), leadDraft: emptyLead });
    expect(loadBuilderSession().status).toBe("ok");
  });

  it("TESTE 8 — version incompatível descarta a sessão com segurança", () => {
    localStorage.setItem(
      BUILDER_SESSION_STORAGE_KEY,
      JSON.stringify({ version: 999, sessionId: "s8", updatedAt: new Date().toISOString(), builder: baseBuilder(), lead: { leadDraft: emptyLead } }),
    );
    const result = loadBuilderSession();
    expect(result.status).toBe("invalid");
    expect(localStorage.getItem(BUILDER_SESSION_STORAGE_KEY)).toBeNull();
  });
});

describe("CORRUPÇÃO", () => {
  it("TESTE 9 — JSON inválido não quebra a aplicação e limpa o armazenamento", () => {
    localStorage.setItem(BUILDER_SESSION_STORAGE_KEY, "{ isso não é json válido");
    let result: ReturnType<typeof loadBuilderSession> | undefined;
    expect(() => {
      result = loadBuilderSession();
    }).not.toThrow();
    expect(result?.status).toBe("invalid");
    expect(localStorage.getItem(BUILDER_SESSION_STORAGE_KEY)).toBeNull();
  });

  it("TESTE 10 — serviceId inválido em confirmedServices é descartado, o resto da sessão sobrevive", () => {
    const builder = baseBuilder({ confirmedServices: { site: item("site", { site_tipo: "nao_sei" }) } });
    saveBuilderSession({ sessionId: "s10", builder, leadDraft: emptyLead });

    // Corrompe manualmente: injeta uma chave de serviço que não existe mais.
    const raw = JSON.parse(localStorage.getItem(BUILDER_SESSION_STORAGE_KEY)!);
    raw.builder.confirmedServices.servico_removido = { serviceId: "servico_removido", answers: {}, status: "complete", createdAt: "x", updatedAt: "x" };
    localStorage.setItem(BUILDER_SESSION_STORAGE_KEY, JSON.stringify(raw));

    const result = loadBuilderSession();
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(Object.keys(result.session.builder.confirmedServices)).toEqual(["site"]);
  });

  it("editingService sem rascunho correspondente cancela a edição com segurança, mantendo confirmed", () => {
    const raw = {
      version: BUILDER_SESSION_VERSION,
      sessionId: "s11",
      updatedAt: new Date().toISOString(),
      builder: baseBuilder({ editingService: "site", activeService: "site", confirmedServices: { site: item("site", { site_tipo: "ecommerce" }) }, serviceDraft: {} }),
      lead: { leadDraft: emptyLead },
    };
    localStorage.setItem(BUILDER_SESSION_STORAGE_KEY, JSON.stringify(raw));

    const result = loadBuilderSession();
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.session.builder.editingService).toBeNull();
    expect(result.session.builder.activeService).toBeNull();
    expect(result.session.builder.confirmedServices.site?.answers.site_tipo).toBe("ecommerce");
  });

  it("step 'submitting' restaurado vira 'contact' (a chamada em andamento não existe mais)", () => {
    const raw = {
      version: BUILDER_SESSION_VERSION,
      sessionId: "s12",
      updatedAt: new Date().toISOString(),
      builder: baseBuilder({ step: "submitting", confirmedServices: { site: item("site", { site_tipo: "nao_sei" }) } }),
      lead: { leadDraft: emptyLead },
    };
    localStorage.setItem(BUILDER_SESSION_STORAGE_KEY, JSON.stringify(raw));

    const result = loadBuilderSession();
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.session.builder.step).toBe("contact");
  });

  it("step 'reviewing' sem nenhum serviço confirmado (após limpeza) volta para 'choosing_service'", () => {
    const raw = {
      version: BUILDER_SESSION_VERSION,
      sessionId: "s13",
      updatedAt: new Date().toISOString(),
      builder: baseBuilder({ step: "reviewing", confirmedServices: {} }),
      lead: { leadDraft: emptyLead },
    };
    localStorage.setItem(BUILDER_SESSION_STORAGE_KEY, JSON.stringify(raw));

    const result = loadBuilderSession();
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.session.builder.step).toBe("choosing_service");
  });
});

describe("clearBuilderSession", () => {
  it("remove a sessão do storage", () => {
    saveBuilderSession({ sessionId: "s14", builder: baseBuilder(), leadDraft: emptyLead });
    clearBuilderSession();
    expect(loadBuilderSession().status).toBe("empty");
  });
});

describe("nenhuma sessão salva ainda", () => {
  it("retorna status 'empty', sem lançar", () => {
    expect(loadBuilderSession()).toEqual({ status: "empty" });
  });
});

describe("validateStoredSession", () => {
  it("rejeita valores que não são objeto", () => {
    expect(validateStoredSession(null)).toEqual({ ok: false, reason: "invalid_shape" });
    expect(validateStoredSession("string qualquer")).toEqual({ ok: false, reason: "invalid_shape" });
  });
});

describe("localStorage indisponível", () => {
  it("saveBuilderSession não lança quando localStorage.setItem lança", () => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new Error("QuotaExceededError");
    };
    try {
      expect(() => saveBuilderSession({ sessionId: "s15", builder: baseBuilder(), leadDraft: emptyLead })).not.toThrow();
    } finally {
      Storage.prototype.setItem = original;
    }
  });
});
