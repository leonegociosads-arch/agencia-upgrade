// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { BuilderProvider } from "../state/BuilderContext";
import { builderReducer, initialBuilderState, type BuilderAction } from "../state/builderReducer";
import { LeadProvider } from "../../lead/state/LeadContext";
import BuilderShell from "./BuilderShell";
import type { BuilderState } from "../types";

/**
 * Correções da auditoria de 09/11/2026 (Fase 1): atalho de contato, "Voltar" na 1ª pergunta, um só
 * sistema de progresso, "Meu Upgrade (n)" fora do painel e o rótulo do investimento em anúncios.
 * Ambiente de teste = movimento reduzido (`vitest.setup.ts`), então toda troca de tela é síncrona.
 */

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  window.localStorage.clear();
});

function run(state: BuilderState, ...actions: BuilderAction[]): BuilderState {
  return actions.reduce(builderReducer, state);
}

function reviewingWithTrafego(): BuilderState {
  return run(
    initialBuilderState,
    { type: "START_NEW_SERVICE", serviceId: "trafego" },
    { type: "UPDATE_DRAFT_ANSWER", questionId: "trafego_negocio", value: "negocio_local" },
    { type: "UPDATE_DRAFT_ANSWER", questionId: "trafego_destino", value: ["whatsapp"] },
    { type: "UPDATE_DRAFT_ANSWER", questionId: "trafego_experiencia", value: "nunca_anunciei" },
    { type: "UPDATE_DRAFT_ANSWER", questionId: "trafego_investimento", value: "de_1000_a_3000" },
    { type: "SAVE_SERVICE_DRAFT" },
    { type: "FINALIZE_PROJECT" },
  );
}

function renderBuilder(initialState?: BuilderState) {
  return render(
    <BuilderProvider initialState={initialState}>
      <LeadProvider>
        <BuilderShell />
      </LeadProvider>
    </BuilderProvider>,
  );
}

function journeyLabel(): string {
  const root = document.querySelector("[data-journey-stage]");
  return root?.textContent ?? "";
}

describe("Atalho 'Fale com a Upgrade' (tela de escolha)", () => {
  it("sem nenhum canal configurado, o atalho NÃO aparece (nada de botão cinza desativado)", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "");
    vi.stubEnv("NEXT_PUBLIC_INSTAGRAM", "");
    vi.stubEnv("NEXT_PUBLIC_CONTACT_EMAIL", "");
    renderBuilder();
    expect(screen.queryByText(/Não sabe exatamente do que precisa/)).toBeNull();
    expect(screen.queryByTitle("Canal de contato em breve")).toBeNull();
  });

  it("com WhatsApp configurado, vira um link ativo para a conversa (nova aba, rel seguro)", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "5511912345678");
    renderBuilder();
    const link = screen.getByRole("link", { name: /Não sabe exatamente do que precisa\? Fale com a Upgrade pelo WhatsApp/ });
    expect(link.getAttribute("href")).toMatch(/^https:\/\/wa\.me\/5511912345678\?text=/);
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(link.hasAttribute("disabled")).toBe(false);
  });

  it("só com Instagram (ou só e-mail) configurado, usa esse canal como alternativa", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "");
    vi.stubEnv("NEXT_PUBLIC_INSTAGRAM", "@perfil.teste");
    renderBuilder();
    expect(screen.getByRole("link", { name: /Fale com a Upgrade pelo Instagram/ }).getAttribute("href")).toBe(
      "https://www.instagram.com/perfil.teste/",
    );
    cleanup();

    window.localStorage.clear();
    vi.stubEnv("NEXT_PUBLIC_INSTAGRAM", "");
    vi.stubEnv("NEXT_PUBLIC_CONTACT_EMAIL", "contato@exemplo.com");
    renderBuilder();
    expect(screen.getByRole("link", { name: /Fale com a Upgrade pelo E-mail/ }).getAttribute("href")).toBe("mailto:contato@exemplo.com");
  });
});

