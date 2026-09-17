import "server-only";
import type { LeadPayload } from "@/features/lead/types";
import type { LeadScoreResult } from "@/features/lead/logic/calculateLeadScore";
import type { LeadScoreTier } from "@/features/lead/logic/getLeadScoreTier";
import type { LeadStatus } from "@/features/admin/logic/leadStatus";
import type { ServiceId } from "@/features/builder/types";
import type {
  AdminLeadCounts,
  AdminLeadDetail,
  AdminLeadListItem,
  CreateLeadResult,
  GetLeadByIdResult,
  ListLeadsParams,
  ListLeadsResult,
  UpdateLeadStatusRowResult,
} from "@/lib/repositories/leads";
import type { LeadNote } from "@/lib/repositories/leadNotes";
import type { LeadStatusHistoryEntry } from "@/lib/repositories/leadStatusHistory";

/**
 * Backend em memória usado SÓ quando `isE2ETestMode()` é `true` (Etapa 31 — ver
 * `isE2ETestMode.ts` para o racional completo). Reimplementa a MESMA semântica das funções reais
 * de `lib/repositories/*.ts` — filtro, busca, paginação, ordenação, idempotência — sem nenhuma
 * dependência do Supabase. Nunca importado fora dos pontos de branch nos próprios repositórios.
 *
 * Estado do módulo (não um banco): sobrevive durante toda a execução do `next start` usado pelo
 * Playwright (`webServer` em `playwright.config.ts`), reiniciando a cada novo boot do servidor.
 * Os specs evitam depender de contagens exatas da lista inteira (que cresce a cada lead criado por
 * um teste) — em vez disso, verificam a PRESENÇA de itens específicos (seed ou recém-criados),
 * mantendo os testes independentes entre si (briefing, Seção 105 — "test isolation").
 */

interface AdminLeadRowInternal {
  id: string;
  name: string;
  company: string;
  whatsapp: string;
  email: string;
  websiteOrInstagram: string | null;
  project: LeadPayload["project"];
  leadScore: number;
  leadScoreTier: LeadScoreTier;
  leadScoreVersion: number;
  leadScoreBreakdown: LeadScoreResult["reasons"];
  status: LeadStatus;
  idempotencyKey: string;
  createdAt: string;
}

/** Credenciais fixas do admin de teste — só existem quando `E2E_TEST_MODE=true`. */
export const E2E_ADMIN_EMAIL = "admin@e2e.test";
export const E2E_ADMIN_PASSWORD = "senha-e2e-123";
/** Nome do cookie que representa "sessão de admin" no modo E2E — nunca um cookie real do Supabase
 * Auth (ver `lib/auth/adminSession.ts`, `features/admin/actions/signIn.ts`, `proxy.ts`). */
export const E2E_SESSION_COOKIE = "e2e-admin-session";

/** Valor mágico de `company` que força `createLead` a simular uma falha de persistência —
 * usado pelo spec de "falha do banco + retry preserva dados" (briefing, Seções 37/38). */
export const E2E_FORCE_LEAD_FAILURE_COMPANY = "__E2E_FORCE_FAILURE__";

function nowIso(): string {
  return new Date().toISOString();
}

// IDs em formato UUID de verdade (não só "parece um id") — `updateLeadStatus`/`addLeadNote`
// validam `leadId` com `z.uuid()` antes de qualquer coisa (Etapa 29); um id tipo "e2e-seed-1"
// é rejeitado nessa validação real, um bug de fixture encontrado ao rodar os specs de admin desta
// fase (o Server Action retorna "Identificador de projeto inválido.", nunca chegando ao e2eStore).
export const E2E_SEED_LEAD_IDS = {
  ana: "11111111-1111-4111-8111-111111111111",
  bruno: "22222222-2222-4222-8222-222222222222",
  carla: "33333333-3333-4333-8333-333333333333",
} as const;

