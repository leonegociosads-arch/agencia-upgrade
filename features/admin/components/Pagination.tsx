import Link from "next/link";
import styles from "./Pagination.module.css";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  /** Parâmetros de busca ATUAIS (sem `page`) — preservados ao trocar de página. */
  searchParams: Record<string, string | undefined>;
}

function hrefForPage(searchParams: Record<string, string | undefined>, page: number): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value) params.set(key, value);
  }
  params.set("page", String(page));
  return `/admin?${params.toString()}`;
}

/** `limit`/`offset` via `.range()` no Supabase (`lib/repositories/leads.ts`) — 20 por página. */
export default function Pagination({ page, pageSize, total, searchParams }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Paginação" className={styles.nav}>
      <span className={styles.info}>
        Página {page} de {totalPages} · {total} projeto{total === 1 ? "" : "s"}
      </span>
      <div className={styles.links}>
        {page > 1 ? (
          <Link href={hrefForPage(searchParams, page - 1)}>← Anterior</Link>
        ) : (
          <span className={styles.disabled}>← Anterior</span>
        )}
        {page < totalPages ? (
          <Link href={hrefForPage(searchParams, page + 1)}>Próxima →</Link>
        ) : (
          <span className={styles.disabled}>Próxima →</span>
        )}
      </div>
    </nav>
  );
}
