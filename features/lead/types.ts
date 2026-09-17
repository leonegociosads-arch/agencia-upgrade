import type { ProjectSnapshot } from "../builder/types";

/**
 * Formulário de contato (WF-10) — os únicos 5 campos aprovados (`docs/PROJECT-OVERVIEW.md`,
 * `docs/USER-FLOW.md`, `docs/WIREFRAME.md`, Seção 15). Nenhum campo de briefing, orçamento, prazo
 * ou público-alvo. Todos os valores são strings (o que qualquer `<input>` de HTML produz) — a
 * validação/normalização em `logic/leadFormSchema.ts` decide o que é aceito.
 */
export interface LeadFormData {
  name: string;
  company: string;
  whatsapp: string;
  email: string;
  websiteOrInstagram: string;
}

export type LeadFormField = keyof LeadFormData;

/**
 * Mesma forma de `LeadFormData`, mas já validada e normalizada — a saída do schema de validação
 * (`leadFormSchema`), nunca construída à mão em nenhum outro lugar. `websiteOrInstagram` é
 * opcional aqui porque, depois de normalizado, uma string vazia deixa de existir como valor.
 */
export interface LeadContactData {
  name: string;
  company: string;
  whatsapp: string;
  email: string;
  websiteOrInstagram?: string;
}

/**
 * LEAD PAYLOAD — combinação final de "quem é a pessoa" (`contact`) com "o que ela quer contratar"
 * (`project`, o PROJECT SNAPSHOT de `features/builder`). Nunca mistura os dois: um campo pessoal
 * nunca aparece dentro de `project`, e nenhuma resposta de serviço aparece dentro de `contact`.
 * Serializável (`JSON.stringify`); `meta` só tem o que já existe de verdade nesta fase — sem UTM,
 * IP, geolocalização ou fingerprint (nenhuma coleta disso está implementada ainda).
 * `idempotencyKey` (Fase 13) identifica esta tentativa de envio — a mesma chave em duas tentativas
 * (ex.: "Tentar novamente" depois de uma falha) grava o lead uma única vez no Supabase.
 */
export interface LeadPayload {
  contact: LeadContactData;
  project: ProjectSnapshot;
  meta: {
    createdAt: string;
    idempotencyKey: string;
  };
}