// Campos/opções de resposta REAIS (`features/builder/data/*.ts`) — não inventados. Ids como
// "site_tipo: institucional" ou "trafego_objetivo" (versão anterior deste arquivo) não existem no
// modelo de perguntas de verdade; `buildServiceSummary` os ignora silenciosamente (só um aviso no
// console), mas uma fixture de teste deve refletir dado real, mesmo sendo sintético.
const seedLeads: AdminLeadRowInternal[] = [
  {
    id: E2E_SEED_LEAD_IDS.ana,
    name: "Fixture Ana Souza",
    company: "Ana Studio",
    whatsapp: "5511988887777",
    email: "ana@fixture.test",
    websiteOrInstagram: "@anastudio",
    project: { services: [{ serviceId: "site", answers: { site_tipo: "site_institucional" } }] },
    leadScore: 82,
    leadScoreTier: "PRIORITY",
    leadScoreVersion: 1,
    leadScoreBreakdown: [{ ruleId: "SEED", points: 82 }],
    status: "new",
    idempotencyKey: "e2e-seed-1-key",
    createdAt: "2026-01-10T10:00:00.000Z",
  },
  {
    id: E2E_SEED_LEAD_IDS.bruno,
    name: "Fixture Bruno Lima",
    company: "Bruno Tráfego Ltda",
    whatsapp: "5521977776666",
    email: "bruno@fixture.test",
    websiteOrInstagram: null,
    project: { services: [{ serviceId: "trafego", answers: { trafego_negocio: "servicos" } }] },
    leadScore: 45,
    leadScoreTier: "MEDIUM",
    leadScoreVersion: 1,
    leadScoreBreakdown: [{ ruleId: "SEED", points: 45 }],
    status: "contacted",
    idempotencyKey: "e2e-seed-2-key",
    createdAt: "2026-01-11T10:00:00.000Z",
  },
  {
    id: E2E_SEED_LEAD_IDS.carla,
    name: "Fixture Carla Design",
    company: "Carla Social",
    whatsapp: "5531966665555",
    email: "carla@fixture.test",
    websiteOrInstagram: "carladesign.com.br",
    project: { services: [{ serviceId: "design", answers: { design_servico: "design_redes_sociais" } }] },
    leadScore: 20,
    leadScoreTier: "LOW",
    leadScoreVersion: 1,
    leadScoreBreakdown: [{ ruleId: "SEED", points: 20 }],
    status: "won",
    idempotencyKey: "e2e-seed-3-key",
    createdAt: "2026-01-12T10:00:00.000Z",
  },
];

const leads: AdminLeadRowInternal[] = [...seedLeads];
const notesByLead = new Map<string, LeadNote[]>();
const historyByLead = new Map<string, LeadStatusHistoryEntry[]>();
let noteSeq = 0;
let historySeq = 0;

function toListItem(row: AdminLeadRowInternal): AdminLeadListItem {
  return {
    id: row.id,
    name: row.name,
    company: row.company,
    whatsapp: row.whatsapp,
    email: row.email,
    project: row.project,
    leadScore: row.leadScore,
    leadScoreTier: row.leadScoreTier,
    status: row.status,
    createdAt: row.createdAt,
  };
}

function toDetail(row: AdminLeadRowInternal): AdminLeadDetail {
  return {
    ...toListItem(row),
    websiteOrInstagram: row.websiteOrInstagram,
    leadScoreVersion: row.leadScoreVersion,
    leadScoreBreakdown: row.leadScoreBreakdown,
    idempotencyKey: row.idempotencyKey,
  };
}

const GENERIC_FAILURE_MESSAGE = "Não conseguimos enviar agora. Seus dados continuam preenchidos.";

/** Chaves que já falharam uma vez (Seções 37/38 do briefing — falha + retry preserva dados e não
 * duplica). Falha só na PRIMEIRA tentativa de uma dada `idempotencyKey`; a mesma chave enviada de
 * novo (o "Tentar novamente" real do `LeadForm`, que nunca gera uma chave nova) tem sucesso — mais
 * fiel a uma falha transitória de rede/banco do que uma falha permanente. */
const failedOnceKeys = new Set<string>();

