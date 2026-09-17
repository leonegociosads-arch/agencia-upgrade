// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { setSoundEnabled } from "./sound";
import { useSoundEnabled } from "./useSoundEnabled";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

function Probe() {
  const enabled = useSoundEnabled();
  return <span>{enabled ? "ligado" : "desligado"}</span>;
}

describe("useSoundEnabled", () => {
  it("reflete o estado atual de isSoundEnabled()", () => {
    render(<Probe />);
    expect(screen.getByText("desligado")).not.toBeNull();
  });

  it("reage a setSoundEnabled feito em outro lugar (via o evento de mudança)", () => {
    render(<Probe />);
    act(() => {
      setSoundEnabled(true);
    });
    expect(screen.getByText("ligado")).not.toBeNull();
  });
});
