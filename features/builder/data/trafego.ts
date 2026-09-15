import type { BuilderAnswers, Question } from "../types";

const TRAFEGO_NEGOCIO: Question = {
  id: "trafego_negocio",
  service: "trafego",
  title: "O que você quer divulgar?",
  type: "single_choice",
  required: true,
  options: [
    { id: "negocio_local", label: "Negócio local", description: "Restaurante, clínica, academia, loja física e negócios locais." },
    { id: "delivery", label: "Delivery", description: "Restaurante, pizzaria, hamburgueria e negócios que recebem pedidos." },
    { id: "servicos", label: "Serviços", description: "Profissionais, empresas e prestadores de serviço." },
    { id: "ecommerce", label: "E-commerce", description: "Venda de produtos pela internet." },
    { id: "evento", label: "Evento", description: "Shows, festas, cursos, lançamentos ou eventos presenciais." },
    { id: "outro", label: "Outro" },
  ],
};

const TRAFEGO_DESTINO: Question = {
  id: "trafego_destino",
  service: "trafego",
  title: "Onde você quer gerar o resultado?",
  type: "single_choice",
  required: true,
  options: [
    { id: "whatsapp", label: "WhatsApp" },
    { id: "site_landing_page", label: "Site / Landing Page" },
    { id: "loja_virtual", label: "Loja Virtual" },
    { id: "delivery_plataforma", label: "Delivery / plataforma de pedidos" },
    { id: "nao_sei", label: "Ainda não sei" },
  ],
};

const TRAFEGO_EXPERIENCIA: Question = {
  id: "trafego_experiencia",
  service: "trafego",
  title: "Qual é sua situação atual com anúncios?",
  type: "single_choice",
  required: true,
  options: [
    { id: "nunca_anunciei", label: "Nunca anunciei" },
    { id: "anunciei_algumas_vezes", label: "Já anunciei algumas vezes" },
    { id: "anuncio_atualmente", label: "Já anuncio atualmente" },
    { id: "anunciei_sem_resultado", label: "Já anunciei, mas não tive bons resultados" },
  ],
};

const TRAFEGO_INVESTIMENTO: Question = {
  id: "trafego_investimento",
  service: "trafego",
  title: "Quanto pretende investir em anúncios por mês?",
  type: "single_choice",
  required: true,
  options: [
    { id: "ate_1000", label: "Até R$ 1.000" },
    { id: "de_1000_a_3000", label: "R$ 1.000 a R$ 3.000" },
    { id: "de_3000_a_5000", label: "R$ 3.000 a R$ 5.000" },
    { id: "acima_5000", label: "Acima de R$ 5.000" },
    { id: "nao_sei", label: "Ainda não sei" },
  ],
};

/** 4 perguntas fixas, sempre — nenhuma condição entre elas (ver docs/DECISIONS.md). */
export const TRAFEGO_QUESTIONS: Question[] = [
  TRAFEGO_NEGOCIO,
  TRAFEGO_DESTINO,
  TRAFEGO_EXPERIENCIA,
  TRAFEGO_INVESTIMENTO,
];

/**
 * Fluxo linear e fixo de Tráfego Pago: sempre as mesmas 4 perguntas, sem ramificação.
 * `trafego_investimento` pergunta o valor de investimento em mídia paga (não é orçamento do
 * projeto/contrato com a Upgrade) — ajuda a dimensionar a operação de anúncios.
 * Retorna null quando o mini-fluxo está completo.
 */
export function getNextTrafegoQuestion(answers: BuilderAnswers): Question | null {
  for (const question of TRAFEGO_QUESTIONS) {
    if (answers[question.id] === undefined) return question;
  }
  return null;
}

export function estimateTrafegoTotalSteps(): number {
  return TRAFEGO_QUESTIONS.length;
}
