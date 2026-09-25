/**
 * Geometria da cutscene (`SceneCutscene.tsx`) — reconstrução da referência "três picos" como UMA
 * peça. Coordenadas medidas no PNG de referência (1080px de largura) e normalizadas:
 * - x em % da largura da peça (`--scene-width`), sempre simétrico em torno de 50%;
 * - y em fração da altura da faixa de picos (`--peak-h`), 0 = ponta mais alta, 1 = linha de base
 *   onde a massa preta começa.
 * Todas as diagonais têm a mesma inclinação (`SLOPE`) — é isso que faz as camadas lerem como um
 * único desenho. A peça inteira se move como um bloco; nada aqui é animado individualmente.
 */
export type CutsceneColor = "accent" | "base";

export interface CutsceneRing {
  color: CutsceneColor;
  /** Deslocamento vertical do contorno para dentro, em fração de `--peak-h`. */
  inset: number;
}

export interface CutscenePeak {
  id: string;
  apexX: number;
  /** Altura da ponta, em fração de `--peak-h` a partir do topo. */
  apexY: number;
  /** Do anel externo (contorno) para o interno (preenchimento). */
  rings: CutsceneRing[];
}

/** Queda em fração de `--peak-h` para cada 1% de largura (referência: 0.831 em 50%). */
const SLOPE = 0.831 / 50;
/** Distância de cada pico lateral até o eixo central, em % da largura (média espelhada). */
const LATERAL_OFFSET = 23.4;

const LATERAL_RINGS: CutsceneRing[] = [
  { color: "base", inset: 0 },
  { color: "accent", inset: 0.0135 },
  { color: "base", inset: 0.082 },
];

/** Ordem = ordem de pintura (primeiro fica atrás). Contornos e faixas com metade da espessura da
 * referência (pedido do usuário: mais leve/elegante) — inclusive a faixa do pico central, cuja
 * ponta desceu para ficar a meio caminho da ponta do pico da frente. */
export const CUTSCENE_PEAKS: CutscenePeak[] = [
  {
    id: "back-center",
    apexX: 50,
    apexY: 0.0845,
    rings: [
      { color: "base", inset: 0 },
      { color: "accent", inset: 0.006 },
    ],
  },
  { id: "left", apexX: 50 - LATERAL_OFFSET, apexY: 0.182, rings: LATERAL_RINGS },
  { id: "right", apexX: 50 + LATERAL_OFFSET, apexY: 0.182, rings: LATERAL_RINGS },
  {
    id: "front",
    apexX: 50,
    apexY: 0.169,
    rings: [
      { color: "accent", inset: 0 },
      { color: "base", inset: 0.005 },
    ],
  },
];

const y = (fraction: number) => `calc(var(--peak-h) * ${Number(fraction.toFixed(4))})`;
const x = (percent: number) => `${Number(percent.toFixed(3))}%`;

/**
 * Região abaixo da silhueta do pico (ponta + duas diagonais), até a linha de base. O anel mais
 * interno (`isFill`) desce 2px para dentro da massa, cobrindo por inteiro a borda de baixo dos
 * anéis de trás — sem nenhum filete de cor aparecendo na linha de base.
 */
export function peakPolygon(peak: CutscenePeak, inset: number, isFill: boolean): string {
  const apexY = peak.apexY + inset;
  const reach = (1 - apexY) / SLOPE;
  const leftX = peak.apexX - reach;
  const rightX = peak.apexX + reach;
  const left: [number, number] = leftX < 0 ? [0, apexY + SLOPE * peak.apexX] : [leftX, 1];
  const right: [number, number] = rightX > 100 ? [100, apexY + SLOPE * (100 - peak.apexX)] : [rightX, 1];
  const bottom = isFill ? "calc(var(--peak-h) + 2px)" : "var(--peak-h)";
  const points = [
    `${x(left[0])} ${y(left[1])}`,
    `${x(peak.apexX)} ${y(apexY)}`,
    `${x(right[0])} ${y(right[1])}`,
    `${x(right[0])} ${bottom}`,
    `${x(left[0])} ${bottom}`,
  ];
  return `polygon(${points.join(", ")})`;
}
