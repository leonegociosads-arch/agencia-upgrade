"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth/adminSession";
import { addLeadNote as addLeadNoteRow } from "@/lib/repositories/leadNotes";
import { noteContentSchema } from "../logic/noteContentSchema";

const leadIdSchema = z.uuid();

export interface AddLeadNoteResult {
  ok: boolean;
  message?: string;
}

/** Ação específica e nomeada — só adiciona uma nota; nunca edita/apaga uma existente (V1). */
export async function addLeadNote(leadId: string, content: string): Promise<AddLeadNoteResult> {
  const { user, supabase } = await requireAdminSession();

  const idResult = leadIdSchema.safeParse(leadId);
  if (!idResult.success) return { ok: false, message: "Identificador de projeto inválido." };

  const contentResult = noteContentSchema.safeParse(content);
  if (!contentResult.success) {
    return { ok: false, message: contentResult.error.issues[0]?.message ?? "Nota inválida." };
  }

  const result = await addLeadNoteRow(supabase, leadId, contentResult.data, user.id);
  if (!result.ok) return result;

  revalidatePath(`/admin/leads/${leadId}`);
  return { ok: true };
}
