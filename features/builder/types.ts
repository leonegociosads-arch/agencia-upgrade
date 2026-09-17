// Tipos centrais do Upgrade Builder (Etapa 8 — fundação técnica).
// Estrutura orientada a configuração: perguntas são dados (features/builder/data/*),
// nunca hardcoded dentro de componentes.

export type ServiceId = "site" | "trafego" | "design";

export interface ServiceDefinition {
  id: ServiceId;
  label: string;
  shortDescription: string;
}

export type QuestionType = "single_choice" | "multi_choice";

export interface QuestionOption {
  id: string;
  label: string;
  description?: string;
}

export type AnswerValue = string | string[];

/** Respostas de um único serviço, indexadas pelo id da pergunta (ex.: "site_tipo"). */
export type BuilderAnswers = Record<string, AnswerValue>;

export type QuestionCondition = (answers: BuilderAnswers) => boolean;

export interface Question {
  id: string;
  service: ServiceId;
  title: string;
  type: QuestionType;
  options: QuestionOption[] | ((answers: BuilderAnswers) => QuestionOption[]);
  /** Toda pergunta hoje é obrigatória; o campo existe para permitir perguntas opcionais no futuro. */
  required: boolean;
  /** Ausente = sempre visível. Presente = só visível quando a condição for verdadeira. */
  condition?: QuestionCondition;
}

/** Item concluído dentro do "Meu Upgrade" — no máximo um por ServiceId (ver DECISIONS.md, Fase 4/6). */
export interface UpgradeItem {
  serviceId: ServiceId;
  answers: BuilderAnswers;
  status: "configuring" | "complete";
  createdAt: string;
  updatedAt: string;
}

/**
 * Mesmo formato de `UpgradeItem`, com o nome usado pela camada de persistência futura
 * (docs/DATA-MODEL-CONCEPT.md, Fase 13) — alias, não um tipo paralelo a manter sincronizado.
 */
export type ServiceConfiguration = UpgradeItem;

/** No máximo um item por categoria — reafirma em nível de tipo a decisão da Fase 4/6. */
export type MyUpgrade = Partial<Record<ServiceId, UpgradeItem>>;

export type BuilderStep =
  | "idle"
  | "choosing_service"
  | "configuring"
  | "service_complete"
  | "reviewing"
  | "contact"
  | "submitting"
  | "success"
  | "error";

export interface BuilderState {
  step: BuilderStep;
  /** Serviço sendo configurado ou editado agora; null quando está na tela de escolha. */
  activeService: ServiceId | null;
  /** Não-nulo = modo de edição de um serviço já confirmado (rascunho reversível). */
  editingService: ServiceId | null;
  /** Respostas temporárias do serviço ativo — nunca sobrescreve `confirmedServices` até salvar. */
  serviceDraft: BuilderAnswers;
  /** Ordem dos campos respondidos no draft atual, para suportar "voltar". */
  draftHistory: string[];
  /** Serviços já salvos ("Meu Upgrade"). */
  confirmedServices: MyUpgrade;
  /**
   * Para onde voltar quando a edição atual for salva ou cancelada — o "returnContext" pedido na
   * Etapa 11. Só existem dois destinos possíveis hoje: `"choosing_service"` (o padrão — editar a
   * partir do seletor ou do painel "Meu Upgrade", que nunca sai da tela) e `"reviewing"` (editar a
   * partir do Resumo do Projeto, que É uma tela própria da qual se sai e para a qual se volta).
   */
  returnStep: BuilderStep;
  error: { step: BuilderStep; message: string } | null;
}

export interface SummaryItem {
  question: string;
  answer: string;
}

/**
 * DISPLAY SUMMARY de um serviço, para o Resumo do Projeto (Etapa 11) — dados humanos prontos para
 * renderizar, nunca a fonte de verdade (essa é `confirmedServices`). `title` é o rótulo do
 * serviço (`SERVICES[serviceId].label`); `items` reaproveita `buildServiceSummary` (Etapa 9), sem
 * truncar (o corte para "resumo curto" é decisão de UI do Meu Upgrade, não desta estrutura).
 */
export interface ServiceReviewSummary {
  serviceId: ServiceId;
  title: string;
  items: SummaryItem[];
}

/** Um serviço dentro do PROJECT SNAPSHOT (Seção "Project Snapshot" do IMPLEMENTATION-STAGE-11). */
export interface ProjectSnapshotService {
  serviceId: ServiceId;
  answers: BuilderAnswers;
}

/**
 * PROJECT SNAPSHOT — objeto de dados puro do projeto confirmado, serializável
 * (`JSON.stringify`), sem funções, sem estado de componente, sem rascunho. Fonte de verdade
 * estrutural para uso futuro (Supabase, WhatsApp, e-mail, admin, analytics — Etapas 12+); ainda
 * sem dados pessoais do lead nesta fase.
 */
export interface ProjectSnapshot {
  services: ProjectSnapshotService[];
}
