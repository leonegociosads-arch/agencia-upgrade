"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { LeadFormData } from "../types";
import { generateIdempotencyKey } from "../logic/generateIdempotencyKey";

export const emptyLeadDraft: LeadFormData = {
  name: "",
  company: "",
  whatsapp: "",
  email: "",
  websiteOrInstagram: "",
};

interface LeadContextValue {
  leadDraft: LeadFormData;
  updateLeadDraft: (values: LeadFormData) => void;
  /**
   * Identifica a tentativa de envio atual (Fase 13, prevenção de lead duplicado). Gerada uma única
   * vez por sessão de página (não a cada render) para que "Tentar novamente" depois de uma falha
   * reenvie com a MESMA chave — o Supabase grava o lead uma única vez mesmo que a primeira
   * tentativa tenha na verdade sido salva antes de o erro aparecer na tela.
   */
  idempotencyKey: string;
  /** "Começar de novo" (Fase 14) — volta ao rascunho vazio e gera uma NOVA idempotencyKey (é uma
   * jornada de envio diferente, não uma retentativa da anterior). */
  resetLeadDraft: () => void;
}

const LeadContext = createContext<LeadContextValue | null>(null);

/**
 * Estado do formulário de contato — deliberadamente separado de `BuilderState`
 * (`features/builder`), como pedido na Etapa 12 ("não misturar dados de contato dentro de
 * serviceDraft"). Montado uma vez em `app/builder/page.tsx`, ao lado de `BuilderProvider`, e nunca
 * desmontado enquanto o Builder estiver na tela — é isso que permite `leadDraft` sobreviver quando
 * `LeadForm` (o componente) é desmontado ao navegar para o Resumo do Projeto e depois remontado ao
 * voltar para o contato (`BuilderShell` troca de tela com base em `state.step`, então qualquer
 * estado local do próprio `LeadForm` se perderia nessa troca).
 *
 * `useState` simples, não um reducer: a única operação necessária é "substituir o rascunho
 * inteiro" (chamada explicitamente por `LeadForm` ao sair da tela de contato) — não há ações
 * distintas o suficiente para justificar um reducer.
 */
export function LeadProvider({ children }: { children: ReactNode }) {
  const [leadDraft, setLeadDraft] = useState<LeadFormData>(emptyLeadDraft);
  const [idempotencyKey, setIdempotencyKey] = useState<string>(generateIdempotencyKey);

  const value = useMemo<LeadContextValue>(
    () => ({
      leadDraft,
      updateLeadDraft: setLeadDraft,
      idempotencyKey,
      resetLeadDraft: () => {
        setLeadDraft(emptyLeadDraft);
        setIdempotencyKey(generateIdempotencyKey());
      },
    }),
    [leadDraft, idempotencyKey],
  );

  return <LeadContext.Provider value={value}>{children}</LeadContext.Provider>;
}

export function useLeadDraft(): LeadContextValue {
  const ctx = useContext(LeadContext);
  if (!ctx) throw new Error("useLeadDraft deve ser usado dentro de um LeadProvider");
  return ctx;
}
