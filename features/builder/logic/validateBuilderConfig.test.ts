import { describe, expect, it } from "vitest";
import { validateBuilderConfig } from "./validateBuilderConfig";
import type { Question } from "../types";

describe("validateBuilderConfig (dev guard)", () => {
  it("a configuração real do projeto não tem id de pergunta nem opção duplicados", () => {
    expect(validateBuilderConfig()).toEqual([]);
  });

  it("detecta id de pergunta duplicado dentro do mesmo serviço", () => {
    const broken: Question[] = [
      { id: "dup", service: "site", title: "A", type: "single_choice", required: true, options: [] },
      { id: "dup", service: "site", title: "B", type: "single_choice", required: true, options: [] },
    ];
    const problems = validateBuilderConfig({ site: broken });
    expect(problems.some((p) => p.includes('pergunta duplicado "dup"'))).toBe(true);
  });

  it("detecta opção duplicada dentro da mesma pergunta", () => {
    const broken: Question[] = [
      {
        id: "q",
        service: "site",
        title: "A",
        type: "single_choice",
        required: true,
        options: [
          { id: "x", label: "X" },
          { id: "x", label: "X repetido" },
        ],
      },
    ];
    const problems = validateBuilderConfig({ site: broken });
    expect(problems.some((p) => p.includes('opção duplicada "x"'))).toBe(true);
  });
});
