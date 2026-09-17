// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BuilderProvider } from "../state/BuilderContext";
import { LeadProvider } from "@/features/lead/state/LeadContext";
import { BUILDER_SESSION_STORAGE_KEY } from "@/lib/persistence/builderSession";
import BuilderShell from "./BuilderShell";

vi.mock("@/features/lead/actions/submitLead", () => ({
  submitLead: vi.fn().mockResolvedValue({ ok: true }),
}));

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

/** Espera o auto-save realmente gravar no localStorage antes de simular um refresh. */
async function waitForPersistedSave() {
  await waitFor(() => {
    expect(localStorage.getItem(BUILDER_SESSION_STORAGE_KEY)).not.toBeNull();
  });
}

/** Como o `leadDraft` salva com um pequeno debounce (features/builder/state/useBuilderSessionPersistence.ts),
 * espera especificamente até que o valor gravado no storage reflita o texto já digitado. */
async function waitForPersistedLeadDraftName(expectedName: string) {
  await waitFor(() => {
    const raw = localStorage.getItem(BUILDER_SESSION_STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!).lead.leadDraft.name).toBe(expectedName);
  });
}

/**
 * Testes de componente da persistência de sessão (Fase 14) — simulam "fechar/reabrir a aba"
 * desmontando e remontando `BuilderShell` sobre o MESMO `localStorage` (jsdom mantém isso entre
 * montagens dentro do mesmo teste; o `afterEach` global só limpa ENTRE testes).
 */
