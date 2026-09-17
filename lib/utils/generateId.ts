/**
 * Gerador de id genérico, sem regra de negócio — usado tanto para `idempotencyKey`
 * (`features/lead/logic/generateIdempotencyKey.ts`, Fase 13) quanto para `sessionId` (Fase 14,
 * `lib/persistence/builderSession.ts`). Extraído para cá em vez de duplicado nos dois lugares:
 * as duas versões eram idênticas, e duas cópias da mesma lógica são exatamente o tipo de
 * duplicação que já evitamos noutras partes do projeto (ex.: Display Summary vs Project Snapshot,
 * Etapa 11).
 *
 * Usa `crypto.randomUUID()` quando disponível (navegadores modernos e Node recente); o formato
 * alternativo não é um UUID de verdade, só precisa ser praticamente único.
 */
export function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
