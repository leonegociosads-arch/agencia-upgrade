import { z } from "zod";
import { generateId } from "@/lib/utils/generateId";

/**
 * Sessão de ANALYTICS (Fase 17) — `docs/ANALYTICS.md`, Seções "session_id" e "UTM". Site inteiro
 * (Home, `/projetos`, Builder), não só o Builder: `page_view` precisa existir mesmo em páginas sem
 * nenhum estado do Builder, então este módulo é o dono do `session_id` canônico — o hook de
 * persistência do Builder (`features/builder/state/useBuilderSessionPersistence.ts`, Fase 14) foi
 * ajustado nesta fase para ADOTAR este mesmo id (via `getOrCreateAnalyticsSession().sessionId`) em
 * vez de gerar o seu próprio, exatamente para satisfazer o pedido do briefing: "Utilizar o
 * session_id da Etapa 14... todos os eventos do mesmo fluxo devem compartilhar o mesmo session_id."
 * Ver `docs/DECISIONS.md`, Fase 17, para o registro dessa mudança.
 *
 * Storage PRÓPRIO (`upgrade-analytics:session:v1`), separado de `upgrade-builder:v1` — este
 * registro precisa sobreviver mesmo para quem nunca abre o Builder (visita só a Home), e carrega
 * dados (first-touch, marcos já disparados) que não fazem sentido dentro do schema do Builder.
 *
 * TTL e formato de expiração reaproveitam exatamente a política já validada na Fase 14 (7 dias,
 * contados de `updatedAt`) — não haveria motivo para inventar uma segunda política de expiração
 * só para este módulo.
 */

export const ANALYTICS_SESSION_STORAGE_KEY = "upgrade-analytics:session:v1";
export const ANALYTICS_SESSION_VERSION = 1;
export const ANALYTICS_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type TrafficOrigin = "utm" | "referral" | "organic" | "direct";

export interface AnalyticsFirstTouch {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  /** Só o hostname do referrer — nunca a URL inteira (poderia carregar termos de busca/dados
   * pessoais na query string de quem indicou o clique). */
  referrerHost: string | null;
  landingPath: string;
  origin: TrafficOrigin;
}

export interface AnalyticsSessionRecord {
  version: 1;
  sessionId: string;
  updatedAt: string;
  firstTouch: AnalyticsFirstTouch;
  /** Marcos "uma vez por sessão" já disparados (`docs/ANALYTICS.md`, Seção "Abandono" — a
   * estratégia de "last known step" sugerida no briefing, simplificada para um conjunto: cada
   * marco alcançado fica registrado, sem precisar guardar TODA a estrutura de estado do Builder
   * aqui). Usado por `markFunnelStepOnce` para nunca recontar `builder_started`/`upgrade_reviewed`/
   * `contact_started`/`lead_submitted` a cada refresh/remontagem — só a primeira vez que a sessão
   * alcança cada um conta para o funil. */
  firedOnceEvents: string[];
}

const firstTouchSchema = z.object({
  utmSource: z.string().nullable(),
  utmMedium: z.string().nullable(),
  utmCampaign: z.string().nullable(),
  utmContent: z.string().nullable(),
  utmTerm: z.string().nullable(),
  referrerHost: z.string().nullable(),
  landingPath: z.string(),
  origin: z.enum(["utm", "referral", "organic", "direct"]),
});

const analyticsSessionSchema = z.object({
  version: z.literal(1),
  sessionId: z.string().min(1),
  updatedAt: z.string(),
  firstTouch: firstTouchSchema,
  firedOnceEvents: z.array(z.string()),
});

const SEARCH_ENGINE_HOSTS = ["google.", "bing.", "duckduckgo.", "yahoo.", "baidu.", "yandex."];

/** Heurística simples e não-exaustiva (docs/ANALYTICS.md, Seção "UTM"): só os motores de busca
 * mais comuns. Nunca tenta construir um sistema de atribuição completo. */
function classifyOrigin(hasUtm: boolean, referrerHost: string | null): TrafficOrigin {
  if (hasUtm) return "utm";
  if (!referrerHost) return "direct";
  if (SEARCH_ENGINE_HOSTS.some((host) => referrerHost.includes(host))) return "organic";
  return "referral";
}