describe("Persistência de sessão do Builder (Fase 14) — integração via BuilderShell", () => {
  it("TESTE MANUAL A (automatizado) — refresh no meio de uma pergunta recupera o progresso", async () => {
    const first = renderBuilder();
    fireEvent.click(screen.getByText("Criar um site"));
    fireEvent.click(screen.getByText("Ainda não sei"));
    await screen.findByText("Em que situação está esse projeto?");
    await waitForPersistedSave();
    first.unmount();

    renderBuilder();
    expect(await screen.findByText("Em que situação está esse projeto?")).toBeTruthy();
  });

  it("TESTE MANUAL B (automatizado) — Site confirmado + Tráfego parcial sobrevivem a um refresh", async () => {
    const first = renderBuilder();
    fireEvent.click(screen.getByText("Criar um site"));
    fireEvent.click(screen.getByText("Ainda não sei"));
    fireEvent.click(screen.getByText("Vou criar do zero"));
    await screen.findByText(/adicionado ao seu Upgrade/);

    fireEvent.click(screen.getByText("Adicionar outro serviço"));
    await screen.findByText("Por onde você quer começar?");
    fireEvent.click(screen.getByText("Atrair mais clientes"));
    await waitForPersistedSave();
    first.unmount();

    renderBuilder();
    // O serviço "trafego" ficou parcial (nenhuma resposta ainda) — a tela restaurada deve ser a
    // pergunta inicial dele, não o seletor; e o Site confirmado continua no painel Meu Upgrade.
    await screen.findByText("O que você quer divulgar?");
    fireEvent.click(screen.getByRole("button", { name: /Meu Upgrade/ }));
    expect(screen.getByText("Criar um site")).toBeTruthy();
  });

  it("TESTE MANUAL C (automatizado) — editar sem salvar, refresh: confirmed original, draft alterado, edição pendente", async () => {
    const first = renderBuilder();
    fireEvent.click(screen.getByText("Criar um site"));
    fireEvent.click(screen.getByText("Loja Virtual / E-commerce"));
    fireEvent.click(screen.getByText("Catálogo e pedidos"));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    fireEvent.click(screen.getByText("Vou criar do zero"));
    await screen.findByText(/adicionado ao seu Upgrade/);

    fireEvent.click(screen.getByText("Continuar"));
    await screen.findByText("Por onde você quer começar?");
    fireEvent.click(screen.getByRole("button", { name: /Meu Upgrade/ }));
    fireEvent.click(screen.getByRole("button", { name: /Editar/ }));
    await screen.findByText("Editando Criar um site");

    // "Editando" mostra um resumo com "Alterar" por pergunta — reabre o campo antes de escolher
    // uma opção nova (mesmo padrão usado no script de verificação manual da Etapa 12).
    fireEvent.click(screen.getAllByRole("button", { name: "Alterar" })[0]);
    // Espera diretamente pelo botão da opção (em vez de um texto que também aparece, ambíguo, como
    // rótulo na própria tela de resumo "Editando").
    fireEvent.click(await screen.findByRole("button", { name: /^Site Institucional/ }));
    await waitForPersistedSave();
    first.unmount();

    renderBuilder();
    expect(await screen.findByText("Editando Criar um site")).toBeTruthy();
  });

  it("TESTE MANUAL D (automatizado) — nome e empresa preenchidos no contato sobrevivem a um refresh", async () => {
    const first = renderBuilder();
    fireEvent.click(screen.getByText("Criar um site"));
    fireEvent.click(screen.getByText("Ainda não sei"));
    fireEvent.click(screen.getByText("Vou criar do zero"));
    await screen.findByText(/adicionado ao seu Upgrade/);
    fireEvent.click(screen.getByText("Continuar"));
    await screen.findByText("Por onde você quer começar?");
    fireEvent.click(screen.getByRole("button", { name: /Meu Upgrade/ }));
    fireEvent.click(screen.getByRole("button", { name: "Finalizar projeto" }));
    await screen.findByText("Confira seu projeto");
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    await screen.findByLabelText("Nome");

    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Maria Souza" } });
    fireEvent.change(screen.getByLabelText("Empresa"), { target: { value: "Loja da Maria" } });
    await waitForPersistedLeadDraftName("Maria Souza");
    first.unmount();

    renderBuilder();
    expect(await screen.findByLabelText("Nome")).toBeTruthy();
    expect((screen.getByLabelText("Nome") as HTMLInputElement).value).toBe("Maria Souza");
    expect((screen.getByLabelText("Empresa") as HTMLInputElement).value).toBe("Loja da Maria");
  });

  it("mensagem discreta 'Seu progresso foi recuperado.' aparece depois de restaurar uma sessão válida", async () => {
    const first = renderBuilder();
    fireEvent.click(screen.getByText("Criar um site"));
    await waitForPersistedSave();
    first.unmount();

    renderBuilder();
    expect(await screen.findByText("Seu progresso foi recuperado.")).toBeTruthy();
  });

  it("nenhuma sessão salva: não mostra a mensagem de recuperação", async () => {
    renderBuilder();
    await screen.findByText("Por onde você quer começar?");
    expect(screen.queryByText("Seu progresso foi recuperado.")).toBeNull();
  });

  it("TESTE — 'Começar de novo' limpa confirmed, draft, leadDraft e o storage", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    renderBuilder();
    fireEvent.click(screen.getByText("Criar um site"));
    fireEvent.click(screen.getByText("Ainda não sei"));
    fireEvent.click(screen.getByText("Vou criar do zero"));
    await screen.findByText(/adicionado ao seu Upgrade/);
    await waitForPersistedSave();

    fireEvent.click(screen.getByText("Começar de novo"));
    await screen.findByText("Por onde você quer começar?");
    expect(screen.queryByText("Meu Upgrade (1)")).toBeNull();
    await waitFor(() => {
      const raw = localStorage.getItem(BUILDER_SESSION_STORAGE_KEY);
      expect(raw === null || JSON.parse(raw).builder.step === "choosing_service").toBe(true);
    });
    confirmSpy.mockRestore();
  });

  it("TESTE MANUAL G (automatizado) — SUCCESS sobrevive a um refresh; 'Iniciar novo projeto' limpa a sessão", async () => {
    const first = renderBuilder();
    fireEvent.click(screen.getByText("Criar um site"));
    fireEvent.click(screen.getByText("Ainda não sei"));
    fireEvent.click(screen.getByText("Vou criar do zero"));
    await screen.findByText(/adicionado ao seu Upgrade/);
    fireEvent.click(screen.getByText("Continuar"));
    await screen.findByText("Por onde você quer começar?");
    fireEvent.click(screen.getByRole("button", { name: /Meu Upgrade/ }));
    fireEvent.click(screen.getByRole("button", { name: "Finalizar projeto" }));
    await screen.findByText("Confira seu projeto");
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    await screen.findByLabelText("Nome");

    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Ana Lima" } });
    fireEvent.change(screen.getByLabelText("Empresa"), { target: { value: "Ana Confeitaria" } });
    fireEvent.change(screen.getByLabelText("WhatsApp"), { target: { value: "13977776666" } });
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "ana@teste.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar meu projeto" }));
    await screen.findByText("Recebemos seu projeto.");
    await waitForPersistedSave();
    first.unmount();

    renderBuilder();
    expect(await screen.findByText("Recebemos seu projeto.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Iniciar novo projeto" }));
    await screen.findByText("Por onde você quer começar?");
    await waitFor(() => {
      const raw = localStorage.getItem(BUILDER_SESSION_STORAGE_KEY);
      expect(raw === null || JSON.parse(raw).builder.step === "choosing_service").toBe(true);
    });
  });
});
