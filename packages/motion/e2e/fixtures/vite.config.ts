import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const motionSrc = path.resolve(__dirname, '../../src/index.ts');

export default defineConfig({
  root: __dirname,
  resolve: {
    alias: {
      '@wix/motion': motionSrc,
    },
  },
  build: {
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, 'index.html'),
        scroll: path.resolve(__dirname, 'scroll.html'),
        pointer: path.resolve(__dirname, 'pointer.html'),
        'animation-group': path.resolve(__dirname, 'animation-group.html'),
        effects: path.resolve(__dirname, 'effects.html'),
      },
    },
  },
  server: {
    port: 5174,
  },
});
