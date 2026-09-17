import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase exclusivo do servidor — usa a service role key, que ignora RLS
 * (`docs/TECHNICAL-ARCHITECTURE.md`, Seção 19/29: "nenhuma service role key exposta ao cliente").
 * O `import "server-only"` faz o build falhar caso este módulo seja importado por engano a partir
 * de um Client Component, em vez de descobrir isso só em produção.
 *
 * Criado sob demanda (nunca no topo do módulo) para que a ausência das credenciais não quebre
 * `next build`/`next dev` — o erro só aparece quando uma operação real de banco é tentada
 * (`lib/repositories/leads.ts`), nunca escondido.
 */
export function getSupabaseServerClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Supabase não configurado no servidor: defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
