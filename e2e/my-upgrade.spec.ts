import { test, expect } from "@playwright/test";
import { gotoBuilder, completeSiteQuickly, completeTrafego, completeDesign, continueFromServiceComplete, openMyUpgrade, myUpgradeText } from "./helpers/builder";

/** Briefing, Seções 24-27: estado vazio, adicionar/editar/remover a partir de "Meu Upgrade" —
 * remover o último, um intermediário, e um entre vários. */

test("Meu Upgrade vazio mostra o estado vazio real (não uma lista em branco)", async ({ page }) => {
  await gotoBuilder(page);
  await openMyUpgrade(page);
  await expect(page.getByText("Seu Upgrade ainda está vazio.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Adicionar um serviço" })).toBeVisible();
});

test("remover o último (e único) serviço volta ao estado vazio", async ({ page }) => {
  await gotoBuilder(page);
  await completeSiteQuickly(page);
  await continueFromServiceComplete(page);
  await openMyUpgrade(page);
  await page.getByRole("button", { name: "Remover Criar um site" }).click();
  await page.getByRole("button", { name: "Remover", exact: true }).click();
  await expect(page.getByText("Seu Upgrade ainda está vazio.")).toBeVisible();
});

test("remover um serviço intermediário entre 3 preserva os outros dois", async ({ page }) => {
  await gotoBuilder(page);
  await completeSiteQuickly(page);
  await continueFromServiceComplete(page);
  await completeTrafego(page);
  await continueFromServiceComplete(page);
  await completeDesign(page);
  await continueFromServiceComplete(page);
  await openMyUpgrade(page);

  await page.getByRole("button", { name: "Remover Atrair mais clientes" }).click();
  await page.getByRole("button", { name: "Remover", exact: true }).click();

  await expect(myUpgradeText(page, "2 serviços")).toBeVisible();
  await expect(myUpgradeText(page, "Criar um site")).toBeVisible();
  await expect(myUpgradeText(page, "Fortalecer minha marca e conteúdo")).toBeVisible();
  await expect(myUpgradeText(page, "Atrair mais clientes")).toHaveCount(0);
});

test("cancelar a remoção no diálogo não remove nada", async ({ page }) => {
  await gotoBuilder(page);
  await completeSiteQuickly(page);
  await continueFromServiceComplete(page);
  await openMyUpgrade(page);

  await page.getByRole("button", { name: "Remover Criar um site" }).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await page.getByRole("button", { name: "Cancelar" }).click();
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
  await expect(myUpgradeText(page, "1 serviço")).toBeVisible();
});

test("editar a partir de Meu Upgrade e voltar preserva os demais serviços confirmados", async ({ page }) => {
  await gotoBuilder(page);
  await completeSiteQuickly(page);
  await continueFromServiceComplete(page);
  await completeTrafego(page);
  await continueFromServiceComplete(page);
  await openMyUpgrade(page);

  await page.getByRole("button", { name: "Editar Criar um site" }).click();
  await expect(page.getByText(/^Editando/)).toBeVisible();
  await page.getByRole("button", { name: "Cancelar edição" }).click();

  // O painel "Meu Upgrade" é uma seção persistente (nunca fecha sozinho ao editar/cancelar —
  // `MyUpgrade.tsx`) — continua aberto aqui, sem precisar reabri-lo.
  await expect(myUpgradeText(page, "2 serviços")).toBeVisible();
});
