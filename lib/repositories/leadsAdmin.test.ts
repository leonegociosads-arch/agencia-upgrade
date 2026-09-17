import { describe, expect, it, vi } from "vitest";
import { listLeads, getLeadById, getLeadStatus, updateLeadStatusRow, getAdminLeadCounts } from "./leads";

/**
 * Ao contrário de `createLead` (que cria seu próprio cliente de service role internamente), as
 * funções administrativas recebem o cliente de SESSÃO já pronto (`lib/auth/adminSession.ts`) —
 * por isso os testes aqui só precisam de um builder falso encadeável, sem mockar
 * `getSupabaseServerClient`.
 */
function createQueryBuilder(result: { data?: unknown; error?: unknown; count?: number }) {
  const calls: Record<string, unknown[][]> = {};
  const methods = ["select", "eq", "gte", "filter", "or", "order", "range"] as const;
  const builder: Record<string, unknown> = {};

  for (const method of methods) {
    calls[method] = [];
    builder[method] = vi.fn((...args: unknown[]) => {
      calls[method].push(args);
      return builder;
    });
  }

  builder.maybeSingle = vi.fn(() => Promise.resolve(result));
  builder.update = vi.fn(() => builder);
  // Torna o builder "awaitable" (assim como o real query builder do supabase-js).
  builder.then = (resolve: (value: typeof result) => unknown) => Promise.resolve(result).then(resolve);

  return { builder, calls };
}

function createSupabaseMock(builder: unknown) {
  return { from: vi.fn(() => builder) } as unknown as Parameters<typeof listLeads>[0];
}

const site = { serviceId: "site" as const, answers: { site_tipo: "nao_sei" } };
const baseRow = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "João Silva",
  company: "ABC Móveis",
  whatsapp: "5513999999999",
  email: "joao@teste.com",
  website_or_instagram: null,
  project: { services: [site] },
  lead_score: 42,
  lead_score_tier: "MEDIUM",
  lead_score_version: 1,
  lead_score_breakdown: [{ ruleId: "SERVICE_COUNT_1", points: 6 }],
  status: "new",
  idempotency_key: "chave-1",
  created_at: "2024-01-01T00:00:00.000Z",
};

describe("listLeads (Fase 16)", () => {
  it("TESTE 4/5 — lista os projetos, mais recentes primeiro por padrão", async () => {
    const { builder, calls } = createQueryBuilder({ data: [baseRow], error: null, count: 1 });
    const result = await listLeads(createSupabaseMock(builder), {});
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe("João Silva");
    expect(calls.order[0]).toEqual(["created_at", { ascending: false }]);
  });

  it("TESTE 6/7 — score e tier corretos aparecem no item da lista", async () => {
    const { builder } = createQueryBuilder({ data: [baseRow], error: null, count: 1 });
    const result = await listLeads(createSupabaseMock(builder), {});
    if (!result.ok) throw new Error("esperado ok");
    expect(result.items[0].leadScore).toBe(42);
    expect(result.items[0].leadScoreTier).toBe("MEDIUM");
  });

  it("ordenação por score usa a coluna lead_score, maiores primeiro", async () => {
    const { builder, calls } = createQueryBuilder({ data: [], error: null, count: 0 });
    await listLeads(createSupabaseMock(builder), { sort: "score" });
    expect(calls.order[0]).toEqual(["lead_score", { ascending: false, nullsFirst: false }]);
  });

  it("TESTE 8 — filtra por status", async () => {
    const { builder, calls } = createQueryBuilder({ data: [], error: null, count: 0 });
    await listLeads(createSupabaseMock(builder), { filters: { status: "contacted" } });
    expect(calls.eq).toContainEqual(["status", "contacted"]);
  });

  it("TESTE 9 — filtra por tier", async () => {
    const { builder, calls } = createQueryBuilder({ data: [], error: null, count: 0 });
    await listLeads(createSupabaseMock(builder), { filters: { tier: "PRIORITY" } });
    expect(calls.eq).toContainEqual(["lead_score_tier", "PRIORITY"]);
  });

  it("TESTE 10 — filtra por serviço via containment no JSONB", async () => {
    const { builder, calls } = createQueryBuilder({ data: [], error: null, count: 0 });
    await listLeads(createSupabaseMock(builder), { filters: { service: "trafego" } });
    expect(calls.filter[0][0]).toBe("project->services");
    expect(calls.filter[0][1]).toBe("cs");
    expect(JSON.parse(calls.filter[0][2] as string)).toEqual([{ serviceId: "trafego" }]);
  });

  it("TESTE 11/12 — busca por nome/empresa/e-mail/whatsapp num único OR", async () => {
    const { builder, calls } = createQueryBuilder({ data: [], error: null, count: 0 });
    await listLeads(createSupabaseMock(builder), { filters: { search: "João" } });
    expect(calls.or[0][0]).toContain("name.ilike.%João%");
    expect(calls.or[0][0]).toContain("company.ilike.%João%");
    expect(calls.or[0][0]).toContain("email.ilike.%João%");
    expect(calls.or[0][0]).toContain("whatsapp.ilike.%João%");
  });

  it("busca remove vírgulas/parênteses para não quebrar a sintaxe do filtro", async () => {
    const { builder, calls } = createQueryBuilder({ data: [], error: null, count: 0 });
    await listLeads(createSupabaseMock(builder), { filters: { search: "a,b(c)" } });
    expect(calls.or[0][0]).not.toContain(",b");
    expect(calls.or[0][0]).not.toContain("(c)");
  });

  it("TESTE 27 — paginação: página 1 e página 2 pedem faixas diferentes, sem sobreposição", async () => {
    const { builder: builder1, calls: calls1 } = createQueryBuilder({ data: [], error: null, count: 45 });
    await listLeads(createSupabaseMock(builder1), { page: 1, pageSize: 20 });
    expect(calls1.range[0]).toEqual([0, 19]);

    const { builder: builder2, calls: calls2 } = createQueryBuilder({ data: [], error: null, count: 45 });
    await listLeads(createSupabaseMock(builder2), { page: 2, pageSize: 20 });
    expect(calls2.range[0]).toEqual([20, 39]);
  });

  it("erro do Supabase é reportado como falha recuperável, não lançado", async () => {
    const { builder } = createQueryBuilder({ data: null, error: { message: "boom" }, count: 0 });
    const result = await listLeads(createSupabaseMock(builder), {});
    expect(result.ok).toBe(false);
  });
});

