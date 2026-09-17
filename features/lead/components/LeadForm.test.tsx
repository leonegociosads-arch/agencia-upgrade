// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { BuilderProvider } from "../../builder/state/BuilderContext";
import { builderReducer, initialBuilderState, type BuilderAction } from "../../builder/state/builderReducer";
import BuilderShell from "../../builder/components/BuilderShell";
import { LeadProvider } from "../state/LeadContext";
import type { BuilderState } from "../../builder/types";

// A Fase 13 substitui o simulador local (`?simulateLeadFailure=1`, Etapa 12 — já documentado como
// removível quando existisse uma chamada de rede de verdade) pela Server Action real
// `submitLead`. Nos testes de componente ela é mockada: não há Supabase disponível em teste, e o
// interesse aqui é o comportamento do LeadForm diante de sucesso/falha, não o Supabase em si (isso
// é coberto por `lib/repositories/leads.test.ts` e `features/lead/actions/submitLead.test.ts`).
vi.mock("../actions/submitLead", () => ({
  submitLead: vi.fn(),
}));
import { submitLead } from "../actions/submitLead";

afterEach(cleanup);

beforeEach(() => {
  vi.mocked(submitLead).mockReset();
  // Pequeno atraso proposital (não existe no código de produção): sem ele, a Promise mockada
  // resolve rápido demais para o estado "submitting" (o texto "Enviando...") chegar a aparecer
  // antes de já ter virado "success" no mesmo ciclo de eventos.
  vi.mocked(submitLead).mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 20)));
});

function run(state: BuilderState, ...actions: BuilderAction[]): BuilderState {
  return actions.reduce(builderReducer, state);
}

function inContactWithSite(): BuilderState {
  const confirmed = run(
    initialBuilderState,
    { type: "START_NEW_SERVICE", serviceId: "site" },
    { type: "UPDATE_DRAFT_ANSWER", questionId: "site_tipo", value: "nao_sei" },
    { type: "UPDATE_DRAFT_ANSWER", questionId: "site_situacao", value: "criar_do_zero" },
    { type: "SAVE_SERVICE_DRAFT" },
  );
  return run(confirmed, { type: "FINALIZE_PROJECT" }, { type: "CONTINUE_TO_CONTACT" });
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

function fillValidForm() {
  fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "João Silva" } });
  fireEvent.change(screen.getByLabelText("Empresa"), { target: { value: "ABC Móveis" } });
  fireEvent.change(screen.getByLabelText("WhatsApp"), { target: { value: "(13) 99999-9999" } });
  fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "joao@teste.com" } });
}

