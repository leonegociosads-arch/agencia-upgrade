// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { BuilderProvider } from "../state/BuilderContext";
import { LeadProvider } from "@/features/lead/state/LeadContext";
import BuilderShell from "./BuilderShell";

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

/**
 * Testes obrigatórios da Fase GSAP e Transições (briefing, Seção 48) — comportamento funcional do
 * Builder com as transições de cena/cards reais, não frame a frame (Seção 47). O ambiente de teste
 * roda com `prefers-reduced-motion: reduce` por padrão (`vitest.setup.ts`), então toda transição
 * resolve de forma síncrona — exatamente o que permite testar o FLUXO real sem simular tempo.
 *
 * Itens 7/8/12 da Seção 48 (editar serviço, cancelar edição, refresh/persistência) já têm
 * cobertura própria e mais detalhada em `MyUpgrade.test.tsx`, `ProjectReview.test.tsx` e
 * `BuilderShell.sessionPersistence.test.tsx` — não duplicados aqui.
 */
describe("Builder — comportamento de motion/transição (Fase GSAP e Transições)", () => {
  it("1. selecionar uma opção de múltipla escolha não avança sozinho para a próxima cena", () => {
    renderBuilder();
    fireEvent.click(screen.getByText("Criar um site"));
    fireEvent.click(screen.getByText("Site Institucional"));

    expect(screen.getByText("O que esse projeto precisa ter?")).toBeTruthy();
    fireEvent.click(screen.getByText("Somente apresentação e contato"));

    // Ainda na mesma cena — nenhuma navegação aconteceu só por marcar uma opção.
    expect(screen.getByText("O que esse projeto precisa ter?")).toBeTruthy();
  });

  it("2. 'Próxima' (painel especial) fica desabilitado sem nenhuma opção marcada, e habilita após marcar uma", () => {
    renderBuilder();
    fireEvent.click(screen.getByText("Criar um site"));
    fireEvent.click(screen.getByText("Site Institucional"));

    const continueButton = screen.getByRole("button", { name: "Próxima" });
    expect((continueButton as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(screen.getByText("Somente apresentação e contato"));
    expect((continueButton as HTMLButtonElement).disabled).toBe(false);
  });

  it("3. 'Próxima' (painel especial) avança exatamente uma cena (não pula perguntas)", () => {
    renderBuilder();
    fireEvent.click(screen.getByText("Criar um site"));
    fireEvent.click(screen.getByText("Site Institucional"));
    fireEvent.click(screen.getByText("Somente apresentação e contato"));
    fireEvent.click(screen.getByRole("button", { name: "Próxima" }));

    // A pergunta seguinte no fluxo de "site" é "Em que situação está esse projeto?" — nunca a
    // tela de conclusão diretamente (que exigiria também `site_situacao` respondida).
    expect(screen.getByText("Em que situação está esse projeto?")).toBeTruthy();
  });

  it("4. duplo clique em 'Próxima' (painel especial) não pula duas perguntas", () => {
    renderBuilder();
    fireEvent.click(screen.getByText("Criar um site"));
    fireEvent.click(screen.getByText("Site Institucional"));
    fireEvent.click(screen.getByText("Somente apresentação e contato"));

    const continueButton = screen.getByRole("button", { name: "Próxima" });
    fireEvent.click(continueButton);
    fireEvent.click(continueButton); // mesmo elemento, clique imediato em seguida

    // Chegou em "site_situacao" (uma cena à frente) — não em "conclusão" (duas cenas à frente).
    expect(screen.getByText("Em que situação está esse projeto?")).toBeTruthy();
    expect(screen.queryByText(/adicionado ao seu Upgrade/)).toBeNull();
  });

  it("5. 'Voltar' retorna à pergunta anterior corretamente", () => {
    renderBuilder();
    fireEvent.click(screen.getByText("Criar um site"));
    fireEvent.click(screen.getByText("Site Institucional"));
    fireEvent.click(screen.getByText("Somente apresentação e contato"));
    fireEvent.click(screen.getByRole("button", { name: "Próxima" }));
    expect(screen.getByText("Em que situação está esse projeto?")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "← Voltar" }));

    expect(screen.getByText("O que esse projeto precisa ter?")).toBeTruthy();
  });

  it("6. o estado 'selecionado' de uma opção permanece visível depois do clique (não é só a timeline)", () => {
    renderBuilder();
    fireEvent.click(screen.getByText("Criar um site"));
    fireEvent.click(screen.getByText("Site Institucional"));

    const option = screen.getByRole("button", { name: /Somente apresentação e contato/ });
    // "O que esse projeto precisa ter?" usa o painel especial (`ShowcaseQuestionPanel`): o estado
    // marcado ganha um check explícito (`[data-selection-check]`) além do verde — as opções também têm
    // ícone próprio, então procurar "qualquer <svg>" não serviria. A intenção do teste continua a
    // mesma — seleção nunca depende só de cor: existe um indicador explícito que aparece no clique
    // e some sem ele.
    expect(option.querySelector("[data-selection-check]")).toBeNull();

    fireEvent.click(option);

    expect(option.getAttribute("aria-pressed")).toBe("true");
    expect(option.querySelector("[data-selection-check]")).not.toBeNull();
  });

  it("9. Meu Upgrade abre e fecha", async () => {
    renderBuilder();
    fireEvent.click(screen.getByRole("button", { name: /Meu Upgrade/ }));
    expect(await screen.findByText("Seu Upgrade ainda está vazio.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Fechar Meu Upgrade" }));
    expect(screen.queryByText("Seu Upgrade ainda está vazio.")).toBeNull();
  });

  it("10. com reduced motion (padrão deste ambiente de teste), o fluxo funcional continua idêntico", () => {
    // Este é, na prática, o que TODOS os testes acima já verificam (o ambiente roda com
    // `prefers-reduced-motion: reduce` — ver `vitest.setup.ts`); este teste existe só para deixar
    // essa garantia nomeada e explícita, como pedido pela Seção 48, item 10.
    renderBuilder();
    fireEvent.click(screen.getByText("Criar um site"));
    fireEvent.click(screen.getByText("Ainda não sei"));
    fireEvent.click(screen.getByText("Vou criar do zero"));

    expect(screen.getByText(/adicionado ao seu Upgrade/)).toBeTruthy();
  });

  it("11. desmontar o Builder no meio de uma transição não lança erro (cleanup do GSAP)", () => {
    const { unmount } = renderBuilder();
    fireEvent.click(screen.getByText("Criar um site"));
    fireEvent.click(screen.getByText("Ainda não sei"));

    expect(() => unmount()).not.toThrow();
  });
});