describe("getLeadById (Fase 16)", () => {
  it("TESTE 13/14/16 — retorna contato, serviços e score do lead", async () => {
    const { builder } = createQueryBuilder({ data: baseRow, error: null });
    const result = await getLeadById(createSupabaseMock(builder), baseRow.id);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.lead.email).toBe("joao@teste.com");
    expect(result.lead.project.services).toHaveLength(1);
    expect(result.lead.leadScore).toBe(42);
    expect(result.lead.leadScoreBreakdown).toEqual(baseRow.lead_score_breakdown);
  });

  it("lead não encontrado retorna falha, não lança", async () => {
    const { builder } = createQueryBuilder({ data: null, error: null });
    const result = await getLeadById(createSupabaseMock(builder), "id-inexistente");
    expect(result.ok).toBe(false);
  });
});

describe("updateLeadStatusRow / getLeadStatus (Fase 16)", () => {
  it("TESTE 17 — atualiza só a coluna status", async () => {
    const { builder, calls } = createQueryBuilder({ data: null, error: null });
    const supabase = createSupabaseMock(builder);
    const result = await updateLeadStatusRow(supabase, baseRow.id, "contacted");
    expect(result.ok).toBe(true);
    expect((builder as { update: ReturnType<typeof vi.fn> }).update).toHaveBeenCalledWith({ status: "contacted" });
    expect(calls.eq).toContainEqual(["id", baseRow.id]);
  });

  it("getLeadStatus lê o status atual de um lead", async () => {
    const { builder } = createQueryBuilder({ data: { status: "meeting" }, error: null });
    const status = await getLeadStatus(createSupabaseMock(builder), baseRow.id);
    expect(status).toBe("meeting");
  });

  it("getLeadStatus retorna null quando o lead não existe", async () => {
    const { builder } = createQueryBuilder({ data: null, error: null });
    const status = await getLeadStatus(createSupabaseMock(builder), "id-inexistente");
    expect(status).toBeNull();
  });
});

describe("getAdminLeadCounts (Fase 16)", () => {
  it("agrega as 4 contagens da Home do admin", async () => {
    const { builder } = createQueryBuilder({ count: 3 });
    const counts = await getAdminLeadCounts(createSupabaseMock(builder));
    expect(counts).toEqual({ newToday: 3, priority: 3, proposal: 3, won: 3 });
  });
});
