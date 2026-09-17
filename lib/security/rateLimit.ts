import "server-only";

/**
 * Rate limit simples, em memória, por processo (Etapa 29 — Segurança). Proporcional ao tamanho
 * real do projeto: nenhuma dependência nova (Redis/Upstash), nenhuma tabela extra no Supabase —
 * só uma janela fixa por chave (`"lead:<ip>"`, `"login:<ip>:<email>"`, `"event:<sessionId>"`).
 *
 * Limitação conhecida e aceita: em um deployment serverless com múltiplas instâncias (Vercel),
 * cada instância tem seu próprio contador — o limite real efetivo pode ser um múltiplo do
 * configurado se o tráfego for distribuído entre instâncias frias. Isso não anula a proteção (um
 * bot ainda encontra fricção real), só significa que não é uma garantia matematicamente exata.
 * Documentado em `docs/SECURITY.md` como aceitável para o estágio atual do projeto — a alternativa
 * (um contador central, ex. Supabase ou Upstash) é uma peça de infraestrutura nova só se um abuso
 * real justificar (mesmo critério já usado para "CAPTCHA só se abuso justificar").
 */
interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Evita crescimento ilimitado do Map em um processo de longa duração — varredura só quando o
 * número de chaves distintas já é grande o suficiente para valer o custo de iterar. */
const SWEEP_THRESHOLD = 5000;

function sweepExpired(now: number): void {
  if (buckets.size < SWEEP_THRESHOLD) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  /** Só presente quando `ok` é `false`. */
  retryAfterMs?: number;
}

/** `limit` tentativas por `windowMs`, por `key`. Janela fixa (não deslizante) — simples e
 * suficiente para o objetivo aqui (fricção contra abuso automatizado, não um SLA de precisão). */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweepExpired(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { ok: true };
}

/** Só para testes — cada arquivo de teste que exercita uma Server Action com rate limit precisa
 * começar de um estado limpo (o Map é module-level, sobrevive entre `it()`s do mesmo arquivo). */
export function resetRateLimitForTests(): void {
  buckets.clear();
}
