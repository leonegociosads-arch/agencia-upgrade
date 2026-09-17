"use server";

import { z } from "zod";
import { EVENT_CATEGORIES, EVENT_PROPERTIES_SCHEMAS, isKnownEventName } from "@/lib/analytics/events";
import { insertAnalyticsEvent } from "@/lib/repositories/analyticsEvents";
import { checkRateLimit } from "@/lib/security/rateLimit";

const sessionIdSchema = z.string().trim().min(1).max(100);

/** 60 eventos / 5 minutos por sessão (Etapa 29, Seção 33/44) — o funil real tem hoje umas 10-15
 * milestones possíveis por sessão; 60 é generoso para retries/navegação legítima e ainda barra um
 * script disparando o mesmo endpoint em loop. Chave é o `sessionId` (já pseudônimo, nunca o IP —
 * não há necessidade de mais um identificador aqui). */
const EVENT_RATE_LIMIT = { limit: 60, windowMs: 5 * 60 * 1000 };

/**
 * ÚNICA Server Action de escrita de analytics (Fase 17) — chamada pelo provider interno
 * (`lib/analytics/providers/internal.ts`) para todo evento do funil. É, de propósito, a única
 * exceção a "nunca uma Server Action genérica" (regra estabelecida na Fase 16 para as mutações do
 * admin, `docs/ADMIN-CRM.md`, Seção 15): lá, cada Server Action correspondia a uma operação de
 * negócio distinta e sensível (mudar status, adicionar nota). Aqui, ingestão de analytics É, por
 * natureza, um único funil de entrada — o que impede um evento arbitrário não é ter uma função por
 * evento, e sim a validação estrita contra `EVENT_PROPERTIES_SCHEMAS` abaixo: um nome de evento
 * desconhecido ou um conjunto de propriedades fora do formato exato daquele evento é rejeitado
 * sempre, nunca gravado "do jeito que veio".
 *
 * Nunca lança para quem chama — analytics nunca pode quebrar a aplicação (Seção "Erro no
 * analytics" do briefing). Nunca loga e-mail/telefone/nome (nenhuma propriedade de evento os
 * contém, ver `lib/analytics/events.ts`), mas por segurança este arquivo também nunca loga o
 * conteúdo de `properties` no `console.error` — só a mensagem genérica.
 */
export async function recordEvent(sessionId: string, eventName: string, properties: unknown): Promise<void> {
  try {
    const parsedSessionId = sessionIdSchema.safeParse(sessionId);
    if (!parsedSessionId.success) return;

    const rateLimit = checkRateLimit(`event:${parsedSessionId.data}`, EVENT_RATE_LIMIT.limit, EVENT_RATE_LIMIT.windowMs);
    if (!rateLimit.ok) return;

    if (!isKnownEventName(eventName)) return;

    const propertiesSchema = EVENT_PROPERTIES_SCHEMAS[eventName];
    const parsedProperties = propertiesSchema.safeParse(properties);
    if (!parsedProperties.success) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[analytics] propriedades inválidas para o evento "${eventName}", descartado.`);
      }
      return;
    }

    await insertAnalyticsEvent({
      sessionId: parsedSessionId.data,
      eventName,
      eventCategory: EVENT_CATEGORIES[eventName],
      properties: parsedProperties.data,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[analytics] falha ao registrar evento, ignorada:", error);
    }
  }
}
