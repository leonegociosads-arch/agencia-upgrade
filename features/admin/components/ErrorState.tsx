"use client";

import { useRouter } from "next/navigation";
import Alert from "@/features/design-system/components/Alert";
import Button from "@/features/design-system/components/Button";
import styles from "./ErrorState.module.css";

/** Estado de erro recuperável (Fase 16) — "Tentar novamente" simplesmente pede ao Next para
 * re-renderizar o Server Component desta rota com dados novos. */
export default function ErrorState({ message }: { message: string }) {
  const router = useRouter();

  return (
    <div className={styles.wrapper}>
      <Alert tone="error">{message}</Alert>
      <Button size="sm" onClick={() => router.refresh()}>
        Tentar novamente
      </Button>
    </div>
  );
}
