"use client";

import { useRef, useState, useTransition } from "react";
import { addLeadNote } from "../actions/addLeadNote";
import Textarea from "@/features/design-system/components/Textarea";
import Button from "@/features/design-system/components/Button";
import Alert from "@/features/design-system/components/Alert";
import styles from "./NoteForm.module.css";

/** Adicionar nova nota é suficiente para V1 — sem editar/apagar notas existentes
 * (`docs/ADMIN-CRM.md`, "Notas"). */
export default function NoteForm({ leadId }: { leadId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    const content = String(formData.get("content") ?? "");
    setError(null);
    startTransition(async () => {
      const result = await addLeadNote(leadId, content);
      if (!result.ok) {
        setError(result.message ?? "Não foi possível salvar a nota.");
        return;
      }
      formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className={styles.form}>
      <Textarea
        name="content"
        maxLength={2000}
        rows={3}
        placeholder="Adicionar observação interna (ex.: “Cliente pediu retorno depois das 18h.”)"
        required
        disabled={isPending}
      />
      {error && <Alert tone="error">{error}</Alert>}
      <Button type="submit" size="sm" disabled={isPending} className={styles.button}>
        {isPending ? "Salvando..." : "Adicionar nota"}
      </Button>
    </form>
  );
}
