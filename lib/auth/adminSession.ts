import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createSupabaseServerSessionClient } from "../supabase/serverSessionClient";
import { isE2ETestMode } from "@/lib/testing/isE2ETestMode";
import { E2E_ADMIN_EMAIL, E2E_SESSION_COOKIE } from "@/lib/testing/e2eStore";

export interface AdminSession {
  user: User;
  /** Cliente já autenticado como este admin (chave anon + cookie de sessão) — reaproveitado pelas
   * Server Actions/páginas para consultar `upgrade_leads`/notas/histórico sob RLS, em vez de cada
   * uma criar seu próprio cliente. */
  supabase: SupabaseClient;
}

/**
 * A verificação REAL de acesso administrativo (Fase 16) — não a `proxy.ts` (que só faz uma
 * checagem otimista de "existe uma sessão?"). Segue o padrão que a própria documentação do Next
 * recomenda para autorização (`node_modules/next/dist/docs/.../authentication.md`, "Creating a
 * Data Access Layer"): uma função cacheada por requisição, chamada explicitamente em toda página e
 * Server Action que precisa de acesso de admin — nunca só na `layout`, porque layouts não
 * re-executam em toda navegação client-side dentro da mesma rota.
 *
 * "Estar autenticado" no Supabase Auth NÃO basta — só quem também está em `admin_users` é
 * considerado admin (`docs/ADMIN-CRM.md`).
 */
/** Etapa 31 (Testes Funcionais) — no modo E2E, "sessão de admin" é só um cookie próprio
 * (`E2E_SESSION_COOKIE`, gravado por `signInAdmin`), nunca o Supabase Auth real. `user`/`supabase`
 * são objetos mínimos só para satisfazer o formato de `AdminSession` — nenhum código deste branch
 * chega a usar `supabase` de verdade (todo repositório já intercepta antes, em `isE2ETestMode()`). */
async function getE2EAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  if (cookieStore.get(E2E_SESSION_COOKIE)?.value !== "1") return null;
  const fakeUser = { id: "e2e-admin", email: E2E_ADMIN_EMAIL } as User;
  return { user: fakeUser, supabase: {} as SupabaseClient };
}

export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  if (isE2ETestMode()) return getE2EAdminSession();

  const supabase = await createSupabaseServerSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: adminRow } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!adminRow) return null;

  return { user, supabase };
});

/** Chame no topo de toda página/Server Action do admin — redireciona para o login se a sessão não
 * existir ou não for de um admin autorizado. */
export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
