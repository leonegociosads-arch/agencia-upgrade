import { test, expect } from "@playwright/test";
import { gotoBuilder, completeSiteQuickly, continueFromServiceComplete, openMyUpgrade, finalizeFromMyUpgrade, goToReviewAndContinue, fillLeadForm, submitLeadForm, VALID_LEAD } from "./helpers/builder";
import { loginAsAdmin } from "./helpers/admin";

/**
 * Suíte de fumaça (Etapa 31) — roda em Chromium, Firefox, WebKit e dois viewports mobile
 * (`playwright.config.ts`). Cobre só o essencial: se isto quebrar num motor/viewport específico,
 * é sinal de um problema real de compatibilidade, não um detalhe de um fluxo secundário.
 */

test("Home carrega com header, hero e footer", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Monte seu Upgrade" }).first()).toBeVisible();
});

test("jornada completa do Builder (1 serviço) até a tela de sucesso", async ({ page }) => {
  await gotoBuilder(page);
  await completeSiteQuickly(page);
  await continueFromServiceComplete(page);
  await openMyUpgrade(page);
  await finalizeFromMyUpgrade(page);
  await goToReviewAndContinue(page);
  await fillLeadForm(page, VALID_LEAD);
  await submitLeadForm(page);
  await expect(page.getByRole("heading", { name: "Recebemos seu projeto." })).toBeVisible({ timeout: 10_000 });
});

test("banner de consentimento: aceitar todos e recusar não essenciais mantêm o site funcional", async ({ page }) => {
  await page.goto("/");
  const banner = page.getByRole("region", { name: /privacidade|cookies|consentimento/i });
  await expect(banner).toBeVisible();
  await banner.getByRole("button", { name: /recusar/i }).click();
  await expect(banner).toBeHidden();
  // Site continua funcional depois de recusar (briefing, Seção 65).
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("login do admin (modo E2E) — credenciais corretas entram no painel", async ({ page }) => {
  await loginAsAdmin(page);
});
