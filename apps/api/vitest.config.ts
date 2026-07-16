import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Os testes leem/escrevem os mesmos arquivos JSON em src/data — rodar em série evita
    // condições de corrida entre arquivos de teste diferentes.
    fileParallelism: false,
  },
});
