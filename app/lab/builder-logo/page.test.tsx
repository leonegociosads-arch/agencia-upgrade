import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

import BuilderLogoLabPage, { metadata } from "./page";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("/lab/builder-logo (protótipo isolado)", () => {
  it("responde 404 em produção", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(() => BuilderLogoLabPage()).toThrow("NEXT_NOT_FOUND");
  });

  it("não é indexável", () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
