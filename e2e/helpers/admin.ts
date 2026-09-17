import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Credenciais fixas do admin de teste — precisam ser IDÊNTICAS às de `lib/testing/e2eStore.ts`
 * (`E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD`). Duplicadas aqui (não importadas) de propósito: aquele
 * arquivo tem `import "server-only"`, que lança incondicionalmente fora do bundler do Next.js —
 * importar de dentro de um teste Playwright (que roda em Node puro, sem a condição de resolução
 * "react-server" do Next) quebraria na hora de carregar o arquivo.
 */
export const E2E_ADMIN_EMAIL = "admin@e2e.test";
export const E2E_ADMIN_PASSWORD = "senha-e2e-123";

export async function loginAsAdmin(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("E-mail").fill(E2E_ADMIN_EMAIL);
  await page.getByLabel("Senha").fill(E2E_ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByText("Upgrade — Admin")).toBeVisible({ timeout: 20_000 });

  // O banner de consentimento (Etapa 28) é montado no layout raiz — aparece em toda rota,
  // inclusive `/admin` — e intercepta cliques em qualquer elemento perto do rodapé (bug de teste
  // real encontrado nesta fase, não um bug de aplicação: um admin autenticado também é "um
  // visitante" do ponto de vista do consentimento). Dispensado aqui para não bloquear os testes de
  // admin que continuam.
  const acceptButton = page.getByRole("button", { name: "Aceitar todos" });
  if (await acceptButton.isVisible().catch(() => false)) {
    await acceptButton.click();
  }
}
