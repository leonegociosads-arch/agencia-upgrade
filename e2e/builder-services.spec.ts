import { test, expect } from "@playwright/test";
import {
  gotoBuilder,
  selectService,
  answerSingleChoice,
  answerMultiChoice,
  completeSiteQuickly,
  completeTrafego,
  completeDesign,
  continueFromServiceComplete,
  openMyUpgrade,
  myUpgradeText,
} from "./helpers/builder";

/** Briefing, Seções 6/7/8: os 3 serviços individualmente, combinações de múltiplos serviços, e
 * prevenção de duplicação (não é possível ter duas configurações do mesmo serviço). */

test("Sites e Desenvolvimento — mini-fluxo completo (com site_recursos, não só o atalho)", async ({ page }) => {
  await gotoBuilder(page);
  await selectService(page, "Criar um site");
  await answerSingleChoice(page, "Landing Page");
  await answerMultiChoice(page, ["Somente apresentação e contato"]);
  await answerSingleChoice(page, "Vou criar do zero");
  await expect(page.getByRole("heading", { name: /Serviço adicionado/ })).toBeVisible();
});

test("Tráfego Pago — mini-fluxo completo (4 perguntas fixas)", async ({ page }) => {
  await gotoBuilder(page);
  await completeTrafego(page);
  await expect(page.getByRole("heading", { name: /Serviço adicionado/ })).toBeVisible();
  await expect(page.getByText("Seu serviço de Tráfego pago foi configurado com sucesso.")).toBeVisible();
});

test("Design / Social Media — mini-fluxo completo", async ({ page }) => {
  await gotoBuilder(page);
  await completeDesign(page);
  await expect(page.getByRole("heading", { name: /Serviço adicionado/ })).toBeVisible();
});

test("Múltiplos serviços — Site + Tráfego", async ({ page }) => {
  await gotoBuilder(page);
  await completeSiteQuickly(page);
  await continueFromServiceComplete(page);
  await completeTrafego(page);
  await continueFromServiceComplete(page);
  await openMyUpgrade(page);
  await expect(myUpgradeText(page, "Criar um site")).toBeVisible();
  await expect(myUpgradeText(page, "Atrair mais clientes")).toBeVisible();
  await expect(myUpgradeText(page, "2 serviços")).toBeVisible();
});

test("Múltiplos serviços — Site + Tráfego + Design", async ({ page }) => {
  await gotoBuilder(page);
  await completeSiteQuickly(page);
  await continueFromServiceComplete(page);
  await completeTrafego(page);
  await continueFromServiceComplete(page);
  await completeDesign(page);
  await continueFromServiceComplete(page);
  await openMyUpgrade(page);
  await expect(myUpgradeText(page, "3 serviços")).toBeVisible();
});

test("Seção 8 — não é possível criar duas configurações do mesmo serviço (reabrir = editar, não duplicar)", async ({ page }) => {
  await gotoBuilder(page);
  await completeSiteQuickly(page);
  await continueFromServiceComplete(page);

  // De volta ao seletor: o card de "Criar um site" já mostra "Configurado" — clicar nele de novo
  // entra em MODO DE EDIÇÃO (não cria uma segunda entrada).
  await expect(page.getByText("Configurado")).toBeVisible();
  await selectService(page, "Criar um site");
  await expect(page.getByText(/^Editando/)).toBeVisible();

  // Sair da edição sem salvar e confirmar que "Meu Upgrade" continua com 1 item só.
  await page.getByRole("button", { name: "Cancelar edição" }).click();
  await openMyUpgrade(page);
  await expect(myUpgradeText(page, "1 serviço")).toBeVisible();
});

test("Seção 28 — Finalizar exige ao menos um serviço válido (indisponível no Meu Upgrade vazio)", async ({ page }) => {
  await gotoBuilder(page);
  await openMyUpgrade(page);
  await expect(page.getByText("Seu Upgrade ainda está vazio.")).toBeVisible();
  // Sem nenhum serviço confirmado, "Finalizar projeto" não é sequer renderizado (o painel vazio
  // mostra só "Adicionar um serviço") — confirma que o fluxo não deixa finalizar vazio.
  await expect(page.getByRole("button", { name: "Finalizar projeto" })).toHaveCount(0);
});
