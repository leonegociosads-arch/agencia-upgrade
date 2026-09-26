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
 * Bug real: com movimento reduzido a troca de tela é instantânea, e o 2º clique de um clique duplo
 * caía no botão que acabava de aparecer no mesmo lugar — pulando perguntas. O navegador numera
 * cliques seguidos (`detail` 1, 2, 3…); ações que trocam a tela ignoram do 2º em diante.
 * (O ambiente de teste já roda com movimento reduzido — `vitest.setup.ts`.)
 */
describe("clique repetido não atravessa telas", () => {
  it("o 2º clique de um clique duplo não responde a pergunta que acabou de aparecer", () => {
    renderBuilder();
    fireEvent.click(screen.getByText("Atrair mais clientes"));
    fireEvent.click(screen.getByText("Negócio local"), { detail: 1 });
    expect(screen.getByText("Onde você quer gerar o resultado?")).toBeTruthy();
    // Mesmo gesto, 2º clique: cai na primeira opção da pergunta NOVA — e precisa ser ignorado.
    fireEvent.click(screen.getByText("WhatsApp"), { detail: 2 });
    expect(screen.getByText("Onde você quer gerar o resultado?")).toBeTruthy();
    // Um clique novo (detail 1) continua funcionando normalmente.
    fireEvent.click(screen.getByText("WhatsApp"), { detail: 1 });
    expect(screen.getByText("Qual é sua situação atual com anúncios?")).toBeTruthy();
  });

  it("painel especial: 'Próxima' e 'Voltar' também ignoram o clique repetido", () => {
    renderBuilder();
    fireEvent.click(screen.getByText("Atrair mais clientes"));
    fireEvent.click(screen.getByText("Negócio local"));
    fireEvent.click(screen.getByText("WhatsApp"));
    fireEvent.click(screen.getByText("Nunca anunciei"));
    fireEvent.click(screen.getByRole("button", { name: "Próxima" }), { detail: 2 });
    expect(screen.getByText("Qual é sua situação atual com anúncios?")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Voltar" }), { detail: 3 });
    expect(screen.getByText("Qual é sua situação atual com anúncios?")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Próxima" }), { detail: 1 });
    expect(screen.getByText("Quanto pretende investir em anúncios por mês?")).toBeTruthy();
  });

  it("teclado (detail 0) continua funcionando", () => {
    renderBuilder();
    fireEvent.click(screen.getByText("Atrair mais clientes"));
    fireEvent.click(screen.getByText("Negócio local"), { detail: 0 });
    expect(screen.getByText("Onde você quer gerar o resultado?")).toBeTruthy();
  });
});
