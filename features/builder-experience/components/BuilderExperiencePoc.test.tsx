// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import BuilderExperiencePoc from "./BuilderExperiencePoc";

afterEach(cleanup);

/**
 * Testes de comportamento (não de frame de animação — mesma filosofia da Fase GSAP e Transições).
 * O ambiente de teste roda com `prefers-reduced-motion: reduce` por padrão (`vitest.setup.ts`),
 * então toda troca de cena aqui resolve de forma síncrona — o fluxo real (seleção, bloqueio de
 * avançar, voltar preservando escolha) é exercitado de ponta a ponta sem precisar simular tempo.
 */
describe("BuilderExperiencePoc (Prova de Conceito — Builder)", () => {
  it("Cena 1 mostra as 3 categorias reais, e Avançar começa desabilitado", () => {
    render(<BuilderExperiencePoc />);
    expect(screen.getByText("Criar um site")).not.toBeNull();
    expect(screen.getByText("Atrair mais clientes")).not.toBeNull();
    expect(screen.getByText("Fortalecer minha marca e conteúdo")).not.toBeNull();
    expect((screen.getByRole("button", { name: "Avançar para a próxima cena" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("selecionar um card NÃO avança sozinho — só habilita o botão Avançar", () => {
    render(<BuilderExperiencePoc />);
    fireEvent.click(screen.getByRole("button", { name: /Criar um site/ }));

    // continua na Cena 1
    expect(screen.getByText("Por onde você quer começar?")).not.toBeNull();
    expect((screen.getByRole("button", { name: /Criar um site/ }) as HTMLButtonElement).getAttribute("aria-pressed")).toBe("true");
    expect((screen.getByRole("button", { name: "Avançar para a próxima cena" }) as HTMLButtonElement).disabled).toBe(false);
  });

  it("clicar Avançar depois de selecionar Site leva à pergunta real 'Que tipo de site você precisa?'", () => {
    render(<BuilderExperiencePoc />);
    fireEvent.click(screen.getByRole("button", { name: /Criar um site/ }));
    fireEvent.click(screen.getByRole("button", { name: "Avançar para a próxima cena" }));

    expect(screen.getByText("Que tipo de site você precisa?")).not.toBeNull();
    expect(screen.getByText("Landing Page")).not.toBeNull();
  });

  it("Voltar retorna à Cena 1 mantendo a escolha anterior selecionada", () => {
    render(<BuilderExperiencePoc />);
    fireEvent.click(screen.getByRole("button", { name: /Criar um site/ }));
    fireEvent.click(screen.getByRole("button", { name: "Avançar para a próxima cena" }));
    fireEvent.click(screen.getByRole("button", { name: "Voltar para a cena anterior" }));

    expect(screen.getByText("Por onde você quer começar?")).not.toBeNull();
    expect((screen.getByRole("button", { name: /Criar um site/ }) as HTMLButtonElement).getAttribute("aria-pressed")).toBe("true");
  });

  it("trocar de serviço na Cena 1 mostra a pergunta correspondente ao NOVO serviço na Cena 2", () => {
    render(<BuilderExperiencePoc />);
    fireEvent.click(screen.getByRole("button", { name: /Atrair mais clientes/ }));
    fireEvent.click(screen.getByRole("button", { name: "Avançar para a próxima cena" }));

    expect(screen.getByText("O que você quer divulgar?")).not.toBeNull();
  });

  it("na Cena 2, selecionar uma opção habilita Avançar; avançar leva à Cena 3 (fim da prova)", () => {
    render(<BuilderExperiencePoc />);
    fireEvent.click(screen.getByRole("button", { name: /Criar um site/ }));
    fireEvent.click(screen.getByRole("button", { name: "Avançar para a próxima cena" }));
    expect((screen.getByRole("button", { name: "Avançar para a próxima cena" }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: /Landing Page/ }));
    expect((screen.getByRole("button", { name: "Avançar para a próxima cena" }) as HTMLButtonElement).disabled).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "Avançar para a próxima cena" }));
    expect(screen.getByText("Fim da prova de conceito")).not.toBeNull();
  });

  it("'Reiniciar prova' na Cena 3 volta ao início, limpo", () => {
    render(<BuilderExperiencePoc />);
    fireEvent.click(screen.getByRole("button", { name: /Criar um site/ }));
    fireEvent.click(screen.getByRole("button", { name: "Avançar para a próxima cena" }));
    fireEvent.click(screen.getByRole("button", { name: /Landing Page/ }));
    fireEvent.click(screen.getByRole("button", { name: "Avançar para a próxima cena" }));
    fireEvent.click(screen.getByRole("button", { name: "Reiniciar prova" }));

    expect(screen.getByText("Por onde você quer começar?")).not.toBeNull();
    expect((screen.getByRole("button", { name: /Criar um site/ }) as HTMLButtonElement).getAttribute("aria-pressed")).toBe("false");
    expect((screen.getByRole("button", { name: "Avançar para a próxima cena" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("Voltar desabilitado na Cena 1 (nada para voltar)", () => {
    render(<BuilderExperiencePoc />);
    expect((screen.getByRole("button", { name: "Voltar para a cena anterior" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("desmonta sem lançar erro em qualquer cena", () => {
    const { unmount } = render(<BuilderExperiencePoc />);
    fireEvent.click(screen.getByRole("button", { name: /Criar um site/ }));
    fireEvent.click(screen.getByRole("button", { name: "Avançar para a próxima cena" }));
    expect(() => unmount()).not.toThrow();
  });
});
