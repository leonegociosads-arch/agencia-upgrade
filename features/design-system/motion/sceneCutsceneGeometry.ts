/**
 * Geometria e coreografia da cutscene (`SceneCutscene.tsx`).
 *
 * Dois grupos DOM independentes, com a mesma geometria (tamanho/distância em CSS:
 * `--triangle-width`, `--triangle-height`, `--triangle-offset`):
 * - `closing`: três triângulos apontando PARA CIMA (esquerdo, central, direito) — fecham a tela;
 * - `opening`: os mesmos três, apontando PARA BAIXO — abrem a tela.
 * O `blackCover` anda colado na base dos laterais (mesmo tempo que eles), então os triângulos
 * aparecem na borda da cortina preta. Só `y` é animado; X/tamanho nunca mudam.
 *
 * A abertura é o espelho temporal do fechamento: no fechamento o central sai na frente e os
 * laterais vêm juntos logo depois; na abertura os laterais saem juntos primeiro e o central logo
 * depois.
 */
export type CutsceneColor = "accent" | "base";

export interface CutsceneRing {
  color: CutsceneColor;
  /** Fração da altura do triângulo — anel desenhado como triângulo semelhante encolhido em
   * direção à base, então o contorno tem espessura uniforme nas duas laterais inclinadas. */
  inset: number;
}

export interface CutsceneTiming {
  delay: number;
  duration: number;
}

export interface CutsceneGeometry {
  /** Do anel externo (contorno) para o interno (preenchimento). */
  rings: { center: CutsceneRing[]; lateral: CutsceneRing[] };
  closing: { center: CutsceneTiming; laterals: CutsceneTiming };
  opening: { laterals: CutsceneTiming; center: CutsceneTiming };
}

const PEAKS: CutsceneGeometry = {
  rings: {
    center: [
      { color: "base", inset: 0 },
      { color: "accent", inset: 0.03 },
    ],
    lateral: [
      { color: "base", inset: 0 },
      { color: "accent", inset: 0.025 },
      { color: "base", inset: 0.18 },
    ],
  },
  // Stagger de 40ms com durações quase iguais: o central fica no máximo ~meio triângulo à frente
  // (atrás, na abertura) — sempre sobreposto aos laterais, nunca "descolado" da formação.
  closing: {
    center: { delay: 0, duration: 0.7 },
    laterals: { delay: 0.04, duration: 0.71 },
  },
  opening: {
    laterals: { delay: 0, duration: 0.71 },
    center: { delay: 0.04, duration: 0.7 },
  },
};

export const CUTSCENE_GEOMETRY = { peaks: PEAKS } satisfies Record<string, CutsceneGeometry>;

export type SceneCutsceneVariant = keyof typeof CUTSCENE_GEOMETRY;

export type TriangleDirection = "up" | "down";

const pct = (value: number) => `${Number(value.toFixed(3))}%`;

/** Triângulo (ou anel interno dele) ocupando a caixa inteira: ponta no centro, base na borda. */
export function trianglePolygon(inset: number, direction: TriangleDirection): string {
  const half = 50 * (1 - inset);
  const tip = direction === "up" ? inset * 100 : 100 - inset * 100;
  const base = direction === "up" ? 100 : 0;
  return `polygon(50% ${pct(tip)}, ${pct(50 + half)} ${pct(base)}, ${pct(50 - half)} ${pct(base)})`;
}
