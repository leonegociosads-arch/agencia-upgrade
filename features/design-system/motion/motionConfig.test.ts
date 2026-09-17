// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { DISTANCE, getSceneDistance } from "./motionConfig";

function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
}

describe("motionConfig — getSceneDistance (Seção 34: mobile tem menos deslocamento)", () => {
  const originalWidth = window.innerWidth;

  afterEach(() => {
    setViewportWidth(originalWidth);
  });

  it("usa a distância cheia em desktop", () => {
    setViewportWidth(1440);
    expect(getSceneDistance()).toBe(DISTANCE.scene);
  });

  it("reduz a distância abaixo do breakpoint mobile", () => {
    setViewportWidth(390);
    expect(getSceneDistance()).toBeLessThan(DISTANCE.scene);
    expect(getSceneDistance()).toBeGreaterThan(0);
  });
});
