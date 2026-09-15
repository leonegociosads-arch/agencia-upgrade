import Link from "next/link";
import styles from "./page.module.css";

/**
 * Home provisória (Etapa 8) — só confirma que a aplicação funciona e conduz ao Builder.
 * Identidade visual final, motion design e conteúdo institucional completo pertencem a fases
 * futuras (docs/PROJECT-OVERVIEW.md, Seção 18).
 */
export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <span className={styles.badge}>Ambiente provisório — Etapa 8</span>
        <h1 className={styles.title}>Agência Upgrade</h1>
        <Link href="/builder" className={styles.cta}>
          Monte seu Upgrade
        </Link>
      </div>
    </div>
  );
}
