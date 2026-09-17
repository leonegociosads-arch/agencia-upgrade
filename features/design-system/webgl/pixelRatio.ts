/**
 * Limita o pixel ratio usado pelo `WebGLRenderer` (Fase 3D/WebGL, Seção 26 do briefing: "não
 * renderizar cegamente em `devicePixelRatio` máximo"). Telas 3x/4x (a maioria dos celulares
 * modernos) fariam o canvas renderizar 9-16x mais pixels que uma tela comum sem nenhum ganho
 * visual perceptível nos efeitos desta fase (formas simples, sem texto fino dentro do canvas) —
 * puro desperdício de GPU.
 *
 * Teto mais baixo em ponteiro grosso (`isCoarsePointer`, Seção 27: "mobile deve ter versão mais
 * leve... resolução menor") — mobile já soma outros custos (menos memória, throttling térmico mais
 * agressivo) que um desktop não tem.
 */
export function getSafePixelRatio(isCoarsePointer: boolean): number {
  const raw = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
  const ceiling = isCoarsePointer ? 1.5 : 2;
  return Math.min(raw, ceiling);
}
