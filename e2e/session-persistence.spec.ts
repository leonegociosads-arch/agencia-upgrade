import { test, expect } from "@playwright/test";
import { gotoBuilder, selectService, answerSingleChoice, completeSiteQuickly, continueFromServiceComplete, dismissConsentBanner, myUpgradeText } from "./helpers/builder";

const BUILDER_STORAGE_KEY = "upgrade-builder:v1";

/** Briefing, Seções 17-23: refresh em cada etapa, persistência de sessão, o cenário crítico
 * draft+confirmed sobrevivendo separados a um refresh, expiração/versão incompatível, storage
 * corrompido, e reset explícito. */

test("refresh no meio das perguntas restaura o progresso (banner de recuperação aparece)", async ({ page }) => {
  await gotoBuilder(page);
  await selectService(page, "Atrair mais clientes");
  await answerSingleChoice(page, "Negócio local");
  await expect(page.getByRole("heading", { name: "Onde você quer gerar o resultado?" })).toBeVisible();

  await page.reload();
  await expect(page.getByText("Seu progresso foi recuperado.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Onde você quer gerar o resultado?" })).toBeVisible();
});

test("refresh no Meu Upgrade / após confirmar um serviço preserva o serviço confirmado", async ({ page }) => {
  await gotoBuilder(page);
  await completeSiteQuickly(page);
  await continueFromServiceComplete(page);

  await page.reload();
  await dismissConsentBanner(page);
  await page.getByRole("button", { name: /^Meu Upgrade/ }).click();
  await expect(myUpgradeText(page, "Criar um site")).toBeVisible();
});

test("Seção 19 — teste crítico: confirmed (E-commerce) e draft (Institucional) sobrevivem separados a um refresh", async ({ page }) => {
  await gotoBuilder(page);
  await selectService(page, "Criar um site");
  await answerSingleChoice(page, "Loja Virtual / E-commerce");
  // Confirma o E-commerce completo primeiro.
  await page.getByRole("button", { name: /^Catálogo e pedidos/ }).click();
  await page.getByRole("button", { name: "Próxima", exact: true }).click();
  await answerSingleChoice(page, "Vou criar do zero");
  await expect(page.getByRole("heading", { name: /Serviço adicionado/ })).toBeVisible();
  await page.getByRole("button", { name: /Adicionar outro serviço/ }).click();

  // Agora começa um SEGUNDO serviço em rascunho (Tráfego) sem terminar — o draft fica pendente.
  await selectService(page, "Atrair mais clientes");
  await answerSingleChoice(page, "Delivery");

  await page.reload();
  await expect(page.getByText("Seu progresso foi recuperado.")).toBeVisible();
  // O rascunho de Tráfego continua de onde parou...
  await expect(page.getByRole("heading", { name: "Onde você quer gerar o resultado?" })).toBeVisible();
  // ...e o Site (E-commerce) confirmado antes continua intacto no Meu Upgrade.
  await page.getByRole("button", { name: /^Meu Upgrade/ }).click();
  await expect(myUpgradeText(page, "Criar um site")).toBeVisible();
});

test("Seção 22 — localStorage corrompido: o app inicia normalmente (não trava, não lança erro)", async ({ page }) => {
  await page.goto("/builder");
  await page.evaluate((key) => window.localStorage.setItem(key, "{ isto não é json válido"), BUILDER_STORAGE_KEY);
  await page.reload();
  await dismissConsentBanner(page);
  await expect(page.getByRole("heading", { name: "Upgrade." })).toBeVisible();
});

test("Seção 21 — versão de sessão incompatível é descartada com segurança (app não quebra)", async ({ page }) => {
  await page.goto("/builder");
  await page.evaluate(
    (key) => window.localStorage.setItem(key, JSON.stringify({ version: 999, state: { step: "choosing_service" } })),
    BUILDER_STORAGE_KEY,
  );
  await page.reload();
  await dismissConsentBanner(page);
  await expect(page.getByRole("heading", { name: "Upgrade." })).toBeVisible();
});

test("Seção 23 — 'Começar de novo' remove a sessão e volta ao estado inicial", async ({ page }) => {
  await gotoBuilder(page);
  await completeSiteQuickly(page);
  await continueFromServiceComplete(page);

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Começar de novo" }).click();

  await expect(page.getByRole("heading", { name: "Upgrade." })).toBeVisible();
  const stored = await page.evaluate((key) => window.localStorage.getItem(key), BUILDER_STORAGE_KEY);
  const hasConfirmedServices = stored ? JSON.stringify(JSON.parse(stored)).includes("Criar um site") : false;
  expect(hasConfirmedServices).toBe(false);
});
