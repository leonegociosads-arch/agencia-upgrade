// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import ConsentBanner from "./ConsentBanner";
import { getConsent, resetConsentForTests } from "@/lib/analytics/consent";
import { clearStoredConsent } from "@/lib/privacy/consentStorage";
import { openConsentPreferences, resetConsentBannerVisibilityForTests } from "../state/consentBannerVisibility";

afterEach(() => {
  cleanup();
  resetConsentForTests();
  clearStoredConsent();
  resetConsentBannerVisibilityForTests();
});

describe("ConsentBanner (Fase LGPD, briefing Seções 16-21)", () => {
  it("aparece sozinho quando não existe nenhuma decisão salva ainda", () => {
    render(<ConsentBanner />);
    expect(screen.getByText("Sua privacidade")).not.toBeNull();
  });

  it("nenhum checkbox de categoria opcional vem pré-marcado ao abrir 'Configurar' (Seção: nunca pré-marcar)", () => {
    render(<ConsentBanner />);
    fireEvent.click(screen.getByRole("button", { name: "Configurar" }));
    expect((screen.getByRole("checkbox", { name: /Analytics/ }) as HTMLInputElement).checked).toBe(false);
    expect((screen.getByRole("checkbox", { name: /Marketing/ }) as HTMLInputElement).checked).toBe(false);
  });

  it("o checkbox 'Essenciais' está sempre marcado e desabilitado (não é uma escolha)", () => {
    render(<ConsentBanner />);
    fireEvent.click(screen.getByRole("button", { name: "Configurar" }));
    const essential = screen.getByRole("checkbox", { name: /Essenciais/ }) as HTMLInputElement;
    expect(essential.checked).toBe(true);
    expect(essential.disabled).toBe(true);
  });

  it("'Aceitar todos' liga as duas categorias e fecha o banner", () => {
    render(<ConsentBanner />);
    fireEvent.click(screen.getByRole("button", { name: "Aceitar todos" }));
    expect(getConsent()).toEqual({ analytics: true, marketing: true });
    expect(screen.queryByText("Sua privacidade")).toBeNull();
  });

  it("'Recusar não essenciais' desliga as duas categorias e fecha o banner", () => {
    render(<ConsentBanner />);
    fireEvent.click(screen.getByRole("button", { name: "Recusar não essenciais" }));
    expect(getConsent()).toEqual({ analytics: false, marketing: false });
    expect(screen.queryByText("Sua privacidade")).toBeNull();
  });

  it("'Configurar' + marcar só Analytics + 'Salvar preferências' aplica exatamente essa escolha", () => {
    render(<ConsentBanner />);
    fireEvent.click(screen.getByRole("button", { name: "Configurar" }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Analytics/ }));
    fireEvent.click(screen.getByRole("button", { name: "Salvar preferências" }));
    expect(getConsent()).toEqual({ analytics: true, marketing: false });
    expect(screen.queryByText("Sua privacidade")).toBeNull();
  });

  it("usuário consegue enviar lead sem aceitar marketing (Seção 81) — recusar não essenciais não afeta consentimento de marketing isoladamente", () => {
    render(<ConsentBanner />);
    fireEvent.click(screen.getByRole("button", { name: "Recusar não essenciais" }));
    expect(getConsent().marketing).toBe(false);
  });

  it("não aparece quando já existe uma decisão salva e ninguém reabriu manualmente", () => {
    const { unmount } = render(<ConsentBanner />);
    fireEvent.click(screen.getByRole("button", { name: "Aceitar todos" }));
    unmount();

    render(<ConsentBanner />);
    expect(screen.queryByText("Sua privacidade")).toBeNull();
  });

  it("reaparece quando reaberto manualmente (link 'Preferências de privacidade' do footer)", () => {
    render(<ConsentBanner />);
    fireEvent.click(screen.getByRole("button", { name: "Aceitar todos" }));
    expect(screen.queryByText("Sua privacidade")).toBeNull();

    act(() => openConsentPreferences());
    expect(screen.getByText("Sua privacidade")).not.toBeNull();
  });

  it("link para a Política de Privacidade está presente", () => {
    render(<ConsentBanner />);
    expect(screen.getByRole("link", { name: "Política de Privacidade" })).toBeTruthy();
  });
});
