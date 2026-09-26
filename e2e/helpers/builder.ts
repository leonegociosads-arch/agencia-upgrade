import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Helpers de E2E para o Builder (Etapa 31). Seletores por role/texto (briefing, Seção 108 —
 * "preferir role/label/texto/semântica", nunca `data-testid` espalhado sem necessidade); os dois
 * `data-testid` que já existiam no projeto antes desta fase (`my-upgrade-panel`) são reaproveitados
 * quando um seletor semântico ficaria ambíguo entre o painel "Meu Upgrade" e o Resumo do Projeto.
 */

/** Dispensa o banner de consentimento clicando "Aceitar todos" — chamado no início de todo teste
 * que não está testando o próprio banner (sem isso, o overlay intercepta cliques nos cards/opções
 * por baixo, já que ele fica fixo no rodapé de toda página, inclusive o Builder). */
export async function dismissConsentBanner(page: Page) {
  const acceptButton = page.getByRole("button", { name: "Aceitar todos" });
  if (await acceptButton.isVisible().catch(() => false)) {
    await acceptButton.click();
  }
}

export async function gotoBuilder(page: Page) {
  await page.goto("/builder");
  await dismissConsentBanner(page);
  await expect(page.getByRole("heading", { name: "Upgrade." })).toBeVisible();
}

export async function selectService(page: Page, serviceLabel: string) {
  // Âncora no início, com um "Configurado " opcional: o card do `ServiceSelector` ganha esse
  // prefixo quando o serviço já está confirmado. Sem a âncora, o nome vira substring de "Editar
  // <label>"/"Remover <label>" também — os botões do MESMO serviço dentro do painel "Meu Upgrade",
  // que continua no DOM ao mesmo tempo (bug de teste real: violação de modo estrito, 3 elementos
  // batendo com o mesmo regex solto).
  await page.getByRole("button", { name: new RegExp(`^(Configurado )?${serviceLabel}`) }).click();
}

/** Clica numa opção de resposta única — o clique já avança para a próxima pergunta sozinho. */
export async function answerSingleChoice(page: Page, optionLabel: string) {
  await page.getByRole("button", { name: new RegExp(`^${optionLabel}`) }).click();
}

/** Marca 1+ opções de múltipla escolha e confirma — "Próxima" no painel especial
 * (`ShowcaseQuestionPanel`, ex.: `site_recursos`), "Continuar" na tela normal. */
export async function answerMultiChoice(page: Page, optionLabels: string[]) {
  for (const label of optionLabels) {
    await page.getByRole("button", { name: new RegExp(`^${label}`) }).click();
  }
  await page.getByRole("button", { name: /^(Próxima|Continuar)$/ }).click();
}

/** Escolha única dentro do painel especial (`ShowcaseQuestionPanel`): marcar a opção NÃO avança
 * sozinho — é preciso confirmar em "Próxima" (Tráfego etapa 4, Design etapa 3). */
export async function answerShowcaseSingleChoice(page: Page, optionLabel: string) {
  await page.getByRole("button", { name: new RegExp(`^${optionLabel}`) }).click();
  await page.getByRole("button", { name: "Próxima", exact: true }).click();
}

/** Completa o mini-fluxo de "Sites e Desenvolvimento" pelo caminho mais curto (site_tipo = "Ainda
 * não sei" pula `site_recursos`) — usado quando o teste não precisa do fluxo completo. */
export async function completeSiteQuickly(page: Page) {
  await selectService(page, "Criar um site");
  await answerSingleChoice(page, "Ainda não sei");
  await answerSingleChoice(page, "Vou criar do zero");
}

/** Completa "Sites e Desenvolvimento" como um E-commerce — usado pelo cenário crítico de
 * draft vs. confirmed (briefing, Seções 9/10): `site_tipo` = E-commerce ativa `site_recursos` com
 * opções específicas de e-commerce (equivalente real desta base de perguntas a "quantidade de
 * produtos" citado no briefing — não existe um campo numérico de "quantidade", mas o mesmo
 * princípio de "resposta dependente que muda com o tipo escolhido" se aplica igual). */
