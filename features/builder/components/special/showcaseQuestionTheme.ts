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
 * Laboratório de cor + motion da cena especial (pedido do usuário): hoje SÓ a pergunta de
 * situação com anúncios do Tráfego Pago ganha a identidade roxa do caminho (camada atrás, post-it,
 * barra, seleção), a entrada/saída em timeline e o "Próxima" que só fica verde depois de escolher.
 * As outras cenas especiais (Site, Design e demais do Tráfego) seguem exatamente como estavam;
 * para testar em outra pergunta, basta incluir o id dela aqui.
 *
 * Regra de cor do Builder: ROXO = contexto do caminho + seleção · VERDE = avançar ("Próxima").
 */
const PURPLE_LAB_QUESTIONS: ReadonlySet<string> = new Set(["trafego_experiencia"]);

export function usesPurpleShowcase(question: { id: string }): boolean {
  return PURPLE_LAB_QUESTIONS.has(question.id);
}

/** Roxo do caminho Tráfego Pago (mesma família do card protagonista, `157,77,255` dos cards de
 * resposta) — usado só como acento; o painel continua branco. */
export const TRAFEGO_PURPLE_ACCENT = "#9d4dff";

export const SHOWCASE_THEMES: Readonly<Record<ServiceId, ShowcaseTheme>> = {
  site: { tag: "Site", accent: "#00f785" },
  trafego: { tag: "Tráfego pago", accent: "#00f785" },
  design: { tag: "Design", accent: "#00f785" },
};
