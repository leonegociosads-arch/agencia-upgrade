"use client";

import { useActionState } from "react";
import { signInAdmin, type SignInResult } from "../actions/signIn";
import Heading from "@/features/design-system/components/Heading";
import FormField from "@/features/design-system/components/FormField";
import Input from "@/features/design-system/components/Input";
import Button from "@/features/design-system/components/Button";
import Alert from "@/features/design-system/components/Alert";
import styles from "./LoginForm.module.css";

const initialState: SignInResult = { ok: true };

/** Fase 19: UI final aplicada, mas continua funcional/direta — o admin prioriza clareza, não
 * experimentação visual (briefing, Seção 20). */
export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(signInAdmin, initialState);

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} action={formAction}>
        <Heading variant="h2" as="h1" className={styles.title}>
          Painel administrativo
        </Heading>

        <FormField label="E-mail" htmlFor="email">
          <Input type="email" id="email" name="email" autoComplete="username" required disabled={isPending} />
        </FormField>

        <FormField label="Senha" htmlFor="password">
          <Input type="password" id="password" name="password" autoComplete="current-password" required disabled={isPending} />
        </FormField>

        {!state.ok && state.message && <Alert tone="error">{state.message}</Alert>}

        <Button type="submit" fullWidth disabled={isPending}>
          {isPending ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </div>
  );
}
