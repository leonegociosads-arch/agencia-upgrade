// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { BuilderProvider } from "../../builder/state/BuilderContext";
import { builderReducer, initialBuilderState, type BuilderAction } from "../../builder/state/builderReducer";
import BuilderShell from "../../builder/components/BuilderShell";
import { LeadProvider } from "../state/LeadContext";
import type { BuilderState } from "../../builder/types";

/**
 * Telas de sucesso e de erro do envio (auditoria de 09/11/2026, A7 e C1) testadas por ESTADO
 * SIMULADO: o reducer leva o Builder direto a "success"/"error" — nenhum formulário é enviado e
 * nenhuma Server Action é chamada.
 */

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  window.localStorage.clear();
});

function run(state: BuilderState, ...actions: BuilderAction[]): BuilderState {
  return actions.reduce(builderReducer, state);
}

function contactWithSiteAndTrafego(): BuilderState {
  return run(
    initialBuilderState,
    { type: "START_NEW_SERVICE", serviceId: "site" },
    { type: "UPDATE_DRAFT_ANSWER", questionId: "site_tipo", value: "nao_sei" },
    { type: "UPDATE_DRAFT_ANSWER", questionId: "site_situacao", value: "criar_do_zero" },
    { type: "SAVE_SERVICE_DRAFT" },
    { type: "GO_TO_ENTRY" },
    { type: "START_NEW_SERVICE", serviceId: "trafego" },
    { type: "UPDATE_DRAFT_ANSWER", questionId: "trafego_negocio", value: "servicos" },
    { type: "UPDATE_DRAFT_ANSWER", questionId: "trafego_destino", value: ["whatsapp"] },
    { type: "UPDATE_DRAFT_ANSWER", questionId: "trafego_experiencia", value: "nunca_anunciei" },
    { type: "UPDATE_DRAFT_ANSWER", questionId: "trafego_investimento", value: "ate_1000" },
    { type: "SAVE_SERVICE_DRAFT" },
    { type: "FINALIZE_PROJECT" },
    { type: "CONTINUE_TO_CONTACT" },
    { type: "START_SUBMIT_LEAD" },
  );
}

const SUCCESS = () => run(contactWithSiteAndTrafego(), { type: "SUBMIT_LEAD_SUCCESS" });
const ERROR = () => run(contactWithSiteAndTrafego(), { type: "SUBMIT_LEAD_FAILURE", message: "Não conseguimos enviar agora." });

function renderAt(state: BuilderState) {
  return render(
    <BuilderProvider initialState={state}>
      <LeadProvider>
        <BuilderShell />
      </LeadProvider>
    </BuilderProvider>,
  );
}

describe("Tela de sucesso", () => {
  it("comunica envio, o que foi montado, que ficou registrado e o que acontece agora", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "");
    vi.stubEnv("NEXT_PUBLIC_RESPONSE_TIME", "");
    renderAt(SUCCESS());

    expect(screen.getByRole("heading", { name: "Recebemos seu projeto." })).toBeTruthy();
    // Na barra da janela e no progresso geral do cabeçalho (todos os passos concluídos).
    expect(screen.getAllByText("Projeto enviado").length).toBeGreaterThanOrEqual(1);
    const list = screen.getByText("O que você montou").nextElementSibling as HTMLElement;
    expect(within(list).getByText("Site")).toBeTruthy();
    expect(within(list).getByText("Tráfego Pago")).toBeTruthy();
    expect(screen.getByText(/ficou registrado com a Upgrade/)).toBeTruthy();
    expect(screen.getByText(/O que acontece agora: a equipe da Upgrade analisa/)).toBeTruthy();
    // Nenhum prazo inventado.
    expect(screen.queryByText(/em até|horas|dias úteis/)).toBeNull();
  });

  it("sem WhatsApp: principal 'Ver projetos', secundário 'Voltar ao site', terciário 'Iniciar novo projeto'", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "");
    renderAt(SUCCESS());

    const verProjetos = screen.getByRole("link", { name: /Ver projetos/ });
    expect(verProjetos.getAttribute("href")).toBe("/projetos");
    expect(verProjetos.className).toMatch(/primary/);
    expect(screen.getByRole("link", { name: "Voltar ao site" }).getAttribute("href")).toBe("/");
    expect(screen.queryByRole("link", { name: /WhatsApp/ })).toBeNull();
    expect(screen.getByRole("button", { name: "Iniciar novo projeto" }).className).toMatch(/restart/);
  });

  it("com WhatsApp: principal 'Continuar pelo WhatsApp' (nova aba), secundário 'Ver projetos'", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "5511912345678");
    renderAt(SUCCESS());

    const whatsapp = screen.getByRole("link", { name: /Continuar pelo WhatsApp/ });
    expect(whatsapp.getAttribute("href")).toMatch(/^https:\/\/wa\.me\/5511912345678\?text=/);
    expect(whatsapp.getAttribute("target")).toBe("_blank");
    expect(whatsapp.className).toMatch(/primary/);
    const verProjetos = screen.getByRole("link", { name: "Ver projetos" });
    expect(verProjetos.className).toMatch(/secondary/);
    expect(screen.queryByRole("link", { name: "Voltar ao site" })).toBeNull();
  });

  it("'Iniciar novo projeto' continua recomeçando o Builder", () => {
    renderAt(SUCCESS());
    fireEvent.click(screen.getByRole("button", { name: "Iniciar novo projeto" }));
    expect(screen.getByText("Escolha o seu")).toBeTruthy();
  });

  it("depois do envio, o botão 'Meu Upgrade' some (não há mais nada para montar)", () => {
    renderAt(SUCCESS());
    expect(screen.queryByRole("button", { name: /Meu Upgrade/ })).toBeNull();
  });
});

describe("Tela de erro do envio", () => {
  it("sem WhatsApp, mostra só tentar de novo / voltar (nenhum contato inventado)", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "");
    renderAt(ERROR());
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: /WhatsApp/ })).toBeNull();
  });

  it("com WhatsApp, oferece o WhatsApp como plano B", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "5511912345678");
    renderAt(ERROR());
    const link = screen.getByRole("link", { name: /Chamar no WhatsApp/ });
    expect(link.getAttribute("href")).toMatch(/^https:\/\/wa\.me\/5511912345678/);
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });
});
