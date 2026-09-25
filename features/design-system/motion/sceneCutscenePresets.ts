import type { SceneCutsceneVariant } from "./sceneCutsceneGeometry";

/**
 * Presets da cutscene de troca de cena (`SceneCutscene.tsx`). O motor (uma única timeline GSAP) é
 * sempre o mesmo — cada preset muda só cores, geometria (`variant`, em `sceneCutsceneGeometry.ts`)
 * e velocidade. Novo preset = nova entrada aqui, nunca uma timeline nova.
 *
 * Cores de acento: verde da Upgrade para Site; roxo e azul medidos direto das artes dos cards de
 * "Escolha o seu Upgrade" (`public/builder/service-select/card-trafego.png` / `card-design.png`,
 * cor saturada dominante de cada PNG) — nunca uma cor nova inventada.
 */
export interface SceneCutscenePreset {
  accent: string;
  base: string;
  variant: SceneCutsceneVariant;
  /** Multiplica todos os tempos da geometria (1 = normal, <1 = mais rápido). */
  speed: number;
  /** Respiro com a tela 100% coberta, logo depois da troca de conteúdo. */
  hold: number;
  ease: string;
}

const BASE_PRESET: SceneCutscenePreset = {
  accent: "#2db958",
  base: "#000000",
  variant: "peaks",
  speed: 1,
  hold: 0.1,
  ease: "power2.inOut",
};

export const SCENE_CUTSCENE_PRESETS = {
  default: BASE_PRESET,
  site: { ...BASE_PRESET, accent: "#2db958" },
  traffic: { ...BASE_PRESET, accent: "#8225c1" },
  design: { ...BASE_PRESET, accent: "#027ecf" },
} satisfies Record<string, SceneCutscenePreset>;

export type SceneCutscenePresetName = keyof typeof SCENE_CUTSCENE_PRESETS;
