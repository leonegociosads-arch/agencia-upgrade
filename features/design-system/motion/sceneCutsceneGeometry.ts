/**
 * Geometria da cutscene (`SceneCutscene.tsx`) — "três picos" interligados, reconstruídos só com
 * `clip-path: polygon()`. Cada peça é uma PLACA da altura da viewport: pico em cima (borda de
 * ataque ao cobrir) e o mesmo pico espelhado embaixo (borda de saída ao revelar, `scaleY(-1)`
 * conceitual). Por ter corpo inteiro, nenhuma defasagem de tempo entre peças abre fresta; a placa
 * da frente sozinha já cobre 100% da viewport no instante da troca.
 *
 * Unidades: x em % da largura; alturas em `--u` (unidade relativa à viewport, ver CSS), medidas a
 * partir da borda do corpo da placa. Contorno = anéis aninhados, cada um com o pico deslocado
 * `inset` para dentro (mesma inclinação, então a espessura fica uniforme nos lados inclinados).
 */
export type CutsceneColor = "accent" | "base";

export interface CutsceneRing {
  color: CutsceneColor;
  inset: number;
}

export interface CutsceneTiming {
  delay: number;
  duration: number;
}

export interface CutscenePiece {
  id: string;
  apexX: number;
  apexH: number;
  halfWidth: number;
  /** Do anel externo (contorno) para o interno (preenchimento). */
  rings: CutsceneRing[];
  bodyLines?: boolean;
  cover: CutsceneTiming;
  reveal: CutsceneTiming;
}

export interface CutsceneGeometry {
  /** Altura da faixa acima/abaixo do corpo onde vivem os picos, em `--u`. */
  cap: number;
  /** Ordem = ordem de pintura (primeiro fica atrás). */
  pieces: CutscenePiece[];
}

// Central mais rápida, direita intermediária, esquerda mais lenta; todas terminam juntas ao cobrir
// (0.56s). Na revelação a ordem se inverte: a central sai primeiro e a esquerda por último.
const PEAKS: CutsceneGeometry = {
  cap: 23,
  pieces: [
    {
      id: "back-center",
      apexX: 50,
      apexH: 21,
      halfWidth: 60,
      rings: [
        { color: "base", inset: 0 },
        { color: "accent", inset: 0.35 },
      ],
      cover: { delay: 0.045, duration: 0.515 },
      reveal: { delay: 0.015, duration: 0.5 },
    },
    {
      id: "left",
      apexX: 27,
      apexH: 17.3,
      halfWidth: 49,
      rings: [
        { color: "base", inset: 0 },
        { color: "accent", inset: 0.4 },
        { color: "base", inset: 3.4 },
      ],
      cover: { delay: 0, duration: 0.56 },
      reveal: { delay: 0.07, duration: 0.56 },
    },
    {
      id: "right",
      apexX: 74,
      apexH: 17.3,
      halfWidth: 49,
      rings: [
        { color: "base", inset: 0 },
        { color: "accent", inset: 0.4 },
        { color: "base", inset: 3.4 },
      ],
      cover: { delay: 0.03, duration: 0.53 },
      reveal: { delay: 0.035, duration: 0.53 },
    },
    {
      id: "front",
      apexX: 50,
      apexH: 17.5,
      halfWidth: 50,
      rings: [
        { color: "accent", inset: 0 },
        { color: "base", inset: 0.3 },
      ],
      bodyLines: true,
      cover: { delay: 0.06, duration: 0.5 },
      reveal: { delay: 0, duration: 0.48 },
    },
  ],
};

export const CUTSCENE_GEOMETRY = { peaks: PEAKS } satisfies Record<string, CutsceneGeometry>;

export type SceneCutsceneVariant = keyof typeof CUTSCENE_GEOMETRY;

const u = (value: number) => `${value.toFixed(2)} * var(--u)`;

/** Polígono da placa: pico no topo, corpo, e o mesmo pico espelhado embaixo. */
export function piecePolygon(piece: CutscenePiece, inset: number): string {
  const left = piece.apexX - piece.halfWidth;
  const right = piece.apexX + piece.halfWidth;
  const top = (h: number) => `calc(var(--cap) - ${u(h - inset)})`;
  const bottom = (h: number) => `calc(100% - var(--cap) + ${u(h - inset)})`;
  const points = [
    [`0%`, top(0)],
    [`${left}%`, top(0)],
    [`${piece.apexX}%`, top(piece.apexH)],
    [`${right}%`, top(0)],
    [`100%`, top(0)],
    [`100%`, bottom(0)],
    [`${right}%`, bottom(0)],
    [`${piece.apexX}%`, bottom(piece.apexH)],
    [`${left}%`, bottom(0)],
    [`0%`, bottom(0)],
  ];
  return `polygon(${points.map(([x, y]) => `${x} ${y}`).join(", ")})`;
}
