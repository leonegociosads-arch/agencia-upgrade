"use client";

import type { InputHTMLAttributes } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import FormField from "@/features/design-system/components/FormField";
import Input from "@/features/design-system/components/Input";

interface LeadFieldProps {
  id: string;
  label: string;
  type?: string;
  optional?: boolean;
  error?: string;
  registration: UseFormRegisterReturn;
  autoComplete?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
}

/**
 * Um campo do formulário de contato (WF-10) — Fase 19: reaproveita `FormField`/`Input` do Design
 * System em vez de duplicar o padrão de label/erro/`aria-describedby` que já existia aqui desde a
 * Fase 12 (o próprio `docs/DESIGN-SYSTEM.md`, Seção 8, registrou que os dois convergiram para a
 * mesma solução de acessibilidade de forma independente — esta fase só une as duas).
 */
export default function LeadField({ id, label, type = "text", optional, error, registration, autoComplete, inputMode }: LeadFieldProps) {
  return (
    <FormField label={optional ? `${label} (opcional)` : label} htmlFor={id} error={error}>
      <Input id={id} type={type} autoComplete={autoComplete} inputMode={inputMode} invalid={Boolean(error)} {...registration} />
    </FormField>
  );
}
