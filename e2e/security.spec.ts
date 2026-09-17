import { test, expect } from "@playwright/test";
import { gotoBuilder, completeSiteQuickly, continueFromServiceComplete, openMyUpgrade, finalizeFromMyUpgrade, goToReviewAndContinue, fillLeadForm, submitLeadForm, VALID_LEAD } from "./helpers/builder";

/**
 * Briefing, Seções 71-78: reexecução (em superfície) das defesas da Etapa 29, sem gerar ataque
 * real (Seção 74: "confirmar resposta correta", não um teste de carga). RLS pública (Seções 72/73)
 * e bypass de admin sem sessão já estão cobertos por `admin.spec.ts`; XSS em nota administrativa já
 * está em `admin.spec.ts`. Este arquivo cobre o que falta: honeypot, rate limit (em pequena escala)
 * e a ausência de open redirect.
 */

test("Seção 75 — honeypot: submissão com o campo-armadilha preenchido é rejeitada, sem criar lead", async ({ page }) => {
  await gotoBuilder(page);
  await completeSiteQuickly(page);
  await continueFromServiceComplete(page);
  await openMyUpgrade(page);
  await finalizeFromMyUpgrade(page);
  await goToReviewAndContinue(page);
  await fillLeadForm(page, VALID_LEAD);

  // Campo invisível (`company_website`) — só um "bot" preenchendo via DOM direto o alcançaria;
  // uma pessoa navegando normalmente nunca o vê nem o alcança por Tab.
  await page.locator("#company_website").evaluate((el, value) => {
    (el as HTMLInputElement).value = value;
  }, "http://spam.example/bot");

  await submitLeadForm(page);
  await expect(page.getByText("Não conseguimos enviar agora. Seus dados continuam preenchidos.")).toBeVisible();
  // Nunca deveria ter avançado para a tela de sucesso.
  await expect(page.getByRole("heading", { name: "Recebemos seu projeto." })).toHaveCount(0);
});

test("Seção 74 — rate limit de login: a 6ª tentativa em sequência é bloqueada com mensagem clara", async ({ page }) => {
  await page.goto("/admin/login");
  const uniqueEmail = `rate-limit-${Date.now()}@e2e.test`;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    await page.getByLabel("E-mail").fill(uniqueEmail);
    await page.getByLabel("Senha").fill("senha-errada");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText(/E-mail ou senha inválidos\.|Muitas tentativas de login\./)).toBeVisible();
  }

  await page.getByLabel("E-mail").fill(uniqueEmail);
  await page.getByLabel("Senha").fill("senha-errada");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByText("Muitas tentativas de login. Aguarde alguns minutos e tente de novo.")).toBeVisible();
});

test("Seção 78 — nenhum open redirect: um parâmetro de URL suspeito não redireciona para fora do site", async ({ page }) => {
  await page.goto("/admin/login?redirect=https://exemplo-malicioso.test");
  await expect(page).toHaveURL(/^http:\/\/localhost:3100\/admin\/login/);
});
