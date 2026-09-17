import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "../supabase/server";
import type { AnalyticsEventCategory, AnalyticsEventMap, AnalyticsEventName } from "@/lib/analytics/events";
import type { ServiceId } from "@/features/builder/types";
import { isE2ETestMode } from "@/lib/testing/isE2ETestMode";

/**
 * Único ponto de acesso à tabela `analytics_events` (Fase 17) — mesma regra das demais tabelas
 * (`docs/FOLDER-STRUCTURE.md`): a UI e as Server Actions nunca chamam Supabase diretamente.
 *
 * Escrita: sempre via SERVICE ROLE (`getSupabaseServerClient`, o mesmo cliente de
 * `lib/repositories/leads.ts` usado por `createLead`) — não a chave anônima. Escolha A das duas
 * apresentadas pelo briefing ("envio pelo servidor" vs. "endpoint público controlado"): como a
 * escrita já passa por uma Server Action (`features/analytics/actions/recordEvent.ts`), que já é
 * "o servidor" no sentido pedido, não existe necessidade de conceder INSERT a `anon` na tabela —
 * zero policy de RLS libera qualquer coisa para o público, e mesmo assim o caminho de escrita
 * funciona (a service role ignora RLS). Isso deixa "não conceder SELECT público" automaticamente
 * satisfeito: não há NENHUM grant para `anon`, nem de leitura nem de escrita.
 */
export interface RecordAnalyticsEventInput<K extends AnalyticsEventName = AnalyticsEventName> {
  sessionId: string;
  eventName: K;
  eventCategory: AnalyticsEventCategory;
  properties: AnalyticsEventMap[K];
}

export type RecordAnalyticsEventResult = { ok: true } | { ok: false };

export async function insertAnalyticsEvent(input: RecordAnalyticsEventInput): Promise<RecordAnalyticsEventResult> {
  // Etapa 31 — modo E2E: aceita o evento sem gravar nada real (nenhuma tabela em memória
  // dedicada, já que nenhum spec desta fase precisa LER eventos de analytics de volta; só
  // confirma que `recordEvent` nunca quebra o Builder quando o modo E2E está ativo).
  if (isE2ETestMode()) return { ok: true };

  let client;
  try {
    client = getSupabaseServerClient();
  } catch (error) {
    console.error("Supabase não configurado (analytics):", error);
    return { ok: false };
  }

  const { error } = await client.from("analytics_events").insert({
    session_id: input.sessionId,
    event_name: input.eventName,
    event_category: input.eventCategory,
    properties: input.properties,
  });

  if (error) {
    // Nunca loga `properties`/`session_id` como se fossem sensíveis (não são — Seção "PII" do
    // briefing), mas ainda assim mantém o log genérico, no mesmo padrão do resto do projeto.
    console.error("Erro ao gravar evento de analytics no Supabase:", error);
    return { ok: false };
  }

  return { ok: true };
}

// ============================================================================
// Leitura administrativa (Fase 17) — usa o cliente de SESSÃO do admin (mesmo padrão da Fase 16:
// RLS aplica como o próprio usuário, nunca com privilégio elevado). A agregação roda dentro do
// Postgres via a função `analytics_overview` (RPC) — nunca traz linha a linha para agregar em
// memória no Node, e por não ser `security definer`, a própria RLS de `analytics_events` decide se
// o chamador vê alguma coisa (Testes 21/22: não-admin autenticado recebe agregados zerados, `anon`
// nem tem permissão para chamar a função).
// ============================================================================

export interface AnalyticsOverview {
  funnel: Partial<Record<AnalyticsEventName, number>>;
  topService: ServiceId | null;
}

interface AnalyticsOverviewRpcResult {
  funnel?: Partial<Record<string, number>>;
  topService?: string | null;
}

export async function getAnalyticsOverview(supabase: SupabaseClient, periodStart: string): Promise<AnalyticsOverview> {
  if (isE2ETestMode()) return { funnel: {}, topService: null };

  const { data, error } = await supabase.rpc("analytics_overview", { period_start: periodStart });
  if (error) {
    console.error("Erro ao carregar visão geral de analytics:", error);
    return { funnel: {}, topService: null };
  }

  const result = (data ?? {}) as AnalyticsOverviewRpcResult;
  return {
    funnel: (result.funnel ?? {}) as Partial<Record<AnalyticsEventName, number>>,
    topService: (result.topService as ServiceId | null | undefined) ?? null,
  };
}
