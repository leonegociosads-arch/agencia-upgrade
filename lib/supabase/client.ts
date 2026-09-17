import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase do navegador — chave "anon" apenas, nunca a service role key
 * (`docs/TECHNICAL-ARCHITECTURE.md`, Seção 19/29).
 *
 * Usa `createBrowserClient` de `@supabase/ssr` (Fase 16), não `createClient` de
 * `@supabase/supabase-js` puro — a diferença importa: `createBrowserClient` grava a sessão em
 * cookies no formato que o cliente de servidor (`lib/supabase/serverSessionClient.ts`) sabe ler,
 * permitindo que um login feito no navegador seja reconhecido nas próximas requisições ao
 * servidor.
 *
 * Ainda sem consumidor: o login do admin (Fase 16) é feito por Server Action
 * (`features/admin/actions/signIn.ts`), consistente com "Server Actions são o mecanismo
 * principal" (`docs/DECISIONS.md`, Fase 6) — este cliente continua reservado para uma futura
 * interação de auth iniciada no navegador (ex.: fluxo de redefinição de senha).
 *
 * Criado sob demanda (nunca no topo do módulo) para que a ausência das variáveis de ambiente não
 * quebre o build.
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
