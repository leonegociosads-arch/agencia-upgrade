/**
 * Presets da cutscene de troca de cena (`SceneCutscene.tsx`). O motor (uma única timeline GSAP) e a
 * geometria (`sceneCutsceneGeometry.ts`) são sempre os mesmos — cada preset muda só cor e tempos.
 *
 * Cores de acento: verde da Upgrade para Site; roxo e azul medidos direto das artes dos cards de
 * "Escolha o seu Upgrade" (`public/builder/service-select/card-trafego.png` / `card-design.png`,
 * cor saturada dominante de cada PNG) — nunca uma cor nova inventada.
 */
export interface SceneCutscenePreset {
  accent: string;
  base: string;
  /** Passagem do desenho de fechamento (ponta entra embaixo → massa preta cobre a tela). */
  coverDuration: number;
  /** Preto absoluto depois da troca de conteúdo. */
  hold: number;
  /** Passagem do desenho invertido de abertura. */
  revealDuration: number;
  ease: string;
}

const BASE_PRESET: SceneCutscenePreset = {
  accent: "#2db958",
  base: "#000000",
  coverDuration: 0.75,
  hold: 0.3,
  revealDuration: 0.8,
  ease: "power3.inOut",
};

export const SCENE_CUTSCENE_PRESETS = {
  default: BASE_PRESET,
  site: { ...BASE_PRESET, accent: "#2db958" },
  traffic: { ...BASE_PRESET, accent: "#8225c1" },
  design: { ...BASE_PRESET, accent: "#027ecf" },
} satisfies Record<string, SceneCutscenePreset>;

export type SceneCutscenePresetName = keyof typeof SCENE_CUTSCENE_PRESETS;
