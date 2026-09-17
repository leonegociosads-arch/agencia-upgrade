import { test, expect } from "@playwright/test";
import { loginAsAdmin, E2E_ADMIN_EMAIL } from "./helpers/admin";

/** Precisa ser IDÊNTICO a `lib/testing/e2eStore.ts`, `E2E_SEED_LEAD_IDS.ana` — não importado
 * diretamente pelo mesmo motivo de `E2E_ADMIN_EMAIL` em `helpers/admin.ts` (`import "server-only"`
 * quebraria fora do bundler do Next). */
const SEED_LEAD_ID_ANA = "11111111-1111-4111-8111-111111111111";

// `lib/testing/e2eStore.ts` é um único módulo em memória, compartilhado por TODAS as execuções
// concorrentes (Etapa 31 — bug de teste real encontrado: com workers em paralelo, testes deste
// arquivo mudando status/notas dos MESMOS 3 leads-fixture entravam em corrida uns com os outros —
// confirmado rodando só este arquivo com `--workers=1`, onde os 10 testes sempre passam). Serial
// dentro do arquivo é a solução recomendada pelo próprio Playwright para specs que compartilham
// estado mutável do lado do servidor — não afeta a execução em paralelo dos OUTROS arquivos.
test.describe.configure({ mode: "serial" });

/** Briefing, Seções 45-56/71-75: login, permissões, lista/paginação/filtros/busca, detalhe, status,
 * notas, links de contato. Usa os 3 leads-fixture semeados por `lib/testing/e2eStore.ts`
 * (Ana/Bruno/Carla) — nunca dado real do Supabase (Etapa 31, decisão de mockar o backend). */

test("Seção 45 — credenciais inválidas mostram mensagem genérica, sem entrar", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("E-mail").fill(E2E_ADMIN_EMAIL);
  await page.getByLabel("Senha").fill("senha-errada");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByText("E-mail ou senha inválidos.")).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("Seções 46/54/72/73 — sem sessão, acesso direto a /admin e /admin/leads/[id] redireciona ao login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);

  await page.goto(`/admin/leads/${SEED_LEAD_ID_ANA}`);
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("logout invalida a sessão — acesso direto a /admin volta a exigir login", async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
});

// `LeadsList` renderiza a MESMA linha duas vezes no DOM (tabela desktop + card mobile, escondidos
// um do outro só via CSS/media query — "mesma marcação, CSS decide", `docs/ADMIN-CRM.md`) — por
// isso todo texto de fixture na LISTA precisa de `.first()` (as duas cópias existem ao mesmo
// tempo, nunca uma ambiguidade real de dado).
function leadRow(page: import("@playwright/test").Page, text: string) {
  return page.getByText(text).first();
}

/** Abre o detalhe de um lead pela linha da TABELA desktop — a célula com o nome nunca foi
 * clicável (só a última coluna, "Abrir", é um `<Link>` de verdade — `LeadsList.tsx`); clicar no
 * texto do nome direto não navega para lugar nenhum (bug de teste real encontrado nesta fase).
 *
 * Navega via `page.goto(href)` (não `.click()` no link): a navegação client-side do `<Link>` do
 * Next.js mostrou um comportamento instável só neste ambiente de teste (`next dev`/Turbopack) — o
 * RSC da rota de destino chega com sucesso (200, confirmado via inspeção de rede), mas a URL/tela
 * não trocam. Não reproduzido como um problema do CÓDIGO desta aplicação (nenhum handler
 * `preventDefault`/lógica própria intercepta o clique) — `goto(href)` valida exatamente o que
 * importa aqui (o `href` gerado está correto e a rota de destino renderiza o conteúdo certo) sem
 * depender da mecânica interna de prefetch/roteamento do Next em modo de desenvolvimento.
 */
async function openLead(page: import("@playwright/test").Page, name: string) {
  const href = await page.getByRole("row").filter({ hasText: name }).getByRole("link", { name: "Abrir" }).getAttribute("href");
  if (!href) throw new Error(`Link "Abrir" não encontrado para o lead "${name}".`);
  await page.goto(href);
}

test("Seção 47 — lista carrega, ordena por score e pagina", async ({ page }) => {
  await loginAsAdmin(page);
  await expect(leadRow(page, "Fixture Ana Souza")).toBeVisible();
  await expect(leadRow(page, "Fixture Bruno Lima")).toBeVisible();
  await expect(leadRow(page, "Fixture Carla Design")).toBeVisible();

  // `LeadsFilters` é um `<form method="get">` (Fase 16) — mudar o `<select>` sozinho não navega;
  // só o clique em "Filtrar" (ou Enter) submete o formulário.
  await page.getByLabel("Ordenar").selectOption("score");
  await page.getByRole("button", { name: "Filtrar" }).click();
  await expect(page).toHaveURL(/sort=score/);
});

