// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import FaqSection from "./FaqSection";

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe("FaqSection (Home como landing page)", () => {
  it("lista perguntas em <details> acessíveis, todas fechadas por padrão", () => {
    const { container } = render(<FaqSection />);

    expect(screen.getByRole("heading", { name: "Perguntas frequentes" })).toBeTruthy();
    const details = container.querySelectorAll("details");
    expect(details.length).toBeGreaterThanOrEqual(4);
    details.forEach((item) => expect(item.hasAttribute("open")).toBe(false));
    expect(screen.getByText("Posso contratar mais de um serviço?")).toBeTruthy();
  });

  it("só afirma o que o produto faz: sem prazo, preço, garantia nem política comercial inventados", () => {
    vi.stubEnv("NEXT_PUBLIC_RESPONSE_TIME", "");
    const { container } = render(<FaqSection />);
    expect(container.textContent).not.toMatch(/R\$|garantia|reembolso|em até|\d+ ?(horas|dias)/i);
    expect(screen.getByText(/entra em contato pelos dados que você informou\./)).toBeTruthy();
  });

  it("o prazo de retorno só aparece quando a Upgrade o define (configuração)", () => {
    vi.stubEnv("NEXT_PUBLIC_RESPONSE_TIME", "em até 1 dia útil");
    render(<FaqSection />);
    expect(screen.getByText(/pelos dados que você informou, em até 1 dia útil\./)).toBeTruthy();
  });
});
