import { describe, expect, it } from "vitest";
import { buildAdminProjectSummary } from "./buildAdminProjectSummary";
import type { ProjectSnapshot } from "@/features/builder/types";

describe("buildAdminProjectSummary — TESTE 15 (respostas com labels humanas, nunca JSON bruto)", () => {
  it("usa o título humano do serviço, não o id interno", () => {
    const project: ProjectSnapshot = { services: [{ serviceId: "site", answers: { site_tipo: "ecommerce" } }] };
    const summaries = buildAdminProjectSummary(project);
    expect(summaries[0].title).toBe("Criar um site");
    expect(summaries[0].serviceId).toBe("site");
  });

  it("cada resposta vem com pergunta e resposta em texto humano, não o valor bruto", () => {
    const project: ProjectSnapshot = { services: [{ serviceId: "site", answers: { site_tipo: "ecommerce" } }] };
    const [summary] = buildAdminProjectSummary(project);
    const item = summary.items.find((i) => i.question === "Que tipo de site você precisa?");
    expect(item?.answer).toBe("Loja Virtual / E-commerce");
    expect(item?.answer).not.toBe("ecommerce");
  });

  it("processa múltiplos serviços, um resumo por serviço, na ordem do snapshot", () => {
    const project: ProjectSnapshot = {
      services: [
        { serviceId: "site", answers: { site_tipo: "nao_sei" } },
        { serviceId: "trafego", answers: { trafego_investimento: "ate_1000" } },
      ],
    };
    const summaries = buildAdminProjectSummary(project);
    expect(summaries.map((s) => s.serviceId)).toEqual(["site", "trafego"]);
  });

  it("projeto sem serviços produz uma lista vazia, sem lançar", () => {
    expect(buildAdminProjectSummary({ services: [] })).toEqual([]);
  });
});
