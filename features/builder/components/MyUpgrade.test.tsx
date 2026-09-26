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

/** Site = E-commerce, já confirmado, de volta na tela de escolha — mesmo tipo de estado usado em
 * builderReducer.test.ts, mas seguindo até `GO_TO_ENTRY` para simular um usuário real que já saiu
 * da tela de conclusão. */
function confirmedEcommerceSite(): BuilderState {
  return run(
    initialBuilderState,
    { type: "START_NEW_SERVICE", serviceId: "site" },
    { type: "UPDATE_DRAFT_ANSWER", questionId: "site_tipo", value: "ecommerce" },
    { type: "UPDATE_DRAFT_ANSWER", questionId: "site_recursos", value: ["pagamento_online"] },
    { type: "UPDATE_DRAFT_ANSWER", questionId: "site_situacao", value: "criar_do_zero" },
    { type: "SAVE_SERVICE_DRAFT" },
    { type: "GO_TO_ENTRY" },
  );
}

function confirmedSiteAndTrafego(): BuilderState {
  return run(
    confirmedEcommerceSite(),
    { type: "START_NEW_SERVICE", serviceId: "trafego" },
    { type: "UPDATE_DRAFT_ANSWER", questionId: "trafego_negocio", value: "servicos" },
    { type: "UPDATE_DRAFT_ANSWER", questionId: "trafego_destino", value: "whatsapp" },
    { type: "UPDATE_DRAFT_ANSWER", questionId: "trafego_experiencia", value: "nunca_anunciei" },
    { type: "UPDATE_DRAFT_ANSWER", questionId: "trafego_investimento", value: "ate_1000" },
    { type: "SAVE_SERVICE_DRAFT" },
    { type: "GO_TO_ENTRY" },
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

/** O botão de alternar o painel, na navegação — nunca ambíguo com o `<h2>` "Meu Upgrade" de
 * dentro do painel, porque busca especificamente por um `button`. */
function toggleMyUpgrade() {
  fireEvent.click(screen.getByRole("button", { name: /Meu Upgrade/ }));
}

/** Escopa buscas ao conteúdo do painel — necessário porque, sempre que `activeService` é nulo, o
 * `ServiceSelector` fica visível ao mesmo tempo que o painel (é uma seção persistente, não um
 * modal), e os dois podem repetir o mesmo texto (o nome do serviço). Busca pelo título como
 * `heading` (não por texto solto) porque o botão de alternar o painel, quando a contagem é 0,
 * normaliza para o mesmo texto "Meu Upgrade" do `<h2>` — só o `role` os distingue.
 *
 * Escopa pelo `data-testid="my-upgrade-panel"` (Fase 19) — o cabeçalho do painel ganhou uma
 * estrutura própria (título + contador + botão de fechar do drawer), então `heading.closest("div")`
 * deixou de alcançar o painel inteiro (passou a parar num `<div>` intermediário do cabeçalho). */
function panel() {
  return screen.getByTestId("my-upgrade-panel");
}

/** site_tipo é sempre a primeira pergunta de Site — o primeiro "Alterar" da revisão sempre a reabre. */
function reopenSiteTipo() {
  fireEvent.click(screen.getAllByText("Alterar")[0]);
}

describe("MyUpgrade — integração (Etapa 10)", () => {
  it("TESTE 1 — estado vazio: mostra a mensagem de vazio e não há como finalizar", () => {
    renderWithState(initialBuilderState);
    toggleMyUpgrade();
    expect(within(panel()).getByText("Seu Upgrade ainda está vazio.")).toBeTruthy();
    expect(within(panel()).queryByText("Finalizar projeto")).toBeNull();
  });

  it("estado vazio: 'Adicionar um serviço' leva ao seletor principal (nunca inicia um serviço sozinho)", () => {
    renderWithState(initialBuilderState);
    toggleMyUpgrade();
    fireEvent.click(within(panel()).getByText("Adicionar um serviço"));
    expect(screen.getByText("Selecione um serviço para montarmos a solução ideal para o seu momento.")).toBeTruthy();
  });

  it("TESTE 2 — um serviço configurado: aparece com o resumo correto", () => {
    renderWithState(confirmedEcommerceSite());
    toggleMyUpgrade();
    const scope = within(panel());
    expect(scope.getByText("Criar um site")).toBeTruthy();
    expect(scope.getByText(/Loja Virtual \/ E-commerce/)).toBeTruthy();
  });

  it("TESTE 3 — múltiplos serviços: ambos aparecem, na ordem em que foram adicionados", () => {
    renderWithState(confirmedSiteAndTrafego());
    toggleMyUpgrade();
    const titles = within(panel())
      .getAllByText(/^(Criar um site|Atrair mais clientes)$/)
      .map((el) => el.textContent);
    expect(titles).toEqual(["Criar um site", "Atrair mais clientes"]);
  });

  it("TESTE 4 — Editar entra em modo de edição com o rascunho preenchido pelos dados confirmados", () => {
    renderWithState(confirmedEcommerceSite());
    toggleMyUpgrade();
    fireEvent.click(within(panel()).getByRole("button", { name: "Editar Criar um site" }));
    expect(screen.getByText("Editando Criar um site")).toBeTruthy();
    expect(screen.getByText(/Revise as respostas e confirme/)).toBeTruthy();
    // A própria revisão já mostra o dado confirmado carregado no rascunho.
    const reviewArea = screen.getByText(/Revise as respostas e confirme/).closest("div")!;
    expect(within(reviewArea).getByText(/Loja Virtual \/ E-commerce/)).toBeTruthy();
  });

  it("TESTE 5 — antes de salvar, o Meu Upgrade confirmado continua mostrando o valor antigo", () => {
    renderWithState(confirmedEcommerceSite());
    toggleMyUpgrade();
    fireEvent.click(within(panel()).getByRole("button", { name: "Editar Criar um site" }));
    reopenSiteTipo();
    fireEvent.click(screen.getByText("Site Institucional"));
    fireEvent.click(screen.getByText("Formulários ou captação de leads"));
    fireEvent.click(screen.getByRole("button", { name: "Próxima" }));

    // A revisão do rascunho já reflete Institucional...
    const reviewArea = screen.getByText(/Revise as respostas e confirme/).closest("div")!;
    expect(within(reviewArea).getByText(/Site Institucional/)).toBeTruthy();

    // ...mas o painel confirmado, visível ao mesmo tempo, continua com E-commerce até salvar.
    expect(within(panel()).getByText(/Loja Virtual \/ E-commerce/)).toBeTruthy();
    expect(within(panel()).queryByText(/Site Institucional/)).toBeNull();
  });

  it("TESTE 6 — salvar aplica a alteração e o Meu Upgrade passa a mostrar o novo valor", () => {
    renderWithState(confirmedEcommerceSite());
    toggleMyUpgrade();
    fireEvent.click(within(panel()).getByRole("button", { name: "Editar Criar um site" }));
    reopenSiteTipo();
    fireEvent.click(screen.getByText("Site Institucional"));
    fireEvent.click(screen.getByText("Formulários ou captação de leads"));
    fireEvent.click(screen.getByRole("button", { name: "Próxima" }));
    fireEvent.click(screen.getByText("Confirmar alterações"));

    const scope = within(panel());
    expect(scope.getByText(/Site Institucional/)).toBeTruthy();
    expect(scope.queryByText(/Loja Virtual \/ E-commerce/)).toBeNull();
  });

  it("TESTE 7 — cancelar mantém o valor antigo", () => {
    renderWithState(confirmedEcommerceSite());
    toggleMyUpgrade();
    fireEvent.click(within(panel()).getByRole("button", { name: "Editar Criar um site" }));
    reopenSiteTipo();
    fireEvent.click(screen.getByText("Site Institucional"));
    fireEvent.click(screen.getByText("Formulários ou captação de leads"));
    fireEvent.click(screen.getByRole("button", { name: "Próxima" }));
    fireEvent.click(screen.getByText("Cancelar edição"));

    const scope = within(panel());
    expect(scope.getByText(/Loja Virtual \/ E-commerce/)).toBeTruthy();
  });

  it("TESTE 8 / TESTE 14 — remover Site preserva o Tráfego, sem afetá-lo", () => {
    renderWithState(confirmedSiteAndTrafego());
    toggleMyUpgrade();
    fireEvent.click(within(panel()).getByRole("button", { name: "Remover Criar um site" }));
    fireEvent.click(screen.getByRole("button", { name: "Remover" }));

    const scope = within(panel());
    expect(scope.queryByText("Criar um site")).toBeNull();
    expect(scope.getByText("Atrair mais clientes")).toBeTruthy();
    expect(scope.getByText(/Nunca anunciei/)).toBeTruthy();
  });

  it("TESTE 9 — remover o último serviço mostra o estado vazio", () => {
    renderWithState(confirmedEcommerceSite());
    toggleMyUpgrade();
    fireEvent.click(within(panel()).getByRole("button", { name: "Remover Criar um site" }));
    fireEvent.click(screen.getByRole("button", { name: "Remover" }));
    expect(within(panel()).getByText("Seu Upgrade ainda está vazio.")).toBeTruthy();
  });

  it("remover: 'Cancelar' no diálogo não remove nada", () => {
    renderWithState(confirmedEcommerceSite());
    toggleMyUpgrade();
    fireEvent.click(within(panel()).getByRole("button", { name: "Remover Criar um site" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(within(panel()).getByText("Criar um site")).toBeTruthy();
  });

  it("TESTE 10 — selecionar no seletor um serviço já configurado abre edição, nunca duplica", () => {
    renderWithState(confirmedEcommerceSite());
    // Clica no card do SELETOR (painel fechado agora), não num botão do painel.
    fireEvent.click(screen.getByText("Criar um site"));
    expect(screen.getByText("Editando Criar um site")).toBeTruthy();
  });

  it("TESTE 11 — projeto vazio não permite finalizar", () => {
    renderWithState(initialBuilderState);
    toggleMyUpgrade();
    expect(within(panel()).queryByText("Finalizar projeto")).toBeNull();
  });

  it("TESTE 12 — com um serviço válido, finalizar avança para a revisão do projeto", () => {
    renderWithState(confirmedEcommerceSite());
    toggleMyUpgrade();
    fireEvent.click(within(panel()).getByRole("button", { name: "Finalizar projeto" }));
    expect(screen.getByText("Confira seu projeto")).toBeTruthy();
  });

  it("TESTE 13 — com uma edição em andamento, finalizar não ignora a alteração pendente", () => {
    renderWithState(confirmedEcommerceSite());
    toggleMyUpgrade();
    fireEvent.click(within(panel()).getByRole("button", { name: "Editar Criar um site" }));
    // O painel continua aberto (é uma seção persistente, não fecha ao editar) — o botão
    // "Finalizar projeto" dele está visível ao mesmo tempo que a tela de edição.
    fireEvent.click(within(panel()).getByRole("button", { name: "Finalizar projeto" }));

    expect(screen.queryByText("Confira seu projeto")).toBeNull();
    expect(within(panel()).getByText(/Termine antes de finalizar o projeto/)).toBeTruthy();

    fireEvent.click(within(panel()).getByText("Descartar alterações"));
    expect(screen.getByText("Selecione um serviço para montarmos a solução ideal para o seu momento.")).toBeTruthy();
  });

  it("TESTE 15 — remover um serviço do meio preserva os demais", () => {
    const threeServices = run(
      confirmedSiteAndTrafego(),
      { type: "START_NEW_SERVICE", serviceId: "design" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "design_servico", value: "identidade_visual" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "identidade_situacao", value: "sem_identidade" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "identidade_escopo", value: "identidade_essencial" },
      { type: "SAVE_SERVICE_DRAFT" },
      { type: "GO_TO_ENTRY" },
    );
    renderWithState(threeServices);
    toggleMyUpgrade();
    fireEvent.click(within(panel()).getByRole("button", { name: "Remover Fortalecer minha marca e conteúdo" }));
    fireEvent.click(screen.getByRole("button", { name: "Remover" }));

    const scope = within(panel());
    expect(scope.getByText("Criar um site")).toBeTruthy();
    expect(scope.getByText("Atrair mais clientes")).toBeTruthy();
    expect(scope.queryByText("Fortalecer minha marca e conteúdo")).toBeNull();
  });

  it("+ Adicionar outro serviço leva ao seletor sem perder os serviços já configurados", () => {
    renderWithState(confirmedEcommerceSite());
    toggleMyUpgrade();
    fireEvent.click(within(panel()).getByText("+ Adicionar outro serviço"));
    expect(screen.getByText("Selecione um serviço para montarmos a solução ideal para o seu momento.")).toBeTruthy();
    expect(within(panel()).getByText("Criar um site")).toBeTruthy();
  });
});
