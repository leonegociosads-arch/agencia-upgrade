import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isE2ETestMode } from "@/lib/testing/isE2ETestMode";
import { e2eAddLeadNote, e2eListLeadNotes } from "@/lib/testing/e2eStore";

/**
 * Observações internas de um lead (Fase 16) — nunca expostas em nenhuma rota pública, nunca
 * incluídas no `ProjectSnapshot`/`LeadPayload` do cliente. Só leitura/escrita via cliente de
 * sessão de um admin (RLS restringe a `admin_users`); ver `supabase/migrations/*_admin_crm.sql`.
 */
export interface LeadNote {
  id: string;
  leadId: string;
  content: string;
  createdBy: string | null;
  createdAt: string;
}

interface LeadNoteRow {
  id: string;
  lead_id: string;
  content: string;
  created_by: string | null;
  created_at: string;
}

function mapRow(row: LeadNoteRow): LeadNote {
  return { id: row.id, leadId: row.lead_id, content: row.content, createdBy: row.created_by, createdAt: row.created_at };
}

export type AddLeadNoteResult = { ok: true } | { ok: false; message: string };

/** `content` já deve chegar validado (trim, 1-2000 caracteres) — ver
 * `features/admin/logic/noteContentSchema.ts`. A constraint `check` no banco é a última linha de
 * defesa, não a primeira. */
export async function addLeadNote(supabase: SupabaseClient, leadId: string, content: string, createdBy: string): Promise<AddLeadNoteResult> {
  if (isE2ETestMode()) return e2eAddLeadNote(leadId, content, createdBy);

  const { error } = await supabase.from("upgrade_lead_notes").insert({ lead_id: leadId, content, created_by: createdBy });
  if (error) {
    // Fase LGPD (briefing Seção 43) — nunca o objeto `error` inteiro: este `insert` grava texto
    // livre escrito por um admin sobre o lead; `details`/`hint` do Postgres poderiam ecoar um
    // fragmento desse conteúdo. Só `code`/`message` chegam ao log.
    console.error("Erro ao salvar nota do lead no Supabase:", { code: error.code, message: error.message });
    return { ok: false, message: "Não foi possível salvar a nota." };
  }
  return { ok: true };
}

export async function listLeadNotes(supabase: SupabaseClient, leadId: string): Promise<LeadNote[]> {
  if (isE2ETestMode()) return e2eListLeadNotes(leadId);

  const { data, error } = await supabase.from("upgrade_lead_notes").select("*").eq("lead_id", leadId).order("created_at", { ascending: false });
  if (error || !data) {
    if (error) console.error("Erro ao listar notas do lead no Supabase:", error);
    return [];
  }
  return (data as LeadNoteRow[]).map(mapRow);
}
