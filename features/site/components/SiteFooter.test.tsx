// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import SiteFooter from "./SiteFooter";
import { isConsentPreferencesManuallyOpen, resetConsentBannerVisibilityForTests } from "@/features/privacy/state/consentBannerVisibility";

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  resetConsentBannerVisibilityForTests();
});

describe("SiteFooter (Fase 19)", () => {
  it("mostra os links institucionais e o ano corrente", () => {
    render(<SiteFooter />);
    expect(screen.getByRole("link", { name: "Projetos" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Privacidade" })).toBeTruthy();
    expect(screen.getByText(new RegExp(String(new Date().getFullYear())))).toBeTruthy();
  });

  it("'Preferências de privacidade' (Fase LGPD) é um botão, não um link, e reabre o consent banner", () => {
    render(<SiteFooter />);
    const button = screen.getByRole("button", { name: "Preferências de privacidade" });
    expect(isConsentPreferencesManuallyOpen()).toBe(false);
    fireEvent.click(button);
    expect(isConsentPreferencesManuallyOpen()).toBe(true);
  });

  it("sem nenhum canal configurado, não mostra contato nenhum (nada inventado)", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "");
    vi.stubEnv("NEXT_PUBLIC_INSTAGRAM", "");
    vi.stubEnv("NEXT_PUBLIC_CONTACT_EMAIL", "");
    render(<SiteFooter />);
    expect(screen.queryByRole("list", { name: "Fale com a Upgrade" })).toBeNull();
    expect(document.querySelector('a[href^="https://wa.me"], a[href^="mailto:"], a[href*="instagram.com"]')).toBeNull();
  });

  it("com canais configurados, lista cada um com ícone + texto, só os que existem", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "5511912345678");
    vi.stubEnv("NEXT_PUBLIC_INSTAGRAM", "");
    vi.stubEnv("NEXT_PUBLIC_CONTACT_EMAIL", "contato@exemplo.com");
    render(<SiteFooter />);
    const list = screen.getByRole("list", { name: "Fale com a Upgrade" });
    const links = list.querySelectorAll("a");
    expect(links).toHaveLength(2);
    expect(screen.getByRole("link", { name: /WhatsApp: \+55 11 91234-5678/ }).getAttribute("href")).toMatch(/^https:\/\/wa\.me\/5511912345678/);
    expect(screen.getByRole("link", { name: /E-mail: contato@exemplo\.com/ }).getAttribute("href")).toBe("mailto:contato@exemplo.com");
    expect(list.querySelectorAll("svg")).toHaveLength(2);
    expect(screen.queryByRole("link", { name: /Instagram/ })).toBeNull();
  });
});
