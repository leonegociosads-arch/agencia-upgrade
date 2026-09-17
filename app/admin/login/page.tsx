import type { Metadata } from "next";
import LoginForm from "@/features/admin/components/LoginForm";

/** `noindex, nofollow` (Fase SEO, Seções 12/13 do briefing) — não está sob `app/admin/(protected)/
 * layout.tsx` (login precisa ser acessível sem sessão), então precisa da própria diretiva aqui. */
export const metadata: Metadata = {
  title: "Login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return <LoginForm />;
}
