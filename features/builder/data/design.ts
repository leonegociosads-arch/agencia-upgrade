import type { BuilderAnswers, Question, QuestionOption } from "../types";

export const DESIGN_SERVICO_OPTIONS: QuestionOption[] = [
  { id: "identidade_visual", label: "Identidade Visual", description: "Logo, cores, tipografia e identidade da marca." },
  { id: "design_redes_sociais", label: "Design para Redes Sociais", description: "Artes, carrosséis, campanhas e conteúdos visuais." },
  { id: "gestao_social_media", label: "Gestão de Social Media", description: "Planejamento, conteúdo e gestão das redes." },
  { id: "criativos_anuncios", label: "Criativos para Anúncios", description: "Peças pensadas especificamente para campanhas." },
  {
    id: "edicao_video",
    label: "Edição de Vídeo",
    description: "Reels, vídeos promocionais e montagens a partir de vídeos, fotos ou materiais que você já possui.",
  },
  // Rótulo voltado ao cliente atualizado no alinhamento pré-Etapa 8 (antes "Quero combinar
  // serviços") — o id interno não muda (ver docs/DECISIONS.md).
  { id: "quero_combinar_servicos", label: "Montar um pacote" },
];

const DESIGN_SERVICO: Question = {
  id: "design_servico",
  service: "design",
  title: "O que sua marca precisa?",
  type: "single_choice",
  required: true,
  options: DESIGN_SERVICO_OPTIONS,
};

// Reaproveita o mesmo campo `design_servico`, agora como lista, quando o visitante escolhe
// "Montar um pacote" em vez de um novo campo dedicado.
const DESIGN_SERVICO_COMBO: Question = {
  id: "design_servico",
  service: "design",
  title: "Quais serviços você quer incluir no seu pacote?",
  type: "multi_choice",
  required: true,
  options: DESIGN_SERVICO_OPTIONS.filter((option) => option.id !== "quero_combinar_servicos"),
};

const MARCA_IDENTIDADE_QUESTION: Question = {
  id: "marca_identidade",
  service: "design",
  title: "Sua marca já possui uma identidade visual?",
  type: "single_choice",
  required: true,
  options: [
    { id: "sim", label: "Sim" },
    { id: "parcialmente", label: "Parcialmente" },
    { id: "nao", label: "Não" },
  ],
};

interface DesignStep {
  fieldId: string;
  build: () => Question;
}

const IDENTIDADE_STEPS: DesignStep[] = [
  {
    fieldId: "identidade_situacao",
    build: () => ({
      id: "identidade_situacao",
      service: "design",
      title: "Como está sua marca hoje?",
      type: "single_choice",
      required: true,
      options: [
        { id: "sem_identidade", label: "Ainda não tenho identidade" },
        { id: "basico_profissionalizar", label: "Tenho algo básico e quero profissionalizar" },
        { id: "tenho_quero_renovar", label: "Já tenho identidade e quero renovar" },
      ],
    }),
  },
  {
    fieldId: "identidade_escopo",
    build: () => ({
      id: "identidade_escopo",
      service: "design",
      title: "O que você procura?",
      type: "single_choice",
      required: true,
      options: [
        { id: "identidade_essencial", label: "Identidade essencial", description: "Logo, paleta e tipografia." },
        { id: "identidade_completa", label: "Identidade completa", description: "Sistema visual mais estruturado e aplicações." },
        { id: "nao_sei_qual", label: "Ainda não sei qual preciso" },
      ],
    }),
  },
];

const DESIGN_REDES_STEPS: DesignStep[] = [
  {
    fieldId: "design_formato",
    build: () => ({
      id: "design_formato",
      service: "design",
      title: "O que você procura?",
      type: "single_choice",
      required: true,
      options: [
        { id: "pacote_artes", label: "Pacote de artes", description: "Quantidade definida de peças." },
        { id: "conteudo_recorrente", label: "Conteúdo recorrente", description: "Artes produzidas continuamente." },
        { id: "campanha_especifica", label: "Campanha específica", description: "Lançamento, promoção, evento ou ação específica." },
      ],
    }),
  },
  { fieldId: "marca_identidade", build: () => MARCA_IDENTIDADE_QUESTION },
];

const GESTAO_SOCIAL_STEPS: DesignStep[] = [
  {
    fieldId: "social_necessidade",
    build: () => ({
      id: "social_necessidade",
      service: "design",
      title: "O que você precisa?",
      type: "single_choice",
      required: true,
      options: [
        { id: "planejamento_conteudo", label: "Planejamento + conteúdo" },
        { id: "criacao_recorrente", label: "Criação de conteúdo recorrente" },
        { id: "gestao_completa", label: "Gestão mais completa das redes" },
        { id: "nao_sei", label: "Ainda não sei" },
      ],
    }),
  },
  { fieldId: "marca_identidade", build: () => MARCA_IDENTIDADE_QUESTION },
];

const CRIATIVOS_STEPS: DesignStep[] = [
  {
    fieldId: "criativos_formato",
    build: () => ({
      id: "criativos_formato",
      service: "design",
      title: "Que tipo de material você precisa?",
      type: "single_choice",
      required: true,
      options: [
        { id: "imagens", label: "Imagens" },
        { id: "videos", label: "Vídeos" },
        { id: "imagens_videos", label: "Imagens + vídeos" },
      ],
    }),
  },
  {
    fieldId: "criativos_material",
    build: () => ({
      id: "criativos_material",
      service: "design",
      title: "Você já possui os materiais da marca?",
      type: "single_choice",
      required: true,
      options: [
        { id: "tenho_tudo", label: "Sim, tenho tudo" },
        { id: "tenho_parte", label: "Tenho parte dos materiais" },
        { id: "preciso_desenvolver", label: "Preciso que a Upgrade desenvolva" },
      ],
    }),
  },
];

