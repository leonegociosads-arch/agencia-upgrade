// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { BuilderProvider } from "../state/BuilderContext";
import { builderReducer, initialBuilderState, type BuilderAction } from "../state/builderReducer";
import { LeadProvider } from "../../lead/state/LeadContext";
import BuilderShell from "./BuilderShell";
import type { BuilderState } from "../types";

afterEach(cleanup);

function run(state: BuilderState, ...actions: BuilderAction[]): BuilderState {
  return actions.reduce(builderReducer, state);
}

function reviewingWithSite(): BuilderState {
  return run(
    initialBuilderState,
    { type: "START_NEW_SERVICE", serviceId: "site" },
    { type: "UPDATE_DRAFT_ANSWER", questionId: "site_tipo", value: "ecommerce" },
    { type: "UPDATE_DRAFT_ANSWER", questionId: "site_recursos", value: ["pagamento_online"] },
    { type: "UPDATE_DRAFT_ANSWER", questionId: "site_situacao", value: "criar_do_zero" },
    { type: "SAVE_SERVICE_DRAFT" },
    { type: "FINALIZE_PROJECT" },
  );
}

function reviewingWithSiteAndTrafego(): BuilderState {
  return run(
    reviewingWithSite(),
    { type: "GO_TO_ENTRY" },
    { type: "START_NEW_SERVICE", serviceId: "trafego" },
    { type: "UPDATE_DRAFT_ANSWER", questionId: "trafego_negocio", value: "servicos" },
    { type: "UPDATE_DRAFT_ANSWER", questionId: "trafego_destino", value: "whatsapp" },
    { type: "UPDATE_DRAFT_ANSWER", questionId: "trafego_experiencia", value: "nunca_anunciei" },
    { type: "UPDATE_DRAFT_ANSWER", questionId: "trafego_investimento", value: "ate_1000" },
    { type: "SAVE_SERVICE_DRAFT" },
    { type: "FINALIZE_PROJECT" },
  );
}

function renderWithState(state: BuilderState) {
  return render(
    <BuilderProvider initialState={state}>
      <LeadProvider>
        <BuilderShell />
      </LeadProvider>
    </BuilderProvider>,
  );
}

function reopenSiteTipo() {
  fireEvent.click(screen.getAllByText("Alterar")[0]);
}

describe("ProjectReview — integração (Etapa 11)", () => {
  it("renderiza o resumo detalhado do único serviço confirmado", () => {
    renderWithState(reviewingWithSite());
    expect(screen.getByText("Confira seu projeto")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Criar um site" })).toBeTruthy();
    expect(screen.getByText("Loja Virtual / E-commerce")).toBeTruthy();
    expect(screen.getByText("Pagamento online")).toBeTruthy();
    expect(screen.getByText("Vou criar do zero")).toBeTruthy();
  });

  it("com múltiplos serviços, mostra os dois blocos, na ordem em que foram adicionados", () => {
    renderWithState(reviewingWithSiteAndTrafego());
    const headings = screen.getAllByRole("heading", { level: 3 }).map((el) => el.textContent);
    expect(headings).toEqual(["Criar um site", "Atrair mais clientes"]);
  });

  it("editar a partir do resumo abre a edição com o rascunho preenchido", () => {
    renderWithState(reviewingWithSite());
    fireEvent.click(screen.getByRole("button", { name: "Editar Criar um site" }));
    expect(screen.getByText("Editando Criar um site")).toBeTruthy();
    const reviewArea = screen.getByText(/Revise as respostas e confirme/).closest("div")!;
    expect(within(reviewArea).getByText(/Loja Virtual \/ E-commerce/)).toBeTruthy();
  });

  it("cancelar uma edição iniciada pelo resumo retorna PARA O RESUMO com os dados originais", () => {
    renderWithState(reviewingWithSite());
    fireEvent.click(screen.getByRole("button", { name: "Editar Criar um site" }));
    reopenSiteTipo();
    fireEvent.click(screen.getByText("Site Institucional"));
    fireEvent.click(screen.getByText("Formulários ou captação de leads"));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    fireEvent.click(screen.getByText("Cancelar edição"));

    expect(screen.getByText("Confira seu projeto")).toBeTruthy(); // voltou para o Resumo, não para o seletor
    expect(screen.getByText("Loja Virtual / E-commerce")).toBeTruthy();
  });

  it("salvar uma edição iniciada pelo resumo retorna PARA O RESUMO já atualizado", () => {
    renderWithState(reviewingWithSite());
    fireEvent.click(screen.getByRole("button", { name: "Editar Criar um site" }));
    reopenSiteTipo();
    fireEvent.click(screen.getByText("Site Institucional"));
    fireEvent.click(screen.getByText("Formulários ou captação de leads"));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    fireEvent.click(screen.getByText("Confirmar alterações"));

    expect(screen.getByText("Confira seu projeto")).toBeTruthy();
    expect(screen.getByText("Site Institucional")).toBeTruthy();
    expect(screen.queryByText("Loja Virtual / E-commerce")).toBeNull();
  });

  it("remover um serviço a partir do resumo (entre vários) preserva os demais e permanece no resumo", () => {
    renderWithState(reviewingWithSiteAndTrafego());
    fireEvent.click(screen.getByRole("button", { name: "Remover Criar um site" }));
    fireEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Remover" }));

    expect(screen.getByText("Confira seu projeto")).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Criar um site" })).toBeNull();
    expect(screen.getByRole("heading", { name: "Atrair mais clientes" })).toBeTruthy();
  });

  it("remover o último serviço a partir do resumo não permite continuar (sai da revisão)", () => {
    renderWithState(reviewingWithSite());
    fireEvent.click(screen.getByRole("button", { name: "Remover Criar um site" }));
    fireEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Remover" }));

    expect(screen.queryByText("Confira seu projeto")).toBeNull();
    expect(screen.getByText("Por onde você quer começar?")).toBeTruthy();
  });

  it("Continuar avança para o estado provisório de contato", () => {
    renderWithState(reviewingWithSite());
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.getByText("Deixe seus dados para analisarmos seu projeto.")).toBeTruthy();
  });

  it("Voltar retorna ao Meu Upgrade / seletor, sem perder os serviços confirmados", () => {
    renderWithState(reviewingWithSite());
    fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
    expect(screen.getByText("Por onde você quer começar?")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Meu Upgrade/ }));
    // `data-testid` (Fase 19) — o cabeçalho do painel ganhou uma estrutura própria, então
    // `heading.closest("div")` deixou de alcançar o painel inteiro.
    const panel = screen.getByTestId("my-upgrade-panel");
    expect(within(panel).getByText("Criar um site")).toBeTruthy();
  });
});
