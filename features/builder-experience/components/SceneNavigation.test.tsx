// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SceneNavigation from "./SceneNavigation";

afterEach(cleanup);

describe("SceneNavigation (Prova de Conceito — Builder)", () => {
  it("Voltar desabilitado quando canGoBack é false; Avançar desabilitado quando canGoForward é false", () => {
    render(<SceneNavigation onBack={() => {}} onForward={() => {}} canGoBack={false} canGoForward={false} isTransitioning={false} />);
    expect((screen.getByRole("button", { name: "Voltar para a cena anterior" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Avançar para a próxima cena" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("mostra a dica quando avançar não está disponível", () => {
    render(<SceneNavigation onBack={() => {}} onForward={() => {}} canGoBack canGoForward={false} isTransitioning={false} forwardHint="Selecione uma opção" />);
    expect(screen.getByText("Selecione uma opção")).not.toBeNull();
  });

  it("esconde a dica assim que avançar fica disponível", () => {
    render(<SceneNavigation onBack={() => {}} onForward={() => {}} canGoBack canGoForward isTransitioning={false} forwardHint="Selecione uma opção" />);
    expect(screen.queryByText("Selecione uma opção")).toBeNull();
  });

  it("dispara onBack/onForward ao clicar, quando habilitados", () => {
    const onBack = vi.fn();
    const onForward = vi.fn();
    render(<SceneNavigation onBack={onBack} onForward={onForward} canGoBack canGoForward isTransitioning={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Voltar para a cena anterior" }));
    fireEvent.click(screen.getByRole("button", { name: "Avançar para a próxima cena" }));
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onForward).toHaveBeenCalledTimes(1);
  });

  it("desabilita os dois botões durante uma transição, mesmo com canGoBack/canGoForward true", () => {
    render(<SceneNavigation onBack={() => {}} onForward={() => {}} canGoBack canGoForward isTransitioning />);
    expect((screen.getByRole("button", { name: "Voltar para a cena anterior" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Avançar para a próxima cena" }) as HTMLButtonElement).disabled).toBe(true);
  });
});
