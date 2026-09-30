// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { BuilderProvider } from "../../state/BuilderContext";
import { LeadProvider } from "@/features/lead/state/LeadContext";
import BuilderShell from "../BuilderShell";
import { getShowcaseLabVariant } from "./showcaseQuestionTheme";

afterEach(cleanup);

function renderBuilder() {
  return render(
    <BuilderProvider>
      <LeadProvider>
        <BuilderShell />
      </LeadProvider>
    </BuilderProvider>,
  );
}

describe("Cena especial com a cor do caminho (Tráfego roxo, Design azul, Site inalterado)", () => {
  it("Tráfego usa roxo, Design usa azul, e o resto fica de fora", () => {
    expect(getShowcaseLabVariant({ id: "trafego_experiencia" })).toBe("purple");
    for (const id of ["identidade_situacao", "design_formato", "social_necessidade", "criativos_formato", "video_material"]) {
      expect(getShowcaseLabVariant({ id })).toBe("blue");
    }
    expect(getShowcaseLabVariant({ id: "site_recursos" })).toBeNull();
    expect(getShowcaseLabVariant({ id: "trafego_negocio" })).toBeNull();
    expect(getShowcaseLabVariant({ id: "marca_identidade" })).toBeNull();
  });

  it("Design: a cena especial usa o post-it azul e 'Próxima' só habilita depois de escolher", async () => {
    const { container } = renderBuilder();
    fireEvent.click(screen.getByText("Fortalecer minha marca e conteúdo"));
    fireEvent.click(await screen.findByText("Identidade Visual"));
    await screen.findByRole("heading", { name: "Como está sua marca hoje?" });

    expect(container.querySelector('img[src*="sticky-note-blue"]')).not.toBeNull();
    const next = screen.getByRole("button", { name: /Próxima/ }) as HTMLButtonElement;
    expect(next.disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: /Ainda não tenho identidade/ }));
    expect(next.disabled).toBe(false);
    fireEvent.click(next);
    expect(await screen.findByRole("heading", { name: /^(?!Como está sua marca hoje).+/ })).toBeTruthy();
  });

  it("usa o post-it roxo e mantém 'Próxima' desabilitada até escolher; escolher habilita e avança igual", async () => {
    const { container } = renderBuilder();
    fireEvent.click(screen.getByText("Atrair mais clientes"));
    fireEvent.click(await screen.findByRole("button", { name: /Negócio local/ }));
    fireEvent.click(await screen.findByText("WhatsApp"));
    await screen.findByRole("heading", { name: "Qual é sua situação atual com anúncios?" });

    expect(container.querySelector('img[src*="sticky-note-purple"]')).not.toBeNull();
    const next = screen.getByRole("button", { name: /Próxima/ }) as HTMLButtonElement;
    expect(next.disabled).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: /Nunca anunciei/ }));
    // Troca de seleção: só uma opção fica marcada.
    fireEvent.click(screen.getByRole("button", { name: /Já anuncio atualmente/ }));
    expect(container.querySelectorAll('button[aria-pressed="true"]')).toHaveLength(1);
    expect(next.disabled).toBe(false);

    fireEvent.click(next);
    expect(await screen.findByRole("heading", { name: "Quanto pretende investir em anúncios por mês?" })).toBeTruthy();
  });

  it("a cena especial do Site continua com o post-it verde de sempre", async () => {
    const { container } = renderBuilder();
    fireEvent.click(screen.getByText("Criar um site"));
    fireEvent.click(screen.getByText("Loja Virtual / E-commerce"));
    await screen.findByRole("button", { name: /Próxima/ });
    expect(container.querySelector('img[src*="sticky-note.png"]')).not.toBeNull();
    expect(container.querySelector('img[src*="sticky-note-purple"]')).toBeNull();
  });
});
