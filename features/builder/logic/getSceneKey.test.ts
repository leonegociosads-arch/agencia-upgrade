import { describe, expect, it } from "vitest";
import { getSceneKey } from "./getSceneKey";
import { initialBuilderState } from "../state/builderReducer";
import type { BuilderState } from "../types";

/**
 * `getSceneKey` só nomeia a cena que `BuilderShell.tsx` já decidiu mostrar — estes testes
 * verificam que a chave muda exatamente quando a tela visível muda (e continua igual quando não
 * muda), sem testar nenhuma animação em si (Fase Motion Design, Seção 30: nada de teste frágil
 * quadro a quadro).
 */
describe("getSceneKey (Motion Design — chave de cena do Builder)", () => {
  it("identifica o seletor de serviço quando não há serviço ativo", () => {
    expect(getSceneKey(initialBuilderState)).toBe("selector");
  });

  it("muda de chave conforme o número de respostas no rascunho avança", () => {
    const state: BuilderState = { ...initialBuilderState, step: "configuring", activeService: "site" };
    const key0 = getSceneKey(state);
    const key1 = getSceneKey({ ...state, serviceDraft: { site_tipo: "landing_page" } });
    expect(key0).not.toBe(key1);
  });

  it("mantém a mesma chave para 'contact' e 'submitting' (mesma tela, só travada)", () => {
    const contact = getSceneKey({ ...initialBuilderState, step: "contact" });
    const submitting = getSceneKey({ ...initialBuilderState, step: "submitting" });
    expect(contact).toBe(submitting);
  });

  it("reaproveita a chave de 'conclusão' assim que a última pergunta é respondida (evita cena em branco antes do autosave)", () => {
    // Fluxo completo de "site" pelo caminho mais curto (nao_sei → só 2 perguntas — ver
    // `features/builder/data/site.ts`, `estimateSiteTotalSteps`).
    const answering: BuilderState = {
      ...initialBuilderState,
      step: "configuring",
      activeService: "site",
      serviceDraft: { site_tipo: "nao_sei" },
    };
    const complete: BuilderState = {
      ...answering,
      serviceDraft: { site_tipo: "nao_sei", site_situacao: "criar_do_zero" },
      draftHistory: ["site_tipo"],
    };
    expect(getSceneKey(complete)).toBe(getSceneKey({ ...complete, step: "service_complete" }));
    expect(getSceneKey(answering)).not.toBe(getSceneKey(complete));
  });

  it("identifica success, error, review e conclusão de serviço com chaves distintas", () => {
    const keys = new Set([
      getSceneKey({ ...initialBuilderState, step: "success" }),
      getSceneKey({ ...initialBuilderState, step: "error" }),
      getSceneKey({ ...initialBuilderState, step: "reviewing" }),
      getSceneKey({ ...initialBuilderState, step: "service_complete", activeService: "trafego" }),
    ]);
    expect(keys.size).toBe(4);
  });
});
