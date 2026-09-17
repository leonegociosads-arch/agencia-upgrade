// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import MyUpgradeItem from "./MyUpgradeItem";
import type { UpgradeItem } from "../types";

afterEach(cleanup);

// "trafego" tem 4 perguntas fixas (MAX_VISIBLE_SUMMARY_ITEMS = 3) — o fixture certo para exercitar
// "+ N mais"/"Mostrar menos" (Microinterações, Seção 17: "expandir").
const TRAFEGO_ITEM: UpgradeItem = {
  serviceId: "trafego",
  status: "complete",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  answers: {
    trafego_negocio: "servicos",
    trafego_destino: "whatsapp",
    trafego_experiencia: "nunca_anunciei",
    trafego_investimento: "ate_1000",
  },
};

describe("MyUpgradeItem (Microinterações, Seção 17 — expandir/remover)", () => {
  it("mostra só 3 respostas por padrão, com o botão '+ 1 mais'", () => {
    render(<MyUpgradeItem serviceId="trafego" item={TRAFEGO_ITEM} onEdit={() => {}} onRemove={() => {}} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByRole("button", { name: "+ 1 mais" })).not.toBeNull();
  });

  it("clicar em '+ N mais' expande a lista completa e mostra 'Mostrar menos'", () => {
    render(<MyUpgradeItem serviceId="trafego" item={TRAFEGO_ITEM} onEdit={() => {}} onRemove={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "+ 1 mais" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(screen.getByRole("button", { name: "Mostrar menos" })).not.toBeNull();
  });

  it("'Mostrar menos' volta a cortar em 3", () => {
    render(<MyUpgradeItem serviceId="trafego" item={TRAFEGO_ITEM} onEdit={() => {}} onRemove={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "+ 1 mais" }));
    fireEvent.click(screen.getByRole("button", { name: "Mostrar menos" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("onEdit/onRemove disparam ao clicar; Remover toca ui_press", () => {
    const onEdit = vi.fn();
    const onRemove = vi.fn();
    render(<MyUpgradeItem serviceId="trafego" item={TRAFEGO_ITEM} onEdit={onEdit} onRemove={onRemove} />);

    fireEvent.click(screen.getByRole("button", { name: /Editar/ }));
    expect(onEdit).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /Remover/ }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
