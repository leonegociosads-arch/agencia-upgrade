// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { BuilderProvider } from "../../state/BuilderContext";
import { LeadProvider } from "@/features/lead/state/LeadContext";
import BuilderShell from "../BuilderShell";
import { usesPurpleShowcase } from "./showcaseQuestionTheme";

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

describe("Cena especial roxa (laboratório — situação com anúncios do Tráfego Pago)", () => {
  it("só a pergunta trafego_experiencia usa a identidade roxa", () => {
    expect(usesPurpleShowcase({ id: "trafego_experiencia" })).toBe(true);
    expect(usesPurpleShowcase({ id: "site_recursos" })).toBe(false);
    expect(usesPurpleShowcase({ id: "trafego_negocio" })).toBe(false);
    expect(usesPurpleShowcase({ id: "design_formato" })).toBe(false);
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
