// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useConsent } from "./useConsent";
import { resetConsentForTests, setConsent } from "@/lib/analytics/consent";
import { clearStoredConsent } from "@/lib/privacy/consentStorage";

afterEach(() => {
  cleanup();
  resetConsentForTests();
  clearStoredConsent();
});

function Probe() {
  const consent = useConsent();
  return <span>{JSON.stringify(consent)}</span>;
}

describe("useConsent (Fase LGPD)", () => {
  it("não lança 'getServerSnapshot should be cached' — regressão real encontrada via Playwright quando o snapshot do servidor era um objeto literal novo a cada chamada", () => {
    expect(() => render(<Probe />)).not.toThrow();
  });

  it("reflete o consentimento atual (padrão restritivo antes de qualquer decisão)", () => {
    render(<Probe />);
    expect(screen.getByText('{"analytics":false,"marketing":false}')).not.toBeNull();
  });

  it("reage a setConsent (via CONSENT_CHANGE_EVENT)", () => {
    render(<Probe />);
    act(() => {
      setConsent({ analytics: true, marketing: true });
    });
    expect(screen.getByText('{"analytics":true,"marketing":true}')).not.toBeNull();
  });
});
