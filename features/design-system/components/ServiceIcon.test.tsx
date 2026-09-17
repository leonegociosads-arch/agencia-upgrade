// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ServiceIcon from "./ServiceIcon";

describe("ServiceIcon (identidade visual oficial)", () => {
  it.each(["site", "trafego", "design"] as const)(
    "renderiza um svg decorativo para o serviço '%s' sem lançar erro",
    (serviceId) => {
      const { container } = render(<ServiceIcon serviceId={serviceId} />);
      const svg = container.querySelector("svg");
      expect(svg).not.toBeNull();
      expect(svg?.getAttribute("aria-hidden")).toBe("true");
    }
  );
});