export function e2eCreateLead(payload: LeadPayload, leadScore: LeadScoreResult): CreateLeadResult {
  if (payload.contact.company === E2E_FORCE_LEAD_FAILURE_COMPANY && !failedOnceKeys.has(payload.meta.idempotencyKey)) {
    failedOnceKeys.add(payload.meta.idempotencyKey);
    return { ok: false, message: GENERIC_FAILURE_MESSAGE };
  }

  const existing = leads.find((row) => row.idempotencyKey === payload.meta.idempotencyKey);
  if (existing) return { ok: true }; // mesma semântica do `23505` real (Fase 13): duplicado = sucesso.

  leads.push({
    id: `e2e-${leads.length + 1}-${Date.now()}`,
    name: payload.contact.name,
    company: payload.contact.company,
    whatsapp: payload.contact.whatsapp,
    email: payload.contact.email,
    websiteOrInstagram: payload.contact.websiteOrInstagram ?? null,
    project: payload.project,
    leadScore: leadScore.score,
    leadScoreTier: leadScore.tier,
    leadScoreVersion: leadScore.version,
    leadScoreBreakdown: leadScore.reasons,
    status: "new",
    idempotencyKey: payload.meta.idempotencyKey,
    createdAt: nowIso(),
  });
  return { ok: true };
}

export function e2eListLeads(params: ListLeadsParams = {}): ListLeadsResult {
  const page = params.page && params.page > 0 ? Math.floor(params.page) : 1;
  const pageSize = params.pageSize && params.pageSize > 0 ? Math.min(Math.floor(params.pageSize), 100) : 20;

  let filtered = [...leads];
  const filters = params.filters ?? {};
  if (filters.status) filtered = filtered.filter((row) => row.status === filters.status);
  if (filters.tier) filtered = filtered.filter((row) => row.leadScoreTier === filters.tier);
  if (filters.service) {
    const serviceId = filters.service as ServiceId;
    filtered = filtered.filter((row) => row.project.services.some((service) => service.serviceId === serviceId));
  }
  if (filters.search) {
    const term = filters.search.toLowerCase();
    filtered = filtered.filter((row) => [row.name, row.company, row.email, row.whatsapp].some((field) => field.toLowerCase().includes(term)));
  }

  filtered.sort((a, b) => (params.sort === "score" ? b.leadScore - a.leadScore : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const page_items = filtered.slice(start, start + pageSize).map(toListItem);

  return { ok: true, items: page_items, total, page, pageSize };
}

export function e2eGetLeadById(id: string): GetLeadByIdResult {
  const row = leads.find((lead) => lead.id === id);
  if (!row) return { ok: false, message: "Projeto não encontrado." };
  return { ok: true, lead: toDetail(row) };
}

export function e2eGetLeadStatus(id: string): LeadStatus | null {
  return leads.find((lead) => lead.id === id)?.status ?? null;
}

export function e2eUpdateLeadStatusRow(id: string, status: LeadStatus): UpdateLeadStatusRowResult {
  const row = leads.find((lead) => lead.id === id);
  if (!row) return { ok: false, message: "Não foi possível atualizar o status." };
  row.status = status;
  return { ok: true };
}

export function e2eGetAdminLeadCounts(): AdminLeadCounts {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  return {
    newToday: leads.filter((row) => row.status === "new" && new Date(row.createdAt) >= todayStart).length,
    priority: leads.filter((row) => row.leadScoreTier === "PRIORITY").length,
    proposal: leads.filter((row) => row.status === "proposal").length,
    won: leads.filter((row) => row.status === "won").length,
  };
}

export function e2eAddLeadStatusHistory(leadId: string, oldStatus: LeadStatus | null, newStatus: LeadStatus, changedBy: string): void {
  historySeq += 1;
  const list = historyByLead.get(leadId) ?? [];
  list.unshift({ id: `e2e-history-${historySeq}`, leadId, oldStatus, newStatus, changedBy, createdAt: nowIso() });
  historyByLead.set(leadId, list);
}

export function e2eListLeadStatusHistory(leadId: string): LeadStatusHistoryEntry[] {
  return historyByLead.get(leadId) ?? [];
}

export function e2eAddLeadNote(leadId: string, content: string, createdBy: string): { ok: true } {
  noteSeq += 1;
  const list = notesByLead.get(leadId) ?? [];
  list.unshift({ id: `e2e-note-${noteSeq}`, leadId, content, createdBy, createdAt: nowIso() });
  notesByLead.set(leadId, list);
  return { ok: true };
}

export function e2eListLeadNotes(leadId: string): LeadNote[] {
  return notesByLead.get(leadId) ?? [];
}

export function e2eSignIn(email: string, password: string): boolean {
  return email === E2E_ADMIN_EMAIL && password === E2E_ADMIN_PASSWORD;
}
