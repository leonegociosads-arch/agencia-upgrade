import { describe, expect, it } from "vitest";
import { questionsByService } from "./questionsByService";
import { getNextQuestion } from "../logic/flow";
import { ALL_OPTION_ASSET_KEYS, getOptionAsset, getOptionAssetKey } from "./optionAssets";
import type { BuilderAnswers, Question, ServiceId } from "../types";

/**
 * Contextos que fazem uma pergunta de opções DINÂMICAS resolver cada um dos seus ramos.
 * Hoje só `site_recursos` muda de opções conforme a resposta anterior.
 */
const BRANCH_CONTEXTS: Record<string, BuilderAnswers[]> = {
  site_recursos: [
    { site_tipo: "landing_page" },
    { site_tipo: "site_institucional" },
    { site_tipo: "ecommerce" },
    { site_tipo: "sistema_plataforma" },
  ],
};

/** Toda pergunta realmente alcançável, com o contexto necessário para resolver suas opções. */
function allReachableQuestions(): { question: Question; answers: BuilderAnswers }[] {
  const result: { question: Question; answers: BuilderAnswers }[] = [];

  for (const service of Object.keys(questionsByService) as ServiceId[]) {
    for (const question of questionsByService[service]) {
      const contexts = BRANCH_CONTEXTS[question.id] ?? [{}];
      for (const answers of contexts) result.push({ question, answers });
    }
  }

  // "Montar um pacote" reaproveita o id `design_servico` como múltipla escolha e por isso não
  // aparece na lista declarativa — só o dispatcher a devolve.
  const combo = getNextQuestion("design", { design_servico: "quero_combinar_servicos" });
  expect(combo).not.toBeNull();
  result.push({ question: combo as Question, answers: {} });

  return result;
}

function resolveOptions(question: Question, answers: BuilderAnswers) {
  return typeof question.options === "function" ? question.options(answers) : question.options;
}

describe("optionAssets — arte de cada opção do Builder", () => {
  it("toda opção de toda pergunta alcançável tem um asset correspondente", () => {
    const faltando: string[] = [];

    for (const { question, answers } of allReachableQuestions()) {
      for (const option of resolveOptions(question, answers)) {
        if (!getOptionAsset(question, option.id)) {
          faltando.push(`${question.id} (${question.type}) -> ${option.id}`);
        }
      }
    }

    expect(faltando).toEqual([]);
  });

  it("não existe asset órfão (todo arquivo mapeado pertence a uma opção real)", () => {
    const usadas = new Set<string>();
    for (const { question, answers } of allReachableQuestions()) {
      for (const option of resolveOptions(question, answers)) {
        usadas.add(getOptionAssetKey(question, option.id));
      }
    }

    const orfaos = ALL_OPTION_ASSET_KEYS.filter((key) => !usadas.has(key));
    expect(orfaos).toEqual([]);
  });

  it("só as opções de múltipla escolha têm caixa de seleção desenhada na arte", () => {
    const divergentes: string[] = [];

    for (const { question, answers } of allReachableQuestions()) {
      for (const option of resolveOptions(question, answers)) {
        const asset = getOptionAsset(question, option.id);
        if (!asset) continue;
        const deveriaTerCaixa = question.type === "multi_choice";
        if (Boolean(asset.checkbox) !== deveriaTerCaixa) {
          divergentes.push(`${question.id} (${question.type}) -> ${option.id}`);
        }
      }
    }

    expect(divergentes).toEqual([]);
  });

  it("toda arte aponta para /assets/builder e declara dimensões (evita layout shift)", () => {
    for (const { question, answers } of allReachableQuestions()) {
      for (const option of resolveOptions(question, answers)) {
        const asset = getOptionAsset(question, option.id);
        if (!asset) continue;
        expect(asset.src.startsWith("/assets/builder/")).toBe(true);
        expect(asset.width).toBeGreaterThan(0);
        expect(asset.height).toBeGreaterThan(0);
      }
    }
  });
});
