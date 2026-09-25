import type { ServiceId } from "../../types";

/**
 * Configuração do fundo "núcleo de partículas" (`ParticleNucleusBackground`). Tudo que se ajusta
 * visualmente mora aqui — o componente só interpreta.
 */

type RGB = readonly [number, number, number];

export interface NucleusTheme {
  /** Centro e borda do fundo (gradiente radial escuro). */
  backgroundCenter: string;
  backgroundEdge: string;
  /** Cores das partículas (sorteadas por partícula). */
  particleColors: readonly RGB[];
  /** Cor do brilho do núcleo. */
  nucleusColor: RGB;
}

export const NUCLEUS_THEMES: Record<"default" | ServiceId, NucleusTheme> = {
  default: {
    backgroundCenter: "#061026",
    backgroundEdge: "#010207",
    particleColors: [
      [150, 200, 255],
      [90, 160, 255],
      [215, 232, 255],
    ],
    nucleusColor: [170, 210, 255],
  },
  // Nuances sutis por caminho — o azul continua dominante.
  site: {
    backgroundCenter: "#05141f",
    backgroundEdge: "#010306",
    particleColors: [
      [150, 210, 245],
      [110, 220, 200],
      [215, 240, 250],
    ],
    nucleusColor: [170, 235, 225],
  },
  trafego: {
    backgroundCenter: "#0a0c26",
    backgroundEdge: "#020108",
    particleColors: [
      [160, 180, 255],
      [150, 130, 255],
      [220, 220, 255],
    ],
    nucleusColor: [190, 180, 255],
  },
  design: {
    backgroundCenter: "#041326",
    backgroundEdge: "#010307",
    particleColors: [
      [130, 210, 255],
      [80, 190, 240],
      [210, 240, 255],
    ],
    nucleusColor: [160, 225, 255],
  },
};

export interface NucleusLayer {
  /** Fração das partículas nesta camada. */
  share: number;
  /** Raio do ponto, em px CSS (mín./máx.). */
  size: readonly [number, number];
  /** Opacidade máxima (mín./máx.). */
  alpha: readonly [number, number];
  /** Multiplicador da velocidade base. */
  speed: number;
  /** 0 = ponto nítido; 1 = bem desfocado (bokeh). */
  blur: number;
}

export const NUCLEUS_CONFIG = {
  /** Quantidade total de partículas por largura de tela. */
  density: { mobile: 500, tablet: 750, desktop: 1000 },
  /** Fração da distância centro→borda percorrida por segundo (antes da aceleração perto do núcleo). */
  speed: 0.085,
  /** Rotação leve do fluxo (rad/s) — dá sensação de redemoinho sem virar espiral. */
  swirl: 0.035,
  /** Brilho do núcleo (0–1) e seu raio em fração do menor lado da tela. */
  nucleusIntensity: 0.55,
  nucleusSize: 0.32,
  /** Pulsação lenta do núcleo (amplitude e período em s). */
  nucleusPulse: { amount: 0.12, period: 5 },
  /** Camadas de profundidade: fundo desfocado e lento, frente nítida e um pouco mais rápida. */
  layers: [
    { share: 0.3, size: [2.2, 4.4], alpha: [0.12, 0.28], speed: 0.6, blur: 1 },
    { share: 0.45, size: [1, 2], alpha: [0.35, 0.65], speed: 1, blur: 0.4 },
    { share: 0.25, size: [0.8, 1.5], alpha: [0.6, 0.95], speed: 1.35, blur: 0 },
  ] satisfies readonly NucleusLayer[],
  /** Limite de densidade de pixels do canvas (celulares Retina). */
  maxDpr: 2,
} as const;
