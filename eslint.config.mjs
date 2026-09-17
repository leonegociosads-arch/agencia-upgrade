import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Artefatos gerados localmente pelo Playwright (Etapa 32) — já no `.gitignore` desde a Etapa
    // 31, mas nunca excluídos do lint; passavam despercebidos só porque ninguém tinha rodado a
    // suíte E2E localmente antes de rodar `eslint .` na mesma pasta. Sem isso, o relatório HTML
    // (JS de terceiros, minificado) é lido como código-fonte do projeto e reprovado.
    "playwright-report/**",
    "test-results/**",
    "blob-report/**",
    "playwright/.cache/**",
  ]),
]);

export default eslintConfig;
