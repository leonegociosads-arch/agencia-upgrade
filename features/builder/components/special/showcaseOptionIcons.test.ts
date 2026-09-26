import { describe, expect, it } from "vitest";
import { getNextQuestion } from "../../logic/flow";
import { getQuestionLayout } from "../../logic/getQuestionLayout";
import type { BuilderAnswers, ServiceId } from "../../types";
import { getShowcaseOptionIcon } from "./showcaseOptionIcons";

/** Todos os caminhos que chegam numa pergunta com o painel especial. */
const SPECIAL_PATHS: Array<[ServiceId, BuilderAnswers]> = [
  ["site", { site_tipo: "landing_page" }],
  ["site", { site_tipo: "ecommerce" }],
  ["site", { site_tipo: "sistema_plataforma" }],
  ["trafego", { trafego_negocio: "servicos", trafego_destino: "whatsapp" }],
  ["design", { design_servico: "identidade_visual" }],
  ["design", { design_servico: "design_redes_sociais" }],
  ["design", { design_servico: "gestao_social_media" }],
  ["design", { design_servico: "criativos_anuncios" }],
  ["design", { design_servico: "edicao_video" }],
];

describe("ícones das opções do painel especial", () => {
  it.each(SPECIAL_PATHS)("%s %j: toda opção da pergunta especial tem ilustração", (serviceId, answers) => {
    const question = getNextQuestion(serviceId, answers);
    expect(question).not.toBeNull();
    expect(getQuestionLayout(question!, answers)).toBe("browser-panel");
    const options = typeof question!.options === "function" ? question!.options(answers) : question!.options;
    const missing = options.filter((option) => getShowcaseOptionIcon(question!.id, option.id) === null).map((option) => option.id);
    expect(missing).toEqual([]);
  });
});
