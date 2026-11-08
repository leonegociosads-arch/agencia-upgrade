// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ProjectMediaConfig } from "../types";
import ProjectMedia from "./ProjectMedia";

afterEach(cleanup);

const IMAGE_MEDIA: ProjectMediaConfig = {
  domain: "exemplo.com.br",
  desktop: { src: "/assets/projects/sm-design/desktop.webp", width: 1600, height: 1000, alt: "Tela principal" },
  mobile: { src: "/assets/projects/sm-design/mobile.webp", width: 600, height: 1298, alt: "Tela no celular" },
};

const VIDEO_MEDIA: ProjectMediaConfig = {
  ...IMAGE_MEDIA,
  video: { sources: [{ src: "/videos/demo.mp4", type: "video/mp4" }], label: "Navegação pelo catálogo" },
};

describe("ProjectMedia (Etapa Ver Projetos)", () => {
  it("modo imagem: mostra as duas telas com texto alternativo, o domínio e nenhum play falso", () => {
    render(<ProjectMedia media={IMAGE_MEDIA} projectName="Projeto" accent="#ff0000" />);

    expect(screen.getByAltText("Tela principal")).not.toBeNull();
    expect(screen.getByAltText("Tela no celular")).not.toBeNull();
    expect(screen.getByText("exemplo.com.br")).not.toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
    expect(document.querySelector("video")).toBeNull();
  });

  it("modo vídeo: só o pôster até o play; ao tocar, carrega o vídeo com controles", () => {
    const { container } = render(<ProjectMedia media={VIDEO_MEDIA} projectName="Projeto" accent="#ff0000" />);

    // Pôster visível, nenhum arquivo de vídeo pedido à rede antes da interação.
    expect(screen.getByAltText("Tela principal")).not.toBeNull();
    expect(container.querySelector("video")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /ver demonstração de projeto/i }));

    const video = container.querySelector("video");
    expect(video).not.toBeNull();
    expect(video?.hasAttribute("controls")).toBe(true);
    expect(video?.getAttribute("aria-label")).toBe("Navegação pelo catálogo (Projeto)");
    expect(video?.querySelector("source")?.getAttribute("src")).toBe("/videos/demo.mp4");
    expect(screen.queryByRole("button", { name: /ver demonstração/i })).toBeNull();
    // O botão sumiu: o foco vai para o player, não se perde no `body`.
    expect(document.activeElement).toBe(video);
  });

  it("autoplay pedido + movimento reduzido (padrão do ambiente de teste): não toca sozinho, oferece o play", () => {
    const media: ProjectMediaConfig = { ...VIDEO_MEDIA, video: { ...VIDEO_MEDIA.video!, autoplay: true } };
    const { container } = render(<ProjectMedia media={media} projectName="Projeto" accent="#ff0000" />);

    expect(container.querySelector("video")).toBeNull();
    expect(screen.getByRole("button", { name: /ver demonstração/i })).not.toBeNull();
  });
});

/**
 * Caminho completo do vídeo (sem movimento reduzido, com IntersectionObserver e um `<video>` que
 * toca/pausa de verdade, disparando `play`/`pause` como o navegador). jsdom não implementa mídia
 * nem IntersectionObserver; o padrão do setup é movimento reduzido ligado.
 */
describe("ProjectMedia — vídeo com autoplay (sem movimento reduzido)", () => {
  const AUTOPLAY_MEDIA: ProjectMediaConfig = { ...VIDEO_MEDIA, video: { ...VIDEO_MEDIA.video!, autoplay: true } };
  const originalMatchMedia = window.matchMedia;
  const originalPaused = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "paused");
  let observers: Array<(entries: Array<{ isIntersecting: boolean }>) => void> = [];

  function setInViewport(isIntersecting: boolean) {
    act(() => observers.forEach((callback) => callback([{ isIntersecting }])));
  }

  beforeEach(() => {
    observers = [];
    window.matchMedia = ((query: string) => ({ ...originalMatchMedia(query), matches: false })) as typeof window.matchMedia;
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(callback: (entries: Array<{ isIntersecting: boolean }>) => void) {
          observers.push(callback);
        }
        observe() {}
        disconnect() {}
      },
    );
    const paused = new WeakMap<HTMLMediaElement, boolean>();
    Object.defineProperty(HTMLMediaElement.prototype, "paused", {
      configurable: true,
      get(this: HTMLMediaElement) {
        return paused.get(this) ?? true;
      },
    });
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) {
      if (paused.get(this) !== false) {
        paused.set(this, false);
        this.dispatchEvent(new Event("play"));
      }
      return Promise.resolve();
    });
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (this: HTMLMediaElement) {
      if (paused.get(this) === false) {
        paused.set(this, true);
        this.dispatchEvent(new Event("pause"));
      }
    });
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    if (originalPaused) Object.defineProperty(HTMLMediaElement.prototype, "paused", originalPaused);
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("só carrega perto da tela; toca mudo, sem controles, e oferece pausa (WCAG 2.2.2)", () => {
    const { container } = render(<ProjectMedia media={AUTOPLAY_MEDIA} projectName="Projeto" accent="#ff0000" />);
    expect(container.querySelector("video")).toBeNull();

    setInViewport(true);
    const video = container.querySelector("video") as HTMLVideoElement;
    expect(video).not.toBeNull();
    expect(video.muted).toBe(true);
    expect(video.hasAttribute("controls")).toBe(false);
    expect(video.paused).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "Pausar demonstração de Projeto" }));
    expect(video.paused).toBe(true);
    expect(screen.getByRole("button", { name: "Tocar demonstração de Projeto" })).not.toBeNull();
  });

  it("fora da tela pausa e, de volta, retoma — no mesmo elemento, sem baixar de novo", () => {
    const { container } = render(<ProjectMedia media={AUTOPLAY_MEDIA} projectName="Projeto" accent="#ff0000" />);
    setInViewport(true);
    const video = container.querySelector("video") as HTMLVideoElement;

    setInViewport(false);
    expect(container.querySelector("video")).toBe(video);
    expect(video.paused).toBe(true);

    setInViewport(true);
    expect(video.paused).toBe(false);
  });

  it("pausa feita pela pessoa é respeitada: voltar à tela não toca sozinho", () => {
    const { container } = render(<ProjectMedia media={AUTOPLAY_MEDIA} projectName="Projeto" accent="#ff0000" />);
    setInViewport(true);
    const video = container.querySelector("video") as HTMLVideoElement;

    fireEvent.click(screen.getByRole("button", { name: "Pausar demonstração de Projeto" }));
    setInViewport(false);
    setInViewport(true);
    expect(video.paused).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Tocar demonstração de Projeto" }));
    expect(video.paused).toBe(false);
  });
});
