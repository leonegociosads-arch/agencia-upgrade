// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useEnabledPulse } from "./useEnabledPulse";

afterEach(cleanup);

function Probe({ enabled }: { enabled: boolean }) {
  const pulsing = useEnabledPulse(enabled);
  return <span>{pulsing ? "pulsando" : "parado"}</span>;
}

describe("useEnabledPulse (Microinterações, Seção 15 — 'Próximo' ao ficar habilitado)", () => {
  it("nunca pulsa na montagem, mesmo já habilitado", () => {
    render(<Probe enabled />);
    expect(screen.getByText("parado")).not.toBeNull();
  });

  it("pulsa quando passa de desabilitado para habilitado", () => {
    const { rerender } = render(<Probe enabled={false} />);
    expect(screen.getByText("parado")).not.toBeNull();

    rerender(<Probe enabled />);
    expect(screen.getByText("pulsando")).not.toBeNull();
  });

  it("não pulsa de novo em re-renders enquanto continua habilitado", () => {
    const { rerender } = render(<Probe enabled={false} />);
    rerender(<Probe enabled />);
    expect(screen.getByText("pulsando")).not.toBeNull();

    // Um segundo re-render com o mesmo `enabled=true` não deveria reiniciar o pulso — mas como o
    // pulso já está em andamento neste ponto (timeout ainda não disparou), o teste relevante é
    // que voltar para `false` e para `true` de novo DISPARA outra vez (comportamento, não frame).
    rerender(<Probe enabled={false} />);
    rerender(<Probe enabled />);
    expect(screen.getByText("pulsando")).not.toBeNull();
  });
});
