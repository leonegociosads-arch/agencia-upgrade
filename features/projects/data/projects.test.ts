import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PROJECT_CASES } from "./projects";

describe("PROJECT_CASES (Etapa Ver Projetos)", () => {
  it("tem só os dois cases reais, na ordem de leitura", () => {
    expect(PROJECT_CASES.map((project) => project.slug)).toEqual(["sm-design", "kai-hikari"]);
    expect(PROJECT_CASES.map((project) => project.index)).toEqual(["01", "02"]);
  });

  it("aponta cada CTA para o site real, em https", () => {
    expect(PROJECT_CASES.map((project) => project.liveUrl)).toEqual([
      "https://www.smdesignoficial.com/",
      "https://kaihikari.somosupgrade.com.br/",
    ]);
  });

  it("mostra o domínio do próprio link na moldura do navegador", () => {
    for (const project of PROJECT_CASES) {
      expect(new URL(project.liveUrl).hostname.replace(/^www\./, "")).toBe(project.media.domain);
    }
  });

  it("tem conteúdo nas duas camadas e toda tecnologia vem com a explicação", () => {
    for (const project of PROJECT_CASES) {
      expect(project.screen.length).toBeGreaterThan(0);
      expect(project.backstage.length).toBeGreaterThan(0);
      for (const tech of project.technologies) expect(tech.role.trim()).not.toBe("");
    }
  });

  it("toda imagem existe em /public e tem texto alternativo", () => {
    for (const project of PROJECT_CASES) {
      const images = [project.media.desktop, project.media.mobile].filter((image) => image !== undefined);
      for (const image of images) {
        expect(image.alt.trim()).not.toBe("");
        expect(existsSync(path.join(process.cwd(), "public", image.src))).toBe(true);
      }
    }
  });
});
