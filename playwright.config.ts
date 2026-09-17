import { defineConfig, devices } from "@playwright/test";

/**
 * E2E (Etapa 31 — Testes Funcionais). Primeiro framework E2E do projeto — Vitest + Testing
 * Library já cobriam unitário/integração (620 testes antes desta fase); Playwright foi escolhido
 * porque nenhum framework E2E existia ainda e é a recomendação padrão do briefing (Seção 3).
 *
 * `webServer` sobe `next dev` (não `next build && next start`): mais rápido de iniciar/reiniciar
 * durante o desenvolvimento dos próprios testes, e o que está sob teste aqui é COMPORTAMENTO
 * funcional (fluxos, estado, persistência, permissões), não performance de produção — essa já tem
 * sua própria auditoria dedicada (`docs/PERFORMANCE.md`, Etapa 30). `E2E_TEST_MODE=true` liga o
 * backend em memória (`lib/testing/e2eStore.ts`) no lugar do Supabase real — ver
 * `docs/FUNCTIONAL-TESTS.md`, Seção "Ambiente", para o racional completo (decisão tomada com o
 * usuário: nunca gravar dados de teste no Supabase real configurado em `.env.local`).
 *
 * Estratégia de projetos (Seções 87-89 do briefing — viewports/browsers "quando possível", não
 * "sempre a suíte inteira 4x"): a suíte funcional completa roda só em Chromium desktop (mais
 * rápido, cobre a lógica); um subconjunto de fumaça (`*.smoke.spec.ts`) roda também em Firefox,
 * WebKit e dois viewports mobile — o suficiente para pegar uma quebra específica de motor/viewport
 * sem multiplicar o tempo total de execução por 5.
 */
const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Teto de workers BAIXO sempre (não só em CI): o `webServer` é um único `next dev` compartilhado
  // por todos os testes (Turbopack compila rotas sob demanda), e o backend fake de E2E
  // (`lib/testing/e2eStore.ts`) é um Map/array em memória, também compartilhado por toda
  // requisição concorrente. Descoberto nesta fase (ver `docs/TEST-RESULTS-STAGE-31.md`): com
  // paralelismo alto, `admin.spec.ts` (que muda status/notas dos mesmos leads-fixture) ficava
  // instável mesmo depois de serializado internamente (`test.describe.configure({mode:"serial"})`)
  // — sobrava carga concorrente de OUTROS arquivos no mesmo servidor. 2 workers é o equilíbrio
  // escolhido entre velocidade e confiabilidade para este ambiente local; um servidor de produção
  // real (`next build && next start`) ou um backend de teste com isolamento de verdade (não em
  // memória) resolveria isso de vez, se a suíte crescer o bastante para justificar o investimento.
  workers: 2,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  // 45s (não os 30s padrão) e `expect.timeout` de 15s (não os 5s padrão): `next dev`/Turbopack
  // compila cada rota sob demanda na primeira visita do processo — a primeira navegação para uma
  // rota "fria" (ex.: `/admin` na primeira vez que um teste faz login) pode legitimamente levar
  // mais de 15s só de compilação, sem nenhum problema real na aplicação (bug real encontrado nesta
  // fase: o primeiro `POST /admin/login` de um `next dev` recém-iniciado levou 17,4s — não uma
  // falha, só compilação JIT; ver `docs/TEST-RESULTS-STAGE-31.md`). Aumentar o timeout aqui é mais
  // robusto do que um `sleep` fixo (Seção 106 do briefing: "esperar estado real").
  timeout: 45_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev -- --port " + PORT,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: { E2E_TEST_MODE: "true" },
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox-smoke", testMatch: /\.smoke\.spec\.ts$/, use: { ...devices["Desktop Firefox"] } },
    { name: "webkit-smoke", testMatch: /\.smoke\.spec\.ts$/, use: { ...devices["Desktop Safari"] } },
    { name: "mobile-chrome-smoke", testMatch: /\.smoke\.spec\.ts$/, use: { ...devices["Pixel 7"] } },
    { name: "mobile-safari-smoke", testMatch: /\.smoke\.spec\.ts$/, use: { ...devices["iPhone 14"] } },
  ],
});
