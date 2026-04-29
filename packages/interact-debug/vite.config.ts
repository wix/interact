import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
        playwright: path.resolve(__dirname, 'src/playwright/index.ts'),
        eval: path.resolve(__dirname, 'src/eval/index.ts'),
        cli: path.resolve(__dirname, 'src/cli.ts'),
      },
      formats: ['es', 'cjs'],
    },
    sourcemap: true,
    rollupOptions: {
      external: [
        '@wix/interact',
        '@wix/motion',
        '@wix/motion-presets',
        '@playwright/test',
        'jsdom',
        'node:child_process',
        'node:fs',
        'node:fs/promises',
        'node:os',
        'node:path',
        'node:url',
        'vite',
      ],
      output: {
        entryFileNames: '[format]/[name].js',
        compact: true,
      },
    },
  },
  resolve: {
    alias: {
      '@wix/interact': path.resolve(__dirname, '../interact/src/index.ts'),
      '@wix/motion': path.resolve(__dirname, '../motion/src/index.ts'),
    },
  },
});
