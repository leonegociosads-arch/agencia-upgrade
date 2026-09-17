import type { ReactNode } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { requireAdminSession } from "@/lib/auth/adminSession";
import { signOutAdmin } from "@/features/admin/actions/signOut";
import styles from "./layout.module.css";

/** `noindex, nofollow` (Fase SEO, Seção 12 do briefing: "obrigatoriamente") — área privada,
 * protegida por sessão (`requireAdminSession`); nunca deve aparecer em busca nem ter links
 * seguidos a partir dela. Cobre `/admin` e `/admin/leads/[id]` (tudo sob este layout). */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Chrome compartilhado do admin autenticado. A checagem feita aqui é conveniente para mostrar o
 * e-mail do admin logado, mas NÃO é a única fronteira de segurança — cada página/Server Action sob
 * este layout chama `requireAdminSession()` de novo (é barato: `cache()` por requisição), porque
 * layouts não re-executam em toda navegação client-side dentro da mesma rota
 * (`node_modules/next/dist/docs/.../authentication.md`, "Layouts and auth checks").
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { user } = await requireAdminSession();

  return (
    <div className={styles.shell}>
      <header className={styles.bar}>
        <span className={styles.brand}>
          {/* Etapa 30 (Performance): dimensões intrínsecas = 2x o tamanho exibido (`.brandMark`,
           * `height: 20px`) — ver o mesmo comentário em `SiteHeader.tsx` para o racional completo. */}
          <Image src="/logo-mark.png" alt="" width={30} height={40} className={styles.brandMark} priority />
          Upgrade — Admin
        </span>
        <div className={styles.actions}>
          <span className={styles.email}>{user.email}</span>
          <form action={signOutAdmin}>
            <button type="submit" className={styles.logoutButton}>
              Sair
            </button>
          </form>
        </div>
      </header>
      <main className={styles.content}>{children}</main>
    </div>
  );
}
