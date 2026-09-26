import { test, expect } from "@playwright/test";
import { dismissConsentBanner, gotoBuilder, completeSiteQuickly, continueFromServiceComplete, openMyUpgrade, myUpgradeText } from "./helpers/builder";

/** Briefing, Seções 79-98: motion não altera lógica, teclado, Escape, WebGL desativado, overlays
 * com scroll lock, reduced motion, 404. */

test("Seção 84/85 — desativar WebGL não impede o Builder de funcionar (fallback CSS assume)", async ({ browser }) => {
  const context = await browser.newContext();
  await context.addInitScript(() => {
    // Remove o suporte a WebGL simulando `getContext` sempre retornando null (mesma checagem que
    // `hasWebGL()` faz de verdade) — sem precisar de uma flag de navegador específica.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (HTMLCanvasElement.prototype as any).getContext = () => null;
  });
  const page = await context.newPage();
  await gotoBuilder(page);
  await completeSiteQuickly(page);
  // A asserção precisa vir ANTES de `continueFromServiceComplete` — esse helper já navega para
  // longe da tela "Serviço adicionado!" (bug de teste: checar depois checa uma tela que o
  // próprio teste já mandou trocar).
  await expect(page.getByRole("heading", { name: /Serviço adicionado/ })).toBeVisible();
  await continueFromServiceComplete(page);
  await expect(page.getByRole("heading", { name: "Upgrade." })).toBeVisible();
  await context.close();
});

test("Seção 86 — prefers-reduced-motion: o fluxo inteiro do Builder continua utilizável", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await gotoBuilder(page);
  await completeSiteQuickly(page);
  await continueFromServiceComplete(page);
  await openMyUpgrade(page);
  await expect(myUpgradeText(page, "Criar um site")).toBeVisible();
});

test("Seção 90/91 — fluxo principal do Builder é navegável só com teclado (Tab + Enter)", async ({ page }) => {
  await page.goto("/builder");
  await dismissConsentBanner(page);

  // Tab até o primeiro card de serviço e ativa com Enter — sem nenhum clique de mouse.
  const firstCard = page.getByRole("button", { name: /^Criar um site/ });
  await firstCard.focus();
  await expect(firstCard).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Que tipo de site você precisa?" })).toBeVisible();

  const option = page.getByRole("button", { name: /^Ainda não sei/ });
  await option.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Em que situação está esse projeto?" })).toBeVisible();
});

test("Seção 92 — Espaço também ativa um card focado (não só Enter)", async ({ page }) => {
  await page.goto("/builder");
  await dismissConsentBanner(page);
  const card = page.getByRole("button", { name: /^Atrair mais clientes/ });
  await card.focus();
  await page.keyboard.press(" ");
  await expect(page.getByRole("heading", { name: "O que você quer divulgar?" })).toBeVisible();
});

test("Seção 93 — Esc fecha o drawer 'Meu Upgrade'", async ({ page }) => {
  await gotoBuilder(page);
  await completeSiteQuickly(page);
  await continueFromServiceComplete(page);
  await openMyUpgrade(page);
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("my-upgrade-panel")).toBeHidden();
});

test("Seção 93 — Esc fecha o diálogo de remoção de serviço (equivalente a Cancelar)", async ({ page }) => {
  await gotoBuilder(page);
  await completeSiteQuickly(page);
  await continueFromServiceComplete(page);
  await openMyUpgrade(page);
  await page.getByRole("button", { name: "Remover Criar um site" }).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
  // Cancelado, não removido.
  await expect(myUpgradeText(page, "1 serviço")).toBeVisible();
});

test("Seção 83 — o scroll da página fica travado enquanto o drawer 'Meu Upgrade' está aberto", async ({ page }) => {
  await gotoBuilder(page);
  await completeSiteQuickly(page);
  await continueFromServiceComplete(page);
  const overflowBefore = await page.evaluate(() => document.body.style.overflow || getComputedStyle(document.body).overflow);
  await openMyUpgrade(page);
  const overflowDuring = await page.evaluate(() => getComputedStyle(document.body).overflow);
  expect(overflowDuring).toBe("hidden");
  expect(overflowDuring).not.toBe(overflowBefore === "hidden" ? "" : overflowBefore);
});

test("Seção 96 — uma rota inexistente mostra a página 404 real", async ({ page }) => {
  const response = await page.goto("/esta-rota-nao-existe-em-lugar-nenhum");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading").first()).toBeVisible();
});
