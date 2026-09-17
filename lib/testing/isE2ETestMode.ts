/**
 * Etapa 31 (Testes Funcionais) — liga o backend em memória (`e2eStore.ts`) no lugar do Supabase
 * real. SÓ fica `true` quando `E2E_TEST_MODE=true` é passado explicitamente ao processo do
 * servidor (`playwright.config.ts`, `webServer.env`) — nunca em `next dev`/`next start`/produção,
 * onde essa variável simplesmente não existe. Escolhido em vez de mockar rede no navegador
 * (`page.route()` do Playwright) porque toda escrita real acontece dentro de Server Actions,
 * executadas no SERVIDOR — o navegador nunca vê a chamada ao Supabase para poder interceptá-la.
 *
 * Decisão tomada com o usuário (Etapa 31): testes E2E não podem gravar dados de verdade no
 * Supabase configurado em `.env.local` (pode ser um projeto real, não um projeto de teste
 * dedicado) — ver `docs/FUNCTIONAL-TESTS.md`, Seção "Ambiente", para o racional completo.
 */
export function isE2ETestMode(): boolean {
  return process.env.E2E_TEST_MODE === "true";
}
