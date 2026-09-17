"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth/adminSession";
import { getLeadStatus, updateLeadStatusRow } from "@/lib/repositories/leads";
import { addLeadStatusHistory } from "@/lib/repositories/leadStatusHistory";
import { isValidLeadStatus } from "../logic/leadStatus";

const leadIdSchema = z.uuid();

export interface UpdateLeadStatusResult {
  ok: boolean;
  message?: string;
}

/**
 * Ação específica e nomeada (`docs/DECISIONS.md`/briefing da Fase 16: "não criar função genérica
 * updateAnything(table, data)") — só sabe mudar o status de um lead, nada mais. `requireAdminSession`
 * é a fronteira real (redireciona se não for admin); o GRANT de coluna no banco
 * (`grant update (status) ...`) é a segunda camada, mesmo que este código tivesse um bug.
 */
export async function updateLeadStatus(leadId: string, newStatus: string): Promise<UpdateLeadStatusResult> {
  const { user, supabase } = await requireAdminSession();

  const idResult = leadIdSchema.safeParse(leadId);
  if (!idResult.success) return { ok: false, message: "Identificador de projeto inválido." };

  if (!isValidLeadStatus(newStatus)) return { ok: false, message: "Status inválido." };

  const oldStatus = await getLeadStatus(supabase, leadId);
  if (!oldStatus) return { ok: false, message: "Projeto não encontrado." };

  const updateResult = await updateLeadStatusRow(supabase, leadId, newStatus);
  if (!updateResult.ok) return updateResult;

  // Falha ao gravar o histórico não desfaz a mudança de status (ver leadStatusHistory.ts) — o
  // status já foi salvo com sucesso, então a ação como um todo é reportada como sucesso.
  await addLeadStatusHistory(supabase, leadId, oldStatus, newStatus, user.id);

  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin");
  return { ok: true };
}
