import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/rulesEval.spec.ts'],
    testTimeout: 1_200_000,
  },
});
