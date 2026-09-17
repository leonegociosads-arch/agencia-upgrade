import { test, expect } from "@playwright/test";
import { gotoBuilder, selectService, answerSingleChoice, answerMultiChoice, continueFromServiceComplete, openMyUpgrade, myUpgradeText } from "./helpers/builder";

/**
 * Briefing, Seções 9/10 — "teste crítico": draft nunca vaza para o confirmed antes de salvar
 * explicitamente, e salvar substitui o confirmed corretamente. Adaptado à base real de perguntas
 * (não existe um campo numérico "quantidade de produtos"; o equivalente real é `site_recursos`,
 * que muda de opções conforme `site_tipo` — o mesmo princípio de "resposta dependente que precisa
 * ser descartada/substituída ao trocar o tipo").
 */

async function confirmEcommerce(page: import("@playwright/test").Page) {
  await gotoBuilder(page);
  await selectService(page, "Criar um site");
  await answerSingleChoice(page, "Loja Virtual / E-commerce");
  await answerMultiChoice(page, ["Catálogo e pedidos", "Pagamento online"]);
  await answerSingleChoice(page, "Vou criar do zero");
  await continueFromServiceComplete(page);
}

test("Seção 9 — editar, mudar o tipo, CANCELAR: o confirmed continua exatamente como estava (E-commerce)", async ({ page }) => {
  await confirmEcommerce(page);

  // Confirma o estado inicial salvo antes de mexer em qualquer coisa.
  await openMyUpgrade(page);
  await expect(myUpgradeText(page, /Loja Virtual|Catálogo e pedidos/).first()).toBeVisible();
  await page.getByRole("button", { name: "Fechar Meu Upgrade" }).click();

  // Entra em edição e muda o tipo — isso invalida `site_recursos` (Seção 11: dependência recursiva).
  await selectService(page, "Criar um site");
  await expect(page.getByText(/^Editando/)).toBeVisible();
  // No modo de edição, a tela mostra a revisão com "Alterar" por campo — reabre `site_tipo`.
  await page.getByRole("button", { name: "Alterar" }).first().click();
  await answerSingleChoice(page, "Site Institucional");
  // `site_recursos` agora tem opções DIFERENTES (as de site institucional, não mais e-commerce).
  await expect(page.getByRole("button", { name: /^Catálogo e pedidos/ })).toHaveCount(0);
  // `site_situacao` não depende de `site_tipo` — a resposta antiga ("Vou criar do zero") continua
  // válida e não precisa ser refeita; o fluxo de edição pula direto para a revisão (bug de teste
  // real ao escrever este spec: `site_situacao` não reaparece como pergunta aqui).
  await answerMultiChoice(page, ["Formulários ou captação de leads"]);

  // Tela de revisão da edição (nunca salva sozinha) — CANCELA em vez de confirmar.
  await expect(page.getByRole("button", { name: "Confirmar alterações" })).toBeVisible();
  await page.getByRole("button", { name: "Cancelar edição" }).click();

  // O CONFIRMED precisa continuar exatamente como antes: E-commerce, nunca Institucional.
  await openMyUpgrade(page);
  await expect(myUpgradeText(page, /Loja Virtual/).first()).toBeVisible();
  await expect(myUpgradeText(page, /Site Institucional/)).toHaveCount(0);
});

test("Seção 10 — editar, mudar o tipo, SALVAR: o confirmed passa a refletir a nova escolha", async ({ page }) => {
  await confirmEcommerce(page);

  await selectService(page, "Criar um site");
  await page.getByRole("button", { name: "Alterar" }).first().click();
  await answerSingleChoice(page, "Site Institucional");
  await answerMultiChoice(page, ["Formulários ou captação de leads"]);
  await page.getByRole("button", { name: "Confirmar alterações" }).click();

  // Agora o confirmed reflete Site Institucional — a resposta antiga de e-commerce (dependente do
  // tipo anterior) não pode sobreviver escondida no registro salvo.
  await openMyUpgrade(page);
  await expect(myUpgradeText(page, /Site Institucional/).first()).toBeVisible();
  await expect(myUpgradeText(page, /Loja Virtual/)).toHaveCount(0);
  await expect(myUpgradeText(page, /Catálogo e pedidos/)).toHaveCount(0);
});
