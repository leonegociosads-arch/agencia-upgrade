// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { isSoundEnabled, playSound, setSoundEnabled, SOUND_ENABLED_CHANGE_EVENT, type SoundEvent } from "./sound";

const ALL_EVENTS: SoundEvent[] = [
  "card_select",
  "scene_advance",
  "scene_back",
  "confirm",
  "service_complete",
  "panel_open",
  "panel_close",
  "ui_press",
  "success",
  "hover_special",
];

describe("sound (Motion Design → GSAP e Transições → Microinterações)", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it("começa desligado por padrão (opt-in, não opt-out)", () => {
    expect(isSoundEnabled()).toBe(false);
  });

  it("persiste a preferência do usuário", () => {
    setSoundEnabled(true);
    expect(isSoundEnabled()).toBe(true);

    setSoundEnabled(false);
    expect(isSoundEnabled()).toBe(false);
  });

  it("setSoundEnabled despacha o evento de mudança (para useSoundEnabled reagir)", () => {
    const listener = vi.fn();
    window.addEventListener(SOUND_ENABLED_CHANGE_EVENT, listener);
    setSoundEnabled(true);
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(SOUND_ENABLED_CHANGE_EVENT, listener);
  });

  it("playSound nunca lança erro para nenhum evento, ligado ou desligado (jsdom não tem Web Audio — síntese vira no-op seguro)", () => {
    for (const event of ALL_EVENTS) {
      expect(() => playSound(event)).not.toThrow();
    }
    setSoundEnabled(true);
    for (const event of ALL_EVENTS) {
      expect(() => playSound(event)).not.toThrow();
    }
  });
});
