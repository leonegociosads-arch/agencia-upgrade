import { defineConfig } from "vitest/config";
import path from "node:path";

// Testes unitários da lógica pura do Builder (Etapa 8) e testes de integração básica de
// componentes (Etapa 9). Ambiente padrão "node" (mais rápido, cobre toda a lógica pura sem
// DOM); os poucos arquivos `.test.tsx` que precisam renderizar componentes declaram
// `// @vitest-environment jsdom` no topo, trocando o ambiente só para si mesmos.
export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["node_modules/**", ".next/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
