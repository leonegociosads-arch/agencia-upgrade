"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerSessionClient } from "@/lib/supabase/serverSessionClient";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { getClientIp } from "@/lib/security/getClientIp";
import { isE2ETestMode } from "@/lib/testing/isE2ETestMode";
import { e2eSignIn, E2E_ADMIN_EMAIL, E2E_SESSION_COOKIE } from "@/lib/testing/e2eStore";

/** 5 tentativas / 5 minutos por IP+e-mail (Etapa 29, Seção 35/36) — fricção contra força bruta na
 * frente do Supabase Auth (que continua sendo a autenticação de verdade; isto não a substitui). */
const LOGIN_RATE_LIMIT = { limit: 5, windowMs: 5 * 60 * 1000 };
const RATE_LIMIT_MESSAGE = "Muitas tentativas de login. Aguarde alguns minutos e tente de novo.";

const credentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Informe seu e-mail.")
    .toLowerCase()
    .pipe(z.email("Digite um e-mail válido.")),
  password: z.string().min(1, "Informe sua senha."),
});

export interface SignInResult {
  ok: boolean;
  message?: string;
}

/**
 * Login do painel administrativo (Fase 16) via Supabase Auth — sem sistema de senha caseiro.
 * Formato `(prevState, formData)` para uso com `useActionState` (`LoginForm.tsx`), padrão da
 * própria documentação do Next para formulários com Server Action.
 *
 * "Estar autenticado" não é suficiente: mesmo com credenciais corretas, só quem também está em
 * `admin_users` termina logado — qualquer outra conta do Supabase Auth (nenhuma existe hoje, já
 * que não há cadastro público) é deslogada de novo e recebe uma mensagem clara.
 */
export async function signInAdmin(_prevState: SignInResult | undefined, formData: FormData): Promise<SignInResult> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  // No modo E2E, a conta fixa de teste (`E2E_ADMIN_EMAIL`) fica fora do rate limit: os specs fazem
  // login de verdade repetidas vezes, em paralelo, dentro da mesma janela de 5 minutos — o rate
  // limit real (Etapa 29) continua testado normalmente com um e-mail exclusivo por execução
  // (`e2e/security.spec.ts`), nunca com a conta fixa que os outros specs também usam.
  const skipRateLimit = isE2ETestMode() && parsed.data.email === E2E_ADMIN_EMAIL;
  if (!skipRateLimit) {
    const ip = await getClientIp();
    const rateLimit = checkRateLimit(`login:${ip}:${parsed.data.email}`, LOGIN_RATE_LIMIT.limit, LOGIN_RATE_LIMIT.windowMs);
    if (!rateLimit.ok) {
      return { ok: false, message: RATE_LIMIT_MESSAGE };
    }
  }

  if (isE2ETestMode()) {
    if (!e2eSignIn(parsed.data.email, parsed.data.password)) {
      return { ok: false, message: "E-mail ou senha inválidos." };
    }
    const cookieStore = await cookies();
    cookieStore.set(E2E_SESSION_COOKIE, "1", { httpOnly: true, sameSite: "lax", path: "/" });
    redirect("/admin");
  }

  const supabase = await createSupabaseServerSessionClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    return { ok: false, message: "E-mail ou senha inválidos." };
  }

  const { data: adminRow } = await supabase.from("admin_users").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!adminRow) {
    await supabase.auth.signOut();
    return { ok: false, message: "Esta conta não tem acesso ao painel administrativo." };
  }

  redirect("/admin");
}
