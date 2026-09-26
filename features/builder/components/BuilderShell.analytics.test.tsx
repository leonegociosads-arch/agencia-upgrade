// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { BuilderProvider } from "../state/BuilderContext";
import { LeadProvider } from "@/features/lead/state/LeadContext";
import BuilderShell from "./BuilderShell";

const trackEventMock = vi.fn();
const trackFunnelMilestoneMock = vi.fn();
vi.mock("@/lib/analytics/trackEvent", () => ({
  trackEvent: (...args: unknown[]) => trackEventMock(...args),
  trackFunnelMilestone: (...args: unknown[]) => trackFunnelMilestoneMock(...args),
}));

const submitLeadMock = vi.fn();
vi.mock("@/features/lead/actions/submitLead", () => ({
  submitLead: (...args: unknown[]) => submitLeadMock(...args),
}));

afterEach(() => {
  cleanup();
  trackEventMock.mockClear();
  trackFunnelMilestoneMock.mockClear();
  submitLeadMock.mockReset();
});

function renderBuilder() {
  return render(
    <BuilderProvider>
      <LeadProvider>
        <BuilderShell />
      </LeadProvider>
    </BuilderProvider>,
  );
}

function callsFor(mock: typeof trackEventMock, name: string) {
  return mock.mock.calls.filter((call) => call[0] === name);
}

/**
 * Testes de disparo de eventos (Fase 17) — cobrem os TESTES OBRIGATÓRIOS 1-9 do briefing
 * ("Tracking"/"Falha"/"Session") via integração real do Builder, no mesmo estilo dos testes de
 * persistência de sessão da Fase 14 (`BuilderShell.sessionPersistence.test.tsx`): simula cliques
 * reais, sem recalcular a lógica do reducer à parte.
 */
