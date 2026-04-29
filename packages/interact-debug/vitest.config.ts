import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: [],
    exclude: ['test/rulesEval.spec.ts', 'node_modules/**'],
  },
});
