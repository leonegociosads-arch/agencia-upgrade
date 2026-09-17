/**
 * Configuração das regras do Lead Score (Fase 15) — centralizada aqui de propósito ("não espalhar
 * números pelo código"). Ver `docs/LEAD-SCORE.md` para o racional completo de cada peso.
 *
 * Usa os serviços/perguntas REAIS de `features/builder/data/*` (site/trafego/design) — não os
 * `PRICE_SIGNAL`/`LEAD_SCORE_SIGNAL` mais antigos de `docs/BUSINESS-RULES.md`, que descreviam um
 * Builder anterior à simplificação da Fase 8 (campos como `trafego_negocio`/`design_formato` como
 * sinal de score, ou uma pergunta de "abrangência", não existem mais nesse papel).
 */

/** Sobe quando as regras abaixo mudarem de forma que um score antigo deixaria de ser comparável. */
export const LEAD_SCORE_VERSION = 1;

/** Limites de tier — única fonte de verdade (nunca duplicar esses números em outro arquivo). */
export const LEAD_SCORE_TIER_THRESHOLDS = {
  PRIORITY: 80,
  HIGH: 60,
  MEDIUM: 30,
} as const;

/**
 * Dados extraídos do `ProjectSnapshot` que as regras abaixo avaliam — nunca dados de contato
 * (`docs/LEAD-SCORE.md`: "dados de contato raramente devem influenciar score").
 */
export interface LeadScoreContext {
  serviceCount: number;
  siteTipo?: string;
  trafegoInvestimento?: string;
  trafegoExperiencia?: string;
  designServico?: string | string[];
}

export interface LeadScoreRule {
  ruleId: string;
  points: number;
  /** Só para leitura interna/auditoria — nunca exibida ao cliente. */
  description: string;
  condition: (ctx: LeadScoreContext) => boolean;
}

/**
 * Regras — quantidade limitada e compreensível, de propósito (evita "dezenas de regras
 * pequenas"). Cada característica é pontuada uma única vez (evita double counting): `serviceDraft`
 * nunca entra aqui, só respostas confirmadas via `ProjectSnapshot`.
 */
export const LEAD_SCORE_RULES: LeadScoreRule[] = [
  // Quantidade de serviços confirmados — potencial comercial de um projeto combinado. Escolhida
  // como a ÚNICA forma de pontuar "multisserviço" (o briefing describe um bônus adicional por
  // combinação como alternativa, não como soma — usar os dois contaria o mesmo sinal duas vezes).
  { ruleId: "SERVICE_COUNT_1", points: 6, description: "Projeto com 1 serviço confirmado.", condition: (ctx) => ctx.serviceCount === 1 },
  { ruleId: "SERVICE_COUNT_2", points: 14, description: "Projeto com 2 serviços confirmados.", condition: (ctx) => ctx.serviceCount === 2 },
  { ruleId: "SERVICE_COUNT_3", points: 22, description: "Projeto com 3 serviços confirmados.", condition: (ctx) => ctx.serviceCount === 3 },

  // Site — tipo escolhido (`site_tipo`). Único campo de Site pontuado: `site_recursos` e
  // `site_situacao` são sobre escopo/preço (PRICE_SIGNAL), não sobre prioridade comercial.
  { ruleId: "SITE_LANDING_PAGE", points: 5, description: "Site: Landing Page.", condition: (ctx) => ctx.siteTipo === "landing_page" },
  { ruleId: "SITE_INSTITUCIONAL", points: 9, description: "Site: Institucional.", condition: (ctx) => ctx.siteTipo === "site_institucional" },
  { ruleId: "SITE_ECOMMERCE", points: 20, description: "Site: Loja Virtual / E-commerce.", condition: (ctx) => ctx.siteTipo === "ecommerce" },
  { ruleId: "SITE_SISTEMA_PLATAFORMA", points: 26, description: "Site: Plataforma / Sistema.", condition: (ctx) => ctx.siteTipo === "sistema_plataforma" },
  { ruleId: "SITE_TIPO_NAO_SEI", points: 4, description: "Site: tipo ainda não definido.", condition: (ctx) => ctx.siteTipo === "nao_sei" },

  // Tráfego pago — investimento mensal informado (`trafego_investimento`): o sinal comercial mais
  // direto que existe hoje no Builder.
  { ruleId: "TRAFFIC_BUDGET_ATE_1000", points: 6, description: "Tráfego: até R$ 1.000/mês.", condition: (ctx) => ctx.trafegoInvestimento === "ate_1000" },
  { ruleId: "TRAFFIC_BUDGET_1000_3000", points: 12, description: "Tráfego: R$ 1.000 a R$ 3.000/mês.", condition: (ctx) => ctx.trafegoInvestimento === "de_1000_a_3000" },
  { ruleId: "TRAFFIC_BUDGET_3000_5000", points: 20, description: "Tráfego: R$ 3.000 a R$ 5.000/mês.", condition: (ctx) => ctx.trafegoInvestimento === "de_3000_a_5000" },
  { ruleId: "TRAFFIC_BUDGET_ACIMA_5000", points: 27, description: "Tráfego: acima de R$ 5.000/mês.", condition: (ctx) => ctx.trafegoInvestimento === "acima_5000" },
  { ruleId: "TRAFFIC_BUDGET_NAO_SEI", points: 4, description: "Tráfego: investimento ainda não definido.", condition: (ctx) => ctx.trafegoInvestimento === "nao_sei" },

  // Tráfego pago — já tem alguma experiência com anúncios (`trafego_experiencia`): mede maturidade
  // comercial, uma dimensão diferente do investimento (por isso soma, não substitui).
  {
    ruleId: "TRAFFIC_EXPERIENCE",
    points: 6,
    description: "Já anunciou antes (qualquer resultado) — mais maduro comercialmente que um primeiro anúncio.",
    condition: (ctx) => ctx.trafegoExperiencia !== undefined && ctx.trafegoExperiencia !== "nunca_anunciei",
  },

  // Design/Social — serviço escolhido (`design_servico`). "Montar um pacote" (`quero_combinar_servicos`)
  // vira uma lista de serviços — pontuado como bônus fixo de pacote, NUNCA somando cada item
  // individual de novo (evita double counting).
  { ruleId: "DESIGN_IDENTIDADE_VISUAL", points: 8, description: "Design: Identidade Visual.", condition: (ctx) => ctx.designServico === "identidade_visual" },
  { ruleId: "DESIGN_REDES_SOCIAIS", points: 4, description: "Design: Design para Redes Sociais (pontual).", condition: (ctx) => ctx.designServico === "design_redes_sociais" },
  { ruleId: "DESIGN_GESTAO_SOCIAL_MEDIA", points: 10, description: "Design: Gestão de Social Media.", condition: (ctx) => ctx.designServico === "gestao_social_media" },
  { ruleId: "DESIGN_CRIATIVOS_ANUNCIOS", points: 6, description: "Design: Criativos para Anúncios.", condition: (ctx) => ctx.designServico === "criativos_anuncios" },
  { ruleId: "DESIGN_EDICAO_VIDEO", points: 8, description: "Design: Edição de Vídeo.", condition: (ctx) => ctx.designServico === "edicao_video" },
  {
    ruleId: "DESIGN_PACOTE_COMPLETO",
    points: 15,
    description: "Design: pacote combinando múltiplos serviços ('Montar um pacote').",
    condition: (ctx) => Array.isArray(ctx.designServico) && ctx.designServico.length > 0,
  },
];
