// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import LeadFormBackdrop from "./LeadFormBackdrop";

function mockMatchMedia(reduce: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduce && query.includes("prefers-reduced-motion"),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
    onchange: null,
  })) as unknown as typeof window.matchMedia;
}

function getTrack(container: HTMLElement) {
  return container.querySelector<HTMLElement>('[data-testid="lead-form-backdrop"] > div:nth-child(1) > div');
}

afterEach(() => {
  cleanup();
});

describe("LeadFormBackdrop (fundo da tela de dados/envio)", () => {
  it("é só decoração: escondido de leitores de tela e sem imagem com texto alternativo", () => {
    mockMatchMedia(false);
    const { getByTestId } = render(<LeadFormBackdrop />);
    const root = getByTestId("lead-form-backdrop");
    expect(root.getAttribute("aria-hidden")).toBe("true");
    root.querySelectorAll("img").forEach((img) => expect(img.getAttribute("alt")).toBe(""));
  });

  it("emenda dois grupos idênticos (loop sem buraco) com os assets reais da identidade", () => {
    mockMatchMedia(false);
    const { container } = render(<LeadFormBackdrop />);
    const track = getTrack(container);
    expect(track?.children.length).toBe(2);
    const sources = (group: Element) => [...group.querySelectorAll("img")].map((img) => decodeURIComponent(img.getAttribute("src") ?? ""));
    const [first, second] = [...(track?.children ?? [])];
    expect(sources(first)).toEqual(sources(second));
    expect(sources(first).join(" ")).toMatch(/logo-mark\.png/);
    expect(sources(first).join(" ")).toMatch(/stars-green\.png/);
    expect(sources(first).join(" ")).toMatch(/summary-mascot\.png/);
  });

  it("anima a faixa na horizontal (GSAP) quando o motion não está reduzido", async () => {
    mockMatchMedia(false);
    const { container } = render(<LeadFormBackdrop />);
    const track = getTrack(container);
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(track?.style.transform).toMatch(/translate/);
    expect(track?.style.transform).not.toMatch(/translate\(0%/);
  });

  it("com prefers-reduced-motion mantém o desenho parado, só deslocado (identidade preservada)", async () => {
    mockMatchMedia(true);
    const { container } = render(<LeadFormBackdrop />);
    const track = getTrack(container);
    const first = track?.style.transform;
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(track?.style.transform).toBe(first);
    expect(track?.children.length).toBe(2);
  });

  it("desmontar limpa a animação: remontar não acumula faixas", () => {
    mockMatchMedia(false);
    const first = render(<LeadFormBackdrop />);
    first.unmount();
    const second = render(<LeadFormBackdrop />);
    expect(second.container.querySelectorAll('[data-testid="lead-form-backdrop"]').length).toBe(1);
    expect(document.querySelectorAll('[data-testid="lead-form-backdrop"]').length).toBe(1);
  });
});
