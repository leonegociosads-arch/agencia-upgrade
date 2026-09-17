import { generateId } from "@/lib/utils/generateId";

/**
 * Gera uma chave única para prevenir leads duplicados por reenvio (ex.: usuário clica em "Tentar
 * novamente" depois de uma falha, ou a rede duplica a requisição). Wrapper semântico sobre
 * `generateId()` (Fase 14) — mantém o nome usado em todo o resto do código de lead, mas sem
 * duplicar a lógica de geração.
 */
export function generateIdempotencyKey(): string {
  return generateId();
}
