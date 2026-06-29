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
        react: path.resolve(__dirname, 'src/react/index.ts'),
        interact: path.resolve(__dirname, 'src/interact/index.ts'),
      },
      formats: ['es', 'cjs'],
    },
    sourcemap: true,
    rollupOptions: {
      // @wix/interact is a type-only dependency of the /interact entry — never bundle it.
      external: ['react', 'react-dom', '@wix/interact'],
      output: {
        entryFileNames: '[format]/[name].js',
        compact: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    preserveSymlinks: false,
  },
});
