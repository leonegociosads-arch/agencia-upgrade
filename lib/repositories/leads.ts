import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "../supabase/server";
import type { LeadPayload } from "@/features/lead/types";
import type { LeadScoreResult, LeadScoreReason } from "@/features/lead/logic/calculateLeadScore";
import type { LeadScoreTier } from "@/features/lead/logic/getLeadScoreTier";
import type { ProjectSnapshot, ServiceId } from "@/features/builder/types";
import type { LeadStatus } from "@/features/admin/logic/leadStatus";
import { isE2ETestMode } from "@/lib/testing/isE2ETestMode";
import * as e2eStore from "@/lib/testing/e2eStore";

export type CreateLeadResult = { ok: true } | { ok: false; message: string };

const GENERIC_FAILURE_MESSAGE = "Não conseguimos enviar agora. Seus dados continuam preenchidos.";

/**
 * Único ponto de acesso à tabela `upgrade_leads` (`docs/FOLDER-STRUCTURE.md`: "camada de
 * repositório isola todo acesso a dados — a UI e as Server Actions nunca chamam Supabase
 * diretamente"). Chamado por `features/lead/actions/submitLead.ts`, nunca diretamente por um
 * componente.
 *
 * Idempotência: `idempotency_key` tem uma constraint UNIQUE no banco (ver
 * `supabase/migrations/*_create_upgrade_leads.sql`). Se a mesma chave já foi gravada (ex.: o
 * usuário clicou em "Tentar novamente" e a primeira tentativa na verdade tinha sido salva), o
 * Postgres retorna o erro de violação de unicidade (`23505`) — do ponto de vista de quem enviou,
 * isso conta como sucesso: o lead já existe, não precisa ser gravado de novo.
 *
 * `leadScore` (Fase 15) é sempre calculado por `submitLead.ts` a partir do `project` já validado
 * — este repositório só persiste o resultado, nunca recalcula nem confia em nenhum score que
 * porventura viesse embutido no `payload`.
 */
export async function createLead(payload: LeadPayload, leadScore: LeadScoreResult): Promise<CreateLeadResult> {
  if (isE2ETestMode()) return e2eStore.e2eCreateLead(payload, leadScore);

  let client;
  try {
    client = getSupabaseServerClient();
  } catch (error) {
    console.error("Supabase não configurado:", error);
    return { ok: false, message: GENERIC_FAILURE_MESSAGE };
  }

  const { error } = await client.from("upgrade_leads").insert({
    name: payload.contact.name,
    company: payload.contact.company,
    whatsapp: payload.contact.whatsapp,
    email: payload.contact.email,
    website_or_instagram: payload.contact.websiteOrInstagram ?? null,
    project: payload.project,
    idempotency_key: payload.meta.idempotencyKey,
    lead_score: leadScore.score,
    lead_score_tier: leadScore.tier,
    lead_score_version: leadScore.version,
    lead_score_breakdown: leadScore.reasons,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: true };
    }
    // Fase LGPD (briefing Seção 43: "evitar registrar PII desnecessariamente em logs") — nunca o
    // objeto `error` inteiro: `details`/`hint` do Postgres ocasionalmente ecoam um fragmento do
    // valor que violou uma constraint, e este `insert` grava nome/e-mail/WhatsApp. Só `code`/
    // `message` (a descrição do tipo de erro, nunca o dado em si) chegam ao log.
    console.error("Erro ao gravar lead no Supabase:", { code: error.code, message: error.message });
    return { ok: false, message: GENERIC_FAILURE_MESSAGE };
  }

  return { ok: true };
}

// ============================================================================
// Leitura/atualização administrativa (Fase 16) — usa o cliente de SESSÃO do admin (RLS/GRANT de
// coluna aplicam), nunca o cliente de service role acima. O chamador (Server Action/página, via
// `lib/auth/adminSession.ts`) já obtém esse cliente autenticado e o passa aqui — evita criar um
// cliente novo por consulta e mantém este arquivo sem saber nada sobre cookies/sessão.
// ============================================================================

const ADMIN_LEAD_COLUMNS =
  "id, name, company, whatsapp, email, website_or_instagram, project, lead_score, lead_score_tier, lead_score_version, lead_score_breakdown, status, idempotency_key, created_at";