describe("'← Voltar' na primeira pergunta", () => {
  it("fica ativo e faz o mesmo que 'Escolher outra área' (volta à escolha de serviço)", () => {
    renderBuilder();
    fireEvent.click(screen.getByText("Criar um site"));
    expect(screen.getByText("Que tipo de site você precisa?")).toBeTruthy();

    const back = screen.getByRole("button", { name: "← Voltar" });
    expect((back as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(back);

    expect(screen.getByText("Escolha o seu")).toBeTruthy();
    expect(screen.queryByText("Que tipo de site você precisa?")).toBeNull();
  });

  it("depois da 1ª resposta, continua voltando à pergunta anterior (sem mudança)", () => {
    renderBuilder();
    fireEvent.click(screen.getByText("Atrair mais clientes"));
    fireEvent.click(screen.getByText("Negócio local"));
    fireEvent.click(screen.getByRole("button", { name: "← Voltar" }));
    expect(screen.getByText("O que você quer divulgar?")).toBeTruthy();
  });
});

describe("Progresso: um sistema só (4 passos da Home + barra do serviço, sem números nem jargão)", () => {
  it("o passo geral avança de verdade: Escolha → Responda → Monte e revise → Envie", () => {
    renderBuilder();
    expect(journeyLabel()).toContain("Escolha o que precisa");

    fireEvent.click(screen.getByText("Criar um site"));
    expect(journeyLabel()).toContain("Responda poucas perguntas");
    cleanup();
    window.localStorage.clear();

    renderBuilder(reviewingWithTrafego());
    expect(journeyLabel()).toContain("Monte e revise o seu Upgrade");
    fireEvent.click(screen.getByRole("button", { name: /Quero receber um retorno/ }));
    expect(journeyLabel()).toContain("Envie e receba o retorno");
  });

  it("pergunta normal: barra do serviço, sem '1 de 3'", () => {
    renderBuilder();
    fireEvent.click(screen.getByText("Criar um site"));
    expect(screen.queryByText(/^\d+ de \d+$/)).toBeNull();
    const bar = screen.getByRole("progressbar", { name: /Progresso em Criar um site/ });
    expect(bar.getAttribute("aria-valuenow")).toBe("1");
    expect(bar.getAttribute("aria-valuemax")).toBe("3");
  });

  it("painel especial: sem '03.', sem 'Pergunta do Builder' e sem '2/3' — mesmo rótulo e mesma barra", () => {
    renderBuilder();
    fireEvent.click(screen.getByText("Criar um site"));
    fireEvent.click(screen.getByText("Site Institucional"));
    expect(screen.getByText("O que esse projeto precisa ter?")).toBeTruthy();

    expect(screen.queryByText(/Pergunta do Builder/i)).toBeNull();
    expect(screen.queryByText(/\d+\/\d+/)).toBeNull();
    expect(screen.queryByText(/^0\d\./)).toBeNull();
    const bar = screen.getByRole("progressbar", { name: /Progresso em Criar um site/ });
    expect(bar.getAttribute("aria-valuenow")).toBe("2");
  });

  it("última pergunta do caminho usa o rótulo contextual 'Só mais uma coisa'", () => {
    renderBuilder();
    fireEvent.click(screen.getByText("Criar um site"));
    fireEvent.click(screen.getByText("Ainda não sei"));
    expect(screen.getByText("Só mais uma coisa")).toBeTruthy();
  });
});

describe("'Meu Upgrade (n)' fora das telas do painel", () => {
  it("no resumo, marca 'você está aqui' (aria-current) e leva o foco ao título do resumo", () => {
    renderBuilder(reviewingWithTrafego());
    const button = screen.getByRole("button", { name: /Meu Upgrade \(1\)/ });
    expect(button.getAttribute("aria-current")).toBe("page");
    fireEvent.click(button);
    expect(document.activeElement?.textContent).toContain("Seu Upgrade");
  });

  it("no formulário de contato, leva de volta ao resumo (mesmo efeito de 'Voltar ao projeto')", () => {
    renderBuilder(reviewingWithTrafego());
    fireEvent.click(screen.getByRole("button", { name: /Quero receber um retorno/ }));
    expect(screen.getByRole("button", { name: "Voltar ao projeto" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Meu Upgrade \(1\)/ }));
    expect(screen.getByRole("heading", { name: "Seu Upgrade está quase pronto!" })).toBeTruthy();
  });
});

describe("Investimento em anúncios no resumo", () => {
  it("aparece com o rótulo 'Investimento mensal em anúncios', nunca o valor solto", () => {
    renderBuilder(reviewingWithTrafego());
    const card = screen.getByRole("heading", { name: "Tráfego Pago" }).closest("article") as HTMLElement;
    expect(card.textContent).toContain("Investimento mensal em anúncios: R$ 1.000 a R$ 3.000");
    // O valor nunca aparece sozinho: o elemento da resposta sempre carrega o rótulo junto.
    const value = within(card).getByText("R$ 1.000 a R$ 3.000");
    expect(value.parentElement?.textContent).toBe("Investimento mensal em anúncios: R$ 1.000 a R$ 3.000");
  });
});
