import { describe, expect, it } from "vitest";
import { validateAnswer } from "./validateAnswer";
import type { Question } from "../types";

const singleChoice: Question = {
  id: "q_single",
  service: "site",
  title: "Pergunta de escolha única",
  type: "single_choice",
  required: true,
  options: [
    { id: "a", label: "A" },
    { id: "b", label: "B" },
  ],
};

const multiChoice: Question = {
  id: "q_multi",
  service: "site",
  title: "Pergunta de múltipla escolha",
  type: "multi_choice",
  required: true,
  options: [
    { id: "a", label: "A" },
    { id: "b", label: "B" },
  ],
};

const optional: Question = { ...singleChoice, id: "q_optional", required: false };

describe("validateAnswer", () => {
  it("obrigatória sem resposta é inválida", () => {
    expect(validateAnswer(singleChoice, undefined)).toBe(false);
  });

  it("obrigatória com resposta de texto não vazio é válida (single_choice)", () => {
    expect(validateAnswer(singleChoice, "a")).toBe(true);
  });

  it("multi_choice exige pelo menos uma opção marcada", () => {
    expect(validateAnswer(multiChoice, [])).toBe(false);
    expect(validateAnswer(multiChoice, ["a"])).toBe(true);
  });

  it("pergunta opcional sem resposta é válida", () => {
    expect(validateAnswer(optional, undefined)).toBe(true);
  });
});
