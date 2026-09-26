import { test, expect } from "@playwright/test";

const CONSENT_STORAGE_KEY = "upgrade-privacy-consent:v1";

/**
 * Briefing, Seções 64-69: consentimento para um novo visitante, recusar mantém o site funcional,
 * alterar a decisão depois, comportamento com nova versão da política. `window.gtag`/`window.fbq`
 * não são verificados aqui como "carregou/não carregou": `NEXT_PUBLIC_GA4_MEASUREMENT_ID`/
 * `NEXT_PUBLIC_META_PIXEL_ID` não estão configuradas neste ambiente (`.env.local` só tem as
 * credenciais do Supabase) — os dois provedores já ficam inativos por ausência de ID, com ou sem
 * consentimento (comportamento coberto pelos testes unitários de `lib/analytics/providers/*.ts`,
 * Fase 17/LGPD). Aqui o que é verificável de ponta a ponta é o próprio contrato de armazenamento
 * do consentimento e o comportamento do banner.
 */

test("novo visitante vê o banner; recusar não essenciais grava a decisão e o site continua funcional", async ({ page }) => {
  await page.goto("/");
  const banner = page.getByRole("region", { name: "Sua privacidade" });
  await expect(banner).toBeVisible();

  await banner.getByRole("button", { name: "Recusar não essenciais" }).click();
  await expect(banner).toBeHidden();

  const stored = await page.evaluate((key) => window.localStorage.getItem(key), CONSENT_STORAGE_KEY);
  expect(stored).not.toBeNull();
  const parsed = JSON.parse(stored!);
  expect(parsed.analytics).toBe(false);
  expect(parsed.marketing).toBe(false);

  // Site inteiro continua funcional depois de recusar — navega para o Builder e interage.
  await page.goto("/builder");
  await expect(page.getByRole("heading", { name: "Upgrade." })).toBeVisible();
});

test("Aceitar todos grava analytics e marketing como true", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Aceitar todos" }).click();
  const stored = await page.evaluate((key) => window.localStorage.getItem(key), CONSENT_STORAGE_KEY);
  const parsed = JSON.parse(stored!);
  expect(parsed.analytics).toBe(true);
  expect(parsed.marketing).toBe(true);
});

test("Configurar permite escolher só analytics, sem pré-marcar nenhuma opção", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Configurar" }).click();
  const analyticsCheckbox = page.getByRole("checkbox", { name: /analytics/i });
  const marketingCheckbox = page.getByRole("checkbox", { name: /marketing/i });
  await expect(analyticsCheckbox).not.toBeChecked();
  await expect(marketingCheckbox).not.toBeChecked();

  await analyticsCheckbox.check();
  await page.getByRole("button", { name: /salvar/i }).click();

  const stored = await page.evaluate((key) => window.localStorage.getItem(key), CONSENT_STORAGE_KEY);
  const parsed = JSON.parse(stored!);
  expect(parsed.analytics).toBe(true);
  expect(parsed.marketing).toBe(false);
});

test("Seção 68 — é possível reabrir e mudar a preferência depois, pelo rodapé", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Aceitar todos" }).click();

  await page.getByRole("button", { name: "Preferências de privacidade" }).click();
  const banner = page.getByRole("region", { name: "Sua privacidade" });
  await expect(banner).toBeVisible();
  await banner.getByRole("button", { name: "Recusar não essenciais" }).click();

  const stored = await page.evaluate((key) => window.localStorage.getItem(key), CONSENT_STORAGE_KEY);
  const parsed = JSON.parse(stored!);
  expect(parsed.analytics).toBe(false);
});

test("Seção 69 — uma decisão de versão de política antiga reabre o banner", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Aceitar todos" }).click();
  await expect(page.getByRole("region", { name: "Sua privacidade" })).toBeHidden();

  await page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    parsed.policyVersion = 0; // versão claramente anterior à atual.
    window.localStorage.setItem(key, JSON.stringify(parsed));
  }, CONSENT_STORAGE_KEY);

  await page.reload();
  await expect(page.getByRole("region", { name: "Sua privacidade" })).toBeVisible();
});
