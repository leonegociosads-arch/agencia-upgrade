"use server";

import { leadPayloadSchema } from "../logic/leadPayloadSchema";
import { calculateLeadScore } from "../logic/calculateLeadScore";
import { createLead } from "@/lib/repositories/leads";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { getClientIp } from "@/lib/security/getClientIp";
import type { LeadPayload } from "../types";

export interface SubmitLeadResult {
  ok: boolean;
  message?: string;
  /** Categoria segura do erro (Fase 17) — só para o evento `lead_submit_failed`
   * (`docs/ANALYTICS.md`), nunca a mensagem técnica/stack trace. `undefined` quando `ok: true`. */
  errorCategory?: "validation" | "persistence" | "unknown";
}

const GENERIC_FAILURE_MESSAGE = "Não conseguimos enviar agora. Seus dados continuam preenchidos.";
const RATE_LIMIT_MESSAGE = "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente de novo.";

/** 5 envios / 10 minutos por IP (Etapa 29, Seção 34) — generoso o bastante para um usuário
 * legítimo que erra e reenvia algumas vezes, apertado o bastante para atrapalhar um script. */
const LEAD_RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };

/**
 * Server Action responsável pelo envio real do lead (`docs/DECISIONS.md`, Fase 6: "Server Actions
 * são o mecanismo principal para o envio do lead — Route Handlers ficam reservados para casos que
 * exigem um endpoint HTTP real (webhooks, integrações externas), nenhum previsto ainda"). Chamada
 * diretamente por `features/lead/components/LeadForm.tsx`, que já é um Client Component.
 *
 * Toda Server Action é um endpoint POST alcançável por qualquer um, não só pela UI que a chama
 * (ver `node_modules/next/dist/docs/01-app/02-guides/server-actions.md`, "Security") — por isso o
 * payload é revalidado aqui com `leadPayloadSchema`, mesmo já tendo passado pela validação do
 * formulário no navegador.
 *
 * Lead Score (Fase 15): calculado aqui, a partir do `project` já validado — nunca aceito do
 * cliente. `leadPayloadSchema` não declara nenhum campo de score/tier/breakdown, então mesmo que
 * um cliente malicioso injete esses campos no corpo da requisição, o Zod (modo "strip" por
 * padrão) os descarta antes de `parsed.data` existir; `calculateLeadScore` roda de novo aqui de
 * qualquer forma, então não há sequer a possibilidade de ler um valor vindo do cliente.
 *
 * `honeypot` (Etapa 29, Seção 38): campo invisível do formulário, nunca preenchido por uma pessoa.
 * Preenchido = bot — rejeitado com a MESMA mensagem genérica de qualquer outra falha (nunca revela
 * ao remetente que foi detectado como automação), sem gravar nada e sem consultar o rate limit
 * (não é um usuário real gastando sua cota).
 */
export async function submitLead(payload: LeadPayload, honeypot?: string): Promise<SubmitLeadResult> {
  if (honeypot) {
    return { ok: false, message: GENERIC_FAILURE_MESSAGE, errorCategory: "validation" };
  }

  const ip = await getClientIp();
  const rateLimit = checkRateLimit(`lead:${ip}`, LEAD_RATE_LIMIT.limit, LEAD_RATE_LIMIT.windowMs);
  if (!rateLimit.ok) {
    return { ok: false, message: RATE_LIMIT_MESSAGE, errorCategory: "validation" };
  }

  const parsed = leadPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    console.error("Payload de lead inválido recebido pela Server Action:", parsed.error.flatten());
    return { ok: false, message: GENERIC_FAILURE_MESSAGE, errorCategory: "validation" };
  }

  const leadScore = calculateLeadScore(parsed.data.project);
  const result = await createLead(parsed.data, leadScore);
  if (result.ok) return result;
  return { ...result, errorCategory: "persistence" };
}
