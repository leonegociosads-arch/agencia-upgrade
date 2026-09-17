"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerSessionClient } from "@/lib/supabase/serverSessionClient";
import { isE2ETestMode } from "@/lib/testing/isE2ETestMode";
import { E2E_SESSION_COOKIE } from "@/lib/testing/e2eStore";

export async function signOutAdmin(): Promise<void> {
  if (isE2ETestMode()) {
    const cookieStore = await cookies();
    cookieStore.delete(E2E_SESSION_COOKIE);
    redirect("/admin/login");
  }

  const supabase = await createSupabaseServerSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
