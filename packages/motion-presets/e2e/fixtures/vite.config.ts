import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,
  resolve: {
    alias: {
      '@wix/motion': path.resolve(__dirname, '../../../motion/src/index.ts'),
    },
  },
  server: {
    port: 5175,
  },
});