function readReferrerHost(): string | null {
  if (typeof document === "undefined" || !document.referrer) return null;
  try {
    const referrerUrl = new URL(document.referrer);
    if (typeof window !== "undefined" && referrerUrl.hostname === window.location.hostname) return null;
    return referrerUrl.hostname;
  } catch {
    return null;
  }
}

/** Lê UTMs da URL atual — chamado só na criação de uma sessão nova (Seção "First touch": nunca
 * substitui uma origem já capturada por causa de navegação interna). */
function captureFirstTouch(searchParams: URLSearchParams, pathname: string): AnalyticsFirstTouch {
  const utmSource = searchParams.get("utm_source");
  const utmMedium = searchParams.get("utm_medium");
  const utmCampaign = searchParams.get("utm_campaign");
  const utmContent = searchParams.get("utm_content");
  const utmTerm = searchParams.get("utm_term");
  const hasUtm = Boolean(utmSource || utmMedium || utmCampaign || utmContent || utmTerm);
  const referrerHost = readReferrerHost();

  return {
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    utmTerm,
    referrerHost,
    landingPath: pathname,
    origin: classifyOrigin(hasUtm, referrerHost),
  };
}

function readRawRecord(): AnalyticsSessionRecord | null {
  if (typeof window === "undefined") return null;
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(ANALYTICS_SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    return null;
  }

  const parsed = analyticsSessionSchema.safeParse(parsedJson);
  if (!parsed.success) return null;

  const ageMs = Date.now() - Date.parse(parsed.data.updatedAt);
  if (!Number.isFinite(ageMs) || ageMs > ANALYTICS_SESSION_TTL_MS) return null;

  return parsed.data;
}

function writeRecord(record: AnalyticsSessionRecord): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ANALYTICS_SESSION_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Storage indisponível — a sessão de analytics continua só em memória pelo resto do
    // carregamento da página; falha silenciosa (mesma postura de `builderSession.ts`).
  }
}

function createRecord(searchParams: URLSearchParams, pathname: string): AnalyticsSessionRecord {
  return {
    version: ANALYTICS_SESSION_VERSION,
    sessionId: generateId(),
    updatedAt: new Date().toISOString(),
    firstTouch: captureFirstTouch(searchParams, pathname),
    firedOnceEvents: [],
  };
}

/**
 * Ponto de entrada principal — lê a sessão válida existente ou cria uma nova (nunca gera um id
 * novo a cada `page_view`, Seção "Session start" do briefing). Chamado pelo tracker de página
 * (`features/analytics/components/AnalyticsPageView.tsx`) e por
 * `useBuilderSessionPersistence.ts`, sempre com os mesmos parâmetros de origem (URL atual) — como
 * é idempotente para uma sessão já existente, não importa quantas vezes é chamado por render.
 */
export function getOrCreateAnalyticsSession(searchParams: URLSearchParams, pathname: string): AnalyticsSessionRecord {
  const existing = readRawRecord();
  if (existing) {
    // Atualiza só `updatedAt` (renova o TTL a cada atividade) — nunca recaptura o first-touch.
    const renewed: AnalyticsSessionRecord = { ...existing, updatedAt: new Date().toISOString() };
    writeRecord(renewed);
    return renewed;
  }

  const created = createRecord(searchParams, pathname);
  writeRecord(created);
  return created;
}

/** "Começar de novo" (Fase 14) é uma jornada anônima diferente por decisão de produto já tomada —
 * gera uma sessão de analytics nova também, com first-touch recapturado a partir da URL atual. */
export function resetAnalyticsSession(searchParams: URLSearchParams, pathname: string): AnalyticsSessionRecord {
  const created = createRecord(searchParams, pathname);
  writeRecord(created);
  return created;
}

/**
 * Marca um marco "uma vez por sessão" (Seção "Session id"/"Last known step"). Retorna `true` só na
 * primeira vez que este marco é alcançado nesta sessão — quem chama só dispara o evento quando o
 * retorno é `true`, o que resolve sozinho o problema de refresh/remontagem reenviando o mesmo
 * evento de funil.
 */
export function markFunnelStepOnce(sessionId: string, step: string): boolean {
  const existing = readRawRecord();
  if (!existing || existing.sessionId !== sessionId) return true; // sem registro local: não bloqueia, só não persiste o marco.
  if (existing.firedOnceEvents.includes(step)) return false;

  writeRecord({ ...existing, updatedAt: new Date().toISOString(), firedOnceEvents: [...existing.firedOnceEvents, step] });
  return true;
}