const VIDEO_STEPS: DesignStep[] = [
  {
    fieldId: "video_material",
    build: () => ({
      id: "video_material",
      service: "design",
      title: "Que material você possui?",
      type: "single_choice",
      required: true,
      options: [
        { id: "videos_gravados", label: "Vídeos gravados" },
        { id: "fotos_imagens", label: "Fotos e imagens" },
        { id: "videos_fotos", label: "Vídeos + fotos" },
        { id: "criar_materiais_graficos", label: "Preciso criar a partir de materiais gráficos" },
      ],
    }),
  },
  {
    fieldId: "video_destino",
    build: () => ({
      id: "video_destino",
      service: "design",
      title: "Para onde será esse conteúdo?",
      type: "single_choice",
      required: true,
      options: [
        { id: "redes_sociais_reels", label: "Redes sociais / Reels" },
        { id: "anuncios", label: "Anúncios" },
        { id: "apresentacao_produto_servico", label: "Apresentação de produto ou serviço" },
        { id: "outro", label: "Outro" },
      ],
    }),
  },
];

const STEPS_BY_SERVICE: Record<string, DesignStep[]> = {
  identidade_visual: IDENTIDADE_STEPS,
  design_redes_sociais: DESIGN_REDES_STEPS,
  gestao_social_media: GESTAO_SOCIAL_STEPS,
  criativos_anuncios: CRIATIVOS_STEPS,
  edicao_video: VIDEO_STEPS,
};

// Ordem usada para encadear os mini-fluxos quando "Montar um pacote" é escolhido.
// Segue a ordem em que os serviços aparecem na Pergunta 1.
const SERVICE_ORDER = [
  "identidade_visual",
  "design_redes_sociais",
  "gestao_social_media",
  "criativos_anuncios",
  "edicao_video",
];

/**
 * Resolve a sequência de perguntas a partir do(s) serviço(s) escolhido(s), eliminando
 * campos duplicados entre serviços combinados (ex.: `marca_identidade` aparece em mais
 * de um serviço, mas só é perguntada uma vez).
 */
export function resolveDesignSteps(designServico: string | string[] | undefined): DesignStep[] {
  const ids = designServico === undefined ? [] : Array.isArray(designServico) ? designServico : [designServico];
  const orderedIds = SERVICE_ORDER.filter((id) => ids.includes(id));
  const seenFields = new Set<string>();
  const steps: DesignStep[] = [];
  for (const serviceId of orderedIds) {
    for (const step of STEPS_BY_SERVICE[serviceId] ?? []) {
      if (seenFields.has(step.fieldId)) continue;
      seenFields.add(step.fieldId);
      steps.push(step);
    }
  }
  return steps;
}

/**
 * Lista declarativa de todas as perguntas possíveis de Design/Social Media — usada por
 * `getServiceQuestions` para introspecção (visibilidade, invalidação em cascata). A visibilidade
 * de cada pergunta específica de serviço é derivada de `resolveDesignSteps`, a mesma fonte de
 * verdade usada pelo dispatcher de navegação abaixo.
 */
export const DESIGN_QUESTIONS: Question[] = [
  DESIGN_SERVICO,
  ...Object.values(STEPS_BY_SERVICE)
    .flat()
    .filter((step, index, all) => all.findIndex((s) => s.fieldId === step.fieldId) === index)
    .map((step): Question => {
      const question = step.build();
      return {
        ...question,
        condition: (answers) =>
          resolveDesignSteps(answers.design_servico as string | string[] | undefined).some(
            (resolved) => resolved.fieldId === step.fieldId,
          ),
      };
    }),
];

/**
 * Determina a próxima pergunta do fluxo de Design/Social Media com base nas respostas já dadas.
 * Retorna null quando o mini-fluxo está completo.
 */
export function getNextDesignQuestion(answers: BuilderAnswers): Question | null {
  if (!answers.design_servico) return DESIGN_SERVICO;

  if (answers.design_servico === "quero_combinar_servicos") {
    return DESIGN_SERVICO_COMBO;
  }

  const steps = resolveDesignSteps(answers.design_servico as string | string[]);
  for (const step of steps) {
    if (!answers[step.fieldId]) {
      return step.build();
    }
  }
  return null;
}

export function estimateDesignTotalSteps(answers: BuilderAnswers): number {
  if (!answers.design_servico) return 1;
  if (answers.design_servico === "quero_combinar_servicos") return 2;
  return 1 + resolveDesignSteps(answers.design_servico as string | string[]).length;
}

/** Usado apenas para montar o resumo final — encontra a pergunta dona de um campo já respondido. */
export function getDesignQuestionByField(fieldId: string): Question | undefined {
  for (const steps of Object.values(STEPS_BY_SERVICE)) {
    const step = steps.find((s) => s.fieldId === fieldId);
    if (step) return step.build();
  }
  return undefined;
}

export const DESIGN_SERVICO_QUESTION = DESIGN_SERVICO;

export { MARCA_IDENTIDADE_QUESTION };
