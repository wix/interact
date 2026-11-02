import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packages = path.resolve(__dirname, '../../..');

export default defineConfig({
  root: __dirname,
  resolve: {
    alias: {
      '@wix/interact/web': path.resolve(packages, 'interact/src/web/index.ts'),
      '@wix/motion-presets': path.resolve(packages, 'motion-presets/src/index.ts'),
      '@wix/motion': path.resolve(packages, 'motion/src/index.ts'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, 'index.html'),
      },
    },
  },
  server: {
    port: 5175,
  },
});
