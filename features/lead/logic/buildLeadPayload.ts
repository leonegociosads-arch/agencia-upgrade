import type { ProjectSnapshot } from "../../builder/types";
import type { LeadContactData, LeadPayload } from "../types";

/**
 * Combina os dados pessoais já validados (`LeadContactData`, saída de `leadFormSchema`) com o
 * PROJECT SNAPSHOT atual (`buildProjectSnapshot`, Etapa 11) num LEAD PAYLOAD limpo e serializável.
 * Função pura e trivial de propósito: como `contact` já chega normalizado pelo schema, esta
 * função não repete nenhuma lógica de normalização — só monta a estrutura final. `meta.createdAt`
 * é o único metadado incluído além de `idempotencyKey` (nada de UTM, IP, geolocalização ou
 * fingerprint — nenhuma coleta disso existe ainda). `idempotencyKey` vem de fora (gerado uma vez
 * por tentativa de envio em `LeadContext`) para que retries reais reutilizem a mesma chave.
 */
export function buildLeadPayload(
  contact: LeadContactData,
  project: ProjectSnapshot,
  idempotencyKey: string,
): LeadPayload {
  return {
    contact,
    project,
    meta: { createdAt: new Date().toISOString(), idempotencyKey },
  };
}
