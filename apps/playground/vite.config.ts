import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  // Use VITE_BASE env var for GitHub Pages deployment, default to '/' for local dev
  base: process.env.VITE_BASE || '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@wix/interact/web': path.resolve(__dirname, '../../packages/interact/src/web'),
      '@wix/interact': path.resolve(__dirname, '../../packages/interact/src/index'),
      '@wix/motion': path.resolve(__dirname, '../../packages/motion/src/index'),
      '@wix/motion-presets': path.resolve(__dirname, '../../packages/motion-presets/src/index'),
    },
  },
  server: {
    port: 4175,
  },
});
