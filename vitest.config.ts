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
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      // Fora do Next.js, o pacote "server-only" lança um erro incondicionalmente (ele depende da
      // condição de resolução "react-server" do bundler do Next para virar um no-op em código de
      // servidor). O Vitest roda em Node puro, então apontamos para a própria variante vazia que o
      // pacote já publica para esse caso — nada é enfraquecido: a proteção real acontece no build
      // do Next, aqui só evitamos que os testes quebrem por causa dela.
      "server-only": path.resolve(__dirname, "node_modules/server-only/empty.js"),
    },
  },
});
