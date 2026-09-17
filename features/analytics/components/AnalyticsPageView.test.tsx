// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";

let currentPathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname,
}));

const trackEventMock = vi.fn();
vi.mock("@/lib/analytics/trackEvent", () => ({
  trackEvent: (...args: unknown[]) => trackEventMock(...args),
}));

import AnalyticsPageView from "./AnalyticsPageView";

afterEach(() => {
  cleanup();
  trackEventMock.mockClear();
  currentPathname = "/";
});

describe("AnalyticsPageView (Fase 17)", () => {
  it("dispara page_view uma vez no carregamento inicial, com o pathname atual", () => {
    currentPathname = "/builder";
    render(<AnalyticsPageView />);
    expect(trackEventMock).toHaveBeenCalledTimes(1);
    expect(trackEventMock).toHaveBeenCalledWith("page_view", { path: "/builder" });
  });

  it("dispara um novo page_view quando a rota muda, sem duplicar o do carregamento inicial", () => {
    currentPathname = "/";
    const { rerender } = render(<AnalyticsPageView />);
    expect(trackEventMock).toHaveBeenCalledTimes(1);

    currentPathname = "/builder";
    rerender(<AnalyticsPageView />);
    expect(trackEventMock).toHaveBeenCalledTimes(2);
    expect(trackEventMock).toHaveBeenLastCalledWith("page_view", { path: "/builder" });
  });

  it("não dispara de novo se o componente for re-renderizado com o MESMO pathname", () => {
    currentPathname = "/";
    const { rerender } = render(<AnalyticsPageView />);
    rerender(<AnalyticsPageView />);
    expect(trackEventMock).toHaveBeenCalledTimes(1);
  });
});
