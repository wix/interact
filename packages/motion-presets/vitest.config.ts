import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: [],
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
});
