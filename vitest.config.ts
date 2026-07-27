import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    // O Playwright tem o diretório `e2e/` só para ele; o Vitest não deve
    // tentar rodar aquelas specs.
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      // `src/app/**` é a camada de rota: shell, páginas e 404. Quem a exercita
      // é o Playwright com axe, navegando de verdade — medi-la aqui produziria
      // um número que não corresponde ao que está testado. Ver ADR-006.
      exclude: ['src/**/*.test.{ts,tsx}', 'src/app/**'],
      // Limiares da PROJECT.md §9. Os 100% de `lib/` e `content/` entram
      // junto com o schema Zod, na F2 — subir agora reprovaria um registry
      // que ainda não tem validação para cobrir.
      thresholds: {
        lines: 85,
        branches: 90,
        functions: 85,
        statements: 85,
      },
    },
  },
});
