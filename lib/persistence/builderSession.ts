import { z } from "zod";
import { SERVICES } from "@/features/builder/data/services";
import type { RestorableBuilderState } from "@/features/builder/state/builderReducer";
import type { BuilderStep, MyUpgrade, ServiceId } from "@/features/builder/types";
import type { LeadFormData } from "@/features/lead/types";

/**
 * Persistência local da sessão do Builder (Fase 14) — ver `docs/SESSION-PERSISTENCE.md` para a
 * documentação completa (objetivo, TTL, versionamento, privacidade, limitações). Este módulo é a
 * ÚNICA porta de entrada para `localStorage` no projeto ("não espalhar localStorage diretamente
 * nos componentes") — chamado só por `features/builder/state/useBuilderSessionPersistence.ts`.
 *
 * Fluxo: STATE -> SERIALIZE -> STORAGE (`saveBuilderSession`), depois STORAGE -> VALIDATE ->
 * HYDRATE -> STATE (`loadBuilderSession`, que usa `validateStoredSession` por dentro). A
 * persistência nunca é a fonte de verdade — só espelha o `BuilderState`/`leadDraft` que já existem.
 */

export const BUILDER_SESSION_STORAGE_KEY = "upgrade-builder:v1";
export const BUILDER_SESSION_VERSION = 1;
/** 7 dias — ver `docs/SESSION-PERSISTENCE.md`, Seção "TTL", para a justificativa da escolha. */
export const BUILDER_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const BUILDER_STEPS: BuilderStep[] = [
  "idle",
  "choosing_service",
  "configuring",
  "service_complete",
  "reviewing",
  "contact",
  "submitting",
  "success",
  "error",
];

function isKnownStep(value: string): value is BuilderStep {
  return (BUILDER_STEPS as string[]).includes(value);
}

function isKnownServiceId(value: string | null): value is ServiceId {
  return value !== null && value in SERVICES;
}

const answerValueSchema = z.union([z.string(), z.array(z.string())]);
const answersSchema = z.record(z.string(), answerValueSchema);

