import "server-only";
import { headers } from "next/headers";

/**
 * IP do cliente para fins de rate limit (Etapa 29 — Segurança), nunca para identificação pessoal
 * (não é gravado em nenhum lugar, só usado como chave efêmera em memória, `lib/security/
 * rateLimit.ts`). `x-forwarded-for` é preenchido pela infraestrutura (Vercel) — este projeto nunca
 * roda atrás de um proxy próprio que precisaria ser configurado para enviar esse header.
 *
 * Sem essa infraestrutura (ex.: `next dev` local), o header não existe e a função devolve
 * `"unknown"` — todo tráfego local cai na mesma chave, o que é aceitável em desenvolvimento (não é
 * onde a proteção precisa valer).
 */
export async function getClientIp(): Promise<string> {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]!.trim();
  }
  return requestHeaders.get("x-real-ip")?.trim() ?? "unknown";
}
