// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import ServiceSelectorCard from "./ServiceSelectorCard";

afterEach(cleanup);

function renderCard(serviceId: "site" | "trafego" | "design", highPriority = false) {
  return render(
    <ServiceSelectorCard
      serviceId={serviceId}
      label={serviceId}
      configured={false}
      disabled={false}
      active={false}
      dimmed={false}
      onHoverChange={() => {}}
      onSelect={() => {}}
      highPriority={highPriority}
    />,
  );
}

describe("ServiceSelectorCard — carregamento das artes (performance, auditoria 09/11/2026)", () => {
  it("nenhuma carta é 'preguiçosa' (as três ficam acima da dobra)", () => {
    for (const id of ["site", "trafego", "design"] as const) {
      const { container, unmount } = renderCard(id);
      expect(container.querySelector("img")?.getAttribute("loading")).not.toBe("lazy");
      unmount();
    }
  });

  it("a carta central do carrossel do celular baixa com prioridade alta", () => {
    const { container } = renderCard("trafego", true);
    const img = container.querySelector("img");
    expect(img?.getAttribute("fetchpriority")).toBe("high");
    expect(img?.getAttribute("loading")).toBe("eager");
  });
});
