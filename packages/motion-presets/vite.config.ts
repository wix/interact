import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => ({
  build: {
    lib: {
      entry: {
        'motion-presets': path.resolve(__dirname, 'src/index.ts'),
        types: path.resolve(__dirname, 'src/types.ts'),
      },
      name: 'MotionPresets',
      fileName: (format: string, entryName: string) => `${format}/${entryName}.js`,
      formats: ['es' as const, 'cjs' as const],
    },
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      external: ['@wix/motion'],
      output: {
        compact: true,
        globals: {
          '@wix/motion': 'Motion',
        },
      },
    },
  },
}));
