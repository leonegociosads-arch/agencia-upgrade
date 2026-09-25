/**
 * Geometria da cutscene (`SceneCutscene.tsx`) — três picos (esquerdo, central, direito) do MESMO
 * tamanho, espelhados em relação ao centro, mais uma quarta placa (`blackCover`) puramente preta e
 * sem pico (retângulo) que garante o blackout de verdade.
 *
 * Empilhamento: a ordem deste array É a ordem de pintura no DOM (nenhum `z-index` explícito
 * necessário) — `left`/`right` primeiro (atrás), `center` depois (na frente dos dois, mesmo
 * tamanho, só prioridade de camada), `blackCover` por último (sempre no topo). Enquanto o
 * `blackCover` ainda cobre um trecho da tela, QUALQUER contorno/faixa de acento dos três picos
 * embaixo dele fica oculto ali — é isso que garante "tela 100% preta, sem linha residual" durante
 * o blackout, sem depender de nenhum elemento decorativo próprio para essa fase.
 *
 * Cada peça é uma PLACA da altura da viewport: pico em cima (borda de ataque ao cobrir) e o mesmo
 * pico espelhado embaixo (borda de saída ao revelar) — por ter corpo inteiro, nenhuma defasagem de
 * tempo entre peças abre fresta.
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
  cover: CutsceneTiming;
  reveal: CutsceneTiming;
}

export interface CutsceneGeometry {
  /** Altura da faixa acima/abaixo do corpo onde vivem os picos, em `--u`. */
  cap: number;
  /** Ordem = ordem de pintura (primeiro fica atrás; `blackCover` por último = sempre no topo). */
  pieces: CutscenePiece[];
}

// Mesmo apexH/halfWidth nos três picos (só o `blackCover` é achatado, apexH: 0 — vira um retângulo
// simples, sem geometria própria, pela mesma função `piecePolygon`). `left`/`right` espelhados de
// verdade: mesmo deslocamento (25) para cada lado do centro (50), mesmos rings.
// `halfWidth` deliberadamente PEQUENO comparado ao `PEAK_OFFSET` (só uma sobra de ~10-15% pra cada
// lado) — com um `halfWidth` grande (a versão anterior, 55, quase o dobro do offset) o pico
// CENTRAL, sendo pintado por cima, cobria a largura inteira dos dois laterais por baixo dele e os
// apagava da composição inteira (não só na região de sobreposição pretendida) — os três "picos"
// visíveis colapsavam num só. Com os três do mesmo tamanho e uma sobreposição rasa nas bordas
// internas, o central só fica na frente ONDE de fato se cruzam, exatamente como a referência.
const PEAK_OFFSET = 25;
const PEAK_APEX_H = 19;
const PEAK_HALF_WIDTH = 30;
const LATERAL_RINGS: CutsceneRing[] = [
  { color: "base", inset: 0 },
  { color: "accent", inset: 0.42 },
  { color: "base", inset: 3.4 },
];

// Cobrir: central mais rápida (chega primeiro), direita intermediária, esquerda mais lenta —
// diferenças de 30-70ms, convergindo para a composição completa. `blackCover` só começa a subir
// depois que os três picos já estão bem adiantados e termina DEPOIS de todos — é essa folga que
// garante blackout sólido assim que ele chega, sem nenhum picos de cor escapando.
// Revelar: espelhado — `blackCover` sai PRIMEIRO (a tela já está preta pelos próprios picos, nada
// muda ainda), só depois os picos saem (central mais rápida de novo) revelando a cena nova com a
// mesma respiração de cor que a entrada teve, agora ao contrário.
const PEAKS: CutsceneGeometry = {
  // Precisa ficar acima do maior `apexH` (19) com folga — mesmo valor do `--cap` fixo em
  // `SceneCutscene.module.css` (a folha não lê este campo; mantido igual só para não confundir).
  cap: 23,
  pieces: [
    {
      id: "left",
      apexX: 50 - PEAK_OFFSET,
      apexH: PEAK_APEX_H,
      halfWidth: PEAK_HALF_WIDTH,
      rings: LATERAL_RINGS,
      cover: { delay: 0.07, duration: 0.52 },
      reveal: { delay: 0.14, duration: 0.5 },
    },
    {
      id: "right",
      apexX: 50 + PEAK_OFFSET,
      apexH: PEAK_APEX_H,
      halfWidth: PEAK_HALF_WIDTH,
      rings: LATERAL_RINGS,
      cover: { delay: 0.035, duration: 0.5 },
      reveal: { delay: 0.09, duration: 0.48 },
    },
    {
      id: "center",
      apexX: 50,
      apexH: PEAK_APEX_H,
      halfWidth: PEAK_HALF_WIDTH,
      rings: [
        { color: "accent", inset: 0 },
        { color: "base", inset: 0.32 },
      ],
      cover: { delay: 0, duration: 0.48 },
      reveal: { delay: 0.05, duration: 0.46 },
    },
    {
      id: "black-cover",
      apexX: 50,
      apexH: 0,
      halfWidth: 50,
      rings: [{ color: "base", inset: 0 }],
      cover: { delay: 0.11, duration: 0.5 },
      reveal: { delay: 0, duration: 0.42 },
    },
  ],
};

export const CUTSCENE_GEOMETRY = { peaks: PEAKS } satisfies Record<string, CutsceneGeometry>;

export type SceneCutsceneVariant = keyof typeof CUTSCENE_GEOMETRY;

const u = (value: number) => `${value.toFixed(2)} * var(--u)`;

/**
 * Polígono da placa: pico no topo, corpo, e o mesmo pico espelhado embaixo. `inset` (anéis do
 * contorno) só encurta a PONTA do pico — os quatro pontos do lado plano (`h: 0`) ficam sempre na
 * mesma borda (`cap` exato), nos anéis todos. Isso é o que faz o contorno/faixa de acento aparecer
 * só perto da ponta do pico, tracejando a lateral inclinada — se o lado plano também deslizasse com
 * o `inset` (como numa primeira versão), cada anel formava um retângulo concêntrico próprio, e a
 * cor do meio (`accent`) ficava permanentemente exposta como uma FAIXA HORIZONTAL colada na borda
 * plana do palco inteiro — visível sempre que esse palco estivesse em repouso cobrindo a tela,
 * inclusive durante o blackout (a "linha residual" que não podia aparecer).
 */
export function piecePolygon(piece: CutscenePiece, inset: number): string {
  const left = piece.apexX - piece.halfWidth;
  const right = piece.apexX + piece.halfWidth;
  const flatTop = `var(--cap)`;
  const flatBottom = `calc(100% - var(--cap))`;
  const apexTop = `calc(var(--cap) - ${u(piece.apexH - inset)})`;
  const apexBottom = `calc(100% - var(--cap) + ${u(piece.apexH - inset)})`;
  const points = [
    [`0%`, flatTop],
    [`${left}%`, flatTop],
    [`${piece.apexX}%`, apexTop],
    [`${right}%`, flatTop],
    [`100%`, flatTop],
    [`100%`, flatBottom],
    [`${right}%`, flatBottom],
    [`${piece.apexX}%`, apexBottom],
    [`${left}%`, flatBottom],
    [`0%`, flatBottom],
  ];
  return `polygon(${points.map(([x, y]) => `${x} ${y}`).join(", ")})`;
}
