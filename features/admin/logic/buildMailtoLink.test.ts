import { describe, expect, it } from "vitest";
import { buildMailtoLink } from "./buildMailtoLink";

describe("buildMailtoLink", () => {
  it("gera um link mailto com o e-mail informado", () => {
    expect(buildMailtoLink("joao@teste.com")).toBe("mailto:joao@teste.com");
  });
});
