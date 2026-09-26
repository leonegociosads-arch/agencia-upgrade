import { test, expect } from "@playwright/test";
import { gotoBuilder, selectService, answerSingleChoice, answerMultiChoice } from "./helpers/builder";

/** Briefing, Seções 11-16: invalidação de dependências, "Voltar" preserva respostas válidas, troca
 * de resposta remove resposta dependente obsoleta, "Continuar" não avança sem resposta obrigatória,
 * duplo clique não pula cena. */

test("Seção 12 — Voltar preserva respostas anteriores válidas (não perde nada ao navegar)", async ({ page }) => {
  await gotoBuilder(page);
  await selectService(page, "Atrair mais clientes");
  await answerSingleChoice(page, "Negócio local");
  await answerSingleChoice(page, "WhatsApp");
  // Volta uma pergunta — a resposta de "negocio" (anterior) precisa continuar valendo. A etapa 4
  // (`trafego_experiencia`) usa o painel especial, cujo botão é "Voltar" (sem a seta de texto).
  await page.getByRole("button", { name: "Voltar", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Onde você quer gerar o resultado?" })).toBeVisible();
  await page.getByRole("button", { name: "← Voltar" }).click();
  await expect(page.getByRole("heading", { name: "O que você quer divulgar?" })).toBeVisible();
  // "Negócio local" continua sendo o card ativo/selecionável de novo (não é single_choice com
  // estado persistente visual, mas responder de novo e seguir confirma que nada corrompeu o draft).
  await answerSingleChoice(page, "Negócio local");
  await expect(page.getByRole("heading", { name: "Onde você quer gerar o resultado?" })).toBeVisible();
});

test("Seção 13 — trocar o tipo de site remove a resposta dependente obsoleta (site_recursos)", async ({ page }) => {
  await gotoBuilder(page);
  await selectService(page, "Criar um site");
  await answerSingleChoice(page, "Loja Virtual / E-commerce");
  await answerMultiChoice(page, ["Catálogo e pedidos", "Pagamento online"]);
  await expect(page.getByRole("heading", { name: "Em que situação está esse projeto?" })).toBeVisible();

  // Volta duas perguntas (situação -> recursos -> tipo) e troca o tipo. "Recursos" é o painel
  // especial, cujo botão é "Voltar" (sem a seta de texto).
  await page.getByRole("button", { name: "← Voltar" }).click();
  await expect(page.getByRole("heading", { name: "O que esse projeto precisa ter?" })).toBeVisible();
  await page.getByRole("button", { name: "Voltar", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Que tipo de site você precisa?" })).toBeVisible();
  await answerSingleChoice(page, "Site Institucional");

  // `site_recursos` precisa reaparecer com as opções de institucional (nunca as de e-commerce
  // sobrevivendo escondidas no draft) — se a invalidação não limpasse a resposta antiga, poderia
  // pular direto para "situação" com um valor de e-commerce órfão.
  await expect(page.getByRole("heading", { name: "O que esse projeto precisa ter?" })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Catálogo e pedidos/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Formulários ou captação de leads/ })).toBeVisible();
});

test("Seção 14 — Próxima (múltipla escolha, painel especial) fica desabilitado sem nenhuma opção marcada", async ({ page }) => {
  await gotoBuilder(page);
  await selectService(page, "Criar um site");
  await answerSingleChoice(page, "Landing Page");
  await expect(page.getByRole("heading", { name: "O que esse projeto precisa ter?" })).toBeVisible();
  const continueButton = page.getByRole("button", { name: "Próxima", exact: true });
  await expect(continueButton).toBeDisabled();
  await page.getByRole("button", { name: /^Formulários ou captação de leads/ }).click();
  await expect(continueButton).toBeEnabled();
});

test("Seção 15/16 — clique duplo rápido em uma opção não pula duas perguntas", async ({ page }) => {
  await gotoBuilder(page);
  await selectService(page, "Atrair mais clientes");
  const option = page.getByRole("button", { name: /^Negócio local/ });
  // `dblclick` (não duas chamadas separadas de `.click()`, cada uma com sua própria espera de
  // actionability) — o jeito real de simular um duplo clique rapidíssimo no MESMO elemento (Seção
  // 16: "bloquear avanço concorrente"). Ignora erro: o próprio elemento pode já não existir mais
  // (navegado para a próxima pergunta) no meio do segundo clique do par — o que É o comportamento
  // correto, não uma falha do teste.
  await option.dblclick().catch(() => {});
  // Se tivesse pulado uma pergunta, o título seguinte seria "Qual é sua situação atual..."
  // (pulando "Onde você quer gerar o resultado?"). Confirma que parou na pergunta certa.
  await expect(page.getByRole("heading", { name: "Onde você quer gerar o resultado?" })).toBeVisible();
});