describe("Disparo de eventos de analytics (Fase 17) — integração via BuilderShell", () => {
  it("TESTE 1 — builder_started dispara uma vez no momento correto (hidratação)", async () => {
    renderBuilder();
    await screen.findByText("Selecione um serviço para montarmos a solução ideal para o seu momento.");
    expect(trackFunnelMilestoneMock).toHaveBeenCalledWith("builder_started", {});
  });

  it("TESTE 2 — service_selected registra o serviceId correto ao escolher um serviço NOVO", async () => {
    renderBuilder();
    await screen.findByText("Selecione um serviço para montarmos a solução ideal para o seu momento.");
    fireEvent.click(screen.getByText("Criar um site"));
    expect(trackEventMock).toHaveBeenCalledWith("service_selected", { serviceId: "site" });
  });

  it("service_selected NÃO dispara ao reabrir um serviço já configurado (isso é edição)", async () => {
    renderBuilder();
    fireEvent.click(screen.getByText("Criar um site"));
    fireEvent.click(screen.getByText("Ainda não sei"));
    fireEvent.click(screen.getByText("Vou criar do zero"));
    await screen.findByRole("heading", { name: /Serviço adicionado/ });
    fireEvent.click(screen.getByText("Adicionar outro serviço"));
    await screen.findByText("Selecione um serviço para montarmos a solução ideal para o seu momento.");
    trackEventMock.mockClear();

    fireEvent.click(screen.getByText("Criar um site")); // já configurado -> reabre para editar
    expect(callsFor(trackEventMock, "service_selected")).toHaveLength(0);
  });

  it("TESTE 3 — service_completed dispara após CONFIRMAÇÃO (auto-save), não apenas ao selecionar", async () => {
    renderBuilder();
    fireEvent.click(screen.getByText("Criar um site"));
    expect(callsFor(trackEventMock, "service_completed")).toHaveLength(0);

    fireEvent.click(screen.getByText("Ainda não sei"));
    fireEvent.click(screen.getByText("Vou criar do zero"));
    await screen.findByRole("heading", { name: /Serviço adicionado/ });

    expect(trackEventMock).toHaveBeenCalledWith("service_completed", { serviceId: "site", questionCount: 2 });
  });

  it("service_edited dispara ao confirmar uma edição (nunca service_completed de novo)", async () => {
    renderBuilder();
    fireEvent.click(screen.getByText("Criar um site"));
    fireEvent.click(screen.getByText("Ainda não sei"));
    fireEvent.click(screen.getByText("Vou criar do zero"));
    await screen.findByRole("heading", { name: /Serviço adicionado/ });
    fireEvent.click(screen.getByText("Adicionar outro serviço"));
    await screen.findByText("Selecione um serviço para montarmos a solução ideal para o seu momento.");
    fireEvent.click(screen.getByRole("button", { name: /Meu Upgrade/ }));
    fireEvent.click(screen.getByRole("button", { name: /Editar/ }));
    await screen.findByText("Editando Criar um site");
    trackEventMock.mockClear();

    fireEvent.click(screen.getByRole("button", { name: "Confirmar alterações" }));
    expect(trackEventMock).toHaveBeenCalledWith("service_edited", { serviceId: "site" });
    expect(callsFor(trackEventMock, "service_completed")).toHaveLength(0);
  });

  it("service_removed registra o serviceId ao remover pelo Meu Upgrade", async () => {
    renderBuilder();
    fireEvent.click(screen.getByText("Criar um site"));
    fireEvent.click(screen.getByText("Ainda não sei"));
    fireEvent.click(screen.getByText("Vou criar do zero"));
    await screen.findByRole("heading", { name: /Serviço adicionado/ });
    fireEvent.click(screen.getByText("Adicionar outro serviço"));
    await screen.findByText("Selecione um serviço para montarmos a solução ideal para o seu momento.");
    fireEvent.click(screen.getByRole("button", { name: /Meu Upgrade/ }));
    fireEvent.click(screen.getByRole("button", { name: "Remover Criar um site" }));
    fireEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Remover" }));

    expect(trackEventMock).toHaveBeenCalledWith("service_removed", { serviceId: "site" });
  });

  it("TESTE 4 — upgrade_reviewed dispara ao entrar no Resumo, com service_count/service_ids", async () => {
    renderBuilder();
    fireEvent.click(screen.getByText("Criar um site"));
    fireEvent.click(screen.getByText("Ainda não sei"));
    fireEvent.click(screen.getByText("Vou criar do zero"));
    await screen.findByRole("heading", { name: /Serviço adicionado/ });
    fireEvent.click(screen.getByText("Adicionar outro serviço"));
    await screen.findByText("Selecione um serviço para montarmos a solução ideal para o seu momento.");
    fireEvent.click(screen.getByRole("button", { name: /Meu Upgrade/ }));
    fireEvent.click(screen.getByRole("button", { name: "Finalizar projeto" }));

    await screen.findByRole("heading", { name: "Seu Upgrade está quase pronto!" });
    expect(trackFunnelMilestoneMock).toHaveBeenCalledWith("upgrade_reviewed", { serviceCount: 1, serviceIds: ["site"] });
  });

  it("TESTE 5 — contact_started dispara ao entrar na etapa de contato", async () => {
    renderBuilder();
    fireEvent.click(screen.getByText("Criar um site"));
    fireEvent.click(screen.getByText("Ainda não sei"));
    fireEvent.click(screen.getByText("Vou criar do zero"));
    await screen.findByRole("heading", { name: /Serviço adicionado/ });
    fireEvent.click(screen.getByText("Adicionar outro serviço"));
    await screen.findByText("Selecione um serviço para montarmos a solução ideal para o seu momento.");
    fireEvent.click(screen.getByRole("button", { name: /Meu Upgrade/ }));
    fireEvent.click(screen.getByRole("button", { name: "Finalizar projeto" }));
    await screen.findByRole("heading", { name: "Seu Upgrade está quase pronto!" });
    trackFunnelMilestoneMock.mockClear();

    fireEvent.click(screen.getByRole("button", { name: /Quero receber um retorno/ }));
    await screen.findByLabelText("Nome");
    expect(trackFunnelMilestoneMock).toHaveBeenCalledWith("contact_started", {});
  });

  async function reachContactStep() {
    fireEvent.click(screen.getByText("Criar um site"));
    fireEvent.click(screen.getByText("Ainda não sei"));
    fireEvent.click(screen.getByText("Vou criar do zero"));
    await screen.findByRole("heading", { name: /Serviço adicionado/ });
    fireEvent.click(screen.getByText("Adicionar outro serviço"));
    await screen.findByText("Selecione um serviço para montarmos a solução ideal para o seu momento.");
    fireEvent.click(screen.getByRole("button", { name: /Meu Upgrade/ }));
    fireEvent.click(screen.getByRole("button", { name: "Finalizar projeto" }));
    await screen.findByRole("heading", { name: "Seu Upgrade está quase pronto!" });
    fireEvent.click(screen.getByRole("button", { name: /Quero receber um retorno/ }));
    await screen.findByLabelText("Nome");
    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Ana Lima" } });
    fireEvent.change(screen.getByLabelText("Empresa"), { target: { value: "Ana Confeitaria" } });
    fireEvent.change(screen.getByLabelText("WhatsApp"), { target: { value: "13977776666" } });
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "ana@teste.com" } });
  }

  it("TESTE 6 — lead_submitted dispara SOMENTE após submitLead resolver com ok: true", async () => {
    submitLeadMock.mockResolvedValue({ ok: true });
    renderBuilder();
    await reachContactStep();
    trackEventMock.mockClear();
    trackFunnelMilestoneMock.mockClear();

    fireEvent.click(screen.getByRole("button", { name: "Enviar meu projeto" }));
    await screen.findByText("Recebemos seu projeto.");

    expect(trackEventMock).toHaveBeenCalledWith("lead_submit_attempted", {});
    expect(trackFunnelMilestoneMock).toHaveBeenCalledWith(
      "lead_submitted",
      expect.objectContaining({ serviceCount: 1, idempotencyKey: expect.any(String) }),
    );
    expect(callsFor(trackEventMock, "lead_submit_failed")).toHaveLength(0);
  });

  it("TESTE 7 — quando o submit falha, lead_submitted NÃO dispara e lead_submit_failed dispara", async () => {
    submitLeadMock.mockResolvedValue({ ok: false, message: "Não conseguimos enviar agora.", errorCategory: "persistence" });
    renderBuilder();
    await reachContactStep();
    trackEventMock.mockClear();
    trackFunnelMilestoneMock.mockClear();

    fireEvent.click(screen.getByRole("button", { name: "Enviar meu projeto" }));
    await screen.findByText("Não conseguimos enviar agora.");

    expect(trackEventMock).toHaveBeenCalledWith("lead_submit_failed", { errorCategory: "persistence" });
    expect(callsFor(trackFunnelMilestoneMock, "lead_submitted")).toHaveLength(0);
  });
});