const upgradeItemSchema = z.object({
  serviceId: z.string(),
  answers: answersSchema,
  status: z.enum(["configuring", "complete"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const leadDraftSchema = z.object({
  name: z.string(),
  company: z.string(),
  whatsapp: z.string(),
  email: z.string(),
  websiteOrInstagram: z.string(),
});

/**
 * Validação ESTRUTURAL apenas (tipos/forma certos). Checagens de "esse valor faz sentido para
 * este app" (serviceId conhecido, step conhecido, coerência entre editingService e serviceDraft)
 * ficam em `sanitizeRestoredSession` — de propósito, para que um único campo estranho não descarte
 * a sessão inteira (ver `docs/SESSION-PERSISTENCE.md`, "Recuperação de inconsistências").
 */
const persistedBuilderSessionSchema = z.object({
  version: z.number(),
  sessionId: z.string().min(1),
  updatedAt: z.string(),
  builder: z.object({
    step: z.string(),
    activeService: z.string().nullable(),
    editingService: z.string().nullable(),
    serviceDraft: answersSchema,
    draftHistory: z.array(z.string()),
    confirmedServices: z.record(z.string(), upgradeItemSchema),
    returnStep: z.string(),
  }),
  lead: z.object({
    leadDraft: leadDraftSchema,
  }),
});

export type PersistedBuilderSession = z.infer<typeof persistedBuilderSessionSchema>;

export interface SanitizedBuilderSession {
  sessionId: string;
  builder: RestorableBuilderState;
  leadDraft: LeadFormData;
}

export type BuilderSessionValidationResult =
  | { ok: true; session: PersistedBuilderSession }
  | { ok: false; reason: "invalid_shape" | "incompatible_version" | "expired" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Passos 1-4 da "VALIDAÇÃO DA SESSÃO" (parse já feito por quem chama, aqui: estrutura, version,
 * expiração). Nunca lança — todo caminho inválido retorna `{ ok: false, reason }`.
 */
export function validateStoredSession(raw: unknown): BuilderSessionValidationResult {
  if (!isRecord(raw)) return { ok: false, reason: "invalid_shape" };
  if (raw.version !== BUILDER_SESSION_VERSION) return { ok: false, reason: "incompatible_version" };

  const parsed = persistedBuilderSessionSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, reason: "invalid_shape" };

  const ageMs = Date.now() - Date.parse(parsed.data.updatedAt);
  if (!Number.isFinite(ageMs) || ageMs > BUILDER_SESSION_TTL_MS) {
    return { ok: false, reason: "expired" };
  }

  return { ok: true, session: parsed.data };
}

/**
 * Passos 5-7 da "VALIDAÇÃO DA SESSÃO" (remover lixo, recuperar de forma segura) — nunca descarta a
 * sessão inteira por causa de UM campo inconsistente; neutraliza só a parte afetada.
 */
export function sanitizeRestoredSession(session: PersistedBuilderSession): SanitizedBuilderSession {
  const dev = process.env.NODE_ENV !== "production";
  const b = session.builder;

  const confirmedServices: MyUpgrade = {};
  for (const [key, item] of Object.entries(b.confirmedServices)) {
    if (isKnownServiceId(key)) {
      confirmedServices[key] = { ...item, serviceId: key };
    } else if (dev) {
      console.warn(`[builderSession] serviceId desconhecido ("${key}") descartado da sessão restaurada.`);
    }
  }

  let activeService = isKnownServiceId(b.activeService) ? b.activeService : null;
  let editingService = isKnownServiceId(b.editingService) ? b.editingService : null;
  let serviceDraft = b.serviceDraft;
  let draftHistory = b.draftHistory;
  let step: BuilderStep = isKnownStep(b.step) ? b.step : "choosing_service";
  const returnStep: BuilderStep = isKnownStep(b.returnStep) ? b.returnStep : "choosing_service";

  // Edição inconsistente (editingService presente, mas sem rascunho real por trás) — nunca deveria
  // acontecer a partir do reducer real (START_EDITING_SERVICE sempre clona respostas existentes),
  // só via corrupção externa do storage. Preferência: cancelar a edição, manter confirmed intacto.
  if (editingService !== null && Object.keys(serviceDraft).length === 0) {
    if (dev) console.warn("[builderSession] editingService sem rascunho — edição cancelada com segurança.");
    editingService = null;
    activeService = null;
    serviceDraft = {};
    draftHistory = [];
  }

  if ((step === "configuring" || step === "service_complete") && activeService === null) {
    step = "choosing_service";
  }
  if ((step === "reviewing" || step === "contact" || step === "success") && Object.keys(confirmedServices).length === 0) {
    step = "choosing_service";
  }
  // "submitting"/"error" nunca voltam como estavam: a chamada em andamento já não existe mais, e a
  // mensagem de erro não foi persistida (é transitória de propósito) — a única continuação segura
  // é devolver o formulário de contato, intacto, para o usuário tentar de novo.
  if (step === "submitting" || step === "error") {
    step = Object.keys(confirmedServices).length > 0 ? "contact" : "choosing_service";
  }

  return {
    sessionId: session.sessionId,
    builder: { step, activeService, editingService, serviceDraft, draftHistory, confirmedServices, returnStep },
    leadDraft: session.lead.leadDraft,
  };
}

export type BuilderSessionLoadResult =
  | { status: "empty" }
  | { status: "expired" }
  | { status: "invalid" }
  | { status: "ok"; session: SanitizedBuilderSession };

export function clearBuilderSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(BUILDER_SESSION_STORAGE_KEY);
  } catch {
    // Storage indisponível (modo privado, quota, etc.) — nada a limpar mesmo.
  }
}

export function loadBuilderSession(): BuilderSessionLoadResult {
  if (typeof window === "undefined") return { status: "empty" };

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(BUILDER_SESSION_STORAGE_KEY);
  } catch {
    return { status: "empty" };
  }
  if (!raw) return { status: "empty" };

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    clearBuilderSession();
    return { status: "invalid" };
  }

  const validation = validateStoredSession(parsedJson);
  if (!validation.ok) {
    clearBuilderSession();
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[builderSession] sessão descartada (${validation.reason}).`);
    }
    return { status: validation.reason === "expired" ? "expired" : "invalid" };
  }

  return { status: "ok", session: sanitizeRestoredSession(validation.session) };
}

export interface SaveBuilderSessionInput {
  sessionId: string;
  builder: RestorableBuilderState;
  leadDraft: LeadFormData;
}

export function saveBuilderSession(input: SaveBuilderSessionInput): void {
  if (typeof window === "undefined") return;

  const payload: PersistedBuilderSession = {
    version: BUILDER_SESSION_VERSION,
    sessionId: input.sessionId,
    updatedAt: new Date().toISOString(),
    builder: {
      step: input.builder.step,
      activeService: input.builder.activeService,
      editingService: input.builder.editingService,
      serviceDraft: input.builder.serviceDraft,
      draftHistory: input.builder.draftHistory,
      confirmedServices: input.builder.confirmedServices as PersistedBuilderSession["builder"]["confirmedServices"],
      returnStep: input.builder.returnStep,
    },
    lead: { leadDraft: input.leadDraft },
  };

  try {
    window.localStorage.setItem(BUILDER_SESSION_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Storage indisponível ou cheio — o Builder continua funcionando só em memória (ver
    // docs/SESSION-PERSISTENCE.md, "Limitações"); falha silenciosa é o comportamento certo aqui,
    // não há UI de erro para "não consegui salvar seu progresso localmente".
  }
}
