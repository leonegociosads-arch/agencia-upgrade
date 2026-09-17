import type { BuilderState, BuilderStep, ServiceId } from "@/features/builder/types";

/**
 * Estrutura conceitual de abandono (Fase 14) — preparação para a Fase 17 (Analytics), NÃO
 * conectada a nenhum destino real ainda (sem Supabase, sem evento disparado, sem chamada de rede).
 * Só uma função pura, derivada inteiramente do `BuilderState` já existente — nenhum dado novo é
 * coletado, nenhum dado pessoal é incluído (`sessionId` é o único identificador, já anônimo).
 *
 * `docs/SESSION-PERSISTENCE.md`, Seção "Abandono", explica por que isso fica só como estrutura
 * pronta nesta fase: persistir isso remotamente antes de existir uma necessidade concreta seria
 * complicar sem benefício (a própria Etapa 14 pediu para não fazer isso "se não for necessário").
 */
export interface AbandonmentSnapshot {
  sessionId: string;
  lastStep: BuilderStep;
  activeService: ServiceId | null;
  confirmedServiceCount: number;
  contactStarted: boolean;
  submitted: boolean;
  updatedAt: string;
}

const CONTACT_OR_LATER_STEPS: BuilderStep[] = ["contact", "submitting", "success", "error"];

export function buildAbandonmentSnapshot(sessionId: string, state: BuilderState, updatedAt: string): AbandonmentSnapshot {
  return {
    sessionId,
    lastStep: state.step,
    activeService: state.activeService,
    confirmedServiceCount: Object.keys(state.confirmedServices).length,
    contactStarted: CONTACT_OR_LATER_STEPS.includes(state.step),
    submitted: state.step === "success",
    updatedAt,
  };
}
