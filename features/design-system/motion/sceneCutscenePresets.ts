/**
 * Presets da cutscene de troca de cena (`SceneCutscene.tsx`). O motor (uma única timeline GSAP) é
 * sempre o mesmo — cada preset muda só cores, geometria (`variant`, lida pelo CSS via
 * `data-variant`) e tempos. Novo preset = nova entrada aqui, nunca uma timeline nova.
 *
 * Cores de acento: verde da Upgrade para Site; roxo e azul medidos direto das artes dos cards de
 * "Escolha o seu Upgrade" (`public/builder/service-select/card-trafego.png` / `card-design.png`,
 * cor saturada dominante de cada PNG) — nunca uma cor nova inventada.
 */
export type SceneCutsceneVariant = "default";

export interface SceneCutscenePreset {
  /** Camada de acento (entra primeiro, sai por último — aparece só como faixa nas bordas). */
  accent: string;
  /** Camada principal, a que de fato cobre a viewport inteira. */
  base: string;
  variant: SceneCutsceneVariant;
  coverDuration: number;
  revealDuration: number;
  /** Quanto a segunda camada começa depois da primeira (sobreposição, nunca em sequência). */
  layerOffset: number;
  /** Respiro com a tela 100% coberta, logo depois da troca de conteúdo. */
  hold: number;
  ease: string;
}

const BASE_PRESET: SceneCutscenePreset = {
  accent: "#2db958",
  base: "#0a0c0b",
  variant: "default",
  coverDuration: 0.5,
  revealDuration: 0.55,
  layerOffset: 0.13,
  hold: 0.08,
  ease: "power3.inOut",
};

export const SCENE_CUTSCENE_PRESETS = {
  default: BASE_PRESET,
  site: { ...BASE_PRESET, accent: "#2db958" },
  traffic: { ...BASE_PRESET, accent: "#8225c1" },
  design: { ...BASE_PRESET, accent: "#027ecf" },
} satisfies Record<string, SceneCutscenePreset>;

export type SceneCutscenePresetName = keyof typeof SCENE_CUTSCENE_PRESETS;
