import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase do servidor que opera COMO o usuário logado (chave "anon" + cookie de sessão),
 * nunca como service role — é isso que faz o RLS de `admin_users`/`upgrade_leads` valer para o
 * painel administrativo (Fase 16). Diferente de `lib/supabase/server.ts` (service role, ignora
 * RLS, usado só pelo envio público do lead) — os dois clientes coexistem de propósito, cada um
 * para seu caso de uso.
 *
 * `setAll` é protegido por `try/catch`: em Server Components, `cookies()` é somente leitura (não
 * dá pra escrever um cookie no meio da renderização) — a Proxy (`proxy.ts`) já cuida de renovar a
 * sessão nesse caso. Em Server Actions e Route Handlers, `cookies()` aceita escrita normalmente, e
 * é aí que uma renovação de token durante o request realmente é persistida. Padrão recomendado
 * pela própria Supabase para o App Router do Next.js.
 */
export async function createSupabaseServerSessionClient(): Promise<SupabaseClient> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Chamado a partir de um Server Component (renderização em andamento) — a Proxy já
          // cuida de renovar a sessão nesse caso; nada a fazer aqui.
        }
      },
    },
  });
}
