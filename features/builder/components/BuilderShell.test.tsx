// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { BuilderProvider } from "../state/BuilderContext";
import { LeadProvider } from "@/features/lead/state/LeadContext";
import BuilderShell from "./BuilderShell";

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

/**
 * Testes de integração básica (Etapa 9) — "os necessários para garantir integração básica",
 * não uma suíte de UI completa. Cobrem exatamente os três pontos pedidos: ServiceSelector inicia
 * o fluxo, QuestionRenderer avança ao responder, e concluir/revisar adiciona ao Meu Upgrade.
 */
describe("Builder — integração básica de componentes", () => {
  it("ServiceSelector: escolher um serviço inicia o mini-fluxo de perguntas daquele serviço", () => {
    renderBuilder();
    fireEvent.click(screen.getByText("Criar um site"));
    expect(screen.getByText("Que tipo de site você precisa?")).toBeTruthy();
  });

  it("QuestionRenderer: selecionar uma resposta avança para a próxima pergunta correta", () => {
    renderBuilder();
    fireEvent.click(screen.getByText("Criar um site"));
    fireEvent.click(screen.getByText("Ainda não sei"));
    expect(screen.getByText("Em que situação está esse projeto?")).toBeTruthy();
  });

  it("ServiceReview: concluir o mini-fluxo salva e o serviço aparece como configurado", async () => {
    renderBuilder();
    fireEvent.click(screen.getByText("Criar um site"));
    fireEvent.click(screen.getByText("Ainda não sei"));
    fireEvent.click(screen.getByText("Vou criar do zero"));

    await screen.findByRole("heading", { name: /Serviço adicionado/ });

    fireEvent.click(screen.getByText("Adicionar outro serviço"));
    expect(await screen.findByText("Configurado")).toBeTruthy();
  });
});
