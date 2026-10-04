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
        splittext: path.resolve(__dirname, 'src/splittext.ts'),
      },
      formats: ['es', 'cjs'],
    },
    sourcemap: true,
    rollupOptions: {
      external: ['zod', '@wix/interact', '@wix/splittext'],
      output: {
        entryFileNames: '[format]/[name].js',
        compact: true,
      },
    },
  },
});
