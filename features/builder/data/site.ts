import type { BuilderAnswers, Question, QuestionOption } from "../types";

const SITE_TIPO_OPTIONS: QuestionOption[] = [
  {
    id: "landing_page",
    label: "Landing Page",
    description: "Uma página focada em apresentar uma oferta, produto ou serviço.",
  },
  {
    id: "site_institucional",
    label: "Site Institucional",
    description: "Para apresentar sua empresa, serviços, portfólio e informações.",
  },
  {
    id: "ecommerce",
    label: "Loja Virtual / E-commerce",
    description: "Produtos, catálogo, carrinho, pagamentos e pedidos.",
  },
  {
    id: "sistema_plataforma",
    label: "Plataforma / Sistema",
    description: "Área do cliente, login, painel, automações ou funções personalizadas.",
  },
  {
    id: "nao_sei",
    label: "Ainda não sei",
    description: "A Upgrade ajuda a identificar o formato ideal.",
  },
];

function siteRecursosOptions(answers: BuilderAnswers): QuestionOption[] {
  const tipo = answers.site_tipo as string | undefined;
  switch (tipo) {
    case "landing_page":
    case "site_institucional":
      return [
        { id: "apresentacao_contato", label: "Somente apresentação e contato" },
        { id: "formularios_leads", label: "Formulários ou captação de leads" },
        { id: "agendamento_orcamento", label: "Agendamento ou solicitação de orçamento" },
        { id: "integracoes_ferramentas", label: "Integrações com outras ferramentas" },
      ];
    case "ecommerce":
      return [
        { id: "catalogo_pedidos", label: "Catálogo e pedidos" },
        { id: "pagamento_online", label: "Pagamento online" },
        { id: "area_cliente", label: "Área do cliente" },
        { id: "integracoes_estoque_pagamentos", label: "Integrações com estoque, pagamentos ou outros sistemas" },
      ];
    case "sistema_plataforma":
      return [
        { id: "login_area_restrita", label: "Login / área restrita" },
        { id: "painel_dashboard", label: "Painel ou dashboard" },
        { id: "pagamentos_assinaturas", label: "Pagamentos ou assinaturas" },
        { id: "integracao_outros_sistemas", label: "Integração com outros sistemas" },
      ];
    default:
      return [];
  }
}

const SITE_TIPO: Question = {
  id: "site_tipo",
  service: "site",
  title: "Que tipo de site você precisa?",
  type: "single_choice",
  options: SITE_TIPO_OPTIONS,
  required: true,
};

const SITE_RECURSOS: Question = {
  id: "site_recursos",
  service: "site",
  title: "O que esse projeto precisa ter?",
  type: "multi_choice",
  options: siteRecursosOptions,
  required: true,
  // SE site_tipo = "Ainda não sei" → não mostrar (nenhuma pergunta técnica extra).
  condition: (answers) => answers.site_tipo !== undefined && answers.site_tipo !== "nao_sei",
};

const SITE_SITUACAO: Question = {
  id: "site_situacao",
  service: "site",
  title: "Em que situação está esse projeto?",
  type: "single_choice",
  options: [
    { id: "criar_do_zero", label: "Vou criar do zero" },
    { id: "refazer", label: "Já tenho um site e quero refazer" },
    { id: "melhorar_expandir", label: "Já tenho algo funcionando e quero melhorar / expandir" },
  ],
  required: true,
};

/**
 * Lista declarativa das perguntas de Site, nesta ordem. Usada por `getServiceQuestions` para
 * introspecção (visibilidade, invalidação em cascata) — não é o dispatcher de navegação
 * (`getNextSiteQuestion` abaixo), que resolve diretamente por clareza e paridade com o
 * comportamento já aprovado desde a Etapa 3.
 */
export const SITE_QUESTIONS: Question[] = [SITE_TIPO, SITE_RECURSOS, SITE_SITUACAO];

/**
 * Determina a próxima pergunta do fluxo de Site com base nas respostas já dadas.
 * SE site_tipo = nao_sei → pula site_recursos (nenhuma pergunta técnica adicional).
 * Retorna null quando o mini-fluxo está completo.
 */
export function getNextSiteQuestion(answers: BuilderAnswers): Question | null {
  if (!answers.site_tipo) return SITE_TIPO;
  if (answers.site_tipo !== "nao_sei" && !answers.site_recursos) return SITE_RECURSOS;
  if (!answers.site_situacao) return SITE_SITUACAO;
  return null;
}

export function estimateSiteTotalSteps(answers: BuilderAnswers): number {
  return answers.site_tipo === "nao_sei" ? 2 : 3;
}