describe("LeadForm — integração (Etapa 12)", () => {
  it("renderiza os 5 campos com labels reais", () => {
    renderWithState(inContactWithSite());
    expect(screen.getByLabelText("Nome")).toBeTruthy();
    expect(screen.getByLabelText("Empresa")).toBeTruthy();
    expect(screen.getByLabelText("WhatsApp")).toBeTruthy();
    expect(screen.getByLabelText("E-mail")).toBeTruthy();
    expect(screen.getByLabelText(/Site ou Instagram/)).toBeTruthy();
  });

  it("enviar vazio mostra erros próximos aos campos e foca o primeiro campo inválido", async () => {
    renderWithState(inContactWithSite());
    fireEvent.click(screen.getByRole("button", { name: "Enviar meu projeto" }));

    expect(await screen.findByText("Informe seu nome.")).toBeTruthy();
    expect(screen.getByText("Informe o nome da empresa.")).toBeTruthy();
    expect(screen.getByText("Informe seu WhatsApp.")).toBeTruthy();
    expect(screen.getByText("Informe seu e-mail.")).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText("Nome"));
    expect(screen.getByLabelText("Nome").getAttribute("aria-invalid")).toBe("true");
  });

  it("WhatsApp inválido mostra a mensagem específica; corrigir o valor remove o erro", async () => {
    renderWithState(inContactWithSite());
    const whatsapp = screen.getByLabelText("WhatsApp");
    fireEvent.change(whatsapp, { target: { value: "123" } });
    fireEvent.blur(whatsapp);
    expect(await screen.findByText("Informe um WhatsApp válido, com DDD.")).toBeTruthy();

    fireEvent.change(whatsapp, { target: { value: "13999999999" } });
    await waitFor(() => expect(screen.queryByText("Informe um WhatsApp válido, com DDD.")).toBeNull());
  });

  it("campo opcional vazio não impede o envio", async () => {
    renderWithState(inContactWithSite());
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Enviar meu projeto" }));
    expect(await screen.findByText("Recebemos seu projeto.")).toBeTruthy();
  });

  it("TESTE de submit — formulário válido avança CONTACT -> SUBMITTING -> SUCCESS", async () => {
    renderWithState(inContactWithSite());
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Enviar meu projeto" }));

    expect(await screen.findByText("Enviando...")).toBeTruthy();
    expect(await screen.findByText("Recebemos seu projeto.")).toBeTruthy();
    expect(screen.getByText("Obrigado, João!")).toBeTruthy();
    expect(screen.getByText("Criar um site")).toBeTruthy();
  });

  it("duplo clique durante o envio não dispara um segundo submit (botão travado em 'Enviando...')", async () => {
    renderWithState(inContactWithSite());
    fillValidForm();
    const submitButton = screen.getByRole("button", { name: "Enviar meu projeto" });
    fireEvent.click(submitButton);
    fireEvent.click(submitButton); // segundo clique, deveria ser ignorado
    expect(await screen.findByText("Enviando...")).toBeTruthy();
    expect(await screen.findByText("Recebemos seu projeto.")).toBeTruthy();
  });

  it("TESTE 10 (Etapa 12) — preencher parcialmente, voltar ao resumo e retornar preserva os campos", () => {
    renderWithState(inContactWithSite());
    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "João Silva" } });
    fireEvent.change(screen.getByLabelText("Empresa"), { target: { value: "ABC Móveis" } });

    fireEvent.click(screen.getByRole("button", { name: "Voltar ao projeto" }));
    expect(screen.getByText("Confira seu projeto")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    expect((screen.getByLabelText("Nome") as HTMLInputElement).value).toBe("João Silva");
    expect((screen.getByLabelText("Empresa") as HTMLInputElement).value).toBe("ABC Móveis");
  });

  it("falha no envio (submitLead retorna ok:false): a mensagem aparece, dados continuam preenchidos e dá para tentar de novo", async () => {
    vi.mocked(submitLead).mockResolvedValue({
      ok: false,
      message: "Não conseguimos enviar agora. Seus dados continuam preenchidos.",
    });
    renderWithState(inContactWithSite());
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Enviar meu projeto" }));

    expect(await screen.findByText("Não conseguimos enviar agora. Seus dados continuam preenchidos.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(await screen.findByLabelText("Nome")).toBeTruthy();
    expect((screen.getByLabelText("Nome") as HTMLInputElement).value).toBe("João Silva");
    expect((screen.getByLabelText("E-mail") as HTMLInputElement).value).toBe("joao@teste.com");
  });

  it("falha e depois 'Voltar' retorna ao Resumo do Projeto sem perder o serviço configurado", async () => {
    vi.mocked(submitLead).mockResolvedValue({
      ok: false,
      message: "Não conseguimos enviar agora. Seus dados continuam preenchidos.",
    });
    renderWithState(inContactWithSite());
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Enviar meu projeto" }));
    await screen.findByText("Não conseguimos enviar agora. Seus dados continuam preenchidos.");

    fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
    expect(screen.getByText("Confira seu projeto")).toBeTruthy();
    expect(within(screen.getByRole("heading", { name: "Criar um site" }).closest("section")!).getByText("Criar um site")).toBeTruthy();
  });

  it("TESTE 9 (Fase 13) — submitLead é chamado com o payload contendo idempotencyKey estável", async () => {
    renderWithState(inContactWithSite());
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Enviar meu projeto" }));
    await screen.findByText("Recebemos seu projeto.");

    expect(submitLead).toHaveBeenCalledTimes(1);
    const [payload] = vi.mocked(submitLead).mock.calls[0];
    expect(typeof payload.meta.idempotencyKey).toBe("string");
    expect(payload.meta.idempotencyKey.length).toBeGreaterThan(0);
  });

  it("TESTE (Etapa 29, Seção 38 — honeypot) — campo-armadilha é inacessível (fora da árvore de acessibilidade, sem foco por Tab)", () => {
    renderWithState(inContactWithSite());
    const honeypot = document.getElementById("company_website") as HTMLInputElement;
    expect(honeypot).toBeTruthy();
    expect(honeypot.getAttribute("tabIndex")).toBe("-1");
    expect(honeypot.closest('[aria-hidden="true"]')).toBeTruthy();
  });

  it("TESTE (Etapa 29, Seção 38 — honeypot) — vazio por padrão, submitLead recebe undefined/vazio no segundo argumento", async () => {
    renderWithState(inContactWithSite());
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Enviar meu projeto" }));
    await screen.findByText("Recebemos seu projeto.");

    const [, honeypotValue] = vi.mocked(submitLead).mock.calls[0];
    expect(honeypotValue).toBeFalsy();
  });
});
