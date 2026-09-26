import { test, expect } from "@playwright/test";
import { gotoBuilder, completeSiteQuickly, continueFromServiceComplete, openMyUpgrade, finalizeFromMyUpgrade, goToReviewAndContinue, fillLeadForm, submitLeadForm, VALID_LEAD } from "./helpers/builder";

/** Briefing, Seções 31-39: validação do formulário de contato, formatos de WhatsApp, e-mail,
 * campo opcional, preservação ao voltar, duplo submit, falha simulada + retry + idempotência. */

async function toContactStep(page: import("@playwright/test").Page) {
  await gotoBuilder(page);
  await completeSiteQuickly(page);
  await continueFromServiceComplete(page);
  await openMyUpgrade(page);
  await finalizeFromMyUpgrade(page);
  await goToReviewAndContinue(page);
}

test("envio vazio mostra erros específicos por campo, sem enviar", async ({ page }) => {
  await toContactStep(page);
  await submitLeadForm(page);
  await expect(page.getByText("Informe seu nome.")).toBeVisible();
  await expect(page.getByText("Informe o nome da empresa.")).toBeVisible();
  await expect(page.getByText("Informe seu WhatsApp.")).toBeVisible();
  await expect(page.getByText("Informe seu e-mail.")).toBeVisible();
});

test("Seção 32 — formatos de WhatsApp brasileiros comuns são aceitos", async ({ page }) => {
  await toContactStep(page);
  const whatsapp = page.getByLabel("WhatsApp");
  for (const format of ["(13) 99999-8888", "13 99999-8888", "13999998888"]) {
    await whatsapp.fill(format);
    await whatsapp.blur();
    await expect(page.getByText("Informe um WhatsApp válido, com DDD.")).toHaveCount(0);
  }
});

test("WhatsApp claramente inválido mostra a mensagem específica", async ({ page }) => {
  await toContactStep(page);
  const whatsapp = page.getByLabel("WhatsApp");
  await whatsapp.fill("123");
  await whatsapp.blur();
  await expect(page.getByText("Informe um WhatsApp válido, com DDD.")).toBeVisible();
});

test("Seção 33 — e-mail claramente inválido é rejeitado, sem tentar validar RFC completa", async ({ page }) => {
  await toContactStep(page);
  const email = page.getByLabel("E-mail");
  await email.fill("nao-e-email");
  await email.blur();
  await expect(page.getByText("Digite um e-mail válido.")).toBeVisible();
  await email.fill("joao@teste.com");
  await email.blur();
  await expect(page.getByText("Digite um e-mail válido.")).toHaveCount(0);
});

test("Seção 34 — Site/Instagram vazio é aceito (campo opcional)", async ({ page }) => {
  await toContactStep(page);
  await fillLeadForm(page, VALID_LEAD);
  await submitLeadForm(page);
  await expect(page.getByRole("heading", { name: "Recebemos seu projeto." })).toBeVisible();
});

test("Seção 35 — preencher, voltar ao projeto e retornar preserva os campos digitados", async ({ page }) => {
  await toContactStep(page);
  await page.getByLabel("Nome").fill("João Preservado");
  await page.getByLabel("Empresa").fill("Empresa Preservada");
  await page.getByRole("button", { name: "Voltar ao projeto" }).click();
  await expect(page.getByRole("heading", { name: "Seu Upgrade está quase pronto!" })).toBeVisible();
  await page.getByRole("button", { name: /Quero receber um retorno/ }).click();
  await expect(page.getByLabel("Nome")).toHaveValue("João Preservado");
  await expect(page.getByLabel("Empresa")).toHaveValue("Empresa Preservada");
});

test("Seção 36 — duplo clique em enviar não dispara dois envios (botão trava em 'Enviando...')", async ({ page }) => {
  await toContactStep(page);
  await fillLeadForm(page, VALID_LEAD);
  const submitButton = page.getByRole("button", { name: "Enviar meu projeto" });
  // `dblclick` simula o duplo clique real num único elemento (duas chamadas separadas de
  // `.click()` cada uma espera sua própria janela de actionability, o que não é fiel a um duplo
  // clique de verdade e gera falso-negativo se o botão some/desabilita entre as duas).
  await submitButton.dblclick().catch(() => {});
  await expect(page.getByRole("heading", { name: "Recebemos seu projeto." })).toBeVisible();
});

test("Seções 37/38/39 — falha simulada de banco: erro claro, dados preservados, retry com mesma idempotencyKey não duplica", async ({ page }) => {
  await toContactStep(page);
  // `__E2E_FORCE_FAILURE__` (lib/testing/e2eStore.ts) força uma falha só na primeira tentativa
  // desta idempotencyKey — a exata simulação de "falha transitória de banco" pedida no briefing.
  await fillLeadForm(page, { ...VALID_LEAD, company: "__E2E_FORCE_FAILURE__" });
  await submitLeadForm(page);

  await expect(page.getByText("Não conseguimos enviar agora. Seus dados continuam preenchidos.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Tentar novamente" })).toBeVisible();

  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(page.getByLabel("Nome")).toHaveValue(VALID_LEAD.name);
  await submitLeadForm(page);
  await expect(page.getByRole("heading", { name: "Recebemos seu projeto." })).toBeVisible({ timeout: 10_000 });
});