export interface AdminLeadListItem {
  id: string;
  name: string;
  company: string;
  whatsapp: string;
  email: string;
  project: ProjectSnapshot;
  leadScore: number | null;
  leadScoreTier: LeadScoreTier | null;
  status: LeadStatus;
  createdAt: string;
}

export interface AdminLeadDetail extends AdminLeadListItem {
  websiteOrInstagram: string | null;
  leadScoreVersion: number | null;
  leadScoreBreakdown: LeadScoreReason[] | null;
  /** Chamado de "submission_id" no briefing — é a própria `idempotency_key` (Fase 13), útil só
   * tecnicamente (auditoria de duplicidade), não um campo de negócio novo. */
  idempotencyKey: string;
}

interface AdminLeadRow {
  id: string;
  name: string;
  company: string;
  whatsapp: string;
  email: string;
  website_or_instagram: string | null;
  project: ProjectSnapshot;
  lead_score: number | null;
  lead_score_tier: LeadScoreTier | null;
  lead_score_version: number | null;
  lead_score_breakdown: LeadScoreReason[] | null;
  status: LeadStatus;
  idempotency_key: string;
  created_at: string;
}

function mapRowToListItem(row: AdminLeadRow): AdminLeadListItem {
  return {
    id: row.id,
    name: row.name,
    company: row.company,
    whatsapp: row.whatsapp,
    email: row.email,
    project: row.project,
    leadScore: row.lead_score,
    leadScoreTier: row.lead_score_tier,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapRowToDetail(row: AdminLeadRow): AdminLeadDetail {
  return {
    ...mapRowToListItem(row),
    websiteOrInstagram: row.website_or_instagram,
    leadScoreVersion: row.lead_score_version,
    leadScoreBreakdown: row.lead_score_breakdown,
    idempotencyKey: row.idempotency_key,
  };
}

/** Limite de tamanho (Etapa 29, Seção 95/97): sem ele, uma query string absurdamente longa em `q`
 * vira uma cláusula `.or()` igualmente longa — nenhuma busca legítima (nome/empresa/e-mail/
 * WhatsApp) precisa de mais que isso. Aplicado ANTES de remover `,`/`()`, então o corte nunca conta
 * caracteres que seriam removidos de qualquer forma. */
const MAX_SEARCH_TERM_LENGTH = 100;

/** Só o suficiente para não deixar o filtro de busca livre quebrar a sintaxe do `.or()` do
 * PostgREST (vírgula separa condições, parênteses agrupam) — não é um escaper genérico de SQL. */
function sanitizeSearchTerm(term: string): string {
  return term.slice(0, MAX_SEARCH_TERM_LENGTH).replace(/[,()]/g, "").trim();
}

export interface ListLeadsFilters {
  status?: LeadStatus;
  tier?: LeadScoreTier;
  service?: ServiceId;
  search?: string;
}

export interface ListLeadsParams {
  filters?: ListLeadsFilters;
  sort?: "recent" | "score";
  /** 1-based. */
  page?: number;
  pageSize?: number;
}

export type ListLeadsResult =
  | { ok: true; items: AdminLeadListItem[]; total: number; page: number; pageSize: number }
  | { ok: false; message: string };

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

/**
 * Lista para a Home do admin — uma única consulta a `upgrade_leads` (`project`, score e status já
 * vivem na mesma linha; não existe "N+1" possível aqui porque não há tabelas relacionadas para
 * juntar). Filtros, busca, ordenação e paginação aplicados na própria consulta (nunca carregando
 * tudo para filtrar em memória).
 */
export async function listLeads(supabase: SupabaseClient, params: ListLeadsParams = {}): Promise<ListLeadsResult> {
  if (isE2ETestMode()) return e2eStore.e2eListLeads(params);

  const page = params.page && params.page > 0 ? Math.floor(params.page) : 1;
  const pageSize = params.pageSize && params.pageSize > 0 ? Math.min(Math.floor(params.pageSize), MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from("upgrade_leads").select(ADMIN_LEAD_COLUMNS, { count: "exact" });

  const filters = params.filters ?? {};
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.tier) query = query.eq("lead_score_tier", filters.tier);
  if (filters.service) {
    query = query.filter("project->services", "cs", JSON.stringify([{ serviceId: filters.service }]));
  }
  if (filters.search) {
    const term = sanitizeSearchTerm(filters.search);
    if (term) {
      query = query.or(`name.ilike.%${term}%,company.ilike.%${term}%,email.ilike.%${term}%,whatsapp.ilike.%${term}%`);
    }
  }

  query = params.sort === "score" ? query.order("lead_score", { ascending: false, nullsFirst: false }) : query.order("created_at", { ascending: false });
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) {
    console.error("Erro ao listar leads no Supabase:", error);
    return { ok: false, message: "Não foi possível carregar a lista de projetos." };
  }

  return { ok: true, items: ((data ?? []) as AdminLeadRow[]).map(mapRowToListItem), total: count ?? 0, page, pageSize };
}

export type GetLeadByIdResult = { ok: true; lead: AdminLeadDetail } | { ok: false; message: string };

export async function getLeadById(supabase: SupabaseClient, id: string): Promise<GetLeadByIdResult> {
  if (isE2ETestMode()) return e2eStore.e2eGetLeadById(id);

  const { data, error } = await supabase.from("upgrade_leads").select(ADMIN_LEAD_COLUMNS).eq("id", id).maybeSingle();
  if (error) {
    console.error("Erro ao buscar lead no Supabase:", error);
    return { ok: false, message: "Não foi possível carregar este projeto." };
  }
  if (!data) return { ok: false, message: "Projeto não encontrado." };
  return { ok: true, lead: mapRowToDetail(data as AdminLeadRow) };
}

export async function getLeadStatus(supabase: SupabaseClient, id: string): Promise<LeadStatus | null> {
  if (isE2ETestMode()) return e2eStore.e2eGetLeadStatus(id);

  const { data } = await supabase.from("upgrade_leads").select("status").eq("id", id).maybeSingle();
  return (data?.status as LeadStatus | undefined) ?? null;
}

export type UpdateLeadStatusRowResult = { ok: true } | { ok: false; message: string };

/** Só a coluna `status` — o GRANT do banco (`grant update (status) ...`) já reforça isso mesmo se
 * este código um dia tentasse enviar mais campos por engano. */
export async function updateLeadStatusRow(supabase: SupabaseClient, id: string, status: LeadStatus): Promise<UpdateLeadStatusRowResult> {
  if (isE2ETestMode()) return e2eStore.e2eUpdateLeadStatusRow(id, status);

  const { error } = await supabase.from("upgrade_leads").update({ status }).eq("id", id);
  if (error) {
    console.error("Erro ao atualizar status do lead no Supabase:", error);
    return { ok: false, message: "Não foi possível atualizar o status." };
  }
  return { ok: true };
}

export interface AdminLeadCounts {
  newToday: number;
  priority: number;
  proposal: number;
  won: number;
}

/**
 * Resumo mínimo da Home do admin (Fase 16) — "não criar 15 gráficos": 4 contagens simples, cada
 * uma uma consulta `head: true` (só a contagem, sem trazer linhas). Reflete o total da base, não
 * só a página atual da lista.
 */
export async function getAdminLeadCounts(supabase: SupabaseClient): Promise<AdminLeadCounts> {
  if (isE2ETestMode()) return e2eStore.e2eGetAdminLeadCounts();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [newToday, priority, proposal, won] = await Promise.all([
    supabase.from("upgrade_leads").select("id", { count: "exact", head: true }).eq("status", "new").gte("created_at", todayStart.toISOString()),
    supabase.from("upgrade_leads").select("id", { count: "exact", head: true }).eq("lead_score_tier", "PRIORITY"),
    supabase.from("upgrade_leads").select("id", { count: "exact", head: true }).eq("status", "proposal"),
    supabase.from("upgrade_leads").select("id", { count: "exact", head: true }).eq("status", "won"),
  ]);

  return {
    newToday: newToday.count ?? 0,
    priority: priority.count ?? 0,
    proposal: proposal.count ?? 0,
    won: won.count ?? 0,
  };
}
