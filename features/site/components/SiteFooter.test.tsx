// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import SiteFooter from "./SiteFooter";
import { isConsentPreferencesManuallyOpen, resetConsentBannerVisibilityForTests } from "@/features/privacy/state/consentBannerVisibility";

afterEach(() => {
  cleanup();
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
});
