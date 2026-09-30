// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { BuilderProvider } from "../../state/BuilderContext";
import { LeadProvider } from "@/features/lead/state/LeadContext";
import BuilderShell from "../BuilderShell";

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

describe("TrafficOptionCard (laboratório visual — 1ª pergunta de Tráfego Pago)", () => {
  it("a 1ª pergunta de Tráfego usa o card em código: sem PNG, com texto visível e identificador 01…06", async () => {
    const { container } = renderBuilder();
    fireEvent.click(screen.getByText("Atrair mais clientes"));
    await screen.findByRole("heading", { name: "O que você quer divulgar?" });

    expect(container.querySelectorAll('img[src*="trafego_negocio"]')).toHaveLength(0);
    expect(screen.getByRole("button", { name: /Negócio local/ })).toBeTruthy();
    expect(screen.getByText("Restaurante, clínica, academia, loja física e negócios locais.")).toBeTruthy();
    expect(screen.getByText("01")).toBeTruthy();
    expect(screen.getByText("06")).toBeTruthy();
  });

  it("o clique continua respondendo e avançando; destino e investimento também usam o card em código", async () => {
    const { container } = renderBuilder();
    fireEvent.click(screen.getByText("Atrair mais clientes"));
    fireEvent.click(await screen.findByRole("button", { name: /Negócio local/ }));

    await screen.findByRole("heading", { name: "Onde você quer gerar o resultado?" });
    expect(container.querySelectorAll('img[src*="trafego_destino"]')).toHaveLength(0);
    expect(screen.getByText("05")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /WhatsApp/ }));

    // A 3ª pergunta é a cena especial (banner branco) e continua como estava.
    await screen.findByRole("heading", { name: "Qual é sua situação atual com anúncios?" });
    expect(screen.queryByText("01")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Nunca anunciei/ }));
    fireEvent.click(screen.getByRole("button", { name: /Próxima/ }));

    await screen.findByRole("heading", { name: "Quanto pretende investir em anúncios por mês?" });
    expect(container.querySelectorAll('img[src*="trafego_investimento"]')).toHaveLength(0);
    fireEvent.click(screen.getByText("Até R$ 1.000"));
    await screen.findByRole("heading", { name: /Serviço adicionado/ });
  });

  it("as outras categorias não mudam: a 1ª pergunta do Site continua com os PNGs", async () => {
    const { container } = renderBuilder();
    fireEvent.click(screen.getByText("Criar um site"));
    await screen.findByRole("heading", { name: "Que tipo de site você precisa?" });
    expect(container.querySelectorAll('img[src*="site_tipo"]').length).toBeGreaterThan(0);
  });
});
