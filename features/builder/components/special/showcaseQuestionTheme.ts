import type { ServiceId } from "../../types";

/**
 * Tudo que muda por categoria na cena especial (`ShowcaseQuestionPanel`) — um único lugar. O painel
 * continua claro/branco em todas as categorias (o charme da cena é o contraste com o fundo escuro);
 * a categoria só aparece na aba estilo browser e no acento pontual (opção selecionada, barra de
 * progresso). Hoje as três usam o verde da referência aprovada, que é também a cor do botão
 * "Próxima" (asset em PNG, não recolorível); para seguir a cor de cada caminho, basta trocar
 * `accent` aqui.
 */
export interface ShowcaseTheme {
  /** Texto da aba estilo browser no topo do painel. */
  tag: string;
  /** Acento pontual (opção selecionada, barra de progresso). */
  accent: string;
}

/**
 * Laboratório de cor + motion da cena especial (pedido do usuário): as cenas especiais do Tráfego
 * Pago (roxo) e do Design e Social Media (azul) ganham a identidade do próprio caminho (camada
 * atrás, post-it, barra, seleção), a entrada/saída em timeline e o "Próxima" que só fica verde
 * depois de escolher. A cena especial do Site continua exatamente como estava (verde, entrada
 * antiga); para testar em outra pergunta, basta incluir o id dela aqui.
 *
 * Regra de cor do Builder: COR DO CAMINHO = contexto + seleção · VERDE = avançar ("Próxima").
 */
export type ShowcaseLabVariant = "purple" | "blue";

const SHOWCASE_LAB_QUESTIONS: Readonly<Record<string, ShowcaseLabVariant>> = {
  trafego_experiencia: "purple",
  identidade_situacao: "blue",
  design_formato: "blue",
  social_necessidade: "blue",
  criativos_formato: "blue",
  video_material: "blue",
};

export function getShowcaseLabVariant(question: { id: string }): ShowcaseLabVariant | null {
  return SHOWCASE_LAB_QUESTIONS[question.id] ?? null;
}

/** Acento de cada variante (mesma família dos cards protagonistas de Tráfego e de Design) — só
 * acento; o painel continua branco. */
export const SHOWCASE_LAB_ACCENTS: Readonly<Record<ShowcaseLabVariant, string>> = {
  purple: "#9d4dff",
  blue: "#389cff",
};

/** Post-it recolorido de cada variante (mesma arte, só a cor do papel muda). */
export const SHOWCASE_LAB_POST_IT: Readonly<Record<ShowcaseLabVariant, string>> = {
  purple: "/assets/builder/special-question/sticky-note-purple.png",
  blue: "/assets/builder/special-question/sticky-note-blue.png",
};

export const SHOWCASE_THEMES: Readonly<Record<ServiceId, ShowcaseTheme>> = {
  site: { tag: "Site", accent: "#00f785" },
  trafego: { tag: "Tráfego pago", accent: "#00f785" },
  design: { tag: "Design", accent: "#00f785" },
};