export async function completeSiteAsEcommerce(page: Page) {
  await selectService(page, "Criar um site");
  await answerSingleChoice(page, "Loja Virtual / E-commerce");
  await answerMultiChoice(page, ["Catálogo e pedidos", "Pagamento online"]);
  await answerSingleChoice(page, "Vou criar do zero");
}

export async function completeTrafego(page: Page) {
  await selectService(page, "Atrair mais clientes");
  await answerSingleChoice(page, "Negócio local");
  await answerSingleChoice(page, "WhatsApp");
  await answerShowcaseSingleChoice(page, "Nunca anunciei");
  await answerSingleChoice(page, "Até R\\$ 1.000");
}

export async function completeDesign(page: Page) {
  await selectService(page, "Fortalecer minha marca e conteúdo");
  await answerSingleChoice(page, "Identidade Visual");
  await answerShowcaseSingleChoice(page, "Ainda não tenho identidade");
  await answerSingleChoice(page, "Identidade essencial");
}

/** A partir da tela "Serviço adicionado!", volta ao seletor principal (mantendo o que já foi configurado). */
export async function continueFromServiceComplete(page: Page) {
  await page.getByRole("button", { name: /Adicionar outro serviço/ }).click();
}

/** A partir da tela "Serviço adicionado!", abre o Resumo do Projeto. */
export async function viewSummaryFromServiceComplete(page: Page) {
  await page.getByRole("button", { name: "Ver resumo do projeto" }).click();
}

export async function openMyUpgrade(page: Page) {
  await page.getByRole("button", { name: /^Meu Upgrade/ }).click();
  await expect(page.getByTestId("my-upgrade-panel")).toBeVisible();
}

/** Escopado ao painel "Meu Upgrade" — necessário sempre que o texto pode também aparecer no
 * `ServiceSelector` por baixo (o card "Configurado X" mostra o mesmo rótulo do serviço), que
 * continua montado no DOM enquanto o Drawer está por cima (bug de teste real encontrado nesta
 * fase: `page.getByText(label)` sem escopo é ambíguo em modo estrito sempre que os dois coexistem). */
export function myUpgradeText(page: Page, text: string | RegExp) {
  return page.getByTestId("my-upgrade-panel").getByText(text);
}

export async function closeMyUpgrade(page: Page) {
  await page.getByRole("button", { name: "Fechar Meu Upgrade" }).click();
}

export async function finalizeFromMyUpgrade(page: Page) {
  await page.getByRole("button", { name: "Finalizar projeto" }).click();
}

export async function goToReviewAndContinue(page: Page) {
  await expect(page.getByRole("heading", { name: "Seu Upgrade está quase pronto!" })).toBeVisible();
  await page.getByRole("button", { name: /Quero receber um retorno/ }).click();
}

export interface LeadFormValues {
  name: string;
  company: string;
  whatsapp: string;
  email: string;
  websiteOrInstagram?: string;
}

export async function fillLeadForm(page: Page, values: LeadFormValues) {
  await page.getByLabel("Nome").fill(values.name);
  await page.getByLabel("Empresa").fill(values.company);
  await page.getByLabel("WhatsApp").fill(values.whatsapp);
  await page.getByLabel("E-mail").fill(values.email);
  if (values.websiteOrInstagram !== undefined) {
    await page.getByLabel(/Site ou Instagram/).fill(values.websiteOrInstagram);
  }
}

export async function submitLeadForm(page: Page) {
  await page.getByRole("button", { name: "Enviar meu projeto" }).click();
}

export const VALID_LEAD: LeadFormValues = {
  name: "João Playwright",
  company: "Empresa E2E",
  whatsapp: "13999998888",
  email: "joao.e2e@teste.com",
};
