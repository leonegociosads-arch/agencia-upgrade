// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { BuilderProvider } from "../../state/BuilderContext";
import { LeadProvider } from "@/features/lead/state/LeadContext";
import BuilderShell from "../BuilderShell";

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

async function completeSiteQuickly() {
  fireEvent.click(screen.getByText("Criar um site"));
  fireEvent.click(screen.getByText("Ainda não sei"));
  fireEvent.click(screen.getByText("Vou criar do zero"));
  await screen.findByRole("heading", { name: /Serviço adicionado/ });
}

async function completeTrafego() {
  fireEvent.click(screen.getByText("Atrair mais clientes"));
  fireEvent.click(screen.getByText("Negócio local"));
  fireEvent.click(screen.getByText("WhatsApp"));
  // Etapa 4 usa o painel especial: marcar a opção e confirmar em "Próxima".
  fireEvent.click(screen.getByText("Nunca anunciei"));
  fireEvent.click(screen.getByRole("button", { name: "Próxima" }));
  fireEvent.click(screen.getByText("Até R$ 1.000"));
  await screen.findByRole("heading", { name: /Serviço adicionado/ });
}

describe("Tela 'Serviço adicionado' (ServiceCompleteScene)", () => {
  it("aparece ao concluir um serviço, dizendo qual foi", async () => {
    renderBuilder();
    await completeSiteQuickly();
    expect(screen.getByText(/Seu serviço de Site foi configurado com sucesso/)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Adicionar outro serviço/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Ver resumo do projeto" })).toBeTruthy();
  });

  it("'Ver resumo do projeto' abre o Resumo do Projeto de sempre, com o serviço já salvo", async () => {
    renderBuilder();
    await completeSiteQuickly();
    fireEvent.click(screen.getByRole("button", { name: "Ver resumo do projeto" }));
    expect(await screen.findByRole("heading", { name: "Seu Upgrade está quase pronto!" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Site" })).toBeTruthy();
    // Só o serviço configurado aparece (nunca os três fixos da arte de referência).
    expect(screen.queryByRole("heading", { name: "Tráfego Pago" })).toBeNull();
  });

  it("'Adicionar outro serviço' volta à escolha de categoria sem apagar o que já foi configurado", async () => {
    renderBuilder();
    await completeSiteQuickly();
    fireEvent.click(screen.getByRole("button", { name: /Adicionar outro serviço/ }));
    expect(await screen.findByText("Configurado")).toBeTruthy();
  });

  it("Site + Tráfego: os dois serviços aparecem juntos no resumo", async () => {
    renderBuilder();
    await completeSiteQuickly();
    fireEvent.click(screen.getByRole("button", { name: /Adicionar outro serviço/ }));
    await completeTrafego();
    expect(screen.getByText(/Seu serviço de Tráfego pago foi configurado com sucesso/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Ver resumo do projeto" }));
    expect(await screen.findByRole("heading", { name: "Seu Upgrade está quase pronto!" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Site" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Tráfego Pago" })).toBeTruthy();
  });

  it("clique duplo numa ação não navega duas vezes", async () => {
    renderBuilder();
    await completeSiteQuickly();
    const addAnother = screen.getByRole("button", { name: /Adicionar outro serviço/ });
    fireEvent.click(addAnother);
    fireEvent.click(addAnother);
    expect(await screen.findByText("Configurado")).toBeTruthy();
    // Continua na escolha de categoria com o Site configurado — nada foi apagado nem repetido.
    expect(screen.getAllByText("Configurado")).toHaveLength(1);
  });
});
