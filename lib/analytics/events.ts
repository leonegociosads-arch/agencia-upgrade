import { z } from "zod";
import type { ServiceId } from "@/features/builder/types";

/**
 * Contrato central de eventos (Fase 17) — `docs/ANALYTICS.md`, Seção "Eventos". Cada evento tem um
 * nome fixo (`snake_case`) e um formato de propriedades próprio; `trackEvent` (`trackEvent.ts`) é
 * genérico sobre este mapa, então `trackEvent("service_selected", { serviceId: "site" })` é
 * type-safe e `trackEvent("service_selected", { foo: 1 })` é um erro de compilação — ver
 * `lib/analytics/events.typecheck.ts` para a prova em tempo de compilação (TESTE 20 do briefing).
 *
 * Deliberadamente PEQUENO (12 eventos, não os ~14 sugeridos no briefing):
 * - `question_answered` foi avaliado e NÃO implementado — ver `docs/ANALYTICS.md`, Seção
 *   "Eventos avaliados e não implementados", para a análise completa de custo x benefício.
 * - `service_started` foi avaliado e considerado semanticamente igual a `service_selected` neste
 *   fluxo (escolher um serviço novo já inicia a configuração imediatamente, sem etapa própria) —
 *   o próprio briefing previu essa possibilidade ("pode ser combinado... evite eventos duplicados").
 *
 * Nenhuma propriedade aqui pode conter dado pessoal (nome, e-mail, telefone, conteúdo de
 * respostas livres) — só IDs e categorias, nunca o texto digitado por alguém.
 */
export interface AnalyticsEventMap {
  page_view: { path: string };
  builder_started: Record<string, never>;
  service_selected: { serviceId: ServiceId };
  service_completed: { serviceId: ServiceId; questionCount: number };
  service_edited: { serviceId: ServiceId };
  service_removed: { serviceId: ServiceId };
  upgrade_reviewed: { serviceCount: number; serviceIds: ServiceId[] };
  contact_started: Record<string, never>;
  lead_submit_attempted: Record<string, never>;
  /** `idempotencyKey` (Fase 13) não é dado pessoal — é um UUID gerado no navegador só para evitar
   * duplicidade de envio; incluído aqui de propósito porque é a mesma chave já gravada em
   * `upgrade_leads.idempotency_key`, permitindo associar esta sessão anônima ao projeto convertido
   * por um JOIN, sem precisar devolver o `id` do lead para o cliente (`docs/ANALYTICS.md`, Seção
   * "Conversão"). Deliberadamente SEM `lead_score_tier`: o score é um dado comercial interno que
   * nunca deve chegar ao navegador (Fase 15) — expor esse valor aqui, mesmo só para analytics,
   * quebraria essa fronteira já estabelecida. */
  lead_submitted: { serviceCount: number; idempotencyKey: string };
  /** Nunca a mensagem crua do erro (poderia variar/vazar detalhe técnico) — só uma categoria fixa. */
  lead_submit_failed: { errorCategory: "validation" | "persistence" | "unknown" };
  /** Preparado, sem nenhum ponto de disparo ainda: o site público não tem um botão de WhatsApp
   * hoje, e o botão que já existe (Fase 16, `features/admin/logic/buildWhatsAppLink.ts`) é uma
   * ação do administrador, não do visitante — disparar este mesmo evento por lá misturaria o funil
   * público com uma ação interna (o próprio briefing pede para não misturar). */
  whatsapp_clicked: Record<string, never>;
}

export type AnalyticsEventName = keyof AnalyticsEventMap;

export type AnalyticsEventCategory = "engagement" | "funnel" | "conversion" | "internal";

export const EVENT_CATEGORIES: Record<AnalyticsEventName, AnalyticsEventCategory> = {
  page_view: "engagement",
  builder_started: "funnel",
  service_selected: "funnel",
  service_completed: "funnel",
  service_edited: "funnel",
  service_removed: "funnel",
  upgrade_reviewed: "funnel",
  contact_started: "funnel",
  lead_submit_attempted: "conversion",
  lead_submitted: "conversion",
  lead_submit_failed: "conversion",
  whatsapp_clicked: "internal",
};

const serviceIdSchema = z.enum(["site", "trafego", "design"]);
const emptyPropertiesSchema = z.strictObject({});

/**
 * Validação server-side (Fase 17: "Server-side validation... eventos inválidos devem ser
 * impossíveis ou detectáveis"). `.strictObject` rejeita qualquer chave a mais — nunca aceita
 * silenciosamente um campo extra que um cliente malicioso tentasse anexar (ex.: `email`).
 */
export const EVENT_PROPERTIES_SCHEMAS = {
  page_view: z.strictObject({ path: z.string().min(1).max(200) }),
  builder_started: emptyPropertiesSchema,
  service_selected: z.strictObject({ serviceId: serviceIdSchema }),
  service_completed: z.strictObject({ serviceId: serviceIdSchema, questionCount: z.number().int().min(0).max(50) }),
  service_edited: z.strictObject({ serviceId: serviceIdSchema }),
  service_removed: z.strictObject({ serviceId: serviceIdSchema }),
  upgrade_reviewed: z.strictObject({
    serviceCount: z.number().int().min(0).max(10),
    serviceIds: z.array(serviceIdSchema).max(10),
  }),
  contact_started: emptyPropertiesSchema,
  lead_submit_attempted: emptyPropertiesSchema,
  lead_submitted: z.strictObject({
    serviceCount: z.number().int().min(0).max(10),
    idempotencyKey: z.string().min(1).max(100),
  }),
  lead_submit_failed: z.strictObject({ errorCategory: z.enum(["validation", "persistence", "unknown"]) }),
  whatsapp_clicked: emptyPropertiesSchema,
} satisfies { [K in AnalyticsEventName]: z.ZodType<AnalyticsEventMap[K]> };

export const ANALYTICS_EVENT_NAMES = Object.keys(EVENT_PROPERTIES_SCHEMAS) as AnalyticsEventName[];

export function isKnownEventName(value: string): value is AnalyticsEventName {
  return (ANALYTICS_EVENT_NAMES as string[]).includes(value);
}
