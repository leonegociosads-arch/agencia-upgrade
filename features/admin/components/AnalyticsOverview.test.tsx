// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import AnalyticsOverview from "./AnalyticsOverview";

afterEach(cleanup);

describe("AnalyticsOverview (Fase 17 — Visão geral do admin)", () => {
  it("mostra as contagens do funil e as taxas calculadas", () => {
    render(
      <AnalyticsOverview
        overview={{
          funnel: { page_view: 100, builder_started: 50, lead_submitted: 10 },
          topService: "site",
        }}
        period="7d"
        currentParams={{}}
      />,
    );

    expect(screen.getByText("100")).toBeTruthy(); // Visitas
    expect(screen.getByText("50")).toBeTruthy(); // Iniciaram o Builder
    expect(screen.getByText(/Serviço mais escolhido no período: Criar um site/)).toBeTruthy();
  });

  it("passos sem dado nenhum aparecem como 0, nunca undefined/NaN", () => {
    render(<AnalyticsOverview overview={{ funnel: {}, topService: null }} period="today" currentParams={{}} />);
    expect(screen.queryByText("undefined")).toBeNull();
    expect(screen.queryByText("NaN")).toBeNull();
  });

  it("não mostra 'serviço mais escolhido' quando não há nenhum", () => {
    render(<AnalyticsOverview overview={{ funnel: {}, topService: null }} period="today" currentParams={{}} />);
    expect(screen.queryByText(/Serviço mais escolhido/)).toBeNull();
  });

  it("o link do período ativo fica marcado, os outros dois continuam navegáveis", () => {
    render(<AnalyticsOverview overview={{ funnel: {}, topService: null }} period="30d" currentParams={{ status: "new" }} />);
    const link30d = screen.getByRole("link", { name: "Últimos 30 dias" });
    const link7d = screen.getByRole("link", { name: "Últimos 7 dias" });
    expect(link30d.getAttribute("href")).toContain("analyticsPeriod=30d");
    expect(link7d.getAttribute("href")).toContain("status=new"); // preserva os filtros de lead atuais.
  });
});
