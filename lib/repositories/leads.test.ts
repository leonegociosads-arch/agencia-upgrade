import { describe, expect, it, vi, beforeEach } from "vitest";

const insertMock = vi.fn();
const fromMock = vi.fn(() => ({ insert: insertMock }));
const getSupabaseServerClientMock = vi.fn(() => ({ from: fromMock }));

vi.mock("../supabase/server", () => ({
  getSupabaseServerClient: () => getSupabaseServerClientMock(),
}));

import { createLead, listLeads } from "./leads";
import type { LeadPayload } from "../../features/lead/types";
import type { LeadScoreResult } from "../../features/lead/logic/calculateLeadScore";
import type { SupabaseClient } from "@supabase/supabase-js";

const payload: LeadPayload = {
  contact: {
    name: "João Silva",
    company: "ABC Móveis",
    whatsapp: "5513999999999",
    email: "joao@teste.com",
    websiteOrInstagram: "@abcmoveis",
  },
  project: { services: [{ serviceId: "site", answers: { site_tipo: "nao_sei" } }] },
  meta: { createdAt: "2024-01-01T00:00:00.000Z", idempotencyKey: "chave-1" },
};

const leadScore: LeadScoreResult = {
  score: 13,
  tier: "LOW",
  reasons: [
    { ruleId: "SERVICE_COUNT_1", points: 6 },
    { ruleId: "SITE_TIPO_NAO_SEI", points: 4 },
  ],
  version: 1,
};

describe("createLead (repositório lib/repositories/leads.ts)", () => {
  beforeEach(() => {
    insertMock.mockReset();
    fromMock.mockClear();
    getSupabaseServerClientMock.mockClear();
  });

  it("TESTE 1 — grava o lead com as colunas mapeadas corretamente e retorna ok", async () => {
    insertMock.mockResolvedValue({ error: null });
    const result = await createLead(payload, leadScore);
    expect(result).toEqual({ ok: true });
    expect(fromMock).toHaveBeenCalledWith("upgrade_leads");
    expect(insertMock).toHaveBeenCalledWith({
      name: "João Silva",
      company: "ABC Móveis",
      whatsapp: "5513999999999",
      email: "joao@teste.com",
      website_or_instagram: "@abcmoveis",
      project: payload.project,
      idempotency_key: "chave-1",
      lead_score: 13,
      lead_score_tier: "LOW",
      lead_score_version: 1,
      lead_score_breakdown: leadScore.reasons,
    });
  });

  it("TESTE 2 — websiteOrInstagram ausente é gravado como null, não como undefined", async () => {
    insertMock.mockResolvedValue({ error: null });
    const { websiteOrInstagram: _unused, ...contactWithoutSite } = payload.contact;
    void _unused;
    await createLead({ ...payload, contact: contactWithoutSite }, leadScore);
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ website_or_instagram: null }));
  });

  it("TESTE 3 — violação de unicidade (idempotency_key repetida) é tratada como sucesso", async () => {
    insertMock.mockResolvedValue({ error: { code: "23505", message: "duplicate key value" } });
    const result = await createLead(payload, leadScore);
    expect(result).toEqual({ ok: true });
  });

  it("TESTE 4 — outro erro do Postgres retorna falha com a mensagem genérica esperada", async () => {
    insertMock.mockResolvedValue({ error: { code: "42501", message: "permission denied" } });
    const result = await createLead(payload, leadScore);
    expect(result).toEqual({ ok: false, message: "Não conseguimos enviar agora. Seus dados continuam preenchidos." });
  });

  it("TESTE 5 — Supabase não configurado (getSupabaseServerClient lança) retorna falha sem quebrar", async () => {
    getSupabaseServerClientMock.mockImplementationOnce(() => {
      throw new Error("Supabase não configurado no servidor: defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.");
    });
    const result = await createLead(payload, leadScore);
    expect(result).toEqual({ ok: false, message: "Não conseguimos enviar agora. Seus dados continuam preenchidos." });
  });

  it("TESTE 22/23/24 — score, tier e breakdown persistidos correspondem exatamente ao resultado calculado", async () => {
    insertMock.mockResolvedValue({ error: null });
    const highScore: LeadScoreResult = {
      score: 91,
      tier: "PRIORITY",
      reasons: [
        { ruleId: "SERVICE_COUNT_3", points: 22 },
        { ruleId: "SITE_SISTEMA_PLATAFORMA", points: 26 },
      ],
      version: 1,
    };
    await createLead(payload, highScore);
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        lead_score: 91,
        lead_score_tier: "PRIORITY",
        lead_score_version: 1,
        lead_score_breakdown: highScore.reasons,
      }),
    );
  });
});

// ============================================================================
// listLeads — busca administrativa (Etapa 29, Seção 95/97: limitar tamanho de entrada livre)
// ============================================================================

function createChainableQuery(result: { data: unknown[]; error: unknown; count: number }) {
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    filter: vi.fn(() => query),
    or: vi.fn(() => query),
    order: vi.fn(() => query),
    range: vi.fn(() => query),
    then: (resolve: (value: typeof result) => void) => resolve(result),
  };
  return query;
}

describe("listLeads — sanitização/limite do termo de busca (Etapa 29)", () => {
  it("TESTE (Seção 95/97) — um termo de busca absurdamente longo é truncado antes de virar filtro", async () => {
    const query = createChainableQuery({ data: [], error: null, count: 0 });
    const supabase = { from: vi.fn(() => query) } as unknown as SupabaseClient;

    await listLeads(supabase, { filters: { search: "x".repeat(5000) } });

    expect(query.or).toHaveBeenCalledTimes(1);
    const [orExpression] = query.or.mock.calls[0] as unknown as [string];
    const [firstClause] = orExpression.split(",");
    const term = firstClause.replace("name.ilike.%", "").replace(/%$/, "");
    expect(term.length).toBeLessThanOrEqual(100);
  });

  it("uma busca normal não é afetada pelo truncamento", async () => {
    const query = createChainableQuery({ data: [], error: null, count: 0 });
    const supabase = { from: vi.fn(() => query) } as unknown as SupabaseClient;

    await listLeads(supabase, { filters: { search: "João Silva" } });

    expect(query.or).toHaveBeenCalledWith(expect.stringContaining("João Silva"));
  });
});