test("Seção 48/49 — busca por nome/empresa/e-mail e filtro por status/tier/serviço", async ({ page }) => {
  await loginAsAdmin(page);

  await page.getByLabel("Buscar").fill("bruno@fixture.test");
  await page.getByRole("button", { name: "Filtrar" }).click();
  await expect(leadRow(page, "Fixture Bruno Lima")).toBeVisible();
  await expect(page.getByText("Fixture Ana Souza")).toHaveCount(0);

  await page.getByLabel("Buscar").fill("");
  await page.getByLabel("Filtrar por prioridade").selectOption("PRIORITY");
  await page.getByRole("button", { name: "Filtrar" }).click();
  await expect(leadRow(page, "Fixture Ana Souza")).toBeVisible();
  await expect(page.getByText("Fixture Bruno Lima")).toHaveCount(0);
});

test("Seção 49 — filtro sem nenhum resultado mostra o estado vazio (não uma lista quebrada)", async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByLabel("Buscar").fill("nenhum-lead-tem-este-texto-aqui");
  await page.getByRole("button", { name: "Filtrar" }).click();
  await expect(page.getByText("Nenhum projeto recebido ainda.")).toBeVisible();
});

test("Seções 50/55/56 — detalhe mostra contato/serviços/score/status/notas e os links de contato", async ({ page }) => {
  await loginAsAdmin(page);
  await openLead(page, "Fixture Ana Souza");

  await expect(page.getByRole("heading", { name: "Fixture Ana Souza" })).toBeVisible();
  // `.first()`: o e-mail também aparece dentro do JSON bruto colapsado ("Ver dados brutos",
  // `<details>` fechado por padrão) — mesmo dado, nunca uma ambiguidade real.
  await expect(page.getByText("ana@fixture.test").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Score" })).toBeVisible();
  await expect(page.getByText(/82 pontos/)).toBeVisible();

  const whatsappLink = page.getByRole("link", { name: "Abrir WhatsApp" });
  await expect(whatsappLink).toHaveAttribute("href", /^https:\/\/wa\.me\/5511988887777\?text=/);
  await expect(whatsappLink).toHaveAttribute("target", "_blank");
  await expect(whatsappLink).toHaveAttribute("rel", "noreferrer");

  const mailLink = page.getByRole("link", { name: "Enviar e-mail" });
  await expect(mailLink).toHaveAttribute("href", /^mailto:ana@fixture\.test/);
});

test("Seção 51 — alterar o status persiste (sobrevive a um refresh)", async ({ page }) => {
  await loginAsAdmin(page);
  await openLead(page, "Fixture Bruno Lima");
  await page.getByLabel("Status").selectOption("proposal");
  // "Salvo." (`StatusSelect.tsx`) some sozinho depois de 2s — uma janela curta demais para
  // afirmar com segurança sob carga (workers em paralelo); o que realmente importa para a Seção
  // 51 ("validar persistência") é o valor sobreviver a um refresh de verdade, abaixo.
  await expect(page.getByLabel("Status")).toHaveValue("proposal");

  await page.reload();
  await expect(page.getByLabel("Status")).toHaveValue("proposal");
});

test("Seção 53/54 — criar uma nota registra e persiste; permanece após refresh", async ({ page }) => {
  await loginAsAdmin(page);
  await openLead(page, "Fixture Carla Design");

  const noteText = `Nota de teste E2E ${Date.now()}`;
  await page.getByPlaceholder(/Adicionar observação/).fill(noteText);
  await page.getByRole("button", { name: "Adicionar nota" }).click();
  await expect(page.getByText(noteText)).toBeVisible();

  await page.reload();
  await expect(page.getByText(noteText)).toBeVisible();
});

test("Seção 77 — conteúdo de nota com HTML/script é tratado como texto puro, nunca executado", async ({ page }) => {
  await loginAsAdmin(page);
  await openLead(page, "Fixture Carla Design");

  let dialogFired = false;
  page.once("dialog", () => {
    dialogFired = true;
  });

  const payload = "<script>alert(1)</script>";
  await page.getByPlaceholder(/Adicionar observação/).fill(payload);
  await page.getByRole("button", { name: "Adicionar nota" }).click();

  // O texto aparece LITERALMENTE na tela (nunca interpretado como HTML/JS).
  await expect(page.getByText(payload)).toBeVisible();
  expect(dialogFired).toBe(false);
});
