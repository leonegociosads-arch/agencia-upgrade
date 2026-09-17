import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isE2ETestMode } from "@/lib/testing/isE2ETestMode";
import { E2E_SESSION_COOKIE } from "@/lib/testing/e2eStore";

/**
 * Proteção de `/admin/**` (Fase 16) — `docs/TECHNICAL-ARCHITECTURE.md`, Seção 29, já reservava
 * isso para "middleware.ts"; renomeado para `proxy.ts` porque este projeto está no Next.js 16, que
 * depreciou `middleware.js/ts` em favor de `proxy.js/ts` (mesmo arquivo, mesmo propósito — ver
 * `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`).
 *
 * Duas responsabilidades, ambas exigidas pelo padrão oficial do Supabase para Next.js App Router:
 * 1. Renovar o token de sessão a cada requisição (só a Proxy consegue escrever esse cookie de
 *    forma confiável antes da página renderizar).
 * 2. Uma checagem OTIMISTA (só "existe sessão?", sem consultar `admin_users`) — rápida, sem ir ao
 *    banco. A checagem REAL (é admin de verdade?) fica em `lib/auth/adminSession.ts`, chamada
 *    explicitamente em cada página/Server Action — a própria documentação do Next recomenda não
 *    confiar só nesta Proxy para autorização (ela é "otimista", não a fronteira de segurança).
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isLoginRoute = request.nextUrl.pathname === "/admin/login";

  // Etapa 31 (Testes Funcionais) — no modo E2E, a checagem otimista usa o mesmo cookie próprio de
  // `signInAdmin`/`getAdminSession`, nunca o Supabase Auth real (ver `lib/testing/e2eStore.ts`).
  if (isE2ETestMode()) {
    const hasE2ESession = request.cookies.get(E2E_SESSION_COOKIE)?.value === "1";
    if (isAdminRoute && !isLoginRoute && !hasE2ESession) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return response;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Sem credenciais do Supabase configuradas, não há como autenticar ninguém — melhor mandar
  // direto para o login (que também vai falhar de forma clara) do que deixar passar sem checagem.
  if (!supabaseUrl || !supabaseAnonKey) {
    if (isAdminRoute && !isLoginRoute) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isAdminRoute && !isLoginRoute && !user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
