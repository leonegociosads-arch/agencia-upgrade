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

function reviewingWithAllThree(): BuilderState {
  return run(
    reviewingWithSiteAndTrafego(),
    { type: "GO_TO_ENTRY" },
    { type: "START_NEW_SERVICE", serviceId: "design" },
    { type: "UPDATE_DRAFT_ANSWER", questionId: "design_servico", value: "criativos_anuncios" },
    { type: "UPDATE_DRAFT_ANSWER", questionId: "criativos_formato", value: "imagens" },
    { type: "UPDATE_DRAFT_ANSWER", questionId: "criativos_material", value: "tenho_tudo" },
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
    expect(screen.getByRole("heading", { name: "Seu Upgrade está quase pronto!" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Site" })).toBeTruthy();
    expect(screen.getByText("Loja Virtual / E-commerce")).toBeTruthy();
    expect(screen.getByText("Pagamento online")).toBeTruthy();
    expect(screen.getByText("Vou criar do zero")).toBeTruthy();
  });

  it("com múltiplos serviços, mostra os dois blocos, na ordem em que foram adicionados", () => {
    renderWithState(reviewingWithSiteAndTrafego());
    const headings = screen.getAllByRole("heading", { level: 3 }).map((el) => el.textContent);
    expect(headings).toEqual(["Site", "Tráfego Pago"]);
  });

  it("editar a partir do resumo abre a edição com o rascunho preenchido", () => {
    renderWithState(reviewingWithSite());
    fireEvent.click(screen.getByRole("button", { name: "Editar Site" }));
    expect(screen.getByText("Editando Criar um site")).toBeTruthy();
    const reviewArea = screen.getByText(/Revise as respostas e confirme/).closest("div")!;
    expect(within(reviewArea).getByText(/Loja Virtual \/ E-commerce/)).toBeTruthy();
  });

  it("cancelar uma edição iniciada pelo resumo retorna PARA O RESUMO com os dados originais", () => {
    renderWithState(reviewingWithSite());
    fireEvent.click(screen.getByRole("button", { name: "Editar Site" }));
    reopenSiteTipo();
    fireEvent.click(screen.getByText("Site Institucional"));
    fireEvent.click(screen.getByText("Formulários ou captação de leads"));
    fireEvent.click(screen.getByRole("button", { name: "Próxima" }));
    fireEvent.click(screen.getByText("Cancelar edição"));

    expect(screen.getByRole("heading", { name: "Seu Upgrade está quase pronto!" })).toBeTruthy(); // voltou para o Resumo, não para o seletor
    expect(screen.getByText("Loja Virtual / E-commerce")).toBeTruthy();
  });

  it("salvar uma edição iniciada pelo resumo retorna PARA O RESUMO já atualizado", () => {
    renderWithState(reviewingWithSite());
    fireEvent.click(screen.getByRole("button", { name: "Editar Site" }));
    reopenSiteTipo();
    fireEvent.click(screen.getByText("Site Institucional"));
    fireEvent.click(screen.getByText("Formulários ou captação de leads"));
    fireEvent.click(screen.getByRole("button", { name: "Próxima" }));
    fireEvent.click(screen.getByText("Confirmar alterações"));

    expect(screen.getByRole("heading", { name: "Seu Upgrade está quase pronto!" })).toBeTruthy();
    expect(screen.getByText("Site Institucional")).toBeTruthy();
    expect(screen.queryByText("Loja Virtual / E-commerce")).toBeNull();
  });

  it("remover um serviço a partir do resumo (entre vários) preserva os demais e permanece no resumo", () => {
    renderWithState(reviewingWithSiteAndTrafego());
    fireEvent.click(screen.getByRole("button", { name: "Remover Site" }));
    fireEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Remover" }));

    expect(screen.getByRole("heading", { name: "Seu Upgrade está quase pronto!" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Site" })).toBeNull();
    expect(screen.getByRole("heading", { name: "Tráfego Pago" })).toBeTruthy();
  });

  it("remover o último serviço a partir do resumo não permite continuar (sai da revisão)", () => {
    renderWithState(reviewingWithSite());
    fireEvent.click(screen.getByRole("button", { name: "Remover Site" }));
    fireEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Remover" }));

    expect(screen.queryByRole("heading", { name: "Seu Upgrade está quase pronto!" })).toBeNull();
    expect(screen.getByText("Selecione um serviço para montarmos a solução ideal para o seu momento.")).toBeTruthy();
  });

  it("'Quero receber um retorno' avança para o contato", () => {
    renderWithState(reviewingWithSite());
    fireEvent.click(screen.getByRole("button", { name: /Quero receber um retorno/ }));
    expect(screen.getByText("Deixe seus dados para analisarmos seu projeto.")).toBeTruthy();
  });

  it("'Adicionar outro serviço' volta ao seletor, sem perder os serviços confirmados", () => {
    renderWithState(reviewingWithSite());
    fireEvent.click(screen.getByRole("button", { name: /Adicionar outro serviço/ }));
    expect(screen.getByText("Selecione um serviço para montarmos a solução ideal para o seu momento.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Meu Upgrade/ }));
    // `data-testid` (Fase 19) — o cabeçalho do painel ganhou uma estrutura própria, então
    // `heading.closest("div")` deixou de alcançar o painel inteiro.
    const panel = screen.getByTestId("my-upgrade-panel");
    expect(within(panel).getByText("Criar um site")).toBeTruthy();
  });

  it("com os três serviços no projeto, 'Adicionar outro serviço' some (nunca leva a uma escolha vazia)", () => {
    renderWithState(reviewingWithAllThree());
    const headings = screen.getAllByRole("heading", { level: 3 }).map((el) => el.textContent);
    expect(headings).toEqual(["Site", "Tráfego Pago", "Design e Social Media"]);
    expect(screen.queryByRole("button", { name: /Adicionar outro serviço/ })).toBeNull();
    expect(screen.getByRole("button", { name: /Quero receber um retorno/ })).toBeTruthy();
  });

  it("com um serviço faltando, 'Adicionar outro serviço' aparece", () => {
    renderWithState(reviewingWithSiteAndTrafego());
    expect(screen.getByRole("button", { name: /Adicionar outro serviço/ })).toBeTruthy();
  });

  it("a linha do card mostra só as respostas reais, em rótulo humano (nada de id, 'undefined' ou separador sobrando)", () => {
    renderWithState(reviewingWithSiteAndTrafego());
    const card = screen.getByRole("heading", { name: "Tráfego Pago" }).closest("article")!;
    const line = card.querySelector("p")!.textContent!;
    expect(line).toBe("Serviços•WhatsApp•Nunca anunciei•Até R$ 1.000");
    expect(line).not.toMatch(/undefined|null|nunca_anunciei|••/);
  });
});
