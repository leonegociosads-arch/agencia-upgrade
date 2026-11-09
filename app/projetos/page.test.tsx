// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// Mesmo motivo de `app/page.test.tsx`: `SiteHeader` usa `usePathname`, que precisa do contexto do
// App Router — fora dele, um valor fixo basta.
vi.mock("next/navigation", () => ({ usePathname: () => "/projetos" }));

import ProjetosPage from "./page";

afterEach(cleanup);

describe("/projetos (Etapa Ver Projetos)", () => {
  it("tem um único h1, os dois cases como h2 e o índice com âncoras", () => {
    render(<ProjetosPage />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 2, name: "SM Design" })).not.toBeNull();
    expect(screen.getByRole("heading", { level: 2, name: "Kai Hikari" })).not.toBeNull();

    const index = screen.getByRole("navigation", { name: "Cases desta página" });
    const anchors = Array.from(index.querySelectorAll("a")).map((anchor) => anchor.getAttribute("href"));
    expect(anchors).toEqual(["#sm-design", "#kai-hikari"]);
  });

  it("termina no CTA do Builder (rota real, sem fluxo paralelo)", () => {
    render(<ProjetosPage />);

    expect(screen.getByRole("heading", { level: 2, name: "Seu projeto pode ser o próximo." })).not.toBeNull();
    const builderLinks = screen.getAllByRole("link", { name: "Monte seu Upgrade" });
    expect(builderLinks.every((link) => link.getAttribute("href") === "/builder")).toBe(true);
  });
});

describe("/projetos — metadados de compartilhamento", () => {
  it("tem og:title e twitter:title próprios (não os da Home)", async () => {
    const { metadata } = await import("./page");
    expect(metadata.openGraph?.title).toBe("Projetos | Agência Upgrade");
    expect((metadata.openGraph as { url?: string } | undefined)?.url).toBe("/projetos");
    expect(metadata.twitter?.title).toBe("Projetos | Agência Upgrade");
  });
});
