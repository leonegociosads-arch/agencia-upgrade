import type { MouseEvent } from "react";

/**
 * Proteção contra clique repetido que "atravessa" telas. Com movimento, a transição de cena já
 * segura novos cliques enquanto anima; com `prefers-reduced-motion` a troca de tela é instantânea,
 * e o 2º clique de um clique duplo cai no botão que acabou de aparecer no MESMO lugar — escolher um
 * caminho respondia a primeira pergunta sozinho, responder uma pergunta respondia a seguinte (bug
 * real, reproduzido em teste).
 *
 * O próprio navegador numera cliques seguidos no mesmo ponto (`event.detail`: 1, 2, 3…), mesmo
 * quando o alvo muda entre um e outro. Ações que TROCAM a tela (responder, voltar, próxima,
 * confirmar) ignoram o 2º clique em diante; um clique normal (1) e o teclado (0) passam sempre.
 * Nada de trava por tempo: não atrapalha quem clica de propósito em telas seguidas, nem o
 * carrossel do mobile, que conta com dois toques (fica de fora — só o destino ignora o repetido).
 */
export function isRepeatedClick(event: Pick<MouseEvent, "detail"> | undefined): boolean {
  return (event?.detail ?? 0) > 1;
}
