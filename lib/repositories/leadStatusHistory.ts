import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { LeadStatus } from "@/features/admin/logic/leadStatus";
import { isE2ETestMode } from "@/lib/testing/isE2ETestMode";
import { e2eAddLeadStatusHistory, e2eListLeadStatusHistory } from "@/lib/testing/e2eStore";

/** Histórico de mudanças de status (Fase 16) — para não perder contexto de quando/por quem cada
 * mudança aconteceu. Append-only: nenhuma ação de editar/apagar uma entrada existe. */
export interface LeadStatusHistoryEntry {
  id: string;
  leadId: string;
  oldStatus: LeadStatus | null;
  newStatus: LeadStatus;
  changedBy: string | null;
  createdAt: string;
}

interface LeadStatusHistoryRow {
  id: string;
  lead_id: string;
  old_status: LeadStatus | null;
  new_status: LeadStatus;
  changed_by: string | null;
  created_at: string;
}

function mapRow(row: LeadStatusHistoryRow): LeadStatusHistoryEntry {
  return { id: row.id, leadId: row.lead_id, oldStatus: row.old_status, newStatus: row.new_status, changedBy: row.changed_by, createdAt: row.created_at };
}

export async function addLeadStatusHistory(
  supabase: SupabaseClient,
  leadId: string,
  oldStatus: LeadStatus | null,
  newStatus: LeadStatus,
  changedBy: string,
): Promise<void> {
  if (isE2ETestMode()) return e2eAddLeadStatusHistory(leadId, oldStatus, newStatus, changedBy);

  const { error } = await supabase.from("upgrade_lead_status_history").insert({
    lead_id: leadId,
    old_status: oldStatus,
    new_status: newStatus,
    changed_by: changedBy,
  });
  // Falha ao gravar o histórico não desfaz a mudança de status já aplicada (o status em si é o
  // dado que importa); só registra para investigação — não é o suficiente para reportar erro ao
  // admin no meio de uma ação que, na prática, já deu certo.
  if (error) console.error("Erro ao gravar histórico de status no Supabase:", error);
}

export async function listLeadStatusHistory(supabase: SupabaseClient, leadId: string): Promise<LeadStatusHistoryEntry[]> {
  if (isE2ETestMode()) return e2eListLeadStatusHistory(leadId);

  const { data, error } = await supabase
    .from("upgrade_lead_status_history")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  if (error || !data) {
    if (error) console.error("Erro ao listar histórico de status no Supabase:", error);
    return [];
  }
  return (data as LeadStatusHistoryRow[]).map(mapRow);
}
