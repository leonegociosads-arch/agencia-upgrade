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

export const SHOWCASE_THEMES: Readonly<Record<ServiceId, ShowcaseTheme>> = {
  site: { tag: "Site", accent: "#00f785" },
  trafego: { tag: "Tráfego pago", accent: "#00f785" },
  design: { tag: "Design", accent: "#00f785" },
};
